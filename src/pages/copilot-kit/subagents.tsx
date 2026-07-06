import "@copilotkit/react-core/v2/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotChat,
  useConfigureSuggestions,
  useRenderTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
import { MASTRA_BASE_URL } from "@/constants";
import { AgentStepCard } from "@/components/ck/agent-step-card";

const AGENT_ID = "ck_subagents";

const SubagentsCopilotKitDemo = () => {
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

  return (
    <div className="flex h-full w-full flex-col">
      <p className="px-4 py-2 text-center text-xs text-muted-foreground">
        A supervisor delegates to specialist sub-agents — watch each hand-off
        (Research → Writer) appear as its own step.
      </p>
      <div className="flex-1">
        <CopilotChat
          agentId={AGENT_ID}
          className="h-full rounded-2xl max-w-4xl mx-auto"
        />
      </div>
    </div>
  );
};

export default SubagentsCopilotKitDemo;
