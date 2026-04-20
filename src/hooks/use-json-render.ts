import { useState } from "react";
import { useMastraClient } from "@mastra/react";
import { jsonRenderSpecSchema, type JsonRenderSpec } from "@/lib/json-render";

const JSON_RENDER_AGENT_ID = "json-render-agent";

export function useJsonRender(agentId = JSON_RENDER_AGENT_ID) {
  const client = useMastraClient();
  const [spec, setSpec] = useState<JsonRenderSpec | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(prompt: string) {
    if (!prompt.trim() || isGenerating) {
      return null;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const result = await client.getAgent(agentId).generate(prompt, {
        structuredOutput: {
          schema: jsonRenderSpecSchema,
          jsonPromptInjection: true,
        },
      } as never);

      const nextSpec = result.object as unknown as JsonRenderSpec | undefined;

      if (!nextSpec) {
        throw new Error("Mastra did not return a UI spec.");
      }

      setSpec(nextSpec);

      return nextSpec;
    } catch (generationError) {
      const message =
        generationError instanceof Error
          ? generationError.message
          : "UI generation failed.";

      setError(message);

      throw generationError;
    } finally {
      setIsGenerating(false);
    }
  }

  function clear() {
    setSpec(null);
    setError(null);
  }

  return {
    clear,
    error,
    generate,
    isGenerating,
    spec,
  };
}
