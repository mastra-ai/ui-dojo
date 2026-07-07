import { registerApiRoute } from "@mastra/core/server";
import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
  BuiltInAgent,
} from "@copilotkit/runtime/v2";
import { MCPAppsMiddleware } from "@ag-ui/mcp-apps-middleware";

/**
 * A CopilotKit route that surfaces "MCP Apps" — MCP-server tools that carry an
 * interactive `ui://` app resource (SEP-1865) rendered inline in the v2 chat.
 *
 * Unlike the other CopilotKit routes here (which wrap Mastra agents via
 * `@ag-ui/mastra`'s `getLocalAgents`), this one drives a self-managed
 * `BuiltInAgent`: the LLM runs directly and the `MCPAppsMiddleware` connects it
 * to a remote MCP server — here Excalidraw's public MCP (https://mcp.excalidraw.com,
 * no auth) — fetching its UI-enabled tools and proxying the frontend iframe's
 * MCP calls. The v2 `CopilotKitProvider` auto-registers the
 * `MCPAppsActivityRenderer` that renders the `ui://` app in a sandboxed iframe.
 */
export function registerCopilotKitMcp({ path }: { path: string }) {
  const agent = new BuiltInAgent({
    model: "mastra/openai/gpt-5-mini",
    prompt: `You are a helpful assistant connected to Excalidraw's MCP server, which can create and render diagrams as an interactive app inside the chat.

When the user asks you to draw, diagram, sketch, or visualize something, use the Excalidraw MCP tools to create it and render the interactive canvas. Keep any text response short — the diagram renders itself.`,
  });

  agent.use(
    new MCPAppsMiddleware({
      mcpServers: [
        {
          type: "http",
          url: "https://mcp.excalidraw.com",
          serverId: "excalidraw",
        },
      ],
    }),
  );

  const runtime = new CopilotRuntime({ agents: { default: agent } });

  return registerApiRoute(path, {
    method: "ALL",
    handler: async (c) => {
      const handler = createCopilotRuntimeHandler({
        runtime,
        basePath: path,
        mode: "single-route",
      });
      const headers = new Headers(c.req.raw.headers);
      headers.delete("authorization");
      return handler(new Request(c.req.raw, { headers }));
    },
  });
}
