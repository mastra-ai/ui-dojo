import { useState } from "react";
import { JSONUIProvider, Renderer } from "@json-render/react";
import { Loader } from "@/components/ai-elements/loader";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useJsonRender } from "@/hooks/use-json-render";
import { jsonRenderRegistry } from "@/lib/json-render";

const suggestions = [
  "Create a short packing list for a two-day trip",
  "Create a small meal prep checklist for the week",
  "Create a reading plan for learning TypeScript basics",
];

export default function JsonRenderHookPage() {
  const [input, setInput] = useState("");
  const { clear, error, generate, isGenerating, spec } = useJsonRender();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const prompt = input.trim();

    if (!prompt) {
      return;
    }

    const nextSpec = await generate(prompt).catch(() => null);

    if (nextSpec) {
      setInput("");
    }
  }

  async function handleSuggestion(suggestion: string) {
    await generate(suggestion).catch(() => null);
  }

  return (
    <div className="relative mx-auto size-full max-w-3xl p-0 md:p-6">
      <div className="flex h-full flex-col gap-6">
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
          This version wraps `agent.generate()` and structured output in a
          reusable `useJsonRender()` hook.
        </div>

        <Suggestions>
          {suggestions.map((suggestion) => (
            <Suggestion
              key={suggestion}
              onClick={() => void handleSuggestion(suggestion)}
              suggestion={suggestion}
            />
          ))}
        </Suggestions>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <Textarea
            onChange={(event) => setInput(event.target.value)}
            placeholder="Describe a small interface to generate..."
            rows={4}
            value={input}
          />
          <div className="flex items-center justify-between gap-3">
            <Button onClick={clear} type="button" variant="ghost">
              Clear
            </Button>
            <Button disabled={!input.trim() || isGenerating} type="submit">
              {isGenerating ? "Generating..." : "Generate UI"}
            </Button>
          </div>
        </form>

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
