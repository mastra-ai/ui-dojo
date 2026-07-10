import "@copilotkit/react-core/v2/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import { MASTRA_BASE_URL } from "@/constants";
import { COPILOT_KIT_THREAD_IDS } from "./constants";
import { RecipeAssistantPopup } from "@/components/ck/recipe-assistant-popup";
import { SharedRecipeCard } from "@/components/ck/shared-recipe-card";

export default function SharedStateDemo() {
  return (
    <CopilotKit
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit`}
      agent="ck_shared_state"
      threadId={COPILOT_KIT_THREAD_IDS.sharedState}
    >
      <div className="flex h-full min-h-0 w-full items-center justify-center overflow-auto p-6 lg:pr-[29rem]">
        <SharedRecipeCard />
        <RecipeAssistantPopup />
      </div>
    </CopilotKit>
  );
}
