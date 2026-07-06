import "@copilotkit/react-core/v2/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotChat,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
import { MASTRA_BASE_URL } from "@/constants";
import { ActivityCard } from "@/components/ck/activity-card";

// Mirrors the "mastra-background-task" activity content the @ag-ui/mastra bridge
// emits (built up via snapshot + JSON-patch deltas, so most fields are optional).
const backgroundTaskContentSchema = z
  .object({
    taskId: z.string(),
    toolName: z.string().optional(),
    status: z
      .enum([
        "started",
        "running",
        "suspended",
        "resumed",
        "completed",
        "failed",
        "cancelled",
      ])
      .optional(),
    args: z.record(z.string(), z.any()).optional(),
    elapsedMs: z.number().optional(),
    result: z.any().optional(),
    error: z.string().optional(),
  })
  .passthrough();

type BackgroundTaskContent = z.infer<typeof backgroundTaskContentSchema>;

const STATUS: Record<
  string,
  { tone: "running" | "done" | "info" | "failed"; label: string }
> = {
  started: { tone: "running", label: "Queued" },
  running: { tone: "running", label: "Running" },
  resumed: { tone: "running", label: "Running" },
  suspended: { tone: "info", label: "Suspended" },
  completed: { tone: "done", label: "Completed" },
  failed: { tone: "failed", label: "Failed" },
  cancelled: { tone: "info", label: "Cancelled" },
};

function BackgroundTaskCard({ content }: { content: BackgroundTaskContent }) {
  const status = content.status ?? "started";
  const s = STATUS[status] ?? STATUS.started;
  const result = content.result as
    | { summary?: string; sources?: number }
    | undefined;
  const active = s.tone === "running" || status === "suspended";

  return (
    <ActivityCard
      icon="⚙️"
      title="Background task"
      tone={s.tone}
      status={s.label}
    >
      {content.args?.topic ? (
        <p className="text-muted-foreground">
          Topic:{" "}
          <span className="font-medium text-foreground">
            {String(content.args.topic)}
          </span>
        </p>
      ) : null}
      {typeof content.elapsedMs === "number" ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Elapsed {(content.elapsedMs / 1000).toFixed(1)}s
        </p>
      ) : null}
      {active ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Dispatched to the background — the agent keeps chatting; the result
          streams back and this card updates when it finishes.
        </p>
      ) : null}
      {status === "completed" && result?.summary ? (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900 dark:bg-emerald-950/40">
          <p className="text-emerald-900 dark:text-emerald-200">
            {result.summary}
          </p>
          {typeof result.sources === "number" ? (
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
              {result.sources} sources reviewed
            </p>
          ) : null}
        </div>
      ) : null}
      {status === "failed" && content.error ? (
        <p className="mt-2 text-rose-700 dark:text-rose-400">{content.error}</p>
      ) : null}
    </ActivityCard>
  );
}

const backgroundTaskRenderer = {
  activityType: "mastra-background-task",
  content: backgroundTaskContentSchema,
  render: ({ content }: { content: BackgroundTaskContent }) => (
    <BackgroundTaskCard content={content} />
  ),
};

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Research Solana",
        message: "Research the Solana ecosystem for me.",
      },
      {
        title: "Investigate RAG",
        message:
          "Investigate best practices for retrieval-augmented generation.",
      },
    ],
    available: "always",
  });

  return (
    <CopilotChat
      agentId="ck_background_tasks"
      className="h-full rounded-2xl max-w-4xl mx-auto"
    />
  );
}

export default function BackgroundTasksDemo() {
  return (
    <CopilotKit
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit-bg`}
      showDevConsole={false}
      agent="ck_background_tasks"
      renderActivityMessages={[backgroundTaskRenderer]}
    >
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-full w-full md:w-8/10 md:h-8/10 rounded-lg">
          <Chat />
        </div>
      </div>
    </CopilotKit>
  );
}
