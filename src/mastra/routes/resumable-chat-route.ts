import { randomUUID } from "node:crypto";
import { handleChatStream, type ChatStreamHandlerParams } from "@mastra/ai-sdk";
import { toAISdkV5Messages } from "@mastra/ai-sdk/ui";
import { registerApiRoute } from "@mastra/core/server";
import { createUIMessageStreamResponse, type UIMessage } from "ai";
import {
  createResumableStreamContext,
  type Publisher,
  type Subscriber,
} from "resumable-stream/generic";

const memoryKv = new Map<string, string>();
const channelSubscribers = new Map<string, Set<(message: string) => void>>();

const publisher: Publisher = {
  connect: async () => undefined,
  publish: async (channel, message) => {
    const subscribers = channelSubscribers.get(channel);

    if (!subscribers) {
      return 0;
    }

    subscribers.forEach((callback) => callback(message));

    return subscribers.size;
  },
  set: async (key, value) => {
    memoryKv.set(key, value);
    return "OK";
  },
  get: async (key) => memoryKv.get(key) ?? null,
  incr: async (key) => {
    const currentValue = Number(memoryKv.get(key) ?? "0");
    const nextValue = currentValue + 1;

    memoryKv.set(key, String(nextValue));

    return nextValue;
  },
};

const subscriber: Subscriber = {
  connect: async () => undefined,
  subscribe: async (channel, callback) => {
    const subscribers = channelSubscribers.get(channel) ?? new Set();

    subscribers.add(callback);
    channelSubscribers.set(channel, subscribers);
  },
  unsubscribe: async (channel) => {
    // Intentional for demo adapter: Subscriber API only supports channel-level unsubscribe.
    // This app uses one logical subscriber set per stream channel.
    channelSubscribers.delete(channel);
  },
};

const resumableStreamContext = createResumableStreamContext({
  waitUntil: null,
  publisher,
  subscriber,
});

const latestStreamByChatId = new Map<string, string>();

const streamHeaders = {
  "content-type": "text/event-stream; charset=utf-8",
  "x-vercel-ai-ui-message-stream": "v1",
  "cache-control": "no-store",
};

const toChatStreamParams = (
  body: unknown,
): ChatStreamHandlerParams<UIMessage> => {
  const payload =
    body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : {};

  const messages = Array.isArray(payload.messages)
    ? (payload.messages as UIMessage[])
    : [];

  const lastMessage = messages.at(-1);

  return {
    messages: lastMessage ? [lastMessage] : [],
    runId: typeof payload.runId === "string" ? payload.runId : undefined,
    trigger:
      payload.trigger === "submit-message" ||
      payload.trigger === "regenerate-message"
        ? payload.trigger
        : undefined,
    resumeData:
      payload.resumeData && typeof payload.resumeData === "object"
        ? (payload.resumeData as Record<string, unknown>)
        : undefined,
  };
};

export const resumableChatPostRoute = registerApiRoute(
  "/custom/resumable-chat/:chatId",
  {
    method: "POST",
    handler: async (c) => {
      const { chatId } = c.req.param();
      const mastra = c.get("mastra");
      const requestBody = await c.req.json();
      const chatParams = toChatStreamParams(requestBody);

      const aiSdkStream = await handleChatStream({
        mastra,
        agentId: "ghibliAgent",
        params: {
          ...chatParams,
          memory: {
            thread: chatId,
            resource: chatId,
          },
        },
      });

      const upstreamResponse = createUIMessageStreamResponse({
        stream: aiSdkStream,
      });

      if (!upstreamResponse.body) {
        return c.json(
          {
            error: "Failed to start stream",
          },
          500,
        );
      }

      const streamId = randomUUID();
      latestStreamByChatId.set(chatId, streamId);

      const resumableStream = await resumableStreamContext.createNewResumableStream(
        streamId,
        () => upstreamResponse.body!.pipeThrough(new TextDecoderStream()),
      );

      if (!resumableStream) {
        return c.json(
          {
            error: "Unable to create resumable stream",
          },
          500,
        );
      }

      return new Response(resumableStream.pipeThrough(new TextEncoderStream()), {
        headers: streamHeaders,
      });
    },
  },
);

export const resumableChatGetRoute = registerApiRoute(
  "/custom/resumable-chat/:chatId/stream",
  {
    method: "GET",
    handler: async (c) => {
      const { chatId } = c.req.param();
      const streamId = latestStreamByChatId.get(chatId);

      if (!streamId) {
        return new Response(null, { status: 204 });
      }

      const existingStreamState = await resumableStreamContext.hasExistingStream(
        streamId,
      );

      if (existingStreamState === "DONE") {
        latestStreamByChatId.delete(chatId);
        return new Response(null, { status: 204 });
      }

      if (existingStreamState === null) {
        latestStreamByChatId.delete(chatId);
        return new Response(null, { status: 204 });
      }

      const resumedStream = await resumableStreamContext.resumeExistingStream(
        streamId,
      );

      if (!resumedStream) {
        latestStreamByChatId.delete(chatId);
        return new Response(null, { status: 204 });
      }

      return new Response(resumedStream.pipeThrough(new TextEncoderStream()), {
        headers: streamHeaders,
      });
    },
  },
);

export const resumableChatMessagesRoute = registerApiRoute(
  "/custom/resumable-chat/:chatId/messages",
  {
    method: "GET",
    handler: async (c) => {
      try {
        const { chatId } = c.req.param();
        const mastra = c.get("mastra");
        const agent = mastra.getAgent("ghibliAgent");
        const memory = await agent.getMemory();

        if (!memory) {
          return c.json({ messages: [] });
        }

        const thread = await memory.getThreadById({ threadId: chatId });

        if (!thread) {
          return c.json({ messages: [] });
        }

        const recalled = await memory.recall({
          threadId: chatId,
          resourceId: chatId,
          orderBy: {
            field: "createdAt",
            direction: "ASC",
          },
          perPage: 200,
          page: 0,
        });

        return c.json({
          messages: toAISdkV5Messages(recalled.messages),
        });
      } catch (error) {
        console.error("Failed to load resumable chat messages", error);
        return c.json({ messages: [] });
      }
    },
  },
);
