import "@copilotkit/react-core/v2/styles.css";
import { useMemo, useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotChat,
  CopilotChatConfigurationProvider,
  useConfigureSuggestions,
  useInterrupt,
} from "@copilotkit/react-core/v2";
import { MASTRA_BASE_URL } from "@/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Native Human-in-the-Loop via Mastra's suspend/resume. The ck_interrupt agent
// calls the schedule_meeting tool, which suspend()s; the @ag-ui/mastra bridge
// emits both the legacy `on_interrupt` CUSTOM event and (emitInterruptOutcome
// defaults on) the standard RUN_FINISHED interrupt outcome. CopilotKit v2's
// useInterrupt renders the picker; resolve() resumes the suspended tool with the
// user's choice via RunAgentInput.resume (requires CopilotKit >= 1.61.2).

interface SuspendPayload {
  topic?: string;
  attendee?: string;
}

interface TimeSlot {
  iso: string;
  label: string;
}

function generateSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const now = new Date();
  for (let day = 1; day <= 2; day++) {
    for (const hour of [10, 14]) {
      const d = new Date(now);
      d.setDate(now.getDate() + day);
      d.setHours(hour, 0, 0, 0);
      slots.push({
        iso: d.toISOString(),
        label: d.toLocaleString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
      });
    }
  }
  return slots;
}

function TimePickerCard({
  topic,
  attendee,
  onPick,
  onCancel,
}: {
  topic: string;
  attendee?: string;
  onPick: (slot: TimeSlot) => void;
  onCancel: () => void;
}) {
  const slots = useMemo(() => generateSlots(), []);
  const [done, setDone] = useState<TimeSlot | "cancelled" | null>(null);

  // Once resolved, render nothing: resolve() resumes the run and this interrupt
  // unmounts, with the agent's text as the confirmation.
  if (done) return null;

  return (
    <Card className="mx-auto my-2 w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-base capitalize">{topic}</CardTitle>
        {attendee ? <CardDescription>with {attendee}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground">Pick a time</p>
        <div className="grid grid-cols-2 gap-2">
          {slots.map((slot) => (
            <Button
              key={slot.iso}
              variant="outline"
              className="h-auto py-2.5 text-sm font-medium"
              onClick={() => {
                setDone(slot);
                onPick(slot);
              }}
            >
              {slot.label}
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={() => {
            setDone("cancelled");
            onCancel();
          }}
        >
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
}

function ChatContent() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Book a call with sales",
        message: "Book an intro call with the sales team to discuss pricing.",
      },
      {
        title: "Schedule a 1:1 with Alice",
        message: "Schedule a 1:1 with Alice next week to review Q2 goals.",
      },
    ],
    available: "always",
  });

  useInterrupt({
    agentId: "ck_interrupt",
    renderInChat: true,
    render: ({ event, resolve }) => {
      const raw = event.value ?? {};
      const parsed = (typeof raw === "string" ? JSON.parse(raw) : raw) as {
        suspendPayload?: SuspendPayload;
      };
      const payload = parsed.suspendPayload ?? {};
      return (
        <TimePickerCard
          topic={payload.topic ?? "a call"}
          attendee={payload.attendee}
          onPick={(slot) =>
            resolve({ chosen_time: slot.iso, chosen_label: slot.label })
          }
          onCancel={() => resolve({ cancelled: true })}
        />
      );
    },
  });

  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="h-full w-full md:w-8/10 md:h-8/10 rounded-lg">
        <CopilotChat
          agentId="ck_interrupt"
          className="h-full rounded-2xl max-w-4xl mx-auto"
        />
      </div>
    </div>
  );
}

export default function HumanInTheLoopCopilotKitDemo() {
  return (
    <CopilotKit
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit`}
      showDevConsole={false}
      agent="ck_interrupt"
    >
      <CopilotChatConfigurationProvider agentId="ck_interrupt">
        <ChatContent />
      </CopilotChatConfigurationProvider>
    </CopilotKit>
  );
}
