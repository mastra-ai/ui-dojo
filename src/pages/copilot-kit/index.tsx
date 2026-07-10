import { useState } from "react";
import "@copilotkit/react-core/v2/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import {
  useAgentContext,
  useConfigureSuggestions,
  useFrontendTool,
  useRenderTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
import { MASTRA_BASE_URL } from "@/constants";
import { CopilotChatPanel } from "@/components/ck/copilot-chat-panel";
import { WeatherCard } from "@/components/ck/weather-card";

const AGENT_ID = "ck_agentic_chat";

function CopilotKitDemo() {
  return (
    <CopilotKit
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit`}
      agent={AGENT_ID}
    >
      <Chat />
    </CopilotKit>
  );
}

function Chat() {
  const [background, setBackground] = useState<string>("var(--background)");

  useAgentContext({
    description: "Name of the user",
    value: "Bob",
  });

  useFrontendTool({
    name: "change_background",
    description:
      "Change the background of the chat. Accepts anything the CSS background attribute accepts. Regular colors, linear or radial gradients etc.",
    parameters: z.object({
      background: z
        .string()
        .describe("The background. Prefer gradients. Only use when asked."),
    }),
    handler: async ({ background: next }: { background: string }) => {
      setBackground(next);
      return {
        status: "success",
        message: `Background changed to ${next}`,
      };
    },
  });

  useRenderTool({
    name: "get_weather",
    parameters: z.object({
      location: z.string(),
    }),
    render: ({ parameters, result, status }) => {
      if (status !== "complete") {
        return (
          <div className="text-sm text-muted-foreground">
            Loading weather...
          </div>
        );
      }

      return <WeatherCard location={parameters.location} result={result} />;
    },
  });

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Weather in Tokyo",
        message: "What's the weather in Tokyo?",
      },
      {
        title: "Sunset background",
        message: "Change the background to a sunset gradient.",
      },
    ],
    available: "always",
  });

  return (
    <CopilotChatPanel agentId={AGENT_ID} containerStyle={{ background }} />
  );
}

export default CopilotKitDemo;
