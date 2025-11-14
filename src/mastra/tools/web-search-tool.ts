import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import Exa, { type ContentsOptions, type SearchResult } from "exa-js";
import type { InferUITools, UIDataTypes, UIMessage } from "ai";

const exa = new Exa(process.env.EXA_API_KEY);

export const exaOptions: ContentsOptions = {
  text: true,
  summary: true,
  livecrawl: "preferred",
};

export const exaSearch = createTool({
  id: "exa-search",
  description:
    "Web search tool using Exa's neural search. Best for browsing the web for domain-specific information.",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        score: z.string(),
        image: z.string(),
        author: z.string(),
        favicon: z.string(),
        publishedDate: z.string(),
      }),
    ),
  }),
  execute: async ({ context }) => {
    const { query } = context;

    const searchResponse = await exa.search(query, {
      numResults: 7,
      contents: exaOptions,
    });

    const results = searchResponse.results.map(
      (result: SearchResult<typeof exaOptions>) => ({
        title: result.title ?? "",
        url: result.url ?? "",
        score: String(result.score ?? ""),
        image: result.image ?? "",
        author: result.author ?? "",
        favicon: result.favicon ?? "",
        publishedDate: result.publishedDate ?? "",
      }),
    );

    return { results };
  },
});

export type SearchTools = InferUITools<{ exaSearch: typeof exaSearch }>;
export type ChatMessage = UIMessage<never, UIDataTypes, SearchTools>;
