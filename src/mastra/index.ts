import { Mastra } from "@mastra/core/mastra";
import { registerCopilotKit } from "@ag-ui/mastra/copilotkit";
import {
  CloudExporter,
  DefaultExporter,
  Observability,
  SensitiveDataFilter,
} from "@mastra/observability";
import { chatRoute, workflowRoute, networkRoute } from "@mastra/ai-sdk";
import { jsonRenderStreamRoute } from "./routes/json-render-stream";
import { ghibliAgent } from "./agents/ghibli-agent";
import { responsesWeatherAgent } from "./agents/responses-weather-agent";
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
import { hitlPlanningAgent } from "./agents/hitl-planning-agent";
import { weatherApprovalAgent } from "./agents/weather-approval-agent";
import { jsonRenderAgent } from "./agents/json-render-agent";

// CopilotKit demo agents (OSS-89) — see src/mastra/ck/*
import {
  ckAgenticChatAgent,
  ckToolRenderingAgent,
  ckReasoningAgent,
  ckFrontendToolsAgent,
  ckMultimodalAgent,
  ckOpenGenUIAgent,
  ckSharedStateAgent,
  ckBackgroundTasksAgent,
  ckObservationalMemoryAgent,
  ckInterruptAgent,
} from "./ck/agents";
import { a2uiDynamicSchemaAgent } from "./ck/a2ui";
import { ckSubagentsAgent } from "./ck/network";
import { ckByocAgent } from "./ck/byoc";
import { getStorage } from "./ck/storage";
import { registerCopilotKitOM } from "./copilotkit-om-route";
import { registerCopilotKitMcp } from "./copilotkit-mcp-route";

export const mastra = new Mastra({
  agents: {
    ghibliAgent,
    // ── CopilotKit demo agents (OSS-89) ──
    ck_agentic_chat: ckAgenticChatAgent,
    ck_tool_rendering: ckToolRenderingAgent,
    ck_reasoning: ckReasoningAgent,
    ck_frontend_tools: ckFrontendToolsAgent,
    ck_multimodal: ckMultimodalAgent,
    ck_open_gen_ui: ckOpenGenUIAgent,
    ck_shared_state: ckSharedStateAgent,
    ck_background_tasks: ckBackgroundTasksAgent,
    ck_observational_memory: ckObservationalMemoryAgent,
    ck_interrupt: ckInterruptAgent,
    ck_subagents: ckSubagentsAgent,
    ck_byoc: ckByocAgent,
    ck_a2ui_dynamic_schema: a2uiDynamicSchemaAgent,
    responsesWeatherAgent,
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
    hitlPlanningAgent,
    weatherApprovalAgent,
    jsonRenderAgent,
  },
  workflows: {
    activitiesWorkflow,
    orderFulfillmentWorkflow,
    approvalWorkflow,
    agentTextStreamWorkflow,
    branchingWorkflow,
  },
  // File-backed shared storage (see ck/storage.ts): required for the interrupt
  // (suspend/resume snapshot) and background-tasks demos, and backs the
  // working-memory / observational-memory agents.
  storage: getStorage(),
  // Background Tasks are storage-backed; enable the manager for the
  // ck_background_tasks demo.
  backgroundTasks: { enabled: true },
  observability: new Observability({
    configs: {
      default: {
        serviceName: "ui-dojo",
        exporters: [new DefaultExporter(), new CloudExporter()],
        spanOutputProcessors: [new SensitiveDataFilter()],
      },
    },
  }),
  bundler: {
    // Externalize the CopilotKit/AG-UI bridge and its transitive deps so the
    // Mastra CLI bundler doesn't try to re-bundle them (which fails on
    // fast-json-patch's CommonJS named exports). Node resolves them at runtime.
    externals: [
      "@copilotkit/runtime",
      "@copilotkit/runtime/v2",
      "@ag-ui/mastra",
      "@ag-ui/mastra/copilotkit",
      "@ag-ui/mastra/a2ui",
      "@ag-ui/client",
      "@ag-ui/core",
      "@ag-ui/mcp-apps-middleware",
    ],
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
        sendReasoning: true,
      }),
      // See https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk#workflowroute
      workflowRoute({
        path: "/workflow/:workflowId",
        sendReasoning: true,
      }),
      // Workflow route with agent text streaming enabled
      workflowRoute({
        path: "/workflow-agent-text-stream",
        workflow: "agentTextStreamWorkflow",
        // This provides a seamless streaming experience even when agents are running inside workflow steps
        includeTextStreamParts: true,
        sendReasoning: true,
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
      // Dedicated route that surfaces Observational Memory as AG-UI activity
      // events (registerCopilotKit doesn't expose the observationalMemory
      // option, so we pass it to getLocalAgents ourselves). See the
      // observational-memory demo page (agent="ck_observational_memory").
      registerCopilotKitOM({
        path: "/copilotkit-om",
        resourceId: "copilotkit-resource",
        observationalMemory: ["ck_observational_memory"],
      }),
      // Dedicated route with untilIdle for the background-tasks demo, so the run
      // stays open until the dispatched task completes and its result streams
      // back through fullStream (the activity card advances to "Completed").
      // See https://mastra.ai/docs/agents/background-tasks.
      registerCopilotKitOM({
        path: "/copilotkit-bg",
        resourceId: "copilotkit-resource",
        untilIdle: ["ck_background_tasks"],
      }),
      // Self-managed BuiltInAgent wired to Excalidraw's public MCP server via
      // MCPAppsMiddleware; surfaces the ui:// interactive canvas inline in the
      // v2 chat. See the mcp-apps demo page (agent="default").
      registerCopilotKitMcp({ path: "/copilotkit-mcp" }),
      jsonRenderStreamRoute,
    ],
  },
});
