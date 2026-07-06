import "@copilotkit/react-core/v2/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import {
  useConfigureSuggestions,
  useRenderTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
import { MASTRA_BASE_URL } from "@/constants";
import { CalculatorCard } from "@/components/ck/calculator-card";
import { CopilotChatPanel } from "@/components/ck/copilot-chat-panel";

// Open generative UI: the agent decides to render a full interactive app — a
// working calculator — into the chat, not just text. The frontend owns the live
// component; the agent's show_calculator tool call is its request to show it,
// optionally pre-filled with an expression to evaluate.

export default function OpenGenerativeUIDemo() {
  return (
    <CopilotKit
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit`}
      agent="ck_open_gen_ui"
    >
      <Chat />
    </CopilotKit>
  );
}

function Chat() {
  useRenderTool({
    name: "show_calculator",
    parameters: z.object({ expression: z.string().optional() }),
    render: ({ parameters }) => (
      <CalculatorCard
        initial={(parameters as { expression?: string })?.expression}
      />
    ),
  });

  useConfigureSuggestions({
    suggestions: [
      { title: "Open a calculator", message: "Show me a calculator." },
      { title: "Do some math", message: "What is 1245 * 37 + 892?" },
      { title: "Split the bill", message: "Calculate a 20% tip on $86.40." },
    ],
    available: "always",
  });

  return <CopilotChatPanel agentId="ck_open_gen_ui" />;
}
