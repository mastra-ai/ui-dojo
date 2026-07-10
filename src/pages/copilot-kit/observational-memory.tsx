import "@copilotkit/react-core/v2/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import { useConfigureSuggestions } from "@copilotkit/react-core/v2";
import { MASTRA_BASE_URL } from "@/constants";
import { CopilotChatPanel } from "@/components/ck/copilot-chat-panel";
import { observationalMemoryRenderer } from "@/components/ck/observational-memory-card";

export default function ObservationalMemoryDemo() {
  return (
    <CopilotKit
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit-om`}
      agent="ck_observational_memory"
      renderActivityMessages={[observationalMemoryRenderer]}
    >
      <Chat />
    </CopilotKit>
  );
}

const MSG_1 =
  "I'm planning a two-week spring trip across Japan — Tokyo, Kyoto, Osaka, and Hiroshima. I care about cherry blossoms, great food, and avoiding crowds. Help me shape a rough itinerary.";
const MSG_2 =
  "Also: I'm vegetarian, I love quiet gardens and photography, I want one ryokan night with an onsen, and I prefer trains over buses. What would you adjust, and what shouldn't I miss?";

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      { title: "Plan my Japan trip", message: MSG_1 },
      { title: "Add my preferences", message: MSG_2 },
    ],
    available: "always",
  });

  return <CopilotChatPanel agentId="ck_observational_memory" />;
}
