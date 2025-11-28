import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { reportReviewTool } from "../tools/report-review-tool";

export const reportReviewAgent = new Agent({
  id: "report-review-agent",
  name: "Report Review Agent",
  description: "This agent reviews and improves reports",
  instructions: `
    You are a report review assistant. When given a report to review, use the review-report tool 
    to analyze and improve the report's quality, clarity, and structure. The tool will show progress 
    updates as it works.
  `,
  model: "openai/gpt-4o-mini",
  tools: { reportReviewTool },
  memory: new Memory(),
});
