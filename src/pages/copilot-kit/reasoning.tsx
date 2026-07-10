import "@copilotkit/react-core/v2/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import { useConfigureSuggestions } from "@copilotkit/react-core/v2";
import { MASTRA_BASE_URL } from "@/constants";
import { CopilotChatPanel } from "@/components/ck/copilot-chat-panel";

const AGENT_ID = "ck_reasoning";

const ReasoningCopilotKitDemo = () => {
  return (
    <CopilotKit
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit`}
      agent={AGENT_ID}
    >
      <Chat />
    </CopilotKit>
  );
};

const Chat = () => {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Train speed",
        message:
          "If a train travels 60 km in 45 minutes, what's its speed in km/h? Think it through.",
      },
      {
        title: "Optimal route",
        message: "Plan the optimal order to visit 4 cities minimizing travel.",
      },
    ],
    available: "always",
  });

  return <CopilotChatPanel agentId={AGENT_ID} />;
};

export default ReasoningCopilotKitDemo;
