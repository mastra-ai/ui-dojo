import {
  CopilotPopup,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { chatInputWithoutDisclaimer } from "@/components/ck/empty-chat-disclaimer";

/**
 * Popup chat for the shared recipe state example.
 */
export function RecipeAssistantPopup() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Create a recipe",
        message: "Create a delicious Italian pasta recipe.",
      },
      { title: "Make it vegan", message: "Make this recipe vegan." },
      { title: "Add a spicy kick", message: "Add some heat to the recipe." },
    ],
    available: "always",
  });

  return (
    <CopilotPopup
      agentId="ck_shared_state"
      input={chatInputWithoutDisclaimer}
      defaultOpen
      labels={{ modalHeaderTitle: "AI Recipe Assistant" }}
    />
  );
}
