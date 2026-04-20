import { defineRegistry } from "@json-render/react";
import {
  Card as UiCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  jsonRenderCatalog,
  jsonRenderSpecSchema,
  type JsonRenderSpec,
} from "@/lib/json-render-catalog";
import { cn } from "@/lib/utils";

export const { registry: jsonRenderRegistry } = defineRegistry(
  jsonRenderCatalog,
  {
    components: {
      Card: ({ props, children }) => (
        <UiCard className="gap-4 py-4">
          <CardHeader className="gap-1 px-4">
            <CardTitle>{props.title}</CardTitle>
            {props.description ? (
              <CardDescription>{props.description}</CardDescription>
            ) : null}
          </CardHeader>
          {children ? <CardContent className="px-4">{children}</CardContent> : null}
        </UiCard>
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
    },
  },
);

export { jsonRenderCatalog, jsonRenderSpecSchema, type JsonRenderSpec };
