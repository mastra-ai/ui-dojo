import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const inventoryCheckTool = createTool({
  id: "check-inventory",
  description: "Check if items are in stock with progress updates",
  inputSchema: z.object({
    productId: z.string().describe("The product ID to check"),
    quantity: z.number().describe("The quantity needed"),
  }),
  outputSchema: z.object({
    inStock: z.boolean(),
    availableQuantity: z.number(),
    productName: z.string(),
  }),
  execute: async ({ context, writer }) => {
    const { productId, quantity } = context;

    // Emit "in progress" custom event
    await writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "in-progress",
        message: `🔍 Checking inventory for product ${productId}...`,
        stage: "inventory",
      },
    });

    // Simulate inventory check
    await new Promise((resolve) => setTimeout(resolve, 1500));

    await writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "in-progress",
        message: `📦 Verifying stock levels...`,
        stage: "inventory",
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Emit "done" custom event
    await writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "done",
        message: `✅ Inventory check completed`,
        stage: "inventory",
      },
    });

    // Simulate inventory check result
    const availableQuantity = Math.floor(Math.random() * 50) + quantity;
    const inStock = availableQuantity >= quantity;
    const productName = `Product ${productId}`;

    return {
      inStock,
      availableQuantity,
      productName,
    };
  },
});

