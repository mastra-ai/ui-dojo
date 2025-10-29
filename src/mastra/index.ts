import { Mastra } from "@mastra/core/mastra";
import { registerCopilotKit } from "@ag-ui/mastra/copilotkit";
import { LibSQLStore } from "@mastra/libsql";
import { chatRoute, workflowRoute, networkRoute } from "@mastra/ai-sdk";
import { ghibliAgent } from "./agents/ghibli-agent";
import { weatherAgent } from "./agents/weather-agent";
import { activitiesWorkflow } from "./workflows/activities-workflow";
import { routingAgent } from "./agents/routing-agent";

export const mastra = new Mastra({
  agents: {
    ghibliAgent,
    weatherAgent,
    routingAgent,
  },
  workflows: {
    activitiesWorkflow,
  },
  storage: new LibSQLStore({
    url: ":memory:",
  }),
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
      registerCopilotKit({
        path: "/copilotkit",
        resourceId: "ghibliAgent",
      }),
    ],
  },
});
