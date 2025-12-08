import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { forecastSchema, getWeather } from "../shared";

export const weatherTool = createTool({
  id: "get-weather",
  description: "Get current weather for a location",
  inputSchema: z.object({
    location: z.string().describe("The location to get the weather for"),
  }),
  outputSchema: forecastSchema,
  execute: async (inputData) => {
    return await getWeather(inputData.location);
  },
});
