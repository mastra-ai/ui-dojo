import "@copilotkit/react-core/v2/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import {
  useConfigureSuggestions,
  useRenderTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
import { MASTRA_BASE_URL } from "@/constants";
import { COPILOT_KIT_THREAD_IDS } from "./constants";
import { CopilotChatPanel } from "@/components/ck/copilot-chat-panel";
import { WeatherCard } from "@/components/ck/weather-card";

const AGENT_ID = "ck_tool_rendering";

function GenerativeUserInterfacesCopilotKitDemo() {
  return (
    <CopilotKit
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit`}
      agent={AGENT_ID}
      threadId={COPILOT_KIT_THREAD_IDS.toolBasedGenerativeUi}
    >
      <Chat />
    </CopilotKit>
  );
}

const Chat = () => {
  useRenderTool({
    name: "get_weather",
    parameters: z.object({
      location: z.string(),
    }),
    render: ({ parameters, result, status }) => {
      if (status !== "complete") {
        return (
          <div className="mt-2 text-sm text-muted-foreground">
            Retrieving weather...
          </div>
        );
      }
      return <WeatherCard location={parameters.location} result={result} />;
    },
  });

  useConfigureSuggestions({
    suggestions: [
      { title: "Weather in Seoul", message: "What's the weather in Seoul?" },
      { title: "Weather in New York", message: "Weather in New York" },
    ],
    available: "always",
  });

  return <CopilotChatPanel agentId={AGENT_ID} />;
};

export default GenerativeUserInterfacesCopilotKitDemo;
