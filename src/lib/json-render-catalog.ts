import { defineCatalog } from "@json-render/core";
import { schema, type ReactSpec } from "@json-render/react/schema";
import { z } from "zod";

export const jsonRenderCatalog = defineCatalog(schema, {
  components: {
    Card: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
      }),
      slots: ["default"],
      description: "A card container for grouping related content.",
    },
    Text: {
      props: z.object({
        content: z.string(),
        tone: z.enum(["default", "muted"]).nullable(),
      }),
      description: "A short paragraph of text.",
    },
    BulletList: {
      props: z.object({
        title: z.string().nullable(),
        items: z.array(z.string()).min(1),
      }),
      description: "A concise bulleted list of important items.",
    },
  },
  actions: {},
});

export type JsonRenderSpec = ReactSpec<typeof jsonRenderCatalog>;

export const jsonRenderSpecSchema = jsonRenderCatalog.zodSchema();
