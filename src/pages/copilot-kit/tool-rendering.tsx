import "@copilotkit/react-core/v2/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import {
  useConfigureSuggestions,
  useDefaultRenderTool,
  useRenderTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
import { MASTRA_BASE_URL } from "@/constants";
import { CopilotChatPanel } from "@/components/ck/copilot-chat-panel";
import { ToolCallCard } from "@/components/ck/tool-call-card";
import { WeatherCard } from "@/components/ck/weather-card";

const AGENT_ID = "ck_tool_rendering";

const ToolRenderingCopilotKitDemo = () => {
  return (
    <CopilotKit runtimeUrl={`${MASTRA_BASE_URL}/copilotkit`} agent={AGENT_ID}>
      <Chat />
    </CopilotKit>
  );
};

const Chat = () => {
  // Custom renderer for the get_weather tool.
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

  // Catch-all renderer for every other tool call (e.g. get_stock_price).
  useDefaultRenderTool({
    render: ({ name, parameters, status, result }) => {
      return (
        <ToolCallCard
          name={name}
          parameters={parameters}
          status={status}
          result={result}
        />
      );
    },
  });

  useConfigureSuggestions({
    suggestions: [
      { title: "Weather in Paris", message: "What's the weather in Paris?" },
      {
        title: "Stock price of AAPL",
        message: "What's the stock price of AAPL?",
      },
    ],
    available: "always",
  });

  return <CopilotChatPanel agentId={AGENT_ID} />;
};

export default ToolRenderingCopilotKitDemo;
