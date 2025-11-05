import { Mastra } from "@mastra/core/mastra";
import { registerCopilotKit } from "@ag-ui/mastra/copilotkit";
import { LibSQLStore } from "@mastra/libsql";
import { chatRoute, workflowRoute, networkRoute } from "@mastra/ai-sdk";
import { ghibliAgent } from "./agents/ghibli-agent";
import { weatherAgent } from "./agents/weather-agent";
import { activitiesWorkflow } from "./workflows/activities-workflow";
import { routingAgent } from "./agents/routing-agent";
import { bgColorAgent } from "./agents/bg-color-agent";

export const mastra = new Mastra({
  agents: {
    ghibliAgent,
    weatherAgent,
    routingAgent,
    bgColorAgent,
  },
  workflows: {
    activitiesWorkflow,
  },
  storage: new LibSQLStore({
    url: ":memory:",
  }),
  bundler: {
    externals: ["@ag-ui/mastra"],
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
      // @ts-expect-error - resourceId not necessary
      registerCopilotKit({
        path: "/copilotkit",
      }),
    ],
  },
});
