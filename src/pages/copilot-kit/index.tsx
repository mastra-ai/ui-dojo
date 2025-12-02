import { CopilotChat } from "@copilotkit/react-ui";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import { MASTRA_BASE_URL } from "@/constants";

const suggestions: { title: string; message: string }[] = [
  {
    title: "Tell me about Spirited Away",
    message: "Tell me about Spirited Away",
  },
  {
    title: "Who are the main characters in Princess Mononoke?",
    message: "Who are the main characters in Princess Mononoke?",
  },
  {
    title: "Summarize the plot of Howl's Moving Castle",
    message: "Summarize the plot of Howl's Moving Castle",
  },
];

function CopilotKitDemo() {
  return (
    <CopilotKit
      // Defined through registerCopilotKit() in src/mastra/index.ts
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit`}
      agent="ghibliAgent"
    >
      <CopilotChat
        labels={{
          title: "Ghibli Films Assistant",
          initial: "Hi! 👋 Ask me about Ghibli movies, characters, and trivia.",
        }}
        suggestions={suggestions}
        className="h-full w-full mx-auto"
      />
    </CopilotKit>
  );
}

export default CopilotKitDemo;
