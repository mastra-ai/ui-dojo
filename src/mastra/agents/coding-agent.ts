import { Agent } from '@mastra/core/agent';
import { glm47 } from '../lib/glm-provider';
import { readFileTool } from '../tools/file-reader';
import { webSearchTool } from '../tools/web-search';
import { readGithubFileTool, listGithubFilesTool } from '../tools/github-tools';

export const codingAgent = new Agent({
  name: 'coding-agent',
  instructions: `
You are a powerful coding assistant with these capabilities:

1. **Read Local Files**: Use read-file tool to read any file from the filesystem
2. **Analyze Images**: When shown images or screenshots, you can see and analyze them directly
3. **Search the Web**: Use web-search to find documentation, examples, and solutions
4. **Access GitHub Repos**: Use GitHub tools to read files and explore repositories

Guidelines:
- When asked about a file, read it first before responding
- For current documentation or packages, search the web
- When working with GitHub repos, list files first to understand structure
- Always provide practical, tested solutions
- Explain your reasoning clearly
  `,
  model: glm47(),
  tools: {
    readFileTool,
    webSearchTool,
    readGithubFileTool,
    listGithubFilesTool,
  },
});
