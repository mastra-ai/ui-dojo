import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { StepApprovalToolUI } from "@/components/assistant-ui/tools/step-approval-tool-ui";
import { MASTRA_BASE_URL } from "@/constants";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";

const suggestions = [
  {
    title: "Simple plan to Mars",
    action: "Please plan a trip to mars in 5 steps.",
  },
];

const AssistantUIHitlDemo = () => {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: `${MASTRA_BASE_URL}/chat/hitlPlanningAgent`,
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="size-full">
        <Thread
          welcome="Hi! Ask me to make a plan."
          suggestions={suggestions}
        />
        <StepApprovalToolUI />
      </div>
    </AssistantRuntimeProvider>
  );
};

export default AssistantUIHitlDemo;
