/** Suppresses CopilotKit's default input disclaimer in showcase examples. */
export function EmptyChatDisclaimer() {
  return null;
}

export const chatInputWithoutDisclaimer = {
  disclaimer: () => <div className="h-10" />,
};
