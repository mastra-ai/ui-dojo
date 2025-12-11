import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const stepSchema = z.object({
  description: z.string().describe("Description of the step"),
  status: z
    .enum(["enabled", "disabled"])
    .describe("Whether the step is enabled or disabled"),
});

export type Step = z.infer<typeof stepSchema>;

export const generateTaskStepsTool = createTool({
  id: "generateTaskSteps",
  description:
    "Generates a list of steps for the user to review and approve before execution. The user can toggle steps on/off and then approve or reject the plan.",
  inputSchema: z.object({
    steps: z
      .array(stepSchema)
      .describe("List of proposed steps for the user to review"),
  }),
  outputSchema: z.object({
    accepted: z.boolean().describe("Whether the user accepted the plan"),
    steps: z
      .array(stepSchema)
      .describe("The final list of steps after user review"),
  }),
  // No execute function - result is provided by client UI via addResult()
});
