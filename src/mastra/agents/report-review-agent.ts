import { Agent } from "@mastra/core/agent";
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
  model: "mastra/openai/gpt-5-mini",
  tools: { reportReviewTool },
  // Using Mastra Memory Gateway instead of direct memory.
  // memory: new Memory(),
});
