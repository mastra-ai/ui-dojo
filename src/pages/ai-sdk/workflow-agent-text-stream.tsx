import { Loader } from "@/components/ai-elements/loader";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { Button } from "@/components/ui/button";
import { MASTRA_BASE_URL } from "@/constants";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type ToolUIPart } from "ai";
import { Fragment, useState } from "react";

type DisplayStepProps = {
  type: `tool-${string}`;
  title: string;
  status: "running" | "success" | "failed" | "suspended" | "waiting";
  text: unknown;
};

const STATUS_MAP: Record<DisplayStepProps["status"], ToolUIPart["state"]> = {
  running: "input-available",
  waiting: "input-available",
  suspended: "output-error",
  success: "output-available",
  failed: "output-error",
};

const DisplayStep = ({ type, status, text, title }: DisplayStepProps) => {
  const errorText = `Could not process ${title}`;

  return (
    <Tool>
      <ToolHeader title={title} type={type} state={STATUS_MAP[status]} />
      <ToolContent>
        <ToolOutput
          output={text}
          errorText={status === "failed" ? errorText : undefined}
        />
      </ToolContent>
    </Tool>
  );
};

type StepResult = {
  name: "agent-text-stream-workflow";
  steps: {
    "analyze-weather": {
      name: "analyze-weather";
      status: DisplayStepProps["status"];
      output: {
        analysis: string;
        location: string;
      };
    };
    "calculate-comfort": {
      name: "calculate-comfort";
      status: DisplayStepProps["status"];
      output: {
        comfortScore: number;
        summary: string;
        location: string;
      };
    };
  };
};

const WorkflowAgentTextStreamingDemo = () => {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${MASTRA_BASE_URL}/workflow-agent-text-stream`,
      prepareSendMessagesRequest: ({ messages }) => {
        return {
          body: {
            inputData: {
              location:
                messages[messages.length - 1].parts.find(
                  (part) => part.type === "text",
                )?.text || "",
            },
          },
        };
      },
    }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage({ text: input });
    setInput("");
  };

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
            placeholder="Enter a city name"
          />
          <Button type="submit" disabled={status !== "ready"}>
            Analyze Weather
          </Button>
        </form>
      </div>
      {messages.map((message) => (
        <div key={message.id}>
          {message.parts.map((part, index) => {
            // Display user input
            if (part.type === "text" && message.role === "user") {
              return (
                <Message key={index} from={message.role}>
                  <MessageContent>
                    <Response>{part.text}</Response>
                  </MessageContent>
                </Message>
              );
            }

            // Display agent's streamed text chunks
            if (part.type === "text" && message.role === "assistant") {
              return (
                <Message key={index} from="assistant">
                  <MessageContent>
                    <div className="prose prose-sm dark:prose-invert">
                      {status === "streaming" ? (
                        <p className="text-muted-foreground italic">
                          Agent analyzing...
                        </p>
                      ) : null}
                      <Response>{part.text}</Response>
                    </div>
                  </MessageContent>
                </Message>
              );
            }

            // Display workflow data and steps
            if (part.type === "data-workflow") {
              const type = `tool-${part.type}` as const;
              const steps = Object.values((part.data as StepResult).steps);
              const lastStep = steps.find(
                (step) => step.name === "calculate-comfort",
              );

              return (
                <Fragment key={index}>
                  {steps.map((step) => (
                    <DisplayStep
                      key={step.name}
                      type={type}
                      status={step.status}
                      text={step.output}
                      title={step.name}
                    />
                  ))}
                  {status === "ready" && lastStep && (
                    <Message from="assistant">
                      <MessageContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-1">
                            <div className="text-2xl leading-6 font-bold text-primary">
                              {lastStep.output.comfortScore}
                            </div>
                            <div className="text-base leading-6 text-muted-foreground">
                              / 100
                            </div>
                          </div>
                          <Response>{lastStep.output.summary}</Response>
                        </div>
                      </MessageContent>
                    </Message>
                  )}
                </Fragment>
              );
            }

            return null;
          })}
        </div>
      ))}
      {status === "submitted" && <Loader />}
    </div>
  );
};

export default WorkflowAgentTextStreamingDemo;
