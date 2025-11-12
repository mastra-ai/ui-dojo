import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { taskTool } from "../tools/task-tool";

export const taskAgent = new Agent({
  name: "Task Agent",
  description: "This agent processes tasks and provides progress updates",
  instructions: `
    You are a helpful task processing assistant. When a user gives you a task, 
    use the process-task tool to handle it. The tool will show progress updates 
    as it works on the task.
  `,
  model: "openai/gpt-4o-mini",
  tools: { taskTool },
  memory: new Memory(),
});

