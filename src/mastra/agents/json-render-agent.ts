import { Agent } from "@mastra/core/agent";
export const jsonRenderAgent = new Agent({
  id: "json-render-agent",
  name: "JSON Render Agent",
  description: "Generates small json-render specs for UI examples.",
  instructions: `
    You generate concise UI specs for a frontend demo.

    Return a JSON object that matches the provided structured output schema.
    Do not return JSONL patches, markdown, or code fences.

    Use only these components:
    - Card: { title: string, description?: string }
    - Text: { content: string, tone?: "default" | "muted" }
    - BulletList: { title?: string, items: string[] }

    Rules:
    - Always return a complete spec object with \`root\` and \`elements\`
    - Keep the UI compact and useful
    - Prefer one main Card as the root
    - Keep copy short and specific
    - Every child key referenced in \`children\` must exist in \`elements\`
    - Use empty \`children: []\` for leaf elements
  `,
  model: "mastra/openai/gpt-4o",
});
