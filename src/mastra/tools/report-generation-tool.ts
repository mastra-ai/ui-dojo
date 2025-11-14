import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const reportGenerationTool = createTool({
  id: "generate-report",
  description: "Generate a report with progress updates",
  inputSchema: z.object({
    topic: z.string().describe("The topic for the report"),
  }),
  outputSchema: z.object({
    report: z.string(),
  }),
  execute: async ({ context, writer }) => {
    const { topic } = context;

    await writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "in-progress",
        message: `📝 Generating report on: ${topic}`,
        stage: "report-generation",
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    await writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "in-progress",
        message: `✍️ Writing report sections...`,
        stage: "report-generation",
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    await writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "done",
        message: `✅ Report generated for: ${topic}`,
        stage: "report-generation",
      },
    });

    return {
      report: `Report on ${topic}: This comprehensive report covers all aspects of the topic with detailed analysis and recommendations.`,
    };
  },
});

