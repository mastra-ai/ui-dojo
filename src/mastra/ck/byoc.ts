import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// BYOC (Bring Your Own Component): the agent emits a declarative json-render
// spec via a tool; the frontend renders it with @json-render/react + the dojo's
// jsonRenderRegistry — the agent controls WHICH components render and with what
// props, without any bespoke per-tool React component.

const elementSchema = z.object({
  type: z
    .enum([
      "Card",
      "Text",
      "BulletList",
      "Row",
      "Stat",
      "Badge",
      "KeyValue",
      "Divider",
    ])
    .describe("Component type from the registry"),
  props: z
    .record(z.string(), z.any())
    .describe(
      "Props for the component (see the component list in the instructions).",
    ),
  children: z
    .array(z.string())
    .describe("Ids of child elements (empty array for leaves)"),
});

const specSchema = z.object({
  root: z.string().describe("Id of the root element"),
  elements: z
    .record(z.string(), elementSchema)
    .describe("Map of element id -> element. Every child id must exist here."),
});

const renderUiTool = createTool({
  id: "render_ui",
  description:
    "Render a small UI for the user by returning a json-render spec. Use Card as " +
    "the root, with Text and BulletList children. Keep it compact and useful.",
  inputSchema: specSchema,
  outputSchema: specSchema,
  execute: async (spec) => spec,
});

export const ckByocAgent = new Agent({
  id: "ck_byoc",
  name: "ck_byoc",
  instructions: `You render rich UI by calling the render_ui tool with a json-render spec.

Available components (props go in the "props" object):
- Card: { title, description? } — the container. Use as root. children hold its content.
- Row: {} — a horizontal container; put Stat or Badge children inside for a side-by-side row.
- Stat: { label, value, hint? } — a big KPI/metric tile.
- Badge: { text, tone? } tone ∈ "neutral"|"positive"|"warning"|"danger" — a colored pill.
- KeyValue: { pairs: [{label, value}] } — a spec/detail list.
- BulletList: { title?, items: string[] } — a bulleted list.
- Text: { content, tone? } tone ∈ "default"|"muted".
- Divider: {} — a separator line.

Build a genuinely rich layout, not one plain card. A good pattern for a "status"/"overview"
request: a Card root whose children are [a Row of 3 Stat tiles, a Divider, a KeyValue detail
list, a BulletList of highlights, and a Row of Badges].

Rules:
- Always return a complete spec with 'root' and 'elements'.
- Root is a Card. Every id referenced in a 'children' array must exist in 'elements'.
- Leaves (Stat, Badge, Text, BulletList, KeyValue, Divider) use 'children: []'.
- Row/Card use children to hold other elements.
- After calling the tool, add only a one-line remark — the UI renders the content.`,
  model: "mastra/openai/gpt-4o",
  tools: { render_ui: renderUiTool },
});
