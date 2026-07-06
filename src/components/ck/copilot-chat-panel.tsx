import type { ComponentProps, CSSProperties } from "react";
import { CopilotChat } from "@copilotkit/react-core/v2";
import { cn } from "@/lib/utils";
import { chatInputWithoutDisclaimer } from "@/components/ck/empty-chat-disclaimer";

type CopilotChatPanelProps = ComponentProps<typeof CopilotChat> & {
  containerClassName?: string;
  containerStyle?: CSSProperties;
};

/**
 * The single embedded-chat shell used by CopilotKit examples.
 */
export function CopilotChatPanel({
  className,
  containerClassName,
  containerStyle,
  input = chatInputWithoutDisclaimer,
  ...props
}: CopilotChatPanelProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full overflow-hidden",
        containerClassName,
      )}
      style={containerStyle}
    >
      <CopilotChat
        {...props}
        input={input}
        className={cn(
          "h-full min-h-0 w-full rounded-2xl",
          className,
        )}
      />
    </div>
  );
}
