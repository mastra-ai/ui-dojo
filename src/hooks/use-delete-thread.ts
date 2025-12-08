import { useMastraClient } from "@mastra/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteThread = () => {
  const client = useMastraClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      threadId,
      agentId,
    }: {
      threadId: string;
      agentId: string;
    }) => {
      const thread = client.getMemoryThread({ threadId, agentId });
      return thread.delete();
    },
    onSuccess: (_, variables) => {
      const { agentId } = variables;
      if (agentId) {
        queryClient.invalidateQueries({
          queryKey: ["memory", "threads", agentId, agentId],
        });
      }
      console.log("Chat deleted successfully");
    },
    onError: () => {
      console.error("Failed to delete chat");
    },
  });
};
