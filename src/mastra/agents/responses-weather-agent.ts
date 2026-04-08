import { Agent } from "@mastra/core/agent";
import { LibSQLStore } from "@mastra/libsql";
import { Memory } from "@mastra/memory";
import { weatherTool } from "../tools/weather-tool";

export const responsesWeatherAgent = new Agent({
  id: "responses-weather-agent",
  name: "Responses Weather Agent",
  description:
    "This agent powers the Responses API weather demo with persistent memory",
  instructions: `
      You are a helpful weather assistant that provides accurate weather information.

      Your primary function is to help users get weather details for specific locations. When responding:
      - Always ask for a location if none is provided
      - If the location name isn't in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Include relevant details like humidity, wind conditions, and precipitation
      - Keep responses concise but informative

      Use the weatherTool to fetch current weather data.
`,
  model: "openai/gpt-5-mini",
  tools: { weatherTool },
  memory: new Memory({
    storage: new LibSQLStore({
      id: "responses-weather-agent-memory",
      url: "file:mastra.db",
    }),
  }),
});
