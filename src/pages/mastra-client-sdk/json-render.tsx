import { useState } from "react";
import { JSONUIProvider, Renderer } from "@json-render/react";
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
import { useJsonRender } from "@/hooks/use-json-render";
import { jsonRenderRegistry } from "@/lib/json-render";

const suggestions = [
  "Create a simple trip checklist for a weekend in Lagos",
  "Create a compact study plan for learning React hooks",
  "Create a recipe summary for jollof rice",
];

export default function JsonRenderPage() {
  const [input, setInput] = useState("");
  const { clear, error, generate, isGenerating, spec } = useJsonRender();

  async function generateUi(prompt: string) {
    const nextSpec = await generate(prompt).catch(() => null);

    if (nextSpec) {
      setInput("");
    }
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
          Mastra generates a validated `json-render` spec with structured
          output, then the client renders that spec with `Renderer`.
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
              placeholder="Describe a small interface to generate..."
              value={input}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <Button
                className="h-8"
                onClick={clear}
                size="sm"
                type="button"
                variant="ghost"
              >
                Clear
              </Button>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={!input && !isGenerating}
              status={isGenerating ? "streaming" : "ready"}
            />
          </PromptInputFooter>
        </PromptInput>

        <div className="min-h-80 rounded-xl border border-border/60 bg-background p-4">
          {isGenerating ? (
            <Loader />
          ) : spec ? (
            <JSONUIProvider registry={jsonRenderRegistry}>
              <Renderer registry={jsonRenderRegistry} spec={spec} />
            </JSONUIProvider>
          ) : (
            <div className="flex min-h-72 items-center justify-center text-center text-sm text-muted-foreground">
              Submit a prompt to render a generated UI here.
            </div>
          )}
        </div>

        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </div>
    </div>
  );
}
