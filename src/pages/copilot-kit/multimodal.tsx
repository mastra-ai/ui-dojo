import "@copilotkit/react-core/v2/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotChat,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { MASTRA_BASE_URL } from "@/constants";

const AGENT_ID = "ck_multimodal";

const MultimodalCopilotKitDemo = () => {
  return (
    <CopilotKit
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit`}
      showDevConsole={false}
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
    <div className="flex flex-col h-full w-full">
      <div className="border-b border-border px-4 py-3 text-center text-sm text-muted-foreground">
        Upload an image with the paperclip and ask about it.
      </div>
      <div className="flex-1 flex justify-center items-center p-4">
        <div className="h-full w-full md:w-8/10 rounded-lg">
          <CopilotChat
            agentId={AGENT_ID}
            className="h-full rounded-2xl max-w-4xl mx-auto"
            attachments={{ enabled: true }}
          />
        </div>
      </div>
    </div>
  );
};

export default MultimodalCopilotKitDemo;
