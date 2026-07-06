import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { defineRegistry } from "@json-render/react";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * A richer json-render catalog owned by the CopilotKit BYOC demo (kept separate
 * from the shared `@/lib/json-render` catalog so this demo can add components
 * without touching the AI SDK JSON Render demo's registry).
 */
export const byocCatalog = defineCatalog(schema, {
  components: {
    Card: {
      props: z.object({ title: z.string(), description: z.string().nullable() }),
      slots: ["default"],
      description: "A card container. Use as the root; children hold its content.",
    },
    Row: {
      props: z.object({}),
      slots: ["default"],
      description: "A horizontal row; put Stat or Badge children side by side.",
    },
    Stat: {
      props: z.object({
        label: z.string(),
        value: z.string(),
        hint: z.string().nullable(),
      }),
      description: "A KPI/metric tile with a big value and a label.",
    },
    Badge: {
      props: z.object({
        text: z.string(),
        tone: z.enum(["neutral", "positive", "warning", "danger"]).nullable(),
      }),
      description: "A small colored pill.",
    },
    KeyValue: {
      props: z.object({
        pairs: z.array(z.object({ label: z.string(), value: z.string() })).min(1),
      }),
      description: "A label/value detail list.",
    },
    BulletList: {
      props: z.object({
        title: z.string().nullable(),
        items: z.array(z.string()).min(1),
      }),
      description: "A concise bulleted list.",
    },
    Text: {
      props: z.object({
        content: z.string(),
        tone: z.enum(["default", "muted"]).nullable(),
      }),
      description: "A short paragraph.",
    },
    Divider: { props: z.object({}), description: "A thin separator line." },
  },
  actions: {},
});

export const byocSpecSchema = byocCatalog.zodSchema();

const badgeTone: Record<string, "default" | "secondary" | "destructive" | "outline"> =
  {
    neutral: "secondary",
    positive: "default",
    warning: "outline",
    danger: "destructive",
  };

export const { registry: byocRegistry } = defineRegistry(byocCatalog, {
  components: {
    Card: ({ props, children }) => (
      <Card className="gap-4 py-4">
        <CardHeader className="gap-1 px-4">
          <CardTitle>{props.title}</CardTitle>
          {props.description ? (
            <p className="text-sm text-muted-foreground">{props.description}</p>
          ) : null}
        </CardHeader>
        {children ? <CardContent className="px-4">{children}</CardContent> : null}
      </Card>
    ),
    Row: ({ children }) => (
      <div className="flex flex-wrap items-stretch gap-3">{children}</div>
    ),
    Stat: ({ props }) => (
      <div className="min-w-[120px] flex-1 rounded-lg border bg-muted/30 p-3">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {props.label}
        </p>
        <p className="mt-1 text-2xl font-bold text-foreground">{props.value}</p>
        {props.hint ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{props.hint}</p>
        ) : null}
      </div>
    ),
    Badge: ({ props }) => (
      <Badge variant={badgeTone[props.tone ?? "neutral"]}>{props.text}</Badge>
    ),
    KeyValue: ({ props }) => (
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        {props.pairs.map((p) => (
          <div key={p.label} className="contents">
            <dt className="text-muted-foreground">{p.label}</dt>
            <dd className="text-right font-medium text-foreground">{p.value}</dd>
          </div>
        ))}
      </dl>
    ),
    BulletList: ({ props }) => (
      <div className="space-y-2">
        {props.title ? <p className="text-sm font-medium">{props.title}</p> : null}
        <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-foreground">
          {props.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    ),
    Text: ({ props }) => (
      <p
        className={cn(
          "text-sm leading-6",
          props.tone === "muted" ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {props.content}
      </p>
    ),
    Divider: () => <Separator />,
  },
});
