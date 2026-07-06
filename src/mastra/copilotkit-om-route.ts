import { registerApiRoute } from "@mastra/core/server";
import { MASTRA_RESOURCE_ID_KEY } from "@mastra/core/request-context";
import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import { getLocalAgents } from "@ag-ui/mastra";

/**
 * A CopilotKit route that builds its per-request Mastra agents via
 * `getLocalAgents({...})` with options that `@ag-ui/mastra`'s stock
 * `registerCopilotKit` does not expose:
 *   - `observationalMemory`: surface Mastra Observational Memory as AG-UI
 *     activity events.
 *   - `untilIdle`: keep the run stream open until dispatched background tasks
 *     complete, so their completion + result flow through fullStream and the
 *     bridge can advance the background-task activity card to "completed"
 *     (see https://mastra.ai/docs/agents/background-tasks — the run stays open
 *     until every dispatched task finishes and the LLM responds to the result).
 *
 * Mirrors the compiled `registerCopilotKit` handler in @ag-ui/mastra.
 */
export function registerCopilotKitOM({
  path,
  resourceId,
  observationalMemory,
  untilIdle,
}: {
  path: string;
  resourceId: string;
  /** `true` for every agent, or an array of agent ids. */
  observationalMemory?: boolean | string[];
  /** `true` for every agent, or an array of agent ids. */
  untilIdle?: boolean | string[];
}) {
  return registerApiRoute(path, {
    method: "ALL",
    handler: async (c) => {
      const mastra = c.get("mastra");
      const requestContext = c.get("requestContext");
      const agents = getLocalAgents({
        mastra,
        resourceId: requestContext.get(MASTRA_RESOURCE_ID_KEY) ?? resourceId,
        requestContext,
        observationalMemory,
        untilIdle,
      });
      const handler = createCopilotRuntimeHandler({
        runtime: new CopilotRuntime({ agents }),
        basePath: path,
        mode: "single-route",
      });
      const headers = new Headers(c.req.raw.headers);
      headers.delete("authorization");
      return handler(new Request(c.req.raw, { headers }));
    },
  });
}
