import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { reportGenerationAgent } from "./report-generation-agent";
import { reportReviewAgent } from "./report-review-agent";

export const reportAgentNetwork = new Agent({
  id: "report-agent-network",
  name: "Report Agent Network",
  instructions: `You are a routing agent for a report generation network. You coordinate the workflow between specialized report agents.
  
  You have access to the following agents:
  - reportGenerationAgent: Generates comprehensive reports on topics.
  - reportReviewAgent: Reviews and improves existing reports.
  
  IMPORTANT: For every user request, you must ALWAYS call BOTH agents in sequence:
  1. First, delegate to reportGenerationAgent to generate the initial report
  2. Then, delegate to reportReviewAgent to review and improve the generated report
  
  Do not try to answer the query yourself. Always use both agents to ensure the final report is both comprehensive and well-reviewed.`,
  model: "openai/gpt-4o-mini",
  agents: {
    reportGenerationAgent,
    reportReviewAgent,
  },
  memory: new Memory(),
});
