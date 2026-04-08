import { Agent } from "@mastra/core/agent";
import { inventoryCheckTool } from "../tools/inventory-check-tool";

export const inventoryCheckAgent = new Agent({
  id: "inventory-check-agent",
  name: "Inventory Check Agent",
  description: "This agent checks if products are available in inventory",
  instructions: `
    You are an inventory checker. When given a product ID and quantity, use the check-inventory tool 
    to verify if the items are in stock. The tool will show progress updates as it checks.
  `,
  model: "mastra/openai/gpt-5-mini",
  tools: { inventoryCheckTool },
  // Using Mastra Memory Gateway instead of direct memory.
  // memory: new Memory(),
});
