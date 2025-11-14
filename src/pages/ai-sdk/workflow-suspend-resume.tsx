import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MASTRA_BASE_URL } from "@/constants";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type ToolUIPart } from "ai";
import { useState, useMemo } from "react";
import { CheckCircle2, XCircle, FileText, AlertCircle } from "lucide-react";
import type { WorkflowDataPart } from "@mastra/ai-sdk";

type WorkflowData = WorkflowDataPart["data"];

const STATUS_MAP: Record<WorkflowData["steps"][string]["status"], ToolUIPart["state"]> = {
  running: "input-available",
  waiting: "input-available",
  suspended: "input-available",
  success: "output-available",
  failed: "output-error",
  bailed: "output-error",
};

const DisplayStep = ({ 
  step, 
  title 
}: { 
  step: WorkflowData["steps"][string]; 
  title: string;
}) => {
  return (
    <Tool>
      <ToolHeader
        title={title}
        type="tool-data-workflow"
        state={STATUS_MAP[step.status]}
      />
      <ToolContent>
        {step.status === "suspended" && step.suspendPayload && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  Awaiting Approval
                </div>
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  {typeof step.suspendPayload === "object" && "message" in step.suspendPayload
                    ? String(step.suspendPayload.message)
                    : JSON.stringify(step.suspendPayload)}
                </div>
                {typeof step.suspendPayload === "object" && "requestId" in step.suspendPayload && (
                  <Badge variant="outline" className="mt-2">
                    ID: {String(step.suspendPayload.requestId)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
        <ToolOutput 
          output={step.output} 
          errorText={step.status === "failed" ? "Step failed" : undefined} 
        />
      </ToolContent>
    </Tool>
  );
};

const WorkflowSuspendResumeDemo = () => {
  const [requestType, setRequestType] = useState("");
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState("");
  const [approverName, setApproverName] = useState("");

  const { messages, sendMessage, setMessages, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${MASTRA_BASE_URL}/workflow/approvalWorkflow`,
      prepareSendMessagesRequest: ({ messages }) => {

        const lastMessage = messages[messages.length - 1].parts.find((part) => part.type === "text")?.text;
        const metadata = messages[messages.length - 1].metadata as { runId: string, approverName?: string, requestType?: string, amount?: string, details?: string };

        if (lastMessage === "Approve" || lastMessage === "Reject") {
          return {
            body: {
              runId: metadata.runId,
              step: "request-approval",
              resumeData: {
                approved: lastMessage === "Approve",
                approverName: metadata.approverName,
              },
            },
          };
        }

        // Otherwise, start new workflow with inputData
        return {
          body: {
            inputData: {
              requestType: metadata.requestType,
              amount: metadata.amount ? parseFloat(metadata.amount) : undefined,
              details: metadata.details,
            },
          },
        };
      },
    }),
  });

  const suspendedWorkflow = useMemo(() => {
    const part = messages
      .flatMap((m) => m.parts)
      .find((part): part is WorkflowDataPart => 
        part.type === "data-workflow" && 
        "data" in part &&
        typeof part.data === "object" &&
        part.data !== null &&
        "status" in part.data &&
        part.data.status === "suspended"
      );
    return part ? (part.data as WorkflowData) : null;
  }, [messages]);

  const prevRunId = 
    messages
      .flatMap((m) => m.parts)
      .find((part): part is WorkflowDataPart => 
        part.type === "data-workflow"
      )?.id;



  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestType.trim() || !details.trim()) return;
    setMessages([]);
    sendMessage({ text: "Start", metadata: {runId: prevRunId, requestType, amount, details } });
  };

  const handleApprove = () => {
    if (!suspendedWorkflow) return;
    setMessages([]);
    sendMessage({ text: "Approve", metadata: {runId: prevRunId, approverName } });
  };

  const handleReject = () => {
    if (!suspendedWorkflow) return;
    setMessages([]);
    sendMessage({ text: "Reject", metadata: {runId: prevRunId, approverName } });
  };

  const isSuspended = suspendedWorkflow !== null;
  const canStart = status === "ready" && !isSuspended;
  const canResume = isSuspended && status === "ready";

  return (
    <div className="flex flex-col gap-6 h-full max-h-full">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <CardTitle>Request Approval Workflow</CardTitle>
          </div>
          <CardDescription>
            Submit a request that requires approval. The workflow will suspend and wait for your decision.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleStart} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="requestType" className="text-sm font-medium">
                Request Type
              </label>
              <Input
                id="requestType"
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                placeholder="e.g., Expense, Vacation, Purchase"
                required
                disabled={!canStart}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount (optional)
              </label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                disabled={!canStart}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="details" className="text-sm font-medium">
                Details
              </label>
              <Input
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe your request..."
                required
                disabled={!canStart}
              />
            </div>
            {isSuspended && (
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <label htmlFor="approverName" className="text-sm font-medium">
                  Your Name (optional)
                </label>
                <Input
                  id="approverName"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
            )}
            <div className="flex gap-2">
              {canStart && (
                <Button type="submit" disabled={!requestType.trim() || !details.trim()} className="flex-1">
                  Submit Request
                </Button>
              )}
              {canResume && (
                <>
                  <Button
                    type="button"
                    onClick={handleApprove}
                    variant="default"
                    className="flex-1"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    type="button"
                    onClick={handleReject}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
              {isSuspended && !canResume && (
                <div className="text-sm text-muted-foreground p-2">
                  Waiting for workflow to be ready...
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
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

              if (part.type === "data-workflow") {
                const workflow = (part as WorkflowDataPart).data as WorkflowData;
                const steps = Object.entries(workflow.steps);

                return (
                  <div key={index} className="space-y-4">
                    {steps.map(([stepId, step]) => (
                      <DisplayStep key={stepId} step={step} title={stepId} />
                    ))}
                    {status === "ready" && workflow.steps["finalize-request"]?.status === "success" && (
                      <Message from="assistant">
                        <MessageContent>
                          <Response>
                            {(() => {
                              const output = workflow.steps["finalize-request"]?.output;
                              if (output && typeof output === "object" && "message" in output) {
                                const message = output.message;
                                return typeof message === "string" ? message : null;
                              }
                              return null;
                            })()}
                          </Response>
                        </MessageContent>
                      </Message>
                    )}
                  </div>
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
        ))}
      </div>
    </div>
  );
};

export default WorkflowSuspendResumeDemo;
