import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const dataAnalysisTool = createTool({
  id: "analyze-data",
  description: "Analyze data with progress updates",
  inputSchema: z.object({
    dataset: z.string().describe("The dataset to analyze"),
  }),
  outputSchema: z.object({
    insights: z.string(),
    summary: z.string(),
  }),
  execute: async ({ context, writer }) => {
    const { dataset } = context;

    await writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "in-progress",
        message: `📊 Analyzing dataset: ${dataset}`,
        stage: "data-analysis",
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    await writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "in-progress",
        message: `🔍 Processing data patterns...`,
        stage: "data-analysis",
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    await writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "done",
        message: `✅ Analysis completed for: ${dataset}`,
        stage: "data-analysis",
      },
    });

    return {
      insights: `Key insights from ${dataset}: The data shows significant trends and patterns that indicate positive growth.`,
      summary: `Summary: Analysis of ${dataset} reveals important findings.`,
    };
  },
});

