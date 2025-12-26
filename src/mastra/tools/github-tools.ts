import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { github } from '../integrations/github';

export const readGithubFileTool = createTool({
  id: 'read-github-file',
  description: 'Read a file from a GitHub repository',
  inputSchema: z.object({
    owner: z.string().describe('Repository owner (username or org)'),
    repo: z.string().describe('Repository name'),
    path: z.string().describe('Path to file in repository'),
  }),
  outputSchema: z.object({
    content: z.string(),
    path: z.string(),
  }),
  execute: async ({ context }) => {
    const client = await github.getApiClient();
    const response = await client.getContent({
      path: {
        owner: context.owner,
        repo: context.repo,
        path: context.path,
      },
    });
    
    // GitHub returns base64-encoded content
    const content = Buffer.from(
      (response.data as any).content,
      'base64'
    ).toString('utf-8');
    
    return {
      content,
      path: context.path,
    };
  },
});

export const listGithubFilesTool = createTool({
  id: 'list-github-files',
  description: 'List files and folders in a GitHub repository',
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    path: z.string().optional().describe('Directory path (leave empty for root)'),
  }),
  outputSchema: z.object({
    items: z.array(z.object({
      name: z.string(),
      path: z.string(),
      type: z.enum(['file', 'dir']),
    })),
  }),
  execute: async ({ context }) => {
    const client = await github.getApiClient();
    const response = await client.getContent({
      path: {
        owner: context.owner,
        repo: context.repo,
        path: context.path || '',
      },
    });
    
    const items = Array.isArray(response.data) 
      ? response.data.map((item: any) => ({
          name: item.name,
          path: item.path,
          type: item.type === 'dir' ? 'dir' : 'file',
        }))
      : [];
    
    return { items };
  },
});
