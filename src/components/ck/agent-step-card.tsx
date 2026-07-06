import { ActivityCard } from "@/components/ck/activity-card";

type Status = "inProgress" | "executing" | "complete" | string;

function normalize(result: unknown): Record<string, unknown> {
  if (typeof result === "string") {
    try {
      return JSON.parse(result);
    } catch {
      return { text: result };
    }
  }
  return (result as Record<string, unknown>) ?? {};
}

/**
 * One specialist agent's step in a multi-agent run, rendered from a supervisor's
 * `delegate_*` tool call so each hand-off is visible. Uses the shared
 * ActivityCard so it reads as the same component family as the other
 * generation/activity cards.
 */
export function AgentStepCard({
  emoji,
  name,
  subtitle,
  status,
  outputKey,
  result,
}: {
  emoji: string;
  name: string;
  subtitle?: string;
  status: Status;
  outputKey: string;
  result: unknown;
}) {
  const done = status === "complete";
  const data = normalize(result);
  const output = (data[outputKey] as string) ?? (data.text as string) ?? "";

  return (
    <ActivityCard
      icon={emoji}
      title={name}
      tone={done ? "done" : "running"}
      status={done ? "Done" : "Working…"}
    >
      {subtitle ? (
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      ) : null}
      {done && output ? (
        <p className="mt-2 whitespace-pre-wrap text-foreground">{output}</p>
      ) : null}
    </ActivityCard>
  );
}
