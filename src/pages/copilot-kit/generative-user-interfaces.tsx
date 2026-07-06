import "@copilotkit/react-core/v2/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotChat,
  useConfigureSuggestions,
  useRenderTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MASTRA_BASE_URL } from "@/constants";

const AGENT_ID = "ck_tool_rendering";

const GenerativeUserInterfacesCopilotKitDemo = () => {
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

export function WeatherCard({
  location,
  result,
}: {
  location?: string;
  result: unknown;
}) {
  let parsed: Record<string, unknown> =
    typeof result === "string"
      ? safeParse(result)
      : ((result as Record<string, unknown>) ?? {});
  parsed = parsed ?? {};

  const city = (parsed.city as string) ?? location ?? "";
  const temperature = (parsed.temperature as number) ?? 0;
  const feelsLike = (parsed.feelsLike ??
    parsed.feels_like ??
    temperature) as number;
  const humidity = (parsed.humidity as number) ?? 0;
  const windSpeed = (parsed.windSpeed ?? parsed.wind_speed ?? 0) as number;
  const conditions = (parsed.conditions as string) ?? "clear";

  return (
    <Card className="mt-3 max-w-sm w-full">
      <CardHeader>
        <CardTitle className="capitalize">{city}</CardTitle>
        <CardDescription className="capitalize">{conditions}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">
          {temperature}°C
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {((temperature * 9) / 5 + 32).toFixed(1)}°F
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
          <div>
            <div className="font-medium text-foreground">{feelsLike}°</div>
            Feels like
          </div>
          <div>
            <div className="font-medium text-foreground">{humidity}%</div>
            Humidity
          </div>
          <div>
            <div className="font-medium text-foreground">{windSpeed} mph</div>
            Wind
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function safeParse(value: string): Record<string, unknown> {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export default GenerativeUserInterfacesCopilotKitDemo;
