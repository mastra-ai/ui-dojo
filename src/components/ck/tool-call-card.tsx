/**
 * Generic fallback UI for CopilotKit tool calls without a dedicated renderer.
 */
export function ToolCallCard({
  name,
  parameters,
  status,
  result,
}: {
  name: string;
  parameters: unknown;
  status: string;
  result: unknown;
}) {
  return (
    <div className="mt-3 w-full max-w-md rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-semibold">{name}</span>
        <span className="text-xs text-muted-foreground">{status}</span>
      </div>
      <div className="mt-3">
        <div className="text-xs font-medium text-muted-foreground">
          Arguments
        </div>
        <pre className="mt-1 overflow-x-auto rounded-md bg-muted p-2 text-xs">
          {prettyPrint(parameters)}
        </pre>
      </div>
      {status === "complete" && (
        <div className="mt-3">
          <div className="text-xs font-medium text-muted-foreground">
            Result
          </div>
          <pre className="mt-1 overflow-x-auto rounded-md bg-muted p-2 text-xs">
            {prettyPrint(result)}
          </pre>
        </div>
      )}
    </div>
  );
}

function prettyPrint(value: unknown): string {
  let parsed: unknown = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return value;
    }
  }
  try {
    return JSON.stringify(parsed, null, 2);
  } catch {
    return String(parsed);
  }
}
