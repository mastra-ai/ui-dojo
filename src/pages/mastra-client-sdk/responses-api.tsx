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

const suggestions = [
  "What's the weather in Tokyo?",
  "Continue with a follow-up about tomorrow",
  "Compare the weather in Lagos and London",
];

const RESPONSES_AGENT_ID = "responsesWeatherAgent";
const RESPONSES_MODEL = "openai/gpt-5-mini";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

function updateAssistantMessage(
  messages: ChatMessage[],
  assistantMessageId: string,
  nextText: string,
) {
  return messages.map((message) =>
    message.id === assistantMessageId
      ? {
          ...message,
          text: nextText,
        }
      : message,
  );
}

export default function ResponsesApiPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previousResponseId, setPreviousResponseId] = useState<string | null>(
    null,
  );

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
      const stream = await client.responses.stream({
        agent_id: RESPONSES_AGENT_ID,
        model: RESPONSES_MODEL,
        input: userText,
        previous_response_id: previousResponseId ?? undefined,
        store: true,
      });

      for await (const event of stream) {
        switch (event.type) {
          case "response.output_text.delta":
            setMessages((currentMessages) => {
              const currentAssistant =
                currentMessages.find(
                  (message) => message.id === assistantMessage.id,
                )?.text ?? "";

              return updateAssistantMessage(
                currentMessages,
                assistantMessage.id,
                currentAssistant + event.delta,
              );
            });
            break;
          case "response.completed":
            setPreviousResponseId(event.response.id);
            setMessages((currentMessages) =>
              updateAssistantMessage(
                currentMessages,
                assistantMessage.id,
                event.response.output_text,
              ),
            );
            break;
          default:
            break;
        }
      }
    } catch (streamError) {
      setError(
        streamError instanceof Error
          ? streamError.message
          : "Responses API request failed.",
      );

      setMessages((currentMessages) =>
        updateAssistantMessage(
          currentMessages,
          assistantMessage.id,
          "The request failed. Check the browser console and your Mastra server logs.",
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

  function resetConversation() {
    setMessages([]);
    setInput("");
    setError(null);
    setPreviousResponseId(null);
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

        <div className="mt-3 rounded-md border border-border/60 bg-muted/40 px-3 py-2 font-mono text-[11px] text-muted-foreground">
          previous_response_id: {previousResponseId ?? "null"}
        </div>

        <PromptInput className="mt-4" onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(event) => setInput(event.target.value)}
              value={input}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <button
                className="text-muted-foreground text-sm"
                onClick={resetConversation}
                type="button"
              >
                Reset
              </button>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={!input && !isStreaming}
              status={isStreaming ? "streaming" : "ready"}
            />
          </PromptInputFooter>
        </PromptInput>

        {error ? <p className="mt-3 text-destructive text-sm">{error}</p> : null}
      </div>
    </div>
  );
}
