import { useState } from "react";
import { JSONUIProvider, Renderer, useUIStream } from "@json-render/react";
import { Loader } from "@/components/ai-elements/loader";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Button } from "@/components/ui/button";
import { MASTRA_BASE_URL } from "@/constants";
import { jsonRenderRegistry } from "@/lib/json-render";

const suggestions = [
  "Create a simple trip checklist for a weekend in Lagos",
  "Create a compact study plan for learning React hooks",
  "Create a recipe summary for jollof rice",
];

export default function AiSdkJsonRenderPage() {
  const [input, setInput] = useState("");
  const { clear, error, isStreaming, send, spec, usage } = useUIStream({
    api: `${MASTRA_BASE_URL}/json-render-stream`,
  });

  async function generateUi(prompt: string) {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt || isStreaming) {
      return;
    }

    await send(trimmedPrompt, spec ? { previousSpec: spec } : undefined).catch(
      () => null,
    );
    setInput("");
  }

  function handleSubmit(message: PromptInputMessage) {
    if (!message.text) {
      return;
    }

    void generateUi(message.text);
  }

  return (
    <div className="relative mx-auto size-full max-w-4xl p-0 md:p-6">
      <div className="flex h-full flex-col gap-6">
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
          Uses `json-render`&apos;s `useUIStream()` hook to stream JSONL patches
          from a Mastra route. If a spec is already visible, the next prompt
          refines it instead of starting over.
        </div>

        <Suggestions>
          {suggestions.map((suggestion) => (
            <Suggestion
              key={suggestion}
              onClick={() => void generateUi(suggestion)}
              suggestion={suggestion}
            />
          ))}
        </Suggestions>

        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(event) => setInput(event.target.value)}
              placeholder="Describe a small interface to generate or refine..."
              value={input}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <Button
                className="h-8"
                onClick={() => {
                  clear();
                  setInput("");
                }}
                size="sm"
                type="button"
                variant="ghost"
              >
                Clear
              </Button>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={!input && !isStreaming}
              status={isStreaming ? "streaming" : "ready"}
            />
          </PromptInputFooter>
        </PromptInput>

        <div className="min-h-80 rounded-xl border border-border/60 bg-background p-4">
          {isStreaming ? (
            <Loader />
          ) : spec ? (
            <JSONUIProvider
              initialState={spec.state}
              registry={jsonRenderRegistry}
            >
              <Renderer registry={jsonRenderRegistry} spec={spec} />
            </JSONUIProvider>
          ) : (
            <div className="flex min-h-72 items-center justify-center text-center text-sm text-muted-foreground">
              Submit a prompt to render a generated UI here.
            </div>
          )}
        </div>

        {usage ? (
          <p className="text-muted-foreground text-xs">
            Tokens: {usage.promptTokens} prompt / {usage.completionTokens}{" "}
            completion
          </p>
        ) : null}
        {error ? (
          <p className="text-destructive text-sm">{error.message}</p>
        ) : null}
      </div>
    </div>
  );
}
