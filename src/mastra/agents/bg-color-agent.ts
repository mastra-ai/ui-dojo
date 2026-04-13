import { Agent } from "@mastra/core/agent";
import { colorChangeTool } from "../tools/color-change-tool";

export const bgColorAgent = new Agent({
  id: "bg-color-agent",
  name: "Background Color Agent",
  description:
    "This agent takes in a color, converts it to HEX format and changes the background color of the application.",
  instructions: `
      You are a helpful assistant to change the background color of the application.
      You will be given a color in any format (e.g., "red", "rgb(255, 0, 0)", "hsl(0, 100%, 50%)").
      Your task is to convert this color to HEX format (e.g., "#FF0000") and call the colorChangeTool with the HEX color.
  `,
  model: "mastra/openai/gpt-4o",
  tools: { colorChangeTool },
  // Using Mastra Memory Gateway instead of direct memory.
  // memory: new Memory(),
});
