import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { nestedWeatherAgentStreamTool } from "../tools/nested-agent-stream-tool";

export const weatherForecastAgent = new Agent({
  name: "Weather Forecast Agent",
  description:
    "Forecasts tomorrow's weather by analyzing today's conditions via a nested streaming tool.",
  instructions: `
    You are a weather forecasting agent.

    - When the user asks about the weather in a city, you MUST use the "nested-agent-stream" tool.
    - That tool will call a dedicated weather agent internally to get today's detailed weather,
      streaming back intermediate chunks as nested agent/workflow events while it runs.
    - After the tool completes, use today's weather to predict tomorrow's conditions and present
      a clear forecast for the user (temperature, conditions, and any notable changes).

    If the user does not specify a city, ask them to clarify the location before using the tool.
  `,
  model: "openai/gpt-4o-mini",
  tools: { nestedAgentStreamTool: nestedWeatherAgentStreamTool },
  memory: new Memory(),
});
