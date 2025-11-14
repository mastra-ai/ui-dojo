import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

const processRequest = createStep({
  id: "process-request",
  description: "Process the initial request and prepare for approval",
  inputSchema: z.object({
    requestType: z.string().describe("Type of request"),
    amount: z.number().optional().describe("Amount if applicable"),
    details: z.string().describe("Additional details about the request"),
  }),
  outputSchema: z.object({
    requestId: z.string(),
    summary: z.string(),
    requestType: z.string(),
    amount: z.number().optional(),
  }),
  execute: async ({ inputData }) => {
    const requestId = `REQ-${Date.now()}`;
    const summary = `Request for ${inputData.requestType}${inputData.amount ? ` ($${inputData.amount})` : ""}: ${inputData.details}`;

    return {
      requestId,
      summary,
      requestType: inputData.requestType,
      amount: inputData.amount,
    };
  },
});

const requestApproval = createStep({
  id: "request-approval",
  description: "Request approval from user before proceeding",
  inputSchema: z.object({
    requestId: z.string(),
    summary: z.string(),
    requestType: z.string(),
    amount: z.number().optional(),
  }),
  outputSchema: z.object({
    approved: z.boolean(),
    requestId: z.string(),
    approvedBy: z.string().optional(),
  }),
  resumeSchema: z.object({
    approved: z.boolean().describe("Whether the request is approved"),
    approverName: z.string().optional().describe("Name of the approver"),
  }),
  suspendSchema: z.object({
    message: z.string().describe("Message explaining what needs approval"),
    requestId: z.string().describe("The request ID"),
  }),
  execute: async ({ inputData, resumeData, suspend, bail }) => {

    // If the user has rejected, bail out
    if (resumeData?.approved === false) {
      return bail({
        message: `Request ${inputData.requestId} has been rejected.`,
      });
    }

    // If we have resume data, the user has approved
    if (resumeData?.approved) {
      return {
        approved: resumeData.approved,
        requestId: inputData.requestId,
        approvedBy: resumeData.approverName || "User",
      };
    }

    // Otherwise, suspend and wait for approval
    return await suspend({
      message: `Please review and approve this ${inputData.requestType} request: ${inputData.summary}`,
      requestId: inputData.requestId,
    });
  },
});

const finalizeRequest = createStep({
  id: "finalize-request",
  description: "Finalize the approved request",
  inputSchema: z.object({
    approved: z.boolean(),
    requestId: z.string(),
    approvedBy: z.string().optional(),
  }),
  outputSchema: z.object({
    status: z.string(),
    requestId: z.string(),
    message: z.string(),
  }),
  execute: async ({ inputData }) => {
    return {
      status: "approved",
      requestId: inputData.requestId,
      message: `Request ${inputData.requestId} has been approved by ${inputData.approvedBy || "User"} and finalized successfully!`,
    };
  },
});

export const approvalWorkflow = createWorkflow({
  id: "approval-workflow",
  description: "A workflow that processes a request, requests approval, and finalizes it",
  inputSchema: z.object({
    requestType: z.string().describe("Type of request (e.g., 'expense', 'vacation', 'purchase')"),
    amount: z.number().optional().describe("Amount if applicable"),
    details: z.string().describe("Additional details about the request"),
  }),
  outputSchema: z.object({
    status: z.string(),
    requestId: z.string(),
    message: z.string(),
  }),
})
  .then(processRequest)
  .then(requestApproval)
  .then(finalizeRequest);

approvalWorkflow.commit();

