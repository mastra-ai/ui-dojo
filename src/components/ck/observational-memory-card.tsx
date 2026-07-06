import { z } from "zod";
import { ActivityCard } from "@/components/ck/activity-card";

export const observationalMemoryContentSchema = z
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

type ObservationalMemoryContent = z.infer<
  typeof observationalMemoryContentSchema
>;

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

/**
 * Observational memory activity card emitted by the Mastra bridge.
 */
export function ObservationalMemoryCard({
  content,
}: {
  content: ObservationalMemoryContent;
}) {
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

export const observationalMemoryRenderer = {
  activityType: "mastra-observational-memory",
  content: observationalMemoryContentSchema,
  render: ({ content }: { content: ObservationalMemoryContent }) => (
    <ObservationalMemoryCard content={content} />
  ),
};
