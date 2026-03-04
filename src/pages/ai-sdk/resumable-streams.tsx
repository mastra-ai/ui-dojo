import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
  PromptInputFooter,
} from "@/components/ai-elements/prompt-input";
import { Response } from "@/components/ai-elements/response";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Loader } from "@/components/ai-elements/loader";
import { Button } from "@/components/ui/button";
import { MASTRA_BASE_URL } from "@/constants";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useState } from "react";

const suggestions = [
  "Tell me about Princess Mononoke",
  "Who directed Spirited Away?",
  "Recommend a Ghibli movie for first-time viewers",
];

const CHAT_ID_STORAGE_KEY = "ai-sdk-resumable-chat-id";

const getOrCreateChatId = () => {
  const existingId = window.localStorage.getItem(CHAT_ID_STORAGE_KEY);

  if (existingId) {
    return existingId;
  }

  const nextId = crypto.randomUUID();
  window.localStorage.setItem(CHAT_ID_STORAGE_KEY, nextId);

  return nextId;
};

const getMessageText = (message: UIMessage) =>
  message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
    .trim();

const normalizeMessages = (messages: UIMessage[]): UIMessage[] => {
  const lastIndexById = new Map<string, number>();

  messages.forEach((message, index) => {
    if (message.id) {
      lastIndexById.set(message.id, index);
    }
  });

  const dedupedById = messages.filter((message, index) => {
    if (!message.id) {
      return true;
    }

    return lastIndexById.get(message.id) === index;
  });

  const collapsed: UIMessage[] = [];

  for (const message of dedupedById) {
    const previous = collapsed.at(-1);

    if (!previous) {
      collapsed.push(message);
      continue;
    }

    if (previous.role !== "assistant" || message.role !== "assistant") {
      collapsed.push(message);
      continue;
    }

    const previousText = getMessageText(previous);
    const currentText = getMessageText(message);

    if (!previousText || !currentText) {
      collapsed.push(message);
      continue;
    }

    if (currentText === previousText || previousText.startsWith(currentText)) {
      continue;
    }

    if (currentText.startsWith(previousText)) {
      collapsed[collapsed.length - 1] = message;
      continue;
    }

    collapsed.push(message);
  }

  return collapsed;
};

const messageSignature = (message: UIMessage) =>
  `${message.id ?? ""}:${message.role}:${getMessageText(message)}`;

const hasSameMessageState = (a: UIMessage[], b: UIMessage[]) => {
  if (a.length !== b.length) {
    return false;
  }

  return a.every(
    (message, index) => messageSignature(message) === messageSignature(b[index]),
  );
};

const fetchMessagesForChat = async (chatId: string): Promise<UIMessage[]> => {
  const response = await fetch(
    `${MASTRA_BASE_URL}/custom/resumable-chat/${chatId}/messages`,
  );

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { messages?: UIMessage[] };

  if (!Array.isArray(data.messages)) {
    return [];
  }

  return normalizeMessages(data.messages);
};

const ResumableStreamsDemo = () => {
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState(getOrCreateChatId);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${MASTRA_BASE_URL}/custom/resumable-chat/${chatId}`,
        prepareReconnectToStreamRequest: () => ({
          api: `${MASTRA_BASE_URL}/custom/resumable-chat/${chatId}/stream`,
        }),
      }),
    [chatId],
  );

  const [sendError, setSendError] = useState<string | null>(null);

  const { messages, setMessages, sendMessage, status } = useChat({
    id: chatId,
    resume: true,
    transport,
  });

  useEffect(() => {
    let isCancelled = false;

    const loadMessages = async () => {
      setIsLoadingHistory(true);
      const serverMessages = await fetchMessagesForChat(chatId);

      if (isCancelled) {
        return;
      }

      setMessages(serverMessages);
      setIsLoadingHistory(false);
    };

    void loadMessages();

    return () => {
      isCancelled = true;
    };
  }, [chatId, setMessages]);

  useEffect(() => {
    const normalizedMessages = normalizeMessages(messages);

    if (!hasSameMessageState(normalizedMessages, messages)) {
      setMessages(normalizedMessages);
    }
  }, [messages, setMessages]);

  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text?.trim()) {
      return;
    }

    try {
      setSendError(null);
      setInput("");
      await sendMessage({ text: message.text });
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Failed to send message");
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    try {
      setSendError(null);
      await sendMessage({ text: suggestion });
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Failed to send message");
    }
  };

  const handleResetChatId = () => {
    const nextChatId = crypto.randomUUID();

    window.localStorage.setItem(CHAT_ID_STORAGE_KEY, nextChatId);
    setSendError(null);
    setMessages([]);
    setChatId(nextChatId);
  };

  return (
    <div className="max-w-4xl mx-auto p-0 md:p-6 relative size-full">
      <div className="flex flex-col h-full gap-4">
        <div className="flex items-center justify-between rounded-md border px-3 py-2 text-xs text-muted-foreground">
          <span className="font-mono truncate">chatId: {chatId}</span>
          <Button variant="outline" size="sm" onClick={handleResetChatId}>
            New chat id
          </Button>
        </div>

        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => {
              const latestTextPart = message.parts
                .filter((part) => part.type === "text")
                .at(-1);

              if (!latestTextPart) {
                return null;
              }

              return (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    <Response>{latestTextPart.text}</Response>
                  </MessageContent>
                </Message>
              );
            })}

            {(status === "submitted" || isLoadingHistory) && <Loader />}
            {messages.length === 0 && !isLoadingHistory && (
              <Suggestions>
                {suggestions.map((suggestion) => (
                  <Suggestion
                    key={suggestion}
                    suggestion={suggestion}
                    onClick={handleSuggestionClick}
                  />
                ))}
              </Suggestions>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput onSubmit={handleSubmit} className="mt-auto">
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
              placeholder="Start a message, then refresh the page while streaming..."
            />
          </PromptInputBody>
          <PromptInputFooter>
            <div
              className={`flex items-center gap-2 text-xs ${sendError ? "text-destructive" : "text-muted-foreground"}`}
            >
              {sendError
                ? `Send failed: ${sendError}`
                : status === "streaming"
                  ? "Streaming... Reload the page to test resume."
                  : isLoadingHistory
                    ? "Loading messages from Mastra memory..."
                    : "Messages are loaded from Mastra memory (thread/resource = chatId)."}
            </div>
            <div className="flex items-center gap-2">
              <PromptInputSubmit status={status} disabled={!input.trim()} />
            </div>
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};

export default ResumableStreamsDemo;
