import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { forecastSchema, getWeather } from "../shared";

export const weatherApprovalTool = createTool({
  id: "get-weather-with-approval",
  description: "Get current weather for a location (requires user approval)",
  inputSchema: z.object({
    location: z.string().describe("The location to get the weather for"),
  }),
  outputSchema: forecastSchema,
  requireApproval: true,
  execute: async (inputData) => {
    return await getWeather(inputData.location);
  },
});
