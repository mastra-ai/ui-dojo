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
  execute: async (inputData, context) => {
    const { task } = inputData;

    // Emit "in progress" custom event
    await context?.writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "in-progress",
        message: `Gathering information...`,
      },
    });

    // Simulate some work
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Emit "done" custom event
    await context?.writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "done",
        message: `Successfully processed "${task}"`,
      },
    });

    return {
      result: `Task "${task}" has been completed successfully!`,
      status: "completed",
    };
  },
});
