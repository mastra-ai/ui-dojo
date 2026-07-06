import "@copilotkit/react-core/v2/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotChat,
  useConfigureSuggestions,
  useDefaultRenderTool,
  useRenderTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
import { MASTRA_BASE_URL } from "@/constants";
import { WeatherCard } from "./generative-user-interfaces";

const AGENT_ID = "ck_tool_rendering";

const ToolRenderingCopilotKitDemo = () => {
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
        <div className="mt-3 max-w-md w-full rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm font-semibold">{name}</span>
            <span className="text-xs text-muted-foreground">{status}</span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-medium text-muted-foreground">
              Arguments
            </div>
            <pre className="mt-1 overflow-x-auto rounded-md bg-muted p-2 text-xs">
              {prettyPrint(parameters)}
            </pre>
          </div>
          {status === "complete" && (
            <div className="mt-3">
              <div className="text-xs font-medium text-muted-foreground">
                Result
              </div>
              <pre className="mt-1 overflow-x-auto rounded-md bg-muted p-2 text-xs">
                {prettyPrint(result)}
              </pre>
            </div>
          )}
        </div>
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

  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="h-full w-full md:w-8/10 md:h-8/10 rounded-lg">
        <CopilotChat
          agentId={AGENT_ID}
          className="h-full rounded-2xl max-w-4xl mx-auto"
        />
      </div>
    </div>
  );
};

function prettyPrint(value: unknown): string {
  let parsed: unknown = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return value;
    }
  }
  try {
    return JSON.stringify(parsed, null, 2);
  } catch {
    return String(parsed);
  }
}

export default ToolRenderingCopilotKitDemo;
