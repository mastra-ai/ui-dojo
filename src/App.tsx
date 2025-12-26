import { MastraReactProvider } from "@mastra/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "@/components/layout";

import ChatAssistantUi from "@/pages/assistant-ui";
import ClientToolsAssistantUi from "@/pages/client-tools/assistant-ui";
import AssistantUiHitl from "@/pages/assistant-ui/human-in-the-loop";

import ChatAiSdk from "@/pages/ai-sdk";
import AiSdkGenerative from "@/pages/ai-sdk/generative-user-interfaces";
import AiSdkWorkflow from "@/pages/ai-sdk/workflow";
import AiSdkNetwork from "@/pages/ai-sdk/network";
import AiSdkGenerativeCustomEvents from "@/pages/ai-sdk/generative-user-interfaces-with-custom-events";
import AiSdkSubAgentsAndWorkflowsCustomEvents from "@/pages/ai-sdk/sub-agents-and-workflows-custom-events";
import AiSdkAgentNetworkCustomEvents from "@/pages/ai-sdk/agent-network-custom-events";
import AiSdkWorkflowCustomEvents from "@/pages/ai-sdk/workflow-custom-events";
import AiSdkWorkflowSuspendResume from "@/pages/ai-sdk/workflow-suspend-resume";
import AiSdkWorkflowAgentTextStream from "@/pages/ai-sdk/workflow-agent-text-stream";
import AiSdkToolNestedStreams from "@/pages/ai-sdk/tool-nested-streams";
import ClientToolsAiSdk from "@/pages/client-tools/ai-sdk";
import CodingAgent from "@/pages/coding-agent";

import ChatCopilotKit from "@/pages/copilot-kit";
import CopilotKitGenerative from "@/pages/copilot-kit/generative-user-interfaces";
import CopilotKitHITL from "@/pages/copilot-kit/human-in-the-loop";
import ClientToolsCopilotKit from "@/pages/client-tools/copilot-kit";

import { MASTRA_BASE_URL } from "@/constants";

export default function Page() {
  const queryClient = new QueryClient();

  return (
    <ThemeProvider>
      <MastraReactProvider baseUrl={MASTRA_BASE_URL}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" index element={<ChatAiSdk />} />
                <Route path="/coding-agent" element={<CodingAgent />} />
                <Route path="/ai-sdk">
                  <Route path="client-tools" element={<ClientToolsAiSdk />} />
                  <Route
                    path="generative-user-interfaces"
                    element={<AiSdkGenerative />}
                  />
                  <Route path="workflow" element={<AiSdkWorkflow />} />
                  <Route path="network" element={<AiSdkNetwork />} />
                  <Route
                    path="generative-user-interfaces-with-custom-events"
                    element={<AiSdkGenerativeCustomEvents />}
                  />
                  <Route
                    path="sub-agents-and-workflows-custom-events"
                    element={<AiSdkSubAgentsAndWorkflowsCustomEvents />}
                  />
                  <Route
                    path="agent-network-custom-events"
                    element={<AiSdkAgentNetworkCustomEvents />}
                  />
                  <Route
                    path="workflow-custom-events"
                    element={<AiSdkWorkflowCustomEvents />}
                  />
                  <Route
                    path="workflow-suspend-resume"
                    element={<AiSdkWorkflowSuspendResume />}
                  />
                  <Route
                    path="workflow-agent-text-stream"
                    element={<AiSdkWorkflowAgentTextStream />}
                  />
                  <Route
                    path="tool-nested-streams"
                    element={<AiSdkToolNestedStreams />}
                  />
                </Route>
                <Route path="/assistant-ui">
                  <Route
                    path=":agentId/chat/:threadId"
                    element={<ChatAssistantUi />}
                  />
                  <Route
                    path="client-tools"
                    element={<ClientToolsAssistantUi />}
                  />
                  <Route
                    path="human-in-the-loop"
                    element={<AssistantUiHitl />}
                  />
                </Route>
                <Route path="/copilot-kit">
                  <Route index element={<ChatCopilotKit />} />
                  <Route
                    path="generative-user-interfaces"
                    element={<CopilotKitGenerative />}
                  />
                  <Route
                    path="human-in-the-loop"
                    element={<CopilotKitHITL />}
                  />
                  <Route
                    path="client-tools"
                    element={<ClientToolsCopilotKit />}
                  />
                </Route>
              </Routes>
            </Layout>
          </BrowserRouter>
        </QueryClientProvider>
      </MastraReactProvider>
    </ThemeProvider>
  );
}
