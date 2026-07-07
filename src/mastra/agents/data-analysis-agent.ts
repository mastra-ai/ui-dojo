import { Agent } from "@mastra/core/agent";
import { dataAnalysisTool } from "../tools/data-analysis-tool";

export const dataAnalysisAgent = new Agent({
  id: "data-analysis-agent",
  name: "Data Analysis Agent",
  description: "This agent analyzes data and provides insights",
  instructions: `
    You are a data analysis assistant. When given a dataset, use the analyze-data tool 
    to process it and provide insights. The tool will show progress updates as it works.
  `,
  model: "mastra/openai/gpt-5-mini",
  tools: { dataAnalysisTool },
  // Using Mastra Memory Gateway instead of direct memory.
  // memory: new Memory(),
});
