import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { z } from "zod";
import { getStorage } from "./storage";
import {
  weatherTool,
  stockPriceTool,
  scheduleMeetingTool,
  deepResearchTool,
} from "./tools";

const MODEL = "mastra/openai/gpt-5-mini";

/** Agentic chat — a plain weather assistant. Also demonstrates agent-context
 *  (the page sends the user's name via useAgentContext) and working memory. */
export const ckAgenticChatAgent = new Agent({
  id: "ck_agentic_chat",
  name: "ck_agentic_chat",
  instructions: `You are a helpful weather assistant.
- If a location isn't provided, ask for one.
- Use the get_weather tool to answer weather questions.
- If the user tells you their name, greet them by it.
- Keep responses concise but informative.`,
  model: MODEL,
  tools: { get_weather: weatherTool },
  memory: new Memory({
    storage: getStorage(),
    options: {
      workingMemory: {
        enabled: true,
        schema: z.object({ firstName: z.string() }),
      },
    },
  }),
});

/** Tool rendering — one agent with TWO differently-shaped tools so the page can
 *  show a CUSTOM renderer for get_weather and a CATCH-ALL renderer for
 *  get_stock_price in the same conversation. */
export const ckToolRenderingAgent = new Agent({
  id: "ck_tool_rendering",
  name: "ck_tool_rendering",
  instructions: `You are a helpful assistant with two tools.
- For weather questions, call get_weather.
- For stock price questions, call get_stock_price.
After a tool runs, do NOT repeat its data in text — the UI renders it. Just add a one-line remark.`,
  model: MODEL,
  tools: { get_weather: weatherTool, get_stock_price: stockPriceTool },
  memory: new Memory({ storage: getStorage() }),
});

/** Reasoning — an OpenAI reasoning model (o4-mini). `reasoningSummary: "detailed"`
 *  makes OpenAI return a human-readable summary of the model's thinking, which
 *  the bridge streams as reasoning events and CopilotChat renders inline (without
 *  it you only get a "Thought for Ns" placeholder with no content). */
export const ckReasoningAgent = new Agent({
  id: "ck_reasoning",
  name: "ck_reasoning",
  instructions: `You are a careful problem solver. Work through the problem, then give a clear final answer.`,
  model: "mastra/openai/o4-mini",
  defaultOptions: {
    providerOptions: {
      openai: { reasoningSummary: "detailed", reasoningEffort: "medium" },
    },
  },
  memory: new Memory({ storage: getStorage() }),
});

/** Frontend tools — a plain agent. The sync + async client tools are declared
 *  on the page via useFrontendTool; CopilotKit forwards their schemas so the
 *  agent knows to call them. */
export const ckFrontendToolsAgent = new Agent({
  id: "ck_frontend_tools",
  name: "ck_frontend_tools",
  instructions: `You are a helpful assistant that can control the UI through frontend tools.
- Use change_background to change the page background (a synchronous tool).
- Use fetch_activity_suggestion when the user asks for something to do (an async tool that fetches from the browser).
Call the appropriate tool when the user asks. Keep replies short.`,
  model: MODEL,
  memory: new Memory({ storage: getStorage() }),
});

/** Multimodal — a vision-capable assistant. The page enables attachments so the
 *  user can upload images. */
export const ckMultimodalAgent = new Agent({
  id: "ck_multimodal",
  name: "ck_multimodal",
  instructions: `You are a helpful multimodal assistant. When the user uploads an image, describe what you see clearly and answer questions about it. Keep replies concise.`,
  model: MODEL,
  memory: new Memory({ storage: getStorage() }),
});

/** Open generative UI — the agent decides to render a full interactive app (a
 *  calculator) into the chat via a tool, not just text. The frontend owns the
 *  live component; the tool call is the agent's request to show it. */
export const ckOpenGenUIAgent = new Agent({
  id: "ck_open_gen_ui",
  name: "ck_open_gen_ui",
  instructions: `You help users with calculations.

When the user asks for a calculator, or asks any arithmetic/math question, call the show_calculator tool to render an interactive calculator into the chat. If the user asked a specific calculation, pass it as 'expression' (e.g. "12 * 8 + 5") so the calculator opens pre-filled with the result. After calling the tool, add a brief one-line remark; do NOT describe the calculator itself.`,
  model: MODEL,
  tools: {
    show_calculator: {
      id: "show_calculator",
      description:
        "Render an interactive calculator into the chat. Optionally pre-fill an expression to evaluate.",
      inputSchema: z.object({
        expression: z
          .string()
          .optional()
          .describe(
            "Optional arithmetic expression to pre-fill, e.g. '12 * 8 + 5'",
          ),
      }),
      outputSchema: z.object({ expression: z.string().optional() }),
      execute: async (args: unknown) => args,
    } as never,
  },
  memory: new Memory({ storage: getStorage() }),
});

/** Shared state — a recipe assistant with json-schema working memory. The
 *  built-in updateWorkingMemory tool streams state mid-run, which the bridge
 *  turns into STATE_DELTA (snapshot-first). The page binds agent.state and can
 *  edit it (write-back) + sends agent-context. */
export const ckSharedStateAgent = new Agent({
  id: "ck_shared_state",
  name: "ck_shared_state",
  instructions: `You are a helpful assistant for creating recipes.

The recipe in working memory is the user's CURRENT state — they edit it directly in the UI. Treat it as the source of truth, even when an earlier message said otherwise.

IMPORTANT:
1. Create a complete recipe using the existing ingredients and instructions.
2. Append new ingredients to the existing ones; append new steps to the existing ones.
3. 'ingredients' is an array of objects with 'icon', 'name', and 'amount'.
4. 'instructions' is an array of strings.
5. 'special_preferences', 'skill_level' and 'cooking_time' are chosen by the USER, not you. NEVER add, remove, or change them — leave them exactly as they are in working memory. Do NOT re-add a preference the user removed.
6. Make 'ingredients' and 'instructions' MATCH the user's 'special_preferences' (e.g. if "Vegan" is set use vegan ingredients; if "Spicy" is absent use no heat).

After creating or modifying the recipe, answer in one short sentence what you did. Do not describe the whole recipe and do not mention "working memory" or "state".`,
  model: MODEL,
  memory: new Memory({
    storage: getStorage(),
    options: {
      workingMemory: {
        enabled: true,
        schema: z.object({
          recipe: z.object({
            skill_level: z
              .enum(["Beginner", "Intermediate", "Advanced"])
              .describe("The skill level required for the recipe"),
            special_preferences: z
              .array(
                z.enum([
                  "High Protein",
                  "Low Carb",
                  "Spicy",
                  "Budget-Friendly",
                  "One-Pot Meal",
                  "Vegetarian",
                  "Vegan",
                ]),
              )
              .describe("A list of special preferences for the recipe"),
            cooking_time: z
              .enum(["5 min", "15 min", "30 min", "45 min", "60+ min"])
              .describe("The cooking time of the recipe"),
            ingredients: z
              .array(
                z.object({
                  icon: z.string().describe("The ingredient emoji, e.g. 🥕"),
                  name: z.string(),
                  amount: z.string(),
                }),
              )
              .describe("The full list of ingredients"),
            instructions: z
              .array(z.string())
              .describe("The full list of instructions"),
          }),
        }),
      },
    },
  }),
});

/** Background tasks — dispatches run_deep_research as a background task; the
 *  bridge surfaces its lifecycle as activity events. */
export const ckBackgroundTasksAgent = new Agent({
  id: "ck_background_tasks",
  name: "ck_background_tasks",
  instructions: `You are a research assistant that dispatches long-running work as background tasks.
When the user asks you to research or investigate a topic, call run_deep_research with the topic. It runs in the background and returns immediately; briefly tell the user you kicked it off and they'll get findings shortly. Do NOT invent findings — the work is still running. Keep replies short.`,
  model: MODEL,
  tools: { run_deep_research: deepResearchTool },
  memory: new Memory({ storage: getStorage() }),
  // Force background-eligible tools to actually run in the background so the
  // demo is reliable rather than left to the model's per-call choice.
  backgroundTasks: { tools: "all" },
});

/** Observational memory — OM enabled on Memory (developer opt-in). Low
 *  thresholds so observation/buffering/activation fire within a few sizable
 *  turns. The bridge surfaces the data-om-* chunks as activity events when the
 *  OM route toggle is on (see copilotkit-om-route.ts). */
export const ckObservationalMemoryAgent = new Agent({
  id: "ck_observational_memory",
  name: "ck_observational_memory",
  instructions: `You are a friendly travel assistant. Chat naturally and keep replies short (2-3 sentences).`,
  model: MODEL,
  memory: new Memory({
    storage: getStorage(),
    options: {
      observationalMemory: {
        // Same provider as the main model so one key drives the whole demo
        // (OM's default is google/gemini-2.5-flash).
        model: MODEL,
        scope: "thread",
        observation: {
          // Trigger is UNOBSERVED message tokens (user + assistant), so message
          // SIZE crosses it, not turn count. Kept low so a couple of ordinary
          // messages surface the memory activity in the demo.
          messageTokens: 300,
          bufferTokens: 150,
        },
        reflection: { observationTokens: 800 },
      },
    },
  }),
});

/** Interrupt / HITL — native suspend/resume via the schedule_meeting tool. */
export const ckInterruptAgent = new Agent({
  id: "ck_interrupt",
  name: "ck_interrupt",
  instructions: `You are a scheduling assistant. Whenever the user asks to book a call or schedule a meeting, you MUST call the schedule_meeting tool with a short 'topic' and, if known, an 'attendee'. The tool pauses and shows a time picker. After it resumes, briefly confirm whether the meeting was scheduled and when, or note that the user cancelled. Do not ask for approval yourself — always call the tool. Keep responses short.`,
  model: MODEL,
  // Cast: a tool with concrete suspend/resume schemas isn't structurally
  // assignable to Mastra's generic tools map. Runtime behavior is unaffected.
  tools: { schedule_meeting: scheduleMeetingTool as never },
  memory: new Memory({ storage: getStorage() }),
});
