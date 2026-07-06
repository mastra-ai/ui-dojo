import "@copilotkit/react-core/v2/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotChat,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { MASTRA_BASE_URL } from "@/constants";
import { dynamicSchemaCatalog } from "@/a2ui-catalog";

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Compare hotels",
        message:
          "Compare 3 luxury hotels in different cities with ratings and prices.",
      },
      {
        title: "Compare products",
        message:
          "Compare 3 wireless headphones with prices, ratings, and descriptions.",
      },
      {
        title: "Show a team",
        message: "Show a team of 4 people with their roles and contact info.",
      },
    ],
    available: "always",
  });

  return (
    <div className="flex h-full w-full flex-col">
      <p className="px-4 py-2 text-xs text-muted-foreground">
        The agent calls a generation tool; a render sub-agent composes a UI
        surface from a shared component catalog and streams it into the chat.
      </p>
      <div className="flex-1">
        <CopilotChat
          agentId="ck_a2ui_dynamic_schema"
          className="h-full rounded-2xl max-w-4xl mx-auto"
        />
      </div>
    </div>
  );
}

export default function A2UIDemo() {
  return (
    <CopilotKit
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit`}
      showDevConsole={false}
      agent="ck_a2ui_dynamic_schema"
      a2ui={{ catalog: dynamicSchemaCatalog }}
    >
      <Chat />
    </CopilotKit>
  );
}
