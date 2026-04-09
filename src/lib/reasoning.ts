type MessagePartWithReasoningText = {
  type: string;
  text?: string;
};

export const getVisibleReasoningText = (
  parts: MessagePartWithReasoningText[],
) =>
  parts
    .filter((part) => part.type === "reasoning")
    .map((part) => part.text ?? "")
    .join("\n\n");
