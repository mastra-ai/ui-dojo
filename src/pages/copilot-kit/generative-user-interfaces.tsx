import { CopilotChat } from "@copilotkit/react-ui";
import { CopilotKit, useCopilotAction } from "@copilotkit/react-core";
import { MASTRA_BASE_URL } from "@/constants";
import { Weather, type WeatherProps } from "@/components/weather";

const GenerativeUserInterfacesCopilotKitDemo = () => {
  return (
    <CopilotKit
      // Defined through registerCopilotKit() in src/mastra/index.ts
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit`}
      agent="weatherAgent"
    >
      <Chat />
    </CopilotKit>
  );
};

const Chat = () => {
  useCopilotAction({
    name: "weatherTool",
    available: "disabled",
    parameters: [
      {
        name: "location",
        type: "string",
        required: true,
      },
    ],
    render: ({ args, result, status }) => {
      console.log({ args, result, status });

      if (status !== "complete") {
        return <div>Retrieving weather...</div>;
      }

      const weatherResult: WeatherProps = {
        temperature: result?.temperature || 0,
        conditions: result?.conditions || "clear sky",
        feelsLike: result?.feelsLike || 0,
        humidity: result?.humidity || 0,
        icon: result?.icon || "cloud",
        location: result?.location || "",
        windGust: result?.windGust || 0,
        windSpeed: result?.windSpeed || 0,
      };

      return <Weather {...weatherResult} />;
    },
  });

  return (
    <CopilotChat
      labels={{
        title: "Weather Assistant",
        initial: "Hi! 👋 Ask me about the weather in a city.",
      }}
      suggestions={[
        {
          title: "Weather in Seoul",
          message: "How is the weather in Seoul?",
        },
        {
          title: "Weather in New York",
          message: "What is the weather like in New York?",
        },
      ]}
      className="h-full w-full mx-auto"
    />
  );
};

export default GenerativeUserInterfacesCopilotKitDemo;
