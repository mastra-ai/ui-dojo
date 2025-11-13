import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { reportGenerationTool } from "../tools/report-generation-tool";

export const reportGenerationAgent = new Agent({
  name: "Report Generation Agent",
  description: "This agent generates reports on various topics",
  instructions: `
    You are a report generation assistant. When given a topic, use the generate-report tool 
    to create a comprehensive report. The tool will show progress updates as it works.
  `,
  model: "openai/gpt-4o-mini",
  tools: { reportGenerationTool },
  memory: new Memory(),
});

