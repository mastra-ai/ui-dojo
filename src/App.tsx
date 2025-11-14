import { MastraReactProvider } from "@mastra/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "@/components/layout";

import ChatAiSdk from "@/pages/ai-sdk";
import ChatAssistantUi from "@/pages/assistant-ui";
import ChatCopilotKit from "@/pages/copilot-kit";

import AiSdkGenerative from "@/pages/ai-sdk/generative-user-interfaces";
import AiSdkWorkflow from "@/pages/ai-sdk/workflow";
import AiSdkNetwork from "@/pages/ai-sdk/network";
import AiSdkGenerativeCustomEvents from "@/pages/ai-sdk/generative-user-interfaces-with-custom-events";
import AiSdkSubAgentsAndWorkflowsCustomEvents from "@/pages/ai-sdk/sub-agents-and-workflows-custom-events";
import AiSdkAgentNetworkCustomEvents from "@/pages/ai-sdk/agent-network-custom-events";
import AiSdkWorkflowSuspendResume from "@/pages/ai-sdk/workflow-suspend-resume";

import ClientToolsAiSdk from "@/pages/client-tools/ai-sdk";
import ClientToolsAssistantUi from "@/pages/client-tools/assistant-ui";
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
                <Route
                  path="/assistant-ui/:agentId/chat/:threadId"
                  element={<ChatAssistantUi />}
                />
                <Route path="/copilot-kit" element={<ChatCopilotKit />} />
                <Route path="/ai-sdk">
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
                    path="workflow-suspend-resume"
                    element={<AiSdkWorkflowSuspendResume />}
                  />
                </Route>
                <Route path="/client-tools">
                  <Route path="ai-sdk" element={<ClientToolsAiSdk />} />
                  <Route
                    path="assistant-ui"
                    element={<ClientToolsAssistantUi />}
                  />
                  <Route
                    path="copilot-kit"
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
