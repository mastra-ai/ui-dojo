import { makeAssistantToolUI } from "@assistant-ui/react";
import { useState, useEffect, useCallback } from "react";
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

type Step = {
  description: string;
  status: "enabled" | "disabled";
};

type StepApprovalArgs = {
  steps: Step[];
};

type StepApprovalResult = {
  accepted: boolean;
  steps: Step[];
};

export const StepApprovalToolUI = makeAssistantToolUI<
  StepApprovalArgs,
  StepApprovalResult
>({
  toolName: "generateTaskStepsTool",
  render: function Render({ args, status, result, addResult }) {
    const [localSteps, setLocalSteps] = useState<Step[] | null>(null);
    const [hasInteracted, setHasInteracted] = useState(false);

    const isRunning = status.type === "running";
    const isComplete = status.type === "complete";

    // Initialize local state when streaming completes (status changes from running)
    // or when user hasn't interacted yet
    useEffect(() => {
      if (!isRunning && !hasInteracted && args?.steps?.length) {
        setLocalSteps(args.steps);
      }
    }, [isRunning, hasInteracted, args?.steps]);

    // Use localSteps if user has interacted, otherwise use args.steps for live streaming
    const steps =
      hasInteracted && localSteps ? localSteps : (args?.steps ?? []);
    const enabledCount = steps.filter((s) => s.status === "enabled").length;

    const handleToggle = useCallback(
      (index: number) => {
        // On first interaction, copy current args to local state
        if (!hasInteracted) {
          setHasInteracted(true);
          setLocalSteps(args?.steps ?? []);
        }

        setLocalSteps((prev) =>
          (prev ?? []).map((step, i) =>
            i === index
              ? {
                  ...step,
                  status: step.status === "enabled" ? "disabled" : "enabled",
                }
              : step,
          ),
        );
      },
      [hasInteracted, args?.steps],
    );

    const handleConfirm = useCallback(() => {
      const stepsToSubmit = localSteps ?? args?.steps ?? [];
      addResult({
        accepted: true,
        steps: stepsToSubmit.filter((step) => step.status === "enabled"),
      });
    }, [addResult, localSteps, args?.steps]);

    const handleReject = useCallback(() => {
      addResult({ accepted: false, steps: [] });
    }, [addResult]);

    if (!args?.steps?.length) {
      return null;
    }

    return (
      <Card className="my-4">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>
            <h2 className="text-xl">Select Steps</h2>
          </CardTitle>
          <div className="flex flex-row gap-4 items-center">
            <div>
              {enabledCount}/{steps.length} Selected
            </div>
            {!isComplete && (
              <Badge variant={isRunning ? "secondary" : "default"}>
                {isRunning ? "Waiting" : "Ready"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={step.status === "enabled"}
                onChange={() => handleToggle(index)}
                disabled={isComplete || isRunning}
              />
              <Label>{step.description}</Label>
            </div>
          ))}
        </CardContent>
        {!isComplete && (
          <CardFooter className="flex gap-4">
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isRunning}
            >
              Reject
            </Button>
            <Button
              variant="outline"
              onClick={handleConfirm}
              disabled={isRunning}
            >
              Confirm
            </Button>
          </CardFooter>
        )}
        {isComplete && (
          <CardFooter>{result?.accepted ? "Accepted" : "Rejected"}</CardFooter>
        )}
      </Card>
    );
  },
});
