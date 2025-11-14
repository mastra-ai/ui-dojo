import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Action, Actions } from "@/components/ai-elements/actions";
import { Fragment, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Response } from "@/components/ai-elements/response";
import { CopyIcon, GlobeIcon, RefreshCcwIcon } from "lucide-react";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Loader } from "@/components/ai-elements/loader";
import { DefaultChatTransport } from "ai";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { MASTRA_BASE_URL } from "@/constants";
import type { ChatMessage } from "@/mastra/tools/web-search-tool";

const models = [
  {
    name: "GPT 4o Mini",
    value: "openai/gpt-4o-mini",
  },
  {
    name: "Deepseek R1",
    value: "vercel/deepseek/deepseek-r1",
  },
];

const suggestions = [
  "Tell me about Spirited Away",
  "What are Christopher Nolan's top 10 rannked films on IMDB",
  "How much revenue did the first season of Squid Game generate?",
  "Who are the main characters in Princess Mononoke?",
  "Summarize the plot of Howl's Moving Castle",
];

const AISdkDemo = () => {
  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>(models[0].value);
  const [webSearch, setWebSearch] = useState(true);
  const { messages, sendMessage, status, regenerate } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: `${MASTRA_BASE_URL}/chat/${webSearch ? "webSearchAgent" : "ghibliAgent"}`,
    }),
  });

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    sendMessage(
      {
        text: message.text || "Sent with attachments",
        files: message.files,
      },
      {
        body: {
          model: model,
          webSearch: webSearch,
        },
      },
    );
    setInput("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage({ text: suggestion });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full">
      <div className="flex flex-col h-full">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === "assistant" &&
                  message.parts.filter((part) => part.type === "source-url")
                    .length > 0 && (
                    <Sources>
                      <SourcesTrigger
                        count={
                          message.parts.filter(
                            (part) => part.type === "source-url",
                          ).length
                        }
                      />
                      {message.parts
                        .filter((part) => part.type === "source-url")
                        .map((part, i) => (
                          <SourcesContent key={`${message.id}-${i}`}>
                            <Source
                              key={`${message.id}-${i}`}
                              href={part.url}
                              title={part.url}
                            />
                          </SourcesContent>
                        ))}
                    </Sources>
                  )}
                {message.parts
                  .filter((_, index, arr) => index === arr.length - 1)
                  .map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <Fragment key={`${message.id}-${i}`}>
                            <Message from={message.role}>
                              <MessageContent>
                                <Response>{part.text}</Response>
                              </MessageContent>
                            </Message>
                            {message.role === "assistant" &&
                              i === messages.length - 1 && (
                                <Actions className="mt-2">
                                  <Action
                                    onClick={() => regenerate()}
                                    label="Retry"
                                  >
                                    <RefreshCcwIcon className="size-3" />
                                  </Action>
                                  <Action
                                    onClick={() =>
                                      navigator.clipboard.writeText(part.text)
                                    }
                                    label="Copy"
                                  >
                                    <CopyIcon className="size-3" />
                                  </Action>
                                </Actions>
                              )}
                          </Fragment>
                        );
                      case "reasoning":
                        return (
                          <Reasoning
                            key={`${message.id}-${i}`}
                            className="w-full"
                            isStreaming={
                              status === "streaming" &&
                              i === message.parts.length - 1 &&
                              message.id === messages.at(-1)?.id
                            }
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                      case "tool-exaSearch":
                        switch (part.state) {
                          case "input-streaming":
                          case "input-available":
                            return (
                              <div
                                key={`${message.id}-exasearch-${i}`}
                                className="p-2 rounded-lg bg-slate-900 w-fit"
                              >
                                <p className="text-sm text-emerald-500 animate-pulse">
                                  🌐 Searching the web — Calling Exa
                                </p>
                              </div>
                            );
                          case "output-available":
                            return (
                              <div
                                key={`${message.id}-exasearch-${i}`}
                                className="p-2 rounded-lg bg-slate-900 w-fit"
                              >
                                <p className="text-sm text-emerald-500">
                                  🏄‍♀️ Finished search, generating response
                                </p>
                              </div>
                            );
                          case "output-error":
                            return (
                              <div key={`${message.id}-${i}`}>
                                <div className="text-sm text-red-400">
                                  ❌ Error: {part.errorText}
                                </div>
                              </div>
                            );
                          default:
                            return null;
                        }
                      default:
                        return null;
                    }
                  })}
              </div>
            ))}
            {messages
              .filter((_, index, arr) => index === arr.length - 1)
              .map((message) => {
                // grab tool parts that contain exa's search results
                const toolParts = message.parts?.filter(
                  (part) =>
                    part.type === "tool-exaSearch" &&
                    part.state === "output-available",
                );
                const sources =
                  toolParts?.flatMap((part) => part.output.results ?? []) ?? [];

                if (sources.length === 0) return null;
                if (status === "streaming") return null;

                return (
                  <Sources>
                    <SourcesTrigger count={sources.length} />
                    <SourcesContent>
                      {sources.map((source, i) => (
                        <a
                          key={i}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 hover:bg-slate-900 rounded-md transition"
                        >
                          {source.favicon ? (
                            <img
                              src={source.favicon}
                              alt=""
                              className="w-4 h-4 rounded-sm object-contain"
                            />
                          ) : (
                            <div className="w-4 h-4 bg-neutral-300 rounded-sm" />
                          )}
                          <div className="flex flex-col text-sm">
                            <span className="font-medium line-clamp-1">
                              {source.title}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {new URL(source.url).hostname.replace("www.", "")}
                            </span>
                          </div>
                        </a>
                      ))}
                    </SourcesContent>
                  </Sources>
                );
              })}
            {status === "submitted" && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <Suggestions>
          {suggestions.map((suggestion) => (
            <Suggestion
              key={suggestion}
              onClick={handleSuggestionClick}
              suggestion={suggestion}
            />
          ))}
        </Suggestions>

        <PromptInput
          onSubmit={handleSubmit}
          className="mt-4"
          globalDrop
          multiple
        >
          <PromptInputBody>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputButton
                variant={webSearch ? "default" : "ghost"}
                onClick={() => setWebSearch(!webSearch)}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
              <PromptInputModelSelect
                onValueChange={(value) => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((model) => (
                    <PromptInputModelSelectItem
                      key={model.value}
                      value={model.value}
                    >
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit disabled={!input && !status} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};

export default AISdkDemo;
