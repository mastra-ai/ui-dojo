import "@copilotkit/react-core/v2/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import {
  useConfigureSuggestions,
  useRenderTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
import { MASTRA_BASE_URL } from "@/constants";
import { AgentStepCard } from "@/components/ck/agent-step-card";
import { CopilotChatPanel } from "@/components/ck/copilot-chat-panel";

const AGENT_ID = "ck_subagents";

const SubagentsCopilotKitDemo = () => {
  return (
    <CopilotKit
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit`}
      agent={AGENT_ID}
    >
      <Chat />
    </CopilotKit>
  );
};

const Chat = () => {
  useRenderTool({
    name: "delegate_research",
    parameters: z.object({ topic: z.string() }),
    render: ({ parameters, result, status }) => (
      <AgentStepCard
        emoji="🔬"
        name="Research Agent"
        subtitle={(parameters as { topic?: string })?.topic}
        status={status}
        outputKey="findings"
        result={result}
      />
    ),
  });

  useRenderTool({
    name: "delegate_writing",
    parameters: z.object({ notes: z.string() }),
    render: ({ result, status }) => (
      <AgentStepCard
        emoji="✍️"
        name="Writer Agent"
        subtitle="Composing the summary"
        status={status}
        outputKey="draft"
        result={result}
      />
    ),
  });

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Research + summarize",
        message:
          "Research the benefits of green tea and write me a short summary.",
      },
      { title: "Report", message: "Give me a short report on electric cars." },
    ],
    available: "always",
  });

  return <CopilotChatPanel agentId={AGENT_ID} />;
};

export default SubagentsCopilotKitDemo;
