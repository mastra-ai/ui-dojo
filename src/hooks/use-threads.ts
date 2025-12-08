import { useMastraClient } from "@mastra/react";
import { useQuery } from "@tanstack/react-query";

export const useThreads = ({
  resourceId,
  agentId,
  isMemoryEnabled,
}: {
  resourceId: string;
  agentId: string;
  isMemoryEnabled: boolean;
}) => {
  const client = useMastraClient();

  return useQuery({
    queryKey: ["memory", "threads", resourceId, agentId],
    queryFn: async () => {
      if (!isMemoryEnabled) return null;
      const result = await client.listMemoryThreads({ resourceId, agentId });
      return result.threads;
    },
    enabled: Boolean(isMemoryEnabled),
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
};
