/* eslint-disable @typescript-eslint/no-explicit-any */
import "@copilotkit/react-core/v2/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotChat,
  useConfigureSuggestions,
  useRenderTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
import { JSONUIProvider, Renderer } from "@json-render/react";
import { byocRegistry } from "@/components/ck/byoc-json-render";
import { MASTRA_BASE_URL } from "@/constants";

// BYOC: the ck_byoc agent calls render_ui with a declarative json-render spec;
// we render it with @json-render/react + a demo-owned component registry
// (byoc-json-render). The agent owns which components appear — no bespoke
// per-response React.

const specSchema = z.object({
  root: z.string(),
  elements: z.record(
    z.string(),
    z.object({
      type: z.string(),
      props: z.record(z.string(), z.any()),
      children: z.array(z.string()),
    }),
  ),
});

function SpecView({ spec }: { spec: unknown }) {
  const parsed = specSchema.safeParse(spec);
  if (!parsed.success || !parsed.data.elements[parsed.data.root]) {
    return null;
  }
  return (
    <div className="my-2 max-w-xl">
      <JSONUIProvider registry={byocRegistry as any} initialState={{}}>
        <Renderer registry={byocRegistry as any} spec={parsed.data as any} />
      </JSONUIProvider>
    </div>
  );
}

function Chat() {
  useRenderTool({
    name: "render_ui",
    parameters: specSchema,
    render: ({ parameters, result, status }) => {
      const spec =
        parameters ?? (typeof result === "string" ? safeJson(result) : result);
      if (status !== "complete" && !specSchema.safeParse(spec).success) {
        return (
          <div className="my-2 text-sm text-muted-foreground">Building UI…</div>
        );
      }
      return <SpecView spec={spec} />;
    },
  });

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Project status dashboard",
        message:
          "Render a project status overview for 'Apollo' with a few key metrics, a details list, some highlights, and status badges.",
      },
      {
        title: "Product spec sheet",
        message:
          "Render a spec sheet card for a laptop with metric tiles, a key/value details list, and feature badges.",
      },
      {
        title: "Trip summary",
        message:
          "Render a summary card for a 5-day Tokyo trip with stats (days, budget, spots), highlights, and badges.",
      },
    ],
    available: "always",
  });

  return (
    <div className="flex h-full flex-col">
      <p className="px-4 py-2 text-xs text-muted-foreground">
        JSON Render (bring-your-own-component): the agent returns a declarative
        json-render spec and the frontend renders it with your own component
        registry (@json-render/react).
      </p>
      <div className="flex-1">
        <CopilotChat
          agentId="ck_byoc"
          className="h-full rounded-2xl max-w-4xl mx-auto"
        />
      </div>
    </div>
  );
}

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return undefined;
  }
}

export default function ByocDemo() {
  return (
    <CopilotKit
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit`}
      showDevConsole={false}
      agent="ck_byoc"
    >
      <Chat />
    </CopilotKit>
  );
}
