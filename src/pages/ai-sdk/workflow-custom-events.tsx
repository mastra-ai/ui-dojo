import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useState } from "react";
import { MASTRA_BASE_URL } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, GitBranch } from "lucide-react";

type ProgressData = {
  status: "in-progress" | "done";
  message: string;
  stage?: "validation" | "standard-processing" | "express-processing";
};

const ProgressIndicator = ({
  progress,
}: {
  progress: ProgressData & { stage?: string };
}) => {
  if (!progress) return null;

  const getStageName = () => {
    switch (progress.stage) {
      case "validation":
        return "Order Validation";
      case "standard-processing":
        return "Standard Processing";
      case "express-processing":
        return "Express Processing";
      default:
        return "Processing";
    }
  };

  return (
    <div className="grid gap-3 p-4 bg-muted rounded-lg">
      <div className="flex items-center gap-2">
        <Badge
          variant={progress.status === "in-progress" ? "default" : "outline"}
          className="text-xs"
        >
          {progress.status === "in-progress" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> In
              Progress
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-500" /> Done
            </>
          )}
        </Badge>
        <div className="font-semibold text-sm text-muted-foreground">
          {getStageName()}
        </div>
      </div>
      <div className="font-medium text-sm">{progress.message}</div>
    </div>
  );
};

const WorkflowCustomEventsDemo = () => {
  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState("");
  const [orderType, setOrderType] = useState<"standard" | "express">(
    "standard",
  );

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${MASTRA_BASE_URL}/workflow/branchingWorkflow`,
      prepareSendMessagesRequest: ({ messages }) => {
        const metadata = messages[messages.length - 1].metadata as {
          orderId?: string;
          amount?: string;
          orderType?: "standard" | "express";
        };

        return {
          body: {
            inputData: {
              orderId: metadata.orderId,
              orderType: metadata.orderType,
              amount: metadata.amount ? parseFloat(metadata.amount) : 0,
            },
          },
        };
      },
    }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !amount) return;

    sendMessage({
      text: `Process ${orderType} order ${orderId}`,
      metadata: { orderId, amount, orderType },
    });
    setOrderId("");
    setAmount("");
  };

  // Collect all progress events grouped by stage
  const progressEvents = useMemo(() => {
    const events: Array<ProgressData & { stage?: string }> = [];
    messages.forEach((message) => {
      message.parts.forEach((part) => {
        if (part.type === "data-tool-progress") {
          const data = (part.data || {}) as ProgressData;
          if (data) {
            events.push(data);
          }
        }
      });
    });
    return events;
  }, [messages]);

  // Get the latest event for each stage
  const latestByStage = useMemo(() => {
    const byStage: Record<string, ProgressData & { stage?: string }> = {};
    progressEvents.forEach((event) => {
      if (event.stage) {
        // Only keep the latest event for each stage
        if (!byStage[event.stage] || event.status === "done") {
          byStage[event.stage] = event;
        }
      }
    });
    return byStage;
  }, [progressEvents]);

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            <CardTitle>Workflow Steps with Branching</CardTitle>
          </div>
          <CardDescription>
            This workflow validates an order, then branches based on shipping
            type. Each branch is a nested workflow with steps that emit custom
            events using writer.custom().
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="orderId" className="text-sm font-medium">
                  Order ID
                </label>
                <Input
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="ORD-12345"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">
                  Amount ($)
                </label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="99.99"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="orderType" className="text-sm font-medium">
                  Shipping Type
                </label>
                <select
                  id="orderType"
                  value={orderType}
                  onChange={(e) =>
                    setOrderType(e.target.value as "standard" | "express")
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="standard">Standard (5-7 days)</option>
                  <option value="express">Express (1-2 days)</option>
                </select>
              </div>
            </div>
            <Button
              type="submit"
              disabled={status !== "ready" || !orderId || !amount}
              className="w-full"
            >
              {status === "ready" ? "Process Order" : "Processing..."}
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {messages.map((message, idx) => (
          <div key={message.id}>
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
            {/* Show progress indicators for the latest message */}
            {idx === messages.length - 1 &&
              Object.keys(latestByStage).length > 0 && (
                <div className="my-4 space-y-2">
                  {Object.entries(latestByStage)
                    .sort(([a], [b]) => {
                      // Order: validation -> standard/express processing
                      const order = {
                        validation: 0,
                        "standard-processing": 1,
                        "express-processing": 1,
                      };
                      return (
                        (order[a as keyof typeof order] ?? 99) -
                        (order[b as keyof typeof order] ?? 99)
                      );
                    })
                    .map(([stage, event]) => (
                      <ProgressIndicator key={stage} progress={event} />
                    ))}
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowCustomEventsDemo;
