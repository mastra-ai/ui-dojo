import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const taskTool = createTool({
  id: "process-task",
  description: "Process a task with progress updates",
  inputSchema: z.object({
    task: z.string().describe("The task to process"),
  }),
  outputSchema: z.object({
    result: z.string(),
    status: z.string(),
  }),
  execute: async ({ context, writer }) => {
    const { task } = context;

    // Emit "in progress" custom event
    await writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "in-progress",
        message: `Calling task tool`,
      },
    });

    // Simulate some work
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Emit "done" custom event
    await writer?.custom({
      type: "data-tool-progress",
        data: {
            status: "done",
            message: `Task tool completed`,
        },
    });

    return {
      result: `Task "${task}" has been completed successfully!`,
      status: "completed",
    };
  },
});

