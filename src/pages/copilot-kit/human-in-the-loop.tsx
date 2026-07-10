import "@copilotkit/react-core/v2/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import {
  useConfigureSuggestions,
  useInterrupt,
} from "@copilotkit/react-core/v2";
import { MASTRA_BASE_URL } from "@/constants";
import { COPILOT_KIT_THREAD_IDS } from "./constants";
import { CopilotChatPanel } from "@/components/ck/copilot-chat-panel";
import { TimePickerCard } from "@/components/ck/time-picker-card";

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

export default function HumanInTheLoopCopilotKitDemo() {
  return (
    <CopilotKit
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit`}
      agent="ck_interrupt"
      threadId={COPILOT_KIT_THREAD_IDS.hitl}
    >
      <ChatContent />
    </CopilotKit>
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
    available: "before-first-message",
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
    <CopilotChatPanel
      agentId="ck_interrupt"
      containerClassName="copilotkit-hitl-demo"
    />
  );
}
