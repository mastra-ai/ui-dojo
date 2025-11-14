import { createTool } from "@mastra/core";
import { z } from "zod";

export const reportReviewTool = createTool({
  id: "review-report",
  description: "Reviews and edits a report to improve quality, clarity, and completeness",
  inputSchema: z.object({
    reportContent: z.string().describe("The report content to review"),
    topic: z.string().describe("The topic of the report"),
  }),
  outputSchema: z.object({
    reviewedReport: z.string().describe("The reviewed and improved report"),
    changes: z.array(z.string()).describe("List of changes made to the report"),
  }),
  execute: async ({ context, writer }) => {
    const { reportContent, topic } = context;

    // Emit in-progress event
    await writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "in-progress",
        message: `🔍 Reviewing report on ${topic}...`,
        stage: "report-review",
      },
    });

    // Simulate review process
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Emit progress update
    await writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "in-progress",
        message: `✏️ Editing and improving report structure...`,
        stage: "report-review",
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Emit done event
    await writer?.custom({
      type: "data-tool-progress",
      data: {
        status: "done",
        message: `✅ Report review completed for ${topic}`,
        stage: "report-review",
      },
    });

    // Simulate review improvements
    const changes = [
      "Improved introduction clarity",
      "Enhanced section organization",
      "Added executive summary",
      "Strengthened conclusions",
    ];

    const reviewedReport = `# Executive Summary\n\nThis report provides a comprehensive analysis of ${topic}.\n\n${reportContent}\n\n## Review Notes\n\n${changes.map((c) => `- ${c}`).join("\n")}\n\n## Conclusion\n\nThe reviewed report has been enhanced for clarity and completeness.`;

    return {
      reviewedReport,
      changes,
    };
  },
});

