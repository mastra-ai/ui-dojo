import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useState } from "react";
import { MASTRA_BASE_URL } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2 } from "lucide-react";

type ProgressData = {
  status: "in-progress" | "done";
  message: string;
}| undefined

    const ProgressIndicator = ({ progress }: { progress: ProgressData }) => {
    if (!progress) return null;
    return (
    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
      {progress?.status === "in-progress" ? (
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
      ) : (
        <CheckCircle2 className="w-5 h-5 text-green-500" />
      )}
      <div className="flex-1">
        <div className="font-medium">{progress?.message}</div>
        <Badge variant={progress?.status === "in-progress" ? "default" : "secondary"} className="mt-1">
          {progress?.status === "in-progress" ? "In Progress" : "Done"}
        </Badge>
      </div>
    </div>
  );
};

export const GenerativeUserInterfacesCustomEventsDemo = () => {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${MASTRA_BASE_URL}/chat/taskAgent`,
    }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage({ text: input });
    setInput("");
  };


  const toolProgress = useMemo(() => {
    // Find all progress parts across all messages
    const allProgressParts: Array<{ data?: ProgressData }> = [];
    messages.forEach((message) => {
      message.parts.forEach((part) => {
        if (part.type === "data-tool-progress") {
          allProgressParts.push(part as { data?: ProgressData });
        }
      });
    });
    // Get the last progress event and extract its data
    if (allProgressParts.length > 0) {
      const lastPart = allProgressParts[allProgressParts.length - 1];
      return lastPart.data;
    }
    return undefined;
  }, [messages]);
 

  return (
    <div className="flex flex-col gap-8">
      <div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-row gap-4 items-center"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a task to process (e.g., 'Generate report', 'Process data')"
          />
          <Button type="submit" disabled={status !== "ready"}>
            Process Task
          </Button>
        </form>
      </div>
      <div className="space-y-4">
        {messages.map((message, idx) => (
          <div key={message.id}>
            {toolProgress && idx === messages.length - 1 ? (
              <div className="my-2">
                <ProgressIndicator progress={toolProgress} />
              </div>
            ) : null}
            <div>
              {message.parts.map((part, index) => {
                if (part.type === "text" && message.role === "user") {
                  return (
                    <Message key={index} from={message.role}>
                      <MessageContent>
                        <Response>{part.text}</Response>
                      </MessageContent>
                    </Message>
                  );
                }

                if (part.type === "text" && message.role === "assistant") {
                  return (
                    <Message key={index} from={message.role}>
                      <MessageContent>
                        <Response>{part.text}</Response>
                      </MessageContent>
                    </Message>
                  );
                }

                return null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

