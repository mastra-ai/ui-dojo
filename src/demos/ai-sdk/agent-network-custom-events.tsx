import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useState } from "react";
import { MASTRA_BASE_URL } from "@/constants";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Loader2,
  BarChart3,
  FileText,
  Package,
  Network,
  FileEdit,
} from "lucide-react";

type ProgressData = {
  status: "in-progress" | "done";
  message: string;
  stage?: "data-analysis" | "report-generation" | "inventory";
};

const ProgressIndicator = ({
  progress,
  agentName,
}: {
  progress: ProgressData & { stage?: string };
  agentName?: string;
}) => {
  if (!progress) return null;

  const getIcon = () => {
    switch (progress.stage) {
      case "data-analysis":
        return <BarChart3 className="w-5 h-5" />;
      case "report-generation":
        return <FileText className="w-5 h-5" />;
      case "inventory":
        return <Package className="w-5 h-5" />;
      default:
        return <Network className="w-5 h-5" />;
    }
  };

  const getStageName = () => {
    switch (progress.stage) {
      case "data-analysis":
        return "Data Analysis";
      case "report-generation":
        return "Report Generation";
      case "inventory":
        return "Inventory Check";
      default:
        return "Processing";
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg border-l-4 border-l-blue-500">
      <div className="flex items-center gap-2">
        {progress.status === "in-progress" ? (
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        )}
        {getIcon()}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          {agentName && (
            <div className="text-xs font-semibold text-muted-foreground">
              {agentName}
            </div>
          )}
          <div className="font-semibold text-sm text-muted-foreground">
            {getStageName()}
          </div>
          <Badge
            variant={progress.status === "in-progress" ? "default" : "secondary"}
            className="text-xs"
          >
            {progress.status === "in-progress" ? "In Progress" : "Done"}
          </Badge>
        </div>
        <div className="font-medium text-sm">{progress.message}</div>
      </div>
    </div>
  );
};

export const AgentNetworkCustomEventsDemo = () => {
  const [topic, setTopic] = useState("");
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: `${MASTRA_BASE_URL}/network-custom-events`,
    }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    sendMessage({ text: `Generate a report on ${topic}` });
    setTopic("");
    setMessages([]);
  };

  // Collect all progress events
  const progressEvents = useMemo(() => {
    const events: Array<ProgressData & { stage?: string; agentName?: string }> = [];
    messages.forEach((message) => {
      message.parts.forEach((part) => {
        if (part.type === "data-tool-progress") {
          const data = (part.data || {}) as ProgressData;
          if (data) {
            let agentName: string | undefined;
            if (data.stage === "data-analysis") {
              agentName = "Data Analysis Agent";
            } else if (data.stage === "report-generation") {
              agentName = "Report Generation Agent";
            } else if (data.stage === "inventory") {
              agentName = "Inventory Check Agent";
            }
            events.push({ ...data, agentName });
          }
        }
      });
    });
    return events;
  }, [messages]);

  // Get the latest event for each stage
  const latestByStage = useMemo(() => {
    const byStage: Record<string, ProgressData & { stage?: string; agentName?: string }> = {};
    progressEvents.forEach((event) => {
      if (event.stage) {
        if (!byStage[event.stage] || event.status === "done") {
          byStage[event.stage] = event;
        }
      }
    });
    return byStage;
  }, [progressEvents]);

  return (
    <div className="flex flex-col h-full max-h-full">
      <div className="sticky top-0 z-10 bg-background pb-4">
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileEdit className="w-5 h-5" />
              <CardTitle>Report Generator</CardTitle>
            </div>
            <CardDescription>
              Generate a comprehensive report on any topic. The network will route to the appropriate agent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="topic" className="text-sm font-medium">
                  Topic
                </label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Q4 Performance, Sales Analysis, Market Trends"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={status !== "ready" || !topic.trim()} 
                className="w-full"
              >
                {status === "ready" ? "Generate Report" : "Processing..."}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
        {messages.map((message, idx) => (
          <div key={message.id}>
            <div>
              {/* Show progress indicators for the latest message */}
              {idx === messages.length - 1 &&
                Object.keys(latestByStage).length > 0 && (
                  <div className="my-4 space-y-2">
                    {Object.entries(latestByStage)
                      .map(([stage, event]) => (
                        <ProgressIndicator
                          key={stage}
                          progress={event}
                          agentName={event.agentName}
                        />
                      ))}
                  </div>
                )}
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

