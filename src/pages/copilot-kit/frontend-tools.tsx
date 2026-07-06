import "@copilotkit/react-core/v2/styles.css";
import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotPopup,
  useConfigureSuggestions,
  useFrontendTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
import { MASTRA_BASE_URL } from "@/constants";
import { chatInputWithoutDisclaimer } from "@/components/ck/empty-chat-disclaimer";

const AGENT_ID = "ck_frontend_tools";

const DEFAULT_BACKGROUND = "var(--background)";

const ACTIVITY_SUGGESTIONS = [
  "Take a 10-minute walk and notice five things you have never seen before.",
  "Brew a fancy cup of tea and read one chapter of a book you love.",
  "Sketch the view outside your window, no erasing allowed.",
  "Call a friend you have not spoken to in a while, just to say hi.",
  "Try a 5-minute desk stretch routine to reset your posture.",
  "Write down three tiny wins from today, however small.",
] as const;

const FrontendToolsCopilotKitDemo = () => {
  return (
    <CopilotKit runtimeUrl={`${MASTRA_BASE_URL}/copilotkit`} agent={AGENT_ID}>
      <Chat />
    </CopilotKit>
  );
};

const Chat = () => {
  const [background, setBackground] = useState<string>(DEFAULT_BACKGROUND);

  // SYNC frontend tool: mutates UI state synchronously and returns immediately.
  useFrontendTool({
    name: "change_background",
    description:
      "Change the background of the page. Accepts any valid CSS background value (solid colors, linear or radial gradients, etc.).",
    parameters: z.object({
      background: z
        .string()
        .describe(
          "A CSS background value. Prefer tasteful gradients, e.g. 'linear-gradient(135deg, #dbeafe, #bfdbfe)'.",
        ),
    }),
    handler: async ({ background: next }) => {
      setBackground(next);
      return {
        status: "success",
        message: `Background changed to ${next}`,
      };
    },
  });

  // ASYNC frontend tool: awaits a simulated browser-side fetch before returning.
  useFrontendTool({
    name: "fetch_activity_suggestion",
    description:
      "Fetch a fun activity suggestion for the user. Simulates an async browser-side lookup that takes a moment to resolve.",
    parameters: z.object({
      category: z
        .string()
        .optional()
        .describe("Optional hint for the kind of activity the user is after."),
    }),
    handler: async () => {
      // Simulate an async browser-side fetch that resolves after a delay.
      await new Promise((resolve) => setTimeout(resolve, 900));
      const suggestion =
        ACTIVITY_SUGGESTIONS[
          Math.floor(Math.random() * ACTIVITY_SUGGESTIONS.length)
        ];
      return { suggestion };
    },
  });

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Sunset",
        message: "Change the background to a warm sunset gradient.",
        className: "frontend-tools-suggestion-sunset",
      },
      {
        title: "Forest",
        message: "Change the background to a calm forest green gradient.",
        className: "frontend-tools-suggestion-forest",
      },
      {
        title: "Ocean",
        message: "Change the background to a deep ocean blue gradient.",
        className: "frontend-tools-suggestion-ocean",
      },
    ],
    available: "always",
  });

  return (
    <div
      className="copilotkit-frontend-tools-demo relative -mb-4 flex h-[calc(100%+1rem)] min-h-0 w-full overflow-hidden rounded-xl transition-colors duration-500"
      style={{ background }}
    >
      <CopilotPopup
        agentId={AGENT_ID}
        input={chatInputWithoutDisclaimer}
        defaultOpen={true}
      />
    </div>
  );
};

export default FrontendToolsCopilotKitDemo;
