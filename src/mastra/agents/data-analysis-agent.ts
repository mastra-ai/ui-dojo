import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { dataAnalysisTool } from "../tools/data-analysis-tool";

export const dataAnalysisAgent = new Agent({
  name: "Data Analysis Agent",
  description: "This agent analyzes data and provides insights",
  instructions: `
    You are a data analysis assistant. When given a dataset, use the analyze-data tool 
    to process it and provide insights. The tool will show progress updates as it works.
  `,
  model: "openai/gpt-4o-mini",
  tools: { dataAnalysisTool },
  memory: new Memory(),
});

