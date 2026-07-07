import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { Memory } from "@mastra/memory";
import { z } from "zod";
import { getStorage } from "./storage";
import { weatherTool, stockPriceTool } from "./tools";

const MODEL = "mastra/openai/gpt-5-mini";

// ── Specialist sub-agents ────────────────────────────────────────────────
// Each is a real Mastra Agent. The supervisor delegates to them through
// explicit "delegate_*" tools (below) so every hand-off surfaces in the UI as
// its own rendered card — you can watch Research → Write → Review happen,
// instead of just getting one final answer.

const researchSubAgent = new Agent({
  id: "ck_research_sub_agent",
  name: "ck_research_sub_agent",
  description: "Research specialist.",
  instructions: `You are a research specialist. Gather 3-5 concise, factual bullet points on the requested topic. Use get_weather / get_stock_price when relevant. Return only the findings.`,
  model: MODEL,
  tools: { get_weather: weatherTool, get_stock_price: stockPriceTool },
});

const writerSubAgent = new Agent({
  id: "ck_writer_sub_agent",
  name: "ck_writer_sub_agent",
  description: "Writing specialist.",
  instructions: `You are a writing specialist. Turn the provided research notes into a short, engaging, well-structured summary (a tight paragraph or a few bullets).`,
  model: MODEL,
});

async function runAgent(agent: Agent, prompt: string): Promise<string> {
  const res = await agent.generate(prompt);
  return typeof res?.text === "string" ? res.text : String(res?.text ?? "");
}

// ── Delegate tools (server tools → their calls render in the UI) ──────────

const delegateResearch = createTool({
  id: "delegate_research",
  description:
    "Hand a topic to the Research Agent, which gathers factual findings. Call this FIRST.",
  inputSchema: z.object({ topic: z.string().describe("What to research") }),
  outputSchema: z.object({ agent: z.string(), findings: z.string() }),
  execute: async ({ topic }) => ({
    agent: "Research Agent",
    findings: await runAgent(researchSubAgent, topic),
  }),
});

const delegateWriting = createTool({
  id: "delegate_writing",
  description:
    "Hand the research findings to the Writer Agent, which composes the summary.",
  inputSchema: z.object({
    notes: z.string().describe("The research findings to write up"),
  }),
  outputSchema: z.object({ agent: z.string(), draft: z.string() }),
  execute: async ({ notes }) => ({
    agent: "Writer Agent",
    draft: await runAgent(
      writerSubAgent,
      `Write a short summary from these notes:\n\n${notes}`,
    ),
  }),
});

/**
 * Subagents demo — a supervisor that delegates to Research + Writer specialists
 * via explicit tools, so each hand-off renders as its own card in the chat.
 */
export const ckSubagentsAgent = new Agent({
  id: "ck_subagents",
  name: "ck_subagents",
  instructions: `You are a supervisor that produces short reports by delegating to specialist agents. ALWAYS:
1. Call delegate_research with the user's topic.
2. Then call delegate_writing, passing the findings from step 1 as 'notes'.
3. Then give a one-line closing remark (do NOT repeat the full summary — the specialist cards already show the work).
Never answer directly without delegating.`,
  model: MODEL,
  tools: {
    delegate_research: delegateResearch,
    delegate_writing: delegateWriting,
  },
  memory: new Memory({ storage: getStorage() }),
});
