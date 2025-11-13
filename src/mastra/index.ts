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
import { dataAnalysisAgent } from "./agents/data-analysis-agent";
import { reportGenerationAgent } from "./agents/report-generation-agent";
import { networkRoutingAgent } from "./agents/network-routing-agent";

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
    networkRoutingAgent,
  },
  workflows: {
    activitiesWorkflow,
    orderFulfillmentWorkflow,
  },
  storage: new LibSQLStore({
    url: ":memory:",
  }),
  bundler: {
    externals: ["@ag-ui/mastra", "@ag-ui/core", "@ag-ui/client", "@copilotkit/runtime"],
  },
  server: {
    cors: {
      origin: "*",
      allowMethods: ["*"],
      allowHeaders: ["*"],
    },
    apiRoutes: [
      chatRoute({
        path: "/chat/:agentId",
      }),
      workflowRoute({
        path: "/workflow/:workflowId",
      }),
      networkRoute({
        path: "/network",
        agent: "routingAgent",
      }),
      networkRoute({
        path: "/network-custom-events",
        agent: "networkRoutingAgent",
      }),
      // @ts-expect-error - resourceId not necessary
      registerCopilotKit({
        path: "/copilotkit",
      }),
    ],
  },
});
