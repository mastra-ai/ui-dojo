import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { MASTRA_BASE_URL } from "@/constants";
import { Loader } from "@/components/ai-elements/loader";
import { Weather, type WeatherProps } from "@/components/weather";

const GenerativeUserInterfacesAiSdkDemo = () => {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${MASTRA_BASE_URL}/chat/weatherAgent`,
    }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-row gap-4 items-center"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a city name"
          />
          <Button type="submit" disabled={status !== "ready"}>
            Get Weather
          </Button>
        </form>
      </div>
      <div>
        {messages.map((message) => (
          <div key={message.id}>
            <div>
              {message.parts.map((part, index) => {
                if (part.type === "text" && message.role === "user") {
                  return (
                    <Message key={index} from={message.role}>
                      <MessageContent>
                        <Response>{part.text}</Response>
                      </MessageContent>
                    </Message>
                  );
                }

                if (part.type === "tool-weatherTool") {
                  switch (part.state) {
                    case "input-available":
                      return <Loader key={index} />;
                    case "output-available":
                      return (
                        <div key={index}>
                          <Weather {...(part.output as WeatherProps)} />
                        </div>
                      );
                    case "output-error":
                      return <div key={index}>Error: {part.errorText}</div>;
                    default:
                      return null;
                  }
                }

                return null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenerativeUserInterfacesAiSdkDemo;
