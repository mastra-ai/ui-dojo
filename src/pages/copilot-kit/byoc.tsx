import "@copilotkit/react-core/v2/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import {
  useConfigureSuggestions,
  useRenderTool,
} from "@copilotkit/react-core/v2";
import { MASTRA_BASE_URL } from "@/constants";
import {
  byocSpecSchema,
  ByocSpecView,
  safeJson,
} from "@/components/ck/byoc-spec-view";
import { CopilotChatPanel } from "@/components/ck/copilot-chat-panel";

// BYOC: the ck_byoc agent calls render_ui with a declarative json-render spec;
// we render it with @json-render/react + a demo-owned component registry
// (byoc-json-render). The agent owns which components appear — no bespoke
// per-response React.

export default function ByocDemo() {
  return (
    <CopilotKit
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit`}
      agent="ck_byoc"
    >
      <Chat />
    </CopilotKit>
  );
}

function Chat() {
  useRenderTool({
    name: "render_ui",
    parameters: byocSpecSchema,
    render: ({ parameters, result, status }) => {
      const spec =
        parameters ?? (typeof result === "string" ? safeJson(result) : result);
      if (status !== "complete" && !byocSpecSchema.safeParse(spec).success) {
        return (
          <div className="my-2 text-sm text-muted-foreground">Building UI…</div>
        );
      }
      return <ByocSpecView spec={spec} />;
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

  return <CopilotChatPanel agentId="ck_byoc" />;
}
