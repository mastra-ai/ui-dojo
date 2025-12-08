import { Mastra } from "@mastra/core/mastra";
import { registerCopilotKit } from "@ag-ui/mastra/copilotkit";
import { LibSQLStore } from "@mastra/libsql";
import { chatRoute, workflowRoute, networkRoute } from "@mastra/ai-sdk";
import { ghibliAgent } from "./agents/ghibli-agent";
import { weatherAgent } from "./agents/weather-agent";
import { activitiesWorkflow } from "./workflows/activities-workflow";
import { routingAgent } from "./agents/routing-agent";
import { bgColorAgent } from "./agents/bg-color-agent";
import { taskAgent } from "./agents/task-agent";
import { inventoryCheckAgent } from "./agents/inventory-check-agent";
import { orderProcessingAgent } from "./agents/order-processing-agent";
import { orderFulfillmentWorkflow } from "./workflows/order-fulfillment-workflow";
import { approvalWorkflow } from "./workflows/approval-workflow";
import { agentTextStreamWorkflow } from "./workflows/agent-text-stream-workflow";
import { branchingWorkflow } from "./workflows/branching-workflow";
import { dataAnalysisAgent } from "./agents/data-analysis-agent";
import { reportGenerationAgent } from "./agents/report-generation-agent";
import { reportReviewAgent } from "./agents/report-review-agent";
import { reportAgentNetwork } from "./agents/report-agent-network";
import { weatherForecastAgent } from "./agents/weather-forecast-agent";
import { planningAgent } from "./agents/planning-agent";

export const mastra = new Mastra({
  agents: {
    ghibliAgent,
    weatherAgent,
    routingAgent,
    bgColorAgent,
    taskAgent,
    inventoryCheckAgent,
    orderProcessingAgent,
    dataAnalysisAgent,
    reportGenerationAgent,
    reportReviewAgent,
    reportAgentNetwork,
    weatherForecastAgent,
    planningAgent,
  },
  workflows: {
    activitiesWorkflow,
    orderFulfillmentWorkflow,
    approvalWorkflow,
    agentTextStreamWorkflow,
    branchingWorkflow,
  },
  storage: new LibSQLStore({
    id: "mastra-storage",
    url: ":memory:",
  }),
  bundler: {
    externals: ["@copilotkit/runtime"],
  },
  server: {
    // Use a non-default port to avoid conflicts with other Mastra servers running locally
    port: 4750,
    cors: {
      origin: "*",
      allowMethods: ["*"],
      allowHeaders: ["*"],
    },
    apiRoutes: [
      // See https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk#chatroute
      chatRoute({
        path: "/chat/:agentId",
      }),
      // See https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk#workflowroute
      workflowRoute({
        path: "/workflow/:workflowId",
      }),
      // Workflow route with agent text streaming enabled
      workflowRoute({
        path: "/workflow-agent-text-stream",
        workflow: "agentTextStreamWorkflow",
        // This provides a seamless streaming experience even when agents are running inside workflow steps
        includeTextStreamParts: true,
      }),
      // See https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk#networkroute
      networkRoute({
        path: "/network",
        agent: "routingAgent",
      }),
      networkRoute({
        path: "/network-custom-events",
        agent: "reportAgentNetwork",
      }),
      registerCopilotKit({
        path: "/copilotkit",
        resourceId: "copilotkit-resource",
      }),
    ],
  },
});
