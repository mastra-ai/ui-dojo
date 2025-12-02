import { CopilotChat } from "@copilotkit/react-ui";
import { CopilotKit, useFrontendTool } from "@copilotkit/react-core";
import { changeBgColor } from "@/mastra/tools/color-change-tool";
import { MASTRA_BASE_URL } from "@/constants";

const suggestions: { title: string; message: string }[] = [
  {
    title: "Dark blue",
    message: "Change the background color to a dark blue",
  },
  {
    title: "Rebeccapurple",
    message: "Change the background color to rebeccapurple",
  },
];

function ClientCopilotKitDemo() {
  return (
    <CopilotKit
      // Defined through registerCopilotKit() in src/mastra/index.ts
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit`}
      agent="bgColorAgent"
    >
      <Chat />
    </CopilotKit>
  );
}

function Chat() {
  useFrontendTool({
    name: "colorChangeTool",
    description: "Changes the background color",
    parameters: [
      {
        name: "color",
        type: "string",
        description: "The color to change the background to",
        required: true,
      },
    ],
    handler: ({ color }) => {
      changeBgColor(color);
    },
  });

  return (
    <CopilotChat
      labels={{
        title: "Background Color Changer",
        initial: "Hi! 👋 Ask me to change the background color.",
      }}
      suggestions={suggestions}
    />
  );
}

export default ClientCopilotKitDemo;
