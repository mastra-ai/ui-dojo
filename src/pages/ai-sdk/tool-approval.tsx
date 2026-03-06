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
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Response } from "@/components/ai-elements/response";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ai-elements/loader";
import { MASTRA_BASE_URL } from "@/constants";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { isToolUIPart, getToolName } from "ai";
import { useState, useCallback } from "react";
import { CheckCircle2, XCircle, ShieldAlert } from "lucide-react";

type ToolCallApprovalData = {
  state: "data-tool-call-approval";
  runId: string;
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
};

function isToolCallApproval(
  part: UIMessage["parts"][number],
): part is {
  type: "data-tool-call-approval";
  id: string;
  data: ToolCallApprovalData;
} {
  return part.type === "data-tool-call-approval" && "data" in part;
}

function getApprovalForToolCall(
  parts: UIMessage["parts"],
  toolCallId: string,
): ToolCallApprovalData | undefined {
  const part = parts.find(
    (p) => isToolCallApproval(p) && p.data.toolCallId === toolCallId,
  );
  return part && isToolCallApproval(part) ? part.data : undefined;
}

const ToolApprovalDemo = () => {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${MASTRA_BASE_URL}/chat/weatherApprovalAgent`,
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  const handleApproval = useCallback(
    async (data: ToolCallApprovalData, approved: boolean) => {
      await sendMessage(undefined, {
        body: {
          resumeData: { approved },
          runId: data.runId,
        },
      });
    },
    [sendMessage],
  );

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text?.trim()) return;
    sendMessage({ text: message.text });
    setInput("");
  };

  return (
    <div className="max-w-4xl mx-auto p-0 md:p-6 relative size-full">
      <div className="flex flex-col h-full">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {message.parts.map((part, i) => {
                  if (part.type === "text" && part.text.length > 0) {
                    return (
                      <Message key={i} from={message.role}>
                        <MessageContent>
                          <Response>{part.text}</Response>
                        </MessageContent>
                      </Message>
                    );
                  }

                  // Skip the standalone data-tool-call-approval part — its data
                  // is rendered inline inside the corresponding tool-* part below.
                  if (isToolCallApproval(part)) {
                    return null;
                  }

                  if (isToolUIPart(part)) {
                    const approval = getApprovalForToolCall(
                      message.parts,
                      part.toolCallId,
                    );

                    // No approval needed — render normally
                    if (!approval) {
                      return (
                        <Tool key={i}>
                          <ToolHeader
                            title={getToolName(part)}
                            type={part.type}
                            state={part.state}
                          />
                          <ToolContent>
                            <ToolOutput
                              output={part.output}
                              errorText={part.errorText}
                            />
                          </ToolContent>
                        </Tool>
                      );
                    }

                    const awaitingApproval =
                      part.state !== "output-available" &&
                      part.state !== "output-error" &&
                      !isLoading;

                    return (
                      <Tool
                        key={i}
                        open={awaitingApproval || undefined}
                        defaultOpen
                      >
                        <ToolHeader
                          title={getToolName(part)}
                          type={part.type}
                          state={part.state}
                        />
                        <ToolContent>
                          <ToolInput input={approval.args} />
                          {part.state === "output-available" ? (
                            <ToolOutput
                              output={part.output}
                              errorText={part.errorText}
                            />
                          ) : (
                            <div className="p-4 pt-0">
                              <div className="flex items-center gap-2 mb-3 text-sm font-medium text-amber-600 dark:text-amber-400">
                                <ShieldAlert className="size-4" />
                                <span>Approval required</span>
                              </div>
                              {isLoading ? (
                                <p className="text-sm text-muted-foreground">
                                  Processing...
                                </p>
                              ) : (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleApproval(approval, true)
                                    }
                                  >
                                    <CheckCircle2 className="size-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleApproval(approval, false)
                                    }
                                  >
                                    <XCircle className="size-4 mr-1" />
                                    Decline
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </ToolContent>
                      </Tool>
                    );
                  }

                  return null;
                })}
              </div>
            ))}
            {status === "submitted" && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput onSubmit={handleSubmit} className="mt-4">
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
              placeholder="Try: What's the weather in Tokyo?"
            />
          </PromptInputBody>
          <PromptInputFooter>
            <div />
            <PromptInputSubmit disabled={!input.trim() || isLoading} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};

export default ToolApprovalDemo;
