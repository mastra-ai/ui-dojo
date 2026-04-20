import { buildUserPrompt, type Spec } from "@json-render/core";
import { registerApiRoute } from "@mastra/core/server";
import { jsonRenderCatalog } from "@/lib/json-render-catalog";

type JsonRenderStreamRequest = {
  prompt?: string;
  currentSpec?: Spec | null;
};

const encoder = new TextEncoder();

const instructions = jsonRenderCatalog.prompt({
  mode: "standalone",
  customRules: [
    "Keep the UI compact and useful.",
    "Prefer one main Card as the root.",
    "Keep copy short and specific.",
  ],
});

export const jsonRenderStreamRoute = registerApiRoute("/json-render-stream", {
  method: "POST",
  handler: async (c) => {
    const body = await c.req.json<JsonRenderStreamRequest>();
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return c.json({ error: "Prompt is required." }, 400);
    }

    const currentSpec =
      body.currentSpec && body.currentSpec.root ? body.currentSpec : undefined;

    const userPrompt = buildUserPrompt({
      prompt,
      currentSpec,
      editModes: ["patch"],
    });

    const agent = c.get("mastra").getAgentById("json-render-agent");
    const stream = await agent.stream(userPrompt, {
      abortSignal: c.req.raw.signal,
      instructions,
    });

    const responseStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = stream.textStream.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            controller.enqueue(encoder.encode(value));
          }

          const usage = await stream.totalUsage;

          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({
                __meta: "usage",
                promptTokens: usage.inputTokens ?? 0,
                completionTokens: usage.outputTokens ?? 0,
                totalTokens: usage.totalTokens ?? 0,
              })}\n`,
            ),
          );
          controller.close();
        } catch (error) {
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new Response(responseStream, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  },
});
