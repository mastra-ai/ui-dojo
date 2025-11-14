import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { inventoryCheckAgent } from "./inventory-check-agent";
import { orderFulfillmentWorkflow } from "../workflows/order-fulfillment-workflow";

export const orderProcessingAgent = new Agent({
  name: "Order Processing Agent",
  description:
    "This agent processes orders by first checking inventory, then fulfilling the order",
  instructions: `
    You are an order processing assistant. When a user places an order:
    
    1. First, delegate to the inventoryCheckAgent to verify the product is in stock
    2. If in stock, use the orderFulfillmentWorkflow to process payment and prepare shipping
    
    Always explain what you're doing at each step. The inventory check agent and workflow steps will show 
    progress updates as they work.
  `,
  model: "openai/gpt-4o-mini",
  agents: {
    inventoryCheckAgent,
  },
  workflows: {
    orderFulfillmentWorkflow,
  },
  memory: new Memory(),
});

