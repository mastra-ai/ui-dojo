import { useState } from "react";

/**
 * Interactive calculator UI rendered by the open generative UI example.
 */
export function CalculatorCard({ initial }: { initial?: string }) {
  const [expr, setExpr] = useState(initial ?? "");
  const [result, setResult] = useState(() =>
    initial ? safeEval(initial) : "",
  );

  const press = (token: string) => {
    if (token === "=") {
      setResult(safeEval(expr));
      return;
    }
    if (token === "C") {
      setExpr("");
      setResult("");
      return;
    }
    if (token === "⌫") {
      setExpr((value) => value.slice(0, -1));
      return;
    }
    setExpr((value) => value + token);
  };

  const keys = [
    ["C", "(", ")", "⌫"],
    ["7", "8", "9", "/"],
    ["4", "5", "6", "*"],
    ["1", "2", "3", "-"],
    ["0", ".", "=", "+"],
  ];

  return (
    <div className="my-3 w-[280px] rounded-2xl border bg-card p-4 shadow-sm">
      <div className="mb-3 rounded-lg bg-muted/50 p-3 text-right">
        <div className="h-4 text-xs text-muted-foreground">{expr || "0"}</div>
        <div className="text-2xl font-bold tabular-nums">{result || "0"}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {keys.flat().map((key) => {
          const isOp = ["/", "*", "-", "+", "="].includes(key);
          const isFn = ["C", "(", ")", "⌫"].includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => press(key)}
              className={`h-11 rounded-lg text-sm font-semibold transition-colors ${
                key === "="
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : isOp
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : isFn
                      ? "bg-muted text-muted-foreground hover:bg-muted/70"
                      : "border bg-background hover:bg-muted"
              }`}
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function safeEval(expr: string): string {
  const cleaned = expr.replace(/[^0-9+\-*/.()%\s]/g, "");
  if (!cleaned.trim()) return "";
  try {
    const result = Function(`"use strict"; return (${cleaned})`)();
    if (typeof result === "number" && Number.isFinite(result)) {
      return String(Math.round(result * 1e10) / 1e10);
    }
    return "Error";
  } catch {
    return "Error";
  }
}
