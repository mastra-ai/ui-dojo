/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSONUIProvider, Renderer } from "@json-render/react";
import { z } from "zod";
import { byocRegistry } from "@/components/ck/byoc-json-render";

export const byocSpecSchema = z.object({
  root: z.string(),
  elements: z.record(
    z.string(),
    z.object({
      type: z.string(),
      props: z.record(z.string(), z.any()),
      children: z.array(z.string()),
    }),
  ),
});

/**
 * BYOC JSON-render host for the CopilotKit custom UI example.
 */
export function ByocSpecView({ spec }: { spec: unknown }) {
  const parsed = byocSpecSchema.safeParse(spec);
  if (!parsed.success || !parsed.data.elements[parsed.data.root]) {
    return null;
  }
  return (
    <div className="my-2 max-w-xl">
      <JSONUIProvider registry={byocRegistry as any} initialState={{}}>
        <Renderer registry={byocRegistry as any} spec={parsed.data as any} />
      </JSONUIProvider>
    </div>
  );
}

export function safeJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}
