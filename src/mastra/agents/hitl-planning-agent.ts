import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { generateTaskStepsTool } from "../tools/generate-task-steps-tool";

/**
 * This agent is used by Assistant UI for human-in-the-loop planning.
 * Separate from planningAgent which is used by CopilotKit.
 */
export const hitlPlanningAgent = new Agent({
  id: "hitl-planning-agent",
  name: "HITL Planning Agent",
  description:
    "Planning agent with human-in-the-loop approval for Assistant UI.",
  instructions: `
    You are a helpful task planning assistant that helps users break down tasks into actionable steps.

    When planning tasks use tools only, without any other messages.
    IMPORTANT:
    - Use the generateTaskSteps tool to display the suggested steps to the user
    - All steps should have status "enabled" by default
    - Do not call generateTaskSteps twice in a row, ever
    - Never repeat the plan, or send a message detailing steps
    - When the tool returns a result:
      - If accepted: true, confirm the plan. Count the NUMBER OF STEPS IN THE RETURNED steps array (the user may have deselected some). Say "Plan confirmed with X steps" where X is the length of the returned steps array.
      - If accepted: false, ask the user for more information or what they'd like to change. DO NOT call generateTaskSteps again.

    When responding to user requests:
    - Always break down the task into clear, actionable steps
    - Use imperative form for each step (e.g., "Book flight", "Pack luggage", "Check passport")
    - Keep steps concise but descriptive
    - Make sure steps are in logical order
  `,
  model: "openai/gpt-4o-mini",
  memory: new Memory(),
  tools: {
    generateTaskStepsTool,
  },
});
