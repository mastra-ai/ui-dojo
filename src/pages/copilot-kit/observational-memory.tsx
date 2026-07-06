import "@copilotkit/react-core/v2/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotChat,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
import { MASTRA_BASE_URL } from "@/constants";
import { ActivityCard } from "@/components/ck/activity-card";

// Mirrors the "mastra-observational-memory" activity content from @ag-ui/mastra.
const omContentSchema = z
  .object({
    cycleId: z.string(),
    phase: z.enum(["observation", "buffering", "activation"]).optional(),
    status: z.enum(["running", "completed", "failed", "activated"]).optional(),
    observations: z.string().optional(),
    bufferedTokens: z.number().optional(),
    tokensActivated: z.number().optional(),
    error: z.string().optional(),
  })
  .passthrough();

type OMContent = z.infer<typeof omContentSchema>;

const PHASE_LABEL: Record<string, string> = {
  observation: "Observing",
  buffering: "Compressing",
  activation: "Activating",
};
const TONE: Record<string, "running" | "done" | "info" | "failed"> = {
  running: "running",
  completed: "info",
  activated: "done",
  failed: "failed",
};

function OMCard({ content }: { content: OMContent }) {
  const status = content.status ?? "running";
  const phase = content.phase
    ? (PHASE_LABEL[content.phase] ?? content.phase)
    : "Memory";
  return (
    <ActivityCard
      icon="🧠"
      title="Observational Memory"
      tone={TONE[status] ?? "running"}
      status={`${phase} · ${status}`}
    >
      {content.observations ? (
        <p className="text-muted-foreground">{content.observations}</p>
      ) : null}
      <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
        {typeof content.bufferedTokens === "number" ? (
          <span>{content.bufferedTokens} tokens compressed</span>
        ) : null}
        {typeof content.tokensActivated === "number" ? (
          <span>{content.tokensActivated} tokens activated</span>
        ) : null}
      </div>
      {content.error ? (
        <p className="mt-2 text-rose-700 dark:text-rose-400">{content.error}</p>
      ) : null}
    </ActivityCard>
  );
}

const omRenderer = {
  activityType: "mastra-observational-memory",
  content: omContentSchema,
  render: ({ content }: { content: OMContent }) => <OMCard content={content} />,
};

// OM triggers on unobserved message-token size, so a couple of substantive
// messages cross the (low) threshold and surface the memory activity.
const MSG_1 =
  "I'm planning a two-week spring trip across Japan — Tokyo, Kyoto, Osaka, and Hiroshima. I care about cherry blossoms, great food, and avoiding crowds. Help me shape a rough itinerary.";
const MSG_2 =
  "Also: I'm vegetarian, I love quiet gardens and photography, I want one ryokan night with an onsen, and I prefer trains over buses. What would you adjust, and what shouldn't I miss?";

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      { title: "Plan my Japan trip", message: MSG_1 },
      { title: "Add my preferences", message: MSG_2 },
    ],
    available: "always",
  });

  return (
    <CopilotChat
      agentId="ck_observational_memory"
      className="h-full rounded-2xl max-w-4xl mx-auto"
    />
  );
}

export default function ObservationalMemoryDemo() {
  return (
    <CopilotKit
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit-om`}
      showDevConsole={false}
      agent="ck_observational_memory"
      renderActivityMessages={[omRenderer]}
    >
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-full w-full md:w-8/10 md:h-8/10 rounded-lg">
          <Chat />
        </div>
      </div>
    </CopilotKit>
  );
}
