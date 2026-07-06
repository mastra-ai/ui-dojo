import { Agent } from "@mastra/core/agent";
import {
  getA2UITools,
  type A2UIAttemptRecord,
} from "@ag-ui/mastra";

// Provider-string model, resolved by Mastra's model router. The render subagent
// inside getA2UITools resolves it the same way, so the package never couples to
// an @ai-sdk provider version.
const A2UI_MODEL = "mastra/openai/gpt-4o";

// Catalog id must match the frontend catalog registered in src/a2ui-catalog.
const DYNAMIC_CATALOG_ID = "https://a2ui.org/demos/dojo/dynamic_catalog.json";

// Grounds the render subagent on the dynamic catalog's components so a REAL LLM
// emits resolvable surfaces (Row + HotelCard / ProductCard / TeamMemberCard).
const COMPOSITION_GUIDE = `
## Available components — THIS IS THE COMPLETE LIST. Use ONLY these names.
The ONLY valid component names are: "Row", "HotelCard", "ProductCard", "TeamMemberCard".
NEVER use any other component name (do NOT use "Column", "Grid", "Container",
"Card", "List", "Stack", "Box", or anything not in the list above). A surface
that references any other component name is INVALID and will fail to render.

### Row (the ONLY valid root)
Layout container. The root MUST be a Row. Repeat a card template via structural children:
  {"id":"root","component":"Row","children":{"componentId":"card","path":"/items"}}

### HotelCard / ProductCard / TeamMemberCard
Card components bound to per-item data (relative paths inside the template).
- HotelCard fields: name, location, rating, pricePerNight
- ProductCard fields: name, price, rating, description, badge
- TeamMemberCard fields: name, role, department, email, avatarUrl

Each card also takes an "action" so the user can click it (Select / Book /
Contact). ALWAYS give every card an action whose event carries the item's name
in its context, so the agent knows which item the user picked:
  "action": { "event": { "name": "select_item", "context": { "item": { "path": "name" } } } }

## RULES
- Root is ALWAYS a Row (never Column/Grid/anything else) with structural
  children: {"componentId":"<card-id>","path":"/items"}
- Pick exactly ONE card component from the list and reuse it for every item.
- ALWAYS include the referenced card component in the components array.
- ALWAYS add the "action" shown above to the card so it is clickable and the
  selection reports the item's name back.
- Inside templates, use RELATIVE paths (no leading slash): {"path":"name"} not {"path":"/name"}
- Always provide data in the "data" argument as {"items":[...]}
- Generate 3-4 realistic items with diverse data.
`;

const A2UI_INSTRUCTIONS = `You are a helpful assistant that creates rich, clickable visual UI on the fly.

When the user asks for visual content (hotel/product comparisons, team rosters, lists, cards, etc.), use the generate_a2ui tool to create a dynamic A2UI surface. After calling the tool, do NOT repeat the data in text — the tool renders the UI automatically. Just confirm what was rendered in one short sentence.

The cards are clickable. When the user clicks one, you will receive an action event (name "select_item") whose context contains the chosen item's name under "item". When that happens, reply with a single friendly sentence confirming their choice BY NAME (e.g. "Great pick — the Four Seasons George V it is!"). Never ask the user which item they picked — the item name is in the action context.`;

/**
 * Dynamic-schema A2UI (subagent + recovery). The backend OWNS the generate_a2ui
 * tool (the remote/server-side wiring), so the stock registerCopilotKit route
 * works unchanged; the CopilotKit runtime middleware (enabled by the provider's
 * `a2ui={{catalog}}`) renders the surface. getA2UITools carries the shared
 * validate→retry recovery loop, so an invalid render is retried, not painted.
 */
export const a2uiDynamicSchemaAgent = new Agent({
  id: "ck_a2ui_dynamic_schema",
  name: "ck_a2ui_dynamic_schema",
  instructions: A2UI_INSTRUCTIONS,
  model: A2UI_MODEL,
  tools: {
    generate_a2ui: getA2UITools({
      model: A2UI_MODEL,
      defaultCatalogId: DYNAMIC_CATALOG_ID,
      guidelines: { compositionGuide: COMPOSITION_GUIDE },
      recovery: { maxAttempts: 3 },
      onA2UIAttempt: (rec: A2UIAttemptRecord) => {
        console.log(
          `[a2ui] attempt ${rec.attempt}: ${rec.ok ? "valid" : "invalid"}`,
          rec.errors ?? "",
        );
      },
    }) as never,
  },
});
