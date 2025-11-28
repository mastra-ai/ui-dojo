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
import { CheckCircle2, Loader2, ShoppingCart } from "lucide-react";

type ProgressData = {
  status: "in-progress" | "done";
  message: string;
  stage?: "inventory" | "payment" | "shipping";
};

const ProgressIndicator = ({
  progress,
}: {
  progress: ProgressData & { stage?: string };
}) => {
  if (!progress) return null;

  const getStageName = () => {
    switch (progress.stage) {
      case "inventory":
        return "Inventory Check";
      case "payment":
        return "Payment Processing";
      case "shipping":
        return "Shipping Preparation";
      default:
        return "Processing";
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
      <div className="flex items-center gap-2">
        <Badge
          variant={progress.status === "in-progress" ? "secondary" : "outline"}
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
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="font-semibold text-sm text-muted-foreground">
            {getStageName()}
          </div>
          <div className="font-medium text-sm">{progress.message}</div>
        </div>
      </div>
    </div>
  );
};

const SubAgentsAndWorkflowsCustomEventsDemo = () => {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [amount, setAmount] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${MASTRA_BASE_URL}/chat/orderProcessingAgent`,
    }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !quantity || !amount) return;

    const orderMessage = `Place an order for product ${productId}, quantity ${quantity}, amount ${amount}`;
    sendMessage({ text: orderMessage });
    setProductId("");
    setQuantity("");
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

  const hasProgress = Object.keys(latestByStage).length > 0;

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <CardTitle>Place an Order</CardTitle>
          </div>
          <CardDescription>
            Enter the product details to process your order. The agent network
            will coordinate inventory check, payment, and shipping, while
            emitting structured progress events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="product" className="text-sm font-medium">
                  Product ID
                </label>
                <Input
                  id="product"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  placeholder="ABC123"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="quantity" className="text-sm font-medium">
                  Quantity
                </label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="2"
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
                  placeholder="29.99"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={
                status !== "ready" || !productId || !quantity || !amount
              }
              className="w-full"
            >
              {status === "ready" ? "Place Order" : "Processing..."}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Progress events container, separate from text streaming */}
      {hasProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Order Processing Status</CardTitle>
            <CardDescription>
              Structured progress events emitted by the sub-agents and
              workflows. This is separate from the natural-language responses in
              the chat below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(latestByStage)
              .sort(([a], [b]) => {
                // Order: inventory -> payment -> shipping
                const order = { inventory: 0, payment: 1, shipping: 2 };
                return (
                  (order[a as keyof typeof order] ?? 99) -
                  (order[b as keyof typeof order] ?? 99)
                );
              })
              .map(([stage, event]) => (
                <ProgressIndicator key={stage} progress={event} />
              ))}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {messages.map((message) => (
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubAgentsAndWorkflowsCustomEventsDemo;
