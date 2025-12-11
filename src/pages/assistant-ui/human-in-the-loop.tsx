import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { MASTRA_BASE_URL } from "@/constants";

const AssistantUIHitlDemo = () => {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: `${MASTRA_BASE_URL}/chat/ghibliAgent`,
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div>
        <Thread welcome="Ask me about Ghibli movies, characters, and trivia." />
      </div>
    </AssistantRuntimeProvider>
  );
};

export default AssistantUIHitlDemo;
