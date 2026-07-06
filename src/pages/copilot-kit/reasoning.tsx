import "@copilotkit/react-core/v2/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotChat,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { MASTRA_BASE_URL } from "@/constants";

const AGENT_ID = "ck_reasoning";

const ReasoningCopilotKitDemo = () => {
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

  return (
    <div className="flex flex-col h-full w-full">
      <div className="border-b border-border px-4 py-3 text-center text-sm text-muted-foreground">
        Uses an OpenAI reasoning model (o4-mini); reasoning is streamed and
        rendered inline.
      </div>
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
};

export default ReasoningCopilotKitDemo;
