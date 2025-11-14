import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

const processPayment = createStep({
  id: "process-payment",
  description: "Process payment for the order",
  inputSchema: z.object({
    orderId: z.string(),
    amount: z.number(),
    paymentMethod: z.string(),
    productName: z.string(),
  }),
  outputSchema: z.object({
    paymentId: z.string(),
    status: z.string(),
    orderId: z.string(),
    productName: z.string(),
  }),
  execute: async ({ inputData, writer }) => {
    const { amount, orderId, productName } = inputData!;

    // Emit custom event for payment processing start
    await writer?.write({
      type: "data-tool-progress",
      data: {
        status: "in-progress",
        message: `💳 Processing payment of $${amount.toFixed(2)}...`,
        stage: "payment",
      },
    });

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await writer?.write({
      type: "data-tool-progress",
      data: {
        status: "in-progress",
        message: `🔐 Verifying payment method...`,
        stage: "payment",
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Emit done event
    await writer?.write({
      type: "data-tool-progress",
      data: {
        status: "done",
        message: `✅ Payment processed successfully`,
        stage: "payment",
      },
    });

    const paymentId = `PAY-${Date.now()}`;

    return {
      paymentId,
      status: "completed",
      orderId,
      productName,
    };
  },
});

const prepareShipping = createStep({
  id: "prepare-shipping",
  description: "Prepare the order for shipping",
  inputSchema: z.object({
    orderId: z.string(),
    paymentId: z.string(),
    productName: z.string(),
    status: z.string(),
  }),
  outputSchema: z.object({
    trackingNumber: z.string(),
    estimatedDelivery: z.string(),
  }),
  execute: async ({ inputData, writer }) => {
    const { orderId, productName } = inputData!;

    // Emit custom event for shipping preparation start
    await writer?.write({
      type: "data-tool-progress",
      data: {
        status: "in-progress",
        message: `📦 Preparing order ${orderId} for shipping...`,
        stage: "shipping",
      },
    });

    // Simulate shipping preparation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    await writer?.write({
      type: "data-tool-progress",
      data: {
        status: "in-progress",
        message: `🏷️ Labeling package for ${productName}...`,
        stage: "shipping",
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Emit done event
    await writer?.write({
      type: "data-tool-progress",
      data: {
        status: "done",
        message: `✅ Order ready for shipment`,
        stage: "shipping",
      },
    });

    const trackingNumber = `TRK-${Date.now()}`;
    const estimatedDelivery = new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000,
    ).toLocaleDateString();

    return {
      trackingNumber,
      estimatedDelivery,
    };
  },
});

export const orderFulfillmentWorkflow = createWorkflow({
  id: "order-fulfillment-workflow",
  description:
    "This workflow processes an order by first handling payment, then preparing it for shipping",
  inputSchema: z.object({
    orderId: z.string().describe("The order ID"),
    amount: z.number().describe("The order amount"),
    paymentMethod: z.string().describe("The payment method"),
    productName: z.string().describe("The product name"),
  }),
  outputSchema: z.object({
    trackingNumber: z.string(),
    estimatedDelivery: z.string(),
  }),
})
  .then(processPayment)
  .then(prepareShipping);

orderFulfillmentWorkflow.commit();

