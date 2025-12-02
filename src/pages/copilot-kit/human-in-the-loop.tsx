/* eslint-disable @typescript-eslint/no-explicit-any */
import { CopilotChat } from "@copilotkit/react-ui";
import { CopilotKit, useHumanInTheLoop } from "@copilotkit/react-core";
import { MASTRA_BASE_URL } from "@/constants";
import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const StepContainer = ({ children }: { children: React.ReactNode }) => (
  <Card>{children}</Card>
);

const StepHeader = ({
  enabledCount,
  totalCount,
  status,
  showStatus = false,
}: {
  enabledCount: number;
  totalCount: number;
  status: "executing" | "complete" | "inProgress";
  showStatus?: boolean;
}) => (
  <CardHeader className="flex flex-row justify-between items-center">
    <CardTitle>
      <h2 className="text-xl">Select Steps</h2>
    </CardTitle>
    <div className="flex flex-row gap-4 items-center">
      <div>
        {enabledCount}/{totalCount} Selected
      </div>
      {showStatus ? (
        <Badge>{status === "executing" ? "Ready" : "Waiting"}</Badge>
      ) : null}
    </div>
  </CardHeader>
);

const StepItem = ({
  step,
  onToggle,
  disabled = false,
}: {
  step: Step;
  onToggle: () => void;
  disabled?: boolean;
}) => (
  <div className="flex items-center gap-3">
    <input
      type="checkbox"
      checked={step.status === "enabled"}
      onChange={onToggle}
      disabled={disabled}
    />
    <Label htmlFor={step.description}>{step.description}</Label>
  </div>
);

const ActionButton = ({
  children,
  disabled,
  onClick,
  variant,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  variant: "outline" | "destructive";
}) => (
  <Button variant={variant} disabled={disabled} onClick={onClick}>
    {children}
  </Button>
);

interface Step {
  description: string;
  status: "disabled" | "enabled" | "executing";
}

const suggestions: { title: string; message: string }[] = [
  {
    title: "Simple plan to Mars",
    message: "Please plan a trip to mars in 5 steps.",
  },
];

function StepsFeedback({
  args,
  respond,
  status,
}: {
  args: any;
  respond: ((result: any) => void) | undefined;
  status: "executing" | "complete" | "inProgress";
}) {
  const [localSteps, setLocalSteps] = React.useState<Step[]>([]);
  const [accepted, setAccepted] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (status === "executing" && localSteps.length === 0) {
      setLocalSteps(args.steps);
    }
  }, [status, args.steps, localSteps]);

  if (args.steps === undefined || args.steps.length === 0) {
    return <></>;
  }

  const steps = localSteps.length > 0 ? localSteps : args.steps;
  const enabledCount = steps.filter(
    (step: any) => step.status === "enabled",
  ).length;

  const handleStepToggle = (index: number) => {
    setLocalSteps((prevSteps) =>
      prevSteps.map((step, i) =>
        i === index
          ? {
              ...step,
              status: step.status === "enabled" ? "disabled" : "enabled",
            }
          : step,
      ),
    );
  };

  const handleReject = () => {
    if (respond) {
      setAccepted(false);
      respond({ accepted: false });
    }
  };

  const handleConfirm = () => {
    if (respond) {
      setAccepted(true);
      respond({
        accepted: true,
        steps: localSteps.filter((step) => step.status === "enabled"),
      });
    }
  };

  return (
    <StepContainer>
      <StepHeader
        enabledCount={enabledCount}
        totalCount={steps.length}
        status={status}
        showStatus={true}
      />
      <CardContent className="flex flex-col gap-4">
        {steps.map((step: Step, index: number) => (
          <StepItem
            key={index}
            step={step}
            onToggle={() => handleStepToggle(index)}
            disabled={status !== "executing"}
          />
        ))}
      </CardContent>
      {accepted === null ? (
        <CardFooter className="flex gap-4">
          <ActionButton
            variant="destructive"
            disabled={status !== "executing"}
            onClick={handleReject}
          >
            Reject
          </ActionButton>
          <ActionButton
            variant="outline"
            disabled={status !== "executing"}
            onClick={handleConfirm}
          >
            Confirm
          </ActionButton>
        </CardFooter>
      ) : null}
      {accepted !== null ? (
        <CardFooter>{accepted ? "Accepted" : "Rejected"}</CardFooter>
      ) : null}
    </StepContainer>
  );
}

function HumanInTheLoopCopilotKitDemo() {
  return (
    <CopilotKit
      // Defined through registerCopilotKit() in src/mastra/index.ts
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit`}
      agent="planningAgent"
    >
      <Chat />
    </CopilotKit>
  );
}

function Chat() {
  useHumanInTheLoop({
    name: "generate_task_steps",
    description: "Generates a list of steps for the user to perform",
    parameters: [
      {
        name: "steps",
        type: "object[]",
        attributes: [
          {
            name: "description",
            type: "string",
          },
          {
            name: "status",
            type: "string",
            enum: ["enabled", "disabled", "executing"],
          },
        ],
      },
    ],
    available: "enabled",
    render: ({ args, respond, status }) => {
      return <StepsFeedback args={args} respond={respond} status={status} />;
    },
  });

  return (
    <CopilotChat
      labels={{
        title: "Planning Agent",
        initial: "Hi! 👋 Ask me to make a plan.",
      }}
      suggestions={suggestions}
      className="h-full w-full mx-auto"
    />
  );
}

export default HumanInTheLoopCopilotKitDemo;
