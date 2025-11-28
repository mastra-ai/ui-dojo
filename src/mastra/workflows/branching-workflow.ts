import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

// Step 1: Validate order
const validateOrder = createStep({
  id: "validate-order",
  description: "Validate the order details",
  inputSchema: z.object({
    orderId: z.string(),
    orderType: z.enum(["standard", "express"]),
    amount: z.number(),
  }),
  outputSchema: z.object({
    orderId: z.string(),
    orderType: z.enum(["standard", "express"]),
    amount: z.number(),
    isValid: z.boolean(),
  }),
  execute: async ({ inputData, writer }) => {
    await writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "in-progress",
        message: `Validating order ${inputData.orderId}...`,
        stage: "validation",
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "done",
        message: `Order validated successfully`,
        stage: "validation",
      },
    });

    return {
      ...inputData,
      isValid: true,
    };
  },
});

// Nested Workflow 1: Standard Processing
const standardProcessStep = createStep({
  id: "standard-process",
  description: "Process standard order",
  inputSchema: z.object({
    orderId: z.string(),
    orderType: z.enum(["standard", "express"]),
    amount: z.number(),
    isValid: z.boolean(),
  }),
  outputSchema: z.object({
    orderId: z.string(),
    processingTime: z.string(),
    shippingMethod: z.string(),
  }),
  execute: async ({ inputData, writer }) => {
    await writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "in-progress",
        message: `Processing standard order ${inputData.orderId}...`,
        stage: "standard-processing",
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    await writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "in-progress",
        message: `Preparing standard shipping (5-7 business days)...`,
        stage: "standard-processing",
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    await writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "done",
        message: `Standard order processed successfully`,
        stage: "standard-processing",
      },
    });

    return {
      orderId: inputData.orderId,
      processingTime: "5-7 business days",
      shippingMethod: "Standard Ground",
    };
  },
});

const standardWorkflow = createWorkflow({
  id: "standard-shipping-workflow",
  description: "Workflow for standard shipping orders",
  inputSchema: z.object({
    orderId: z.string(),
    orderType: z.enum(["standard", "express"]),
    amount: z.number(),
    isValid: z.boolean(),
  }),
  outputSchema: z.object({
    orderId: z.string(),
    processingTime: z.string(),
    shippingMethod: z.string(),
  }),
}).then(standardProcessStep);

standardWorkflow.commit();

// Nested Workflow 2: Express Processing
const expressProcessStep = createStep({
  id: "express-process",
  description: "Process express order",
  inputSchema: z.object({
    orderId: z.string(),
    orderType: z.enum(["standard", "express"]),
    amount: z.number(),
    isValid: z.boolean(),
  }),
  outputSchema: z.object({
    orderId: z.string(),
    processingTime: z.string(),
    shippingMethod: z.string(),
  }),
  execute: async ({ inputData, writer }) => {
    await writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "in-progress",
        message: `Processing express order ${inputData.orderId}...`,
        stage: "express-processing",
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "in-progress",
        message: `Priority handling activated...`,
        stage: "express-processing",
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "in-progress",
        message: `Preparing express shipping (1-2 business days)...`,
        stage: "express-processing",
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "done",
        message: `Express order processed successfully`,
        stage: "express-processing",
      },
    });

    return {
      orderId: inputData.orderId,
      processingTime: "1-2 business days",
      shippingMethod: "Express Overnight",
    };
  },
});

const expressWorkflow = createWorkflow({
  id: "express-shipping-workflow",
  description: "Workflow for express shipping orders",
  inputSchema: z.object({
    orderId: z.string(),
    orderType: z.enum(["standard", "express"]),
    amount: z.number(),
    isValid: z.boolean(),
  }),
  outputSchema: z.object({
    orderId: z.string(),
    processingTime: z.string(),
    shippingMethod: z.string(),
  }),
}).then(expressProcessStep);

expressWorkflow.commit();

// Main branching workflow
export const branchingWorkflow = createWorkflow({
  id: "branching-workflow",
  description:
    "A workflow that branches based on order type to different processing workflows",
  inputSchema: z.object({
    orderId: z.string().describe("The order ID"),
    orderType: z
      .enum(["standard", "express"])
      .describe("Type of shipping: standard or express"),
    amount: z.number().describe("The order amount"),
  }),
  outputSchema: z.object({
    orderId: z.string(),
    processingTime: z.string(),
    shippingMethod: z.string(),
  }),
})
  .then(validateOrder)
  .branch([
    [
      async ({ inputData }) => inputData.orderType === "standard",
      standardWorkflow,
    ],
    [
      async ({ inputData }) => inputData.orderType === "express",
      expressWorkflow,
    ],
  ]);

branchingWorkflow.commit();
