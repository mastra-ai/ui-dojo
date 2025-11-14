import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { inventoryCheckTool } from "../tools/inventory-check-tool";

export const inventoryCheckAgent = new Agent({
  name: "Inventory Check Agent",
  description: "This agent checks if products are available in inventory",
  instructions: `
    You are an inventory checker. When given a product ID and quantity, use the check-inventory tool 
    to verify if the items are in stock. The tool will show progress updates as it checks.
  `,
  model: "openai/gpt-4o-mini",
  tools: { inventoryCheckTool },
  memory: new Memory(),
});

