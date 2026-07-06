import "@copilotkit/react-core/v2/styles.css";
import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotChat,
  useConfigureSuggestions,
  useFrontendTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
import { MASTRA_BASE_URL } from "@/constants";

const AGENT_ID = "ck_frontend_tools";

const DEFAULT_BACKGROUND = "var(--copilot-kit-background-color, transparent)";

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
    <CopilotKit
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit`}
      showDevConsole={false}
      agent={AGENT_ID}
    >
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
        title: "Change the background",
        message: "Change the background to a calm blue gradient.",
      },
      {
        title: "Suggest an activity",
        message: "Suggest something fun for me to do right now.",
      },
      {
        title: "Sunset theme",
        message: "Make the background a warm sunset gradient.",
      },
    ],
    available: "always",
  });

  return (
    <div
      className="flex flex-col justify-center items-center h-full w-full transition-colors duration-500"
      style={{ background }}
    >
      <p className="mb-4 max-w-2xl text-center text-sm text-muted-foreground">
        Two frontend tools running in the browser: the sync{" "}
        <code className="font-medium">change_background</code> tool updates the
        UI instantly, while the async{" "}
        <code className="font-medium">fetch_activity_suggestion</code> tool
        awaits a simulated fetch before returning.
      </p>
      <div className="h-full w-full md:w-8/10 md:h-8/10 rounded-lg">
        <CopilotChat
          agentId={AGENT_ID}
          className="h-full rounded-2xl max-w-4xl mx-auto"
        />
      </div>
    </div>
  );
};

export default FrontendToolsCopilotKitDemo;
