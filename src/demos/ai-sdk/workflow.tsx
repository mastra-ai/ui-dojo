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
import { Input } from "@/components/ui/input";
import type { Forecast } from "@/mastra/shared";
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
  const errorText = `Could not fetch data for ${title}`;

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
  name: "weather-workflow";
  steps: {
    "fetch-weather": {
      name: "fetch-weather";
      status: DisplayStepProps["status"];
      output: Forecast;
    };
    "plan-activities": {
      name: "plan-activities";
      status: DisplayStepProps["status"];
      output: {
        activities: string;
      };
    };
  };
};

export const WorkflowDemo = () => {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "http://localhost:4111/workflow/activitiesWorkflow",
      prepareSendMessagesRequest: ({ messages }) => {
        return {
          body: {
            inputData: {
              // @ts-expect-error - FIX THIS
              location: messages[messages.length - 1].parts[0].text,
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
            Get Activities
          </Button>
        </form>
      </div>
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
              const type = `tool-${part.type}` as const;
              const steps = Object.values((part.data as StepResult).steps);
              const lastStep = steps.find(
                (step) => step.name === "plan-activities",
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
                        <Response>{lastStep.output.activities}</Response>
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
