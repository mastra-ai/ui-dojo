import "@copilotkit/react-core/v2/styles.css";
import {
  CopilotKitProvider,
  CopilotChat,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { MASTRA_BASE_URL } from "@/constants";

const AGENT_ID = "default";

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Draw with Excalidraw",
        message:
          "Use the Excalidraw MCP server to create a simple flowchart: Start → Process → Decision (yes/no branches) → End. Show me the result.",
      },
    ],
    available: "always",
  });

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 flex justify-center items-center p-4">
        <div className="h-full w-full md:w-8/10 rounded-lg">
          <CopilotChat
            agentId={AGENT_ID}
            className="h-full rounded-2xl max-w-4xl mx-auto"
          />
        </div>
      </div>
    </div>
  );
}

export default function McpAppsDemo() {
  return (
    <CopilotKitProvider
      // Dedicated route that drives a self-managed BuiltInAgent wired to
      // Excalidraw's public MCP via MCPAppsMiddleware. The v2 provider
      // auto-registers the MCPAppsActivityRenderer that renders the ui:// apps.
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit-mcp`}
      showDevConsole={false}
    >
      <Chat />
    </CopilotKitProvider>
  );
}
