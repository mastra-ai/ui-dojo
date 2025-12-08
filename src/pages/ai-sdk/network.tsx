import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
} from "@/components/ai-elements/prompt-input";
import { Action, Actions } from "@/components/ai-elements/actions";
import { Fragment, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Response } from "@/components/ai-elements/response";
import { MASTRA_BASE_URL } from "@/constants";
import { CopyIcon, RefreshCcwIcon, Network as NetworkIcon } from "lucide-react";
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
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolOutput,
} from "@/components/ai-elements/tool";
import type { ToolUIPart } from "ai";
import { Badge } from "@/components/ui/badge";
import type { AgentDataPart, NetworkDataPart } from "@mastra/ai-sdk";
import { CodeBlock } from "@/components/ai-elements/code-block";

type NetworkData = NetworkDataPart["data"];
type StepStatus = NetworkData["steps"][number]["status"];

const STATUS_MAP: Record<StepStatus, ToolUIPart["state"]> = {
  running: "input-available",
  success: "output-available",
  failed: "output-error",
  suspended: "input-available",
  waiting: "input-available",
};

// Convert routing-agent to Routing Agent
const getAgentDisplayName = (stepName: string) => {
  return stepName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const DisplayAgentStep = ({
  step,
  stepName,
  task,
}: {
  step: NetworkData["steps"][number];
  stepName: string;
  task: NetworkDataPart["data"]["steps"][number]["task"];
}) => {
  const displayName = getAgentDisplayName(stepName);
  const [open, setOpen] = useState(false);

  return (
    <Tool open={open || step.status === "running"} onOpenChange={setOpen}>
      <ToolHeader
        title={displayName}
        type="tool-data-network"
        state={STATUS_MAP[step.status]}
      />
      <ToolContent>
        {step.input && (
          <div className="mb-3 px-4 pt-4">
            <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase">
              Input
            </div>
            <CodeBlock
              language="json"
              code={
                typeof step.input === "string"
                  ? step.input
                  : JSON.stringify(step.input, null, 2)
              }
            />
          </div>
        )}
        <ToolOutput
          output={ (task as AgentDataPart['data'])?.text || step.output as ToolUIPart["output"]}
          errorText={step.status === "failed" ? "Step failed" : undefined}
          language="markdown"
        />
      </ToolContent>
    </Tool>
  );
};

const suggestions = [
  "Tell me about Spirited Away",
  "Plan activities in Seoul",
  "What's the weather in Tokyo?",
];

const NetworkDemo = () => {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, regenerate } = useChat({
    transport: new DefaultChatTransport({
      api: `${MASTRA_BASE_URL}/network`,
    }),
  });

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);

    if (!hasText) {
      return;
    }

    sendMessage({
      text: message.text || "",
      files: message.files,
    });
    setInput("");
  };

const handleSuggestionClick = (suggestion: string) => {
    sendMessage({ text: suggestion });
  };


  return (
    <div className="max-w-4xl mx-auto p-0 md:p-6 relative size-full">
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
                {message.parts.map((part, i) => {
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
                    case "data-network": {
                      const networkData = (part as NetworkDataPart)
                        .data as NetworkData;
                      const steps = networkData.steps || [];

                      // Count unique agents
                      const uniqueAgents = new Set(steps.map((s) => s.name))
                        .size;
                      const stepCount = steps.length;

                      const description =
                        uniqueAgents === stepCount
                          ? `${stepCount} agent${stepCount !== 1 ? "s" : ""} coordinated`
                          : `${stepCount} step${stepCount !== 1 ? "s" : ""} across ${uniqueAgents} agent${uniqueAgents !== 1 ? "s" : ""}`;

                      return (
                        <div
                          key={`${message.id}-${i}`}
                          className="my-4 space-y-4"
                        >
                          {/* Network Header */}
                          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
                            <NetworkIcon className="w-5 h-5 text-primary" />
                            <div className="flex-1">
                              <div className="font-semibold text-sm">
                                Agent Network Execution
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {description}
                              </div>
                            </div>
                            {networkData.status && (
                              <Badge
                                variant={
                                  networkData.status === "finished"
                                    ? "default"
                                    : networkData.status === "running"
                                      ? "outline"
                                      : "secondary"
                                }
                              >
                                {networkData.status === "running"
                                  ? "In Progress"
                                  : networkData.status === "finished"
                                    ? "Complete"
                                    : "Running"}
                              </Badge>
                            )}
                          </div>

                          {/* Display each agent step */}
                          {steps.map((step, stepIndex) => (
                            <DisplayAgentStep
                              key={`${step.name}-${stepIndex}`}
                              step={step}
                              stepName={step.name}
                             // @ts-expect-error - task is not typed, 
                              task={(step)?.task}
                            />
                          ))}
                        </div>
                      );
                    }
                    default:
                      return null;
                  }
                })}
              </div>
            ))}
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
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <div>
              Ask about Studio Ghibli, activites in a city, or for the weather.
            </div>
            <PromptInputSubmit disabled={!input && !status} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};

export default NetworkDemo;
