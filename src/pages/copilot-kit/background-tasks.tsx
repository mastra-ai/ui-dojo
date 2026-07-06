import "@copilotkit/react-core/v2/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import { useConfigureSuggestions } from "@copilotkit/react-core/v2";
import { MASTRA_BASE_URL } from "@/constants";
import { backgroundTaskRenderer } from "@/components/ck/background-task-card";
import { CopilotChatPanel } from "@/components/ck/copilot-chat-panel";

export default function BackgroundTasksDemo() {
  return (
    <CopilotKit
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit-bg`}
      agent="ck_background_tasks"
      renderActivityMessages={[backgroundTaskRenderer]}
    >
      <Chat />
    </CopilotKit>
  );
}

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Research Solana",
        message: "Research the Solana ecosystem for me.",
      },
      {
        title: "Investigate RAG",
        message:
          "Investigate best practices for retrieval-augmented generation.",
      },
    ],
    available: "always",
  });

  return <CopilotChatPanel agentId="ck_background_tasks" />;
}
