import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { MASTRA_BASE_URL } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ai-elements/code-block";
import { Loader } from "@/components/ai-elements/loader";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";
import type { AgentDataPart, WorkflowDataPart } from "@mastra/ai-sdk";

type NestedPart = AgentDataPart | WorkflowDataPart;


const ToolNestedStreamsDemo = () => {
  const [question, setQuestion] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${MASTRA_BASE_URL}/chat/weatherForecastAgent`,
    }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    sendMessage({ text: question });
    setQuestion("");
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-row gap-4 items-center"
        >
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder='Ask for a forecast (e.g. "London tomorrow?")'
          />
          <Button type="submit" disabled={status !== "ready"}>
            Get Tomorrow&apos;s Forecast
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        {messages.map((message) => {
          return (
            <div key={message.id}>
              {message.parts.map((part, index) => {
                switch (part.type) {
                  case "text": {
                    return (
                      <Message key={index} from={message.role}>
                        <MessageContent>
                          <Response>{part.text}</Response>
                        </MessageContent>
                      </Message>
                    );
                  }
                  case "data-tool-agent":
                  case "data-tool-workflow": {
                    const nestedPart = part as NestedPart;
                    return (
                      <Collapsible
                        key={index}
                        className="rounded-lg border bg-muted/40"
                        defaultOpen={false}
                      >
                        <CollapsibleTrigger className="group flex w-full items-center justify-between px-4 py-2 text-xs font-semibold uppercase text-muted-foreground hover:text-foreground">
                          <span>
                            {nestedPart.type === "data-tool-agent"
                              ? "Nested Agent Stream"
                              : "Nested Workflow Stream"}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Tool Nested Stream</Badge>
                            <ChevronDownIcon className="size-4 transition-transform group-data-[state=open]:rotate-180" />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 px-4 pb-4 pt-2">
                          <CodeBlock
                            code={JSON.stringify(nestedPart.data ?? {}, null, 2)}
                            language="json"
                            showLineNumbers={false}
                          />
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  }
                  default:
                    return null;
                }
              })}
            </div>
          );
        })}
        {status === "submitted" && <Loader />}
      </div>
    </div>
  );
};

export default ToolNestedStreamsDemo;


