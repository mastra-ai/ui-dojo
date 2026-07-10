import "@copilotkit/react-core/v2/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import { useConfigureSuggestions } from "@copilotkit/react-core/v2";
import { MASTRA_BASE_URL } from "@/constants";
import { CopilotChatPanel } from "@/components/ck/copilot-chat-panel";

const AGENT_ID = "ck_multimodal";

const MultimodalCopilotKitDemo = () => {
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
        title: "Describe the image",
        message: "Describe the image I upload.",
      },
      {
        title: "Find objects",
        message: "What objects are in this photo?",
      },
    ],
    available: "always",
  });

  return (
    <CopilotChatPanel agentId={AGENT_ID} attachments={{ enabled: true }} />
  );
};

export default MultimodalCopilotKitDemo;
