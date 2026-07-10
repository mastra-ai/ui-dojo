import "@copilotkit/react-core/v2/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import { useConfigureSuggestions } from "@copilotkit/react-core/v2";
import { MASTRA_BASE_URL } from "@/constants";
import { COPILOT_KIT_THREAD_IDS } from "./constants";
import { dynamicSchemaCatalog } from "@/components/a2ui-catalog";
import { CopilotChatPanel } from "@/components/ck/copilot-chat-panel";

export default function A2UIDemo() {
  return (
    <CopilotKit
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit`}
      agent="ck_a2ui_dynamic_schema"
      threadId={COPILOT_KIT_THREAD_IDS.a2ui}
      a2ui={{ catalog: dynamicSchemaCatalog }}
    >
      <Chat />
    </CopilotKit>
  );
}

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

  return <CopilotChatPanel agentId="ck_a2ui_dynamic_schema" />;
}
