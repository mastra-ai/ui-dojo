import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Deterministic weather tool used by the chat / tool-rendering / generative-UI
 * demos. Kept synthetic so the demos never depend on a live weather API.
 */
export const weatherTool = createTool({
  id: "get_weather",
  description: "Get the current weather for a location.",
  inputSchema: z.object({
    location: z.string().describe("City name"),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    conditions: z.string(),
    city: z.string(),
  }),
  execute: async ({ location }) => ({
    temperature: 20,
    feelsLike: 22,
    humidity: 60,
    windSpeed: 10,
    conditions: "Sunny",
    city: location,
  }),
});

/**
 * A second, differently-shaped tool so the tool-rendering demo can show a
 * CUSTOM renderer for one tool and a CATCH-ALL renderer for another in the same
 * conversation.
 */
export const stockPriceTool = createTool({
  id: "get_stock_price",
  description: "Get the latest (simulated) stock price for a ticker symbol.",
  inputSchema: z.object({
    symbol: z.string().describe("Ticker symbol, e.g. AAPL"),
  }),
  outputSchema: z.object({
    symbol: z.string(),
    price: z.number(),
    change: z.number(),
    currency: z.string(),
  }),
  execute: async ({ symbol }) => {
    // Deterministic pseudo-price derived from the symbol so it's stable.
    const seed = symbol
      .toUpperCase()
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0);
    const price = 50 + (seed % 400) + Math.round(seed % 100) / 100;
    const change = ((seed % 21) - 10) / 10;
    return { symbol: symbol.toUpperCase(), price, change, currency: "USD" };
  },
});

/**
 * Backend tool that suspends its own execution — Mastra's native HITL primitive.
 * When `suspend()` is called the @ag-ui/mastra bridge emits a CUSTOM
 * `on_interrupt` event AND (since emitInterruptOutcome defaults on) a structured
 * `RUN_FINISHED.outcome`; CopilotKit v2 `useInterrupt` renders the picker and
 * resumes the tool with the user's choice via `resumeData`.
 */
export const scheduleMeetingTool = createTool({
  id: "schedule_meeting",
  description:
    "Ask the user to pick a meeting time. Surfaces an in-chat time picker " +
    "and returns the user's selection so the agent can confirm.",
  inputSchema: z.object({
    topic: z.string().describe("Short description of the meeting purpose"),
    attendee: z.string().optional().describe("Who the meeting is with"),
  }),
  suspendSchema: z.object({
    topic: z.string(),
    attendee: z.string().optional(),
  }),
  resumeSchema: z.object({
    chosen_time: z.string().optional(),
    chosen_label: z.string().optional(),
    cancelled: z.boolean().optional(),
  }),
  execute: async (inputData, context) => {
    const { resumeData, suspend } = context?.agent ?? {};

    // First execution: pause and ask the user to pick a time. Return the
    // `suspend()` call DIRECTLY so Mastra pauses at tool-call-suspended. Do NOT
    // `await suspend()` then return — that completes the tool and the run
    // continues without waiting for the user.
    if (!resumeData) {
      return suspend?.({
        topic: inputData.topic,
        attendee: inputData.attendee,
      });
    }

    if (resumeData.cancelled) {
      return `User cancelled. Meeting NOT scheduled: ${inputData.topic}`;
    }
    const label = resumeData.chosen_label ?? resumeData.chosen_time;
    return label
      ? `Meeting scheduled for ${label}: ${inputData.topic}`
      : `User did not pick a time. Meeting NOT scheduled: ${inputData.topic}`;
  },
});

/**
 * A deliberately slow "deep research" tool, flagged background-eligible so
 * Mastra's Background Task manager dispatches it out of the agentic loop. Its
 * lifecycle surfaces on fullStream as background-task-* chunks, which the
 * @ag-ui/mastra bridge maps to ACTIVITY_SNAPSHOT / ACTIVITY_DELTA events.
 */
export const deepResearchTool = createTool({
  id: "run_deep_research",
  description:
    "Run a long deep-research job on a topic. Runs in the background and " +
    "reports progress while the conversation continues. Use it whenever the " +
    "user asks to research, investigate, or dig into a topic.",
  inputSchema: z.object({
    topic: z.string().describe("The topic to research"),
  }),
  outputSchema: z.object({
    topic: z.string(),
    summary: z.string(),
    sources: z.number(),
  }),
  background: { enabled: true, waitTimeoutMs: 60_000 },
  execute: async ({ topic }) => {
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 800));
    }
    return {
      topic,
      summary: `Completed a deep-research pass on "${topic}": gathered findings, cross-checked sources, and synthesized a summary.`,
      sources: 7,
    };
  },
});
