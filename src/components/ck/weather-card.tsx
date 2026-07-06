import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Weather tool result UI shared by CopilotKit weather examples.
 */
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
    <Card className="mt-3 w-full max-w-sm">
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
