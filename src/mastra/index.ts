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

export const mastra = new Mastra({
  agents: {
    ghibliAgent,
    weatherAgent,
    routingAgent,
    bgColorAgent,
    taskAgent,
  },
  workflows: {
    activitiesWorkflow,
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
      // @ts-expect-error - resourceId not necessary
      registerCopilotKit({
        path: "/copilotkit",
      }),
    ],
  },
});
