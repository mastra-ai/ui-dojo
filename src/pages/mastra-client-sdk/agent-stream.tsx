import { useState } from "react";
import { MastraClient } from "@mastra/client-js";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Loader } from "@/components/ai-elements/loader";
import { Response } from "@/components/ai-elements/response";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { MASTRA_BASE_URL } from "@/constants";

const client = new MastraClient({
  baseUrl: MASTRA_BASE_URL,
});

const agent = client.getAgent("ghibliAgent");

const suggestions = [
  "Tell me about Spirited Away",
  "Who is Howl in Howl's Moving Castle?",
  "Recommend a Studio Ghibli movie for a first watch",
];

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export default function AgentStreamPage() {
  const [input, setInput] = useState("");
  const [threadId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage(userText: string) {
    if (!userText.trim() || isStreaming) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: userText,
    };
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "",
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      assistantMessage,
    ]);
    setInput("");
    setError(null);
    setIsStreaming(true);

    try {
      const stream = await agent.stream(userText, {
        memory: {
          resource: "ui-dojo",
          thread: threadId,
        },
      });

      await stream.processDataStream({
        onChunk: async (chunk) => {
          switch (chunk.type) {
            case "text-delta":
              if (typeof chunk.payload?.text !== "string") {
                return;
              }

              setMessages((currentMessages) => {
                const currentAssistant =
                  currentMessages.find(
                    (message) => message.id === assistantMessage.id,
                  )?.text ?? "";

                return currentMessages.map((message) =>
                  message.id === assistantMessage.id
                    ? { ...message, text: currentAssistant + chunk.payload.text }
                    : message,
                );
              });
              break;
            default:
              break;
          }
        },
      });
    } catch (streamError) {
      setError(
        streamError instanceof Error
          ? streamError.message
          : "Streaming request failed.",
      );

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === assistantMessage.id
            ? {
                ...message,
                text: "The request failed. Check the browser console and your Mastra server logs.",
              }
            : message,
        ),
      );
    } finally {
      setIsStreaming(false);
    }
  }

  function handleSubmit(message: PromptInputMessage) {
    if (!message.text) {
      return;
    }

    void sendMessage(message.text);
  }

  return (
    <div className="relative mx-auto size-full max-w-4xl p-0 md:p-6">
      <div className="flex h-full flex-col">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  <Response>{message.text || "..."}</Response>
                </MessageContent>
              </Message>
            ))}
            {isStreaming ? <Loader /> : null}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <Suggestions>
          {suggestions.map((suggestion) => (
            <Suggestion
              key={suggestion}
              onClick={() => void sendMessage(suggestion)}
              suggestion={suggestion}
            />
          ))}
        </Suggestions>

        <PromptInput className="mt-4" onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(event) => setInput(event.target.value)}
              value={input}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit disabled={!input && !isStreaming} status={isStreaming ? "streaming" : "ready"} />
          </PromptInputFooter>
        </PromptInput>

        {error ? <p className="mt-3 text-destructive text-sm">{error}</p> : null}
      </div>
    </div>
  );
}
