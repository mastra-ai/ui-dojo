import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "running" | "done" | "info" | "failed";

const DOT: Record<Tone, string> = {
  running: "bg-amber-400 animate-pulse",
  done: "bg-emerald-500",
  info: "bg-sky-400",
  failed: "bg-rose-500",
};
const TEXT: Record<Tone, string> = {
  running: "text-amber-600 dark:text-amber-400",
  done: "text-emerald-600 dark:text-emerald-400",
  info: "text-sky-600 dark:text-sky-400",
  failed: "text-rose-600 dark:text-rose-400",
};

/**
 * A single coherent shell (shadcn Card) for every "generation / activity" UI in
 * the CopilotKit demos — background tasks, observational memory, sub-agent
 * hand-offs — so they all read as the same component family.
 */
export function ActivityCard({
  icon,
  title,
  tone,
  status,
  children,
  className,
}: {
  icon?: ReactNode;
  title: string;
  tone: Tone;
  status: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("my-2 w-full max-w-xl gap-0 py-0", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 px-4 py-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          {icon ? <span className="text-base leading-none">{icon}</span> : null}
          {title}
        </CardTitle>
        <span
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium",
            TEXT[tone],
          )}
        >
          <span className={cn("h-2 w-2 rounded-full", DOT[tone])} />
          {status}
        </span>
      </CardHeader>
      {children ? (
        <CardContent className="px-4 pb-4 pt-0 text-sm">{children}</CardContent>
      ) : null}
    </Card>
  );
}
