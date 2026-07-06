import "@copilotkit/react-core/v2/styles.css";
import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotChat,
  useConfigureSuggestions,
  useRenderTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
import { MASTRA_BASE_URL } from "@/constants";

// Open generative UI: the agent decides to render a full interactive app — a
// working calculator — into the chat, not just text. The frontend owns the live
// component; the agent's show_calculator tool call is its request to show it,
// optionally pre-filled with an expression to evaluate.

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

function Calculator({ initial }: { initial?: string }) {
  const [expr, setExpr] = useState(initial ?? "");
  const [result, setResult] = useState(() =>
    initial ? safeEval(initial) : "",
  );

  const press = (t: string) => {
    if (t === "=") {
      setResult(safeEval(expr));
      return;
    }
    if (t === "C") {
      setExpr("");
      setResult("");
      return;
    }
    if (t === "⌫") {
      setExpr((e) => e.slice(0, -1));
      return;
    }
    setExpr((e) => e + t);
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
        {keys.flat().map((k) => {
          const isOp = ["/", "*", "-", "+", "="].includes(k);
          const isFn = ["C", "(", ")", "⌫"].includes(k);
          return (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              className={`h-11 rounded-lg text-sm font-semibold transition-colors ${
                k === "="
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : isOp
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : isFn
                      ? "bg-muted text-muted-foreground hover:bg-muted/70"
                      : "bg-background border hover:bg-muted"
              }`}
            >
              {k}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Chat() {
  useRenderTool({
    name: "show_calculator",
    parameters: z.object({ expression: z.string().optional() }),
    render: ({ parameters }) => (
      <Calculator
        initial={(parameters as { expression?: string })?.expression}
      />
    ),
  });

  useConfigureSuggestions({
    suggestions: [
      { title: "Open a calculator", message: "Show me a calculator." },
      { title: "Do some math", message: "What is 1245 * 37 + 892?" },
      { title: "Split the bill", message: "Calculate a 20% tip on $86.40." },
    ],
    available: "always",
  });

  return (
    <div className="flex h-full w-full flex-col">
      <p className="px-4 py-2 text-xs text-muted-foreground">
        Ask for a calculator or a calculation — the agent renders a working,
        interactive calculator right in the chat.
      </p>
      <div className="flex-1">
        <CopilotChat
          agentId="ck_open_gen_ui"
          className="h-full rounded-2xl max-w-4xl mx-auto"
        />
      </div>
    </div>
  );
}

export default function OpenGenerativeUIDemo() {
  return (
    <CopilotKit
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit`}
      showDevConsole={false}
      agent="ck_open_gen_ui"
    >
      <Chat />
    </CopilotKit>
  );
}
