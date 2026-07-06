import { useState } from "react";
import "@copilotkit/react-core/v2/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotChat,
  useAgentContext,
  useConfigureSuggestions,
  useFrontendTool,
  useRenderTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
import { MASTRA_BASE_URL } from "@/constants";

const AGENT_ID = "ck_agentic_chat";

function CopilotKitDemo() {
  return (
    <CopilotKit
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit`}
      showDevConsole={false}
      agent={AGENT_ID}
    >
      <Chat />
    </CopilotKit>
  );
}

function Chat() {
  const [background, setBackground] = useState<string>(
    "--copilot-kit-background-color",
  );

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

      let parsed: Record<string, unknown> =
        typeof result === "string"
          ? safeParse(result)
          : ((result as Record<string, unknown>) ?? {});
      parsed = parsed ?? {};

      const city = (parsed.city as string) ?? parameters.location;
      const temperature = parsed.temperature;
      const feelsLike = parsed.feelsLike ?? parsed.feels_like;
      const humidity = parsed.humidity;
      const windSpeed = parsed.windSpeed ?? parsed.wind_speed;
      const conditions = parsed.conditions;

      return (
        <div className="mt-2 max-w-xs rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="flex items-baseline justify-between">
            <span className="text-base font-semibold capitalize">{city}</span>
            <span className="text-sm text-muted-foreground capitalize">
              {conditions as string}
            </span>
          </div>
          <div className="mt-2 text-3xl font-bold">
            {temperature as number}°C
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
            <div>
              <div className="font-medium text-foreground">
                {feelsLike as number}°
              </div>
              Feels like
            </div>
            <div>
              <div className="font-medium text-foreground">
                {humidity as number}%
              </div>
              Humidity
            </div>
            <div>
              <div className="font-medium text-foreground">
                {windSpeed as number} mph
              </div>
              Wind
            </div>
          </div>
        </div>
      );
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
    <div
      className="flex justify-center items-center h-full w-full"
      style={{ background }}
    >
      <div className="h-full w-full md:w-8/10 md:h-8/10 rounded-lg">
        <CopilotChat
          agentId={AGENT_ID}
          className="h-full rounded-2xl max-w-4xl mx-auto"
        />
      </div>
    </div>
  );
}

function safeParse(value: string): Record<string, unknown> {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export default CopilotKitDemo;
