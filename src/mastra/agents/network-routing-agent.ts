import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { dataAnalysisAgent } from "./data-analysis-agent";
import { reportGenerationAgent } from "./report-generation-agent";
import { inventoryCheckAgent } from "./inventory-check-agent";

export const networkRoutingAgent = new Agent({
  name: "Network Routing Agent",
  instructions: `You are a routing agent that directs user queries to the appropriate specialized agent based on the task type.
  
  Names of the available agents:
  - dataAnalysisAgent: Analyzes datasets and provides insights.
  - reportGenerationAgent: Generates comprehensive reports on topics.
  - inventoryCheckAgent: Checks product inventory availability.
  
  Route queries about data analysis to the Data Analysis Agent. Route queries about generating reports to the Report Generation Agent. Route queries about inventory or products to the Inventory Check Agent. Always ensure that the user's query is handled by the most relevant agent.`,
  model: "openai/gpt-4o-mini",
  agents: {
    dataAnalysisAgent,
    reportGenerationAgent,
    inventoryCheckAgent,
  },
  memory: new Memory(),
});

