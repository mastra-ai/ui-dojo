# UI Dojo

A Mastra showcase demonstrating how to integrate Mastra with popular AI UI frameworks. Compare implementations side-by-side and choose the best approach for your project.

This project provides working examples of Mastra integrated with three major AI UI frameworks, plus demonstrations of advanced patterns like generative UIs, workflows, and agent networks. Use this as a reference to understand how Mastra works with different UI approaches and pick the one that fits your needs.

In addition to this project, also consult the official Mastra documentation:

- [AI SDK](https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk)
- [Assistant UI](https://mastra.ai/docs/frameworks/agentic-uis/assistant-ui)
- [CopilotKit](https://mastra.ai/docs/frameworks/agentic-uis/copilotkit)

## Features

- **Framework Comparisons**: See Mastra working with AI SDK, Assistant UI, and CopilotKit
- **Generative UIs**: Build custom UI components for tool responses
- **Workflows**: Implement multi-step AI workflows with streaming and suspend/resume steps (including "Human in the Loop")
- **Agent Networks**: Coordinate multiple AI agents for complex tasks
- **Client SDK Integration**: Use Mastra's Client SDK with different frameworks

## Prerequisites

- Node.js 20 or later
- OpenAI API key

## Setup

1. **Clone and install dependencies:**

   ```bash
   git clone git@github.com:mastra-ai/ui-dojo.git
   cd ui-dojo
   pnpm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env and add your API key
   ```

3. **Start the development server:**

   ```bash
   pnpm run dev
   ```

   This runs both the Mastra server and Vite dev server concurrently.

## What's Inside

### Chat Examples

Compare three different approaches to building chat interfaces with Mastra:

- **AI SDK** (`src/pages/ai-sdk/index.tsx`) - Built with Vercel's AI SDK and `@mastra/ai-sdk`
- **Assistant UI** (`src/pages/assistant-ui/index.tsx`) - Built with Assistant UI's Thread components and `useExternalStoreRuntime()` to connect Assistant UI to Mastra's memory
- **CopilotKit** (`src/pages/copilot-kit/index.tsx`) - Built with CopilotKit's Chat component

These examples showcase similar chat functionality implemented with different UI frameworks, allowing you to compare their approaches and capabilities.

### AI SDK UI

Explore advanced AI SDK UI capabilities:

- **Generative UIs** (`src/pages/ai-sdk/generative-user-interfaces.tsx`) - Custom UI components for tool responses
- **Workflows** (`src/pages/ai-sdk/workflow.tsx`) - Multi-step workflows with the activities workflow
- **Agent Networks** (`src/pages/ai-sdk/network.tsx`) - Multiple agents coordinating through a routing agent

### Custom Events

- **Generative UIs** (`src/pages/ai-sdk/generative-user-interfaces-with-custom-events.tsx`) - Custom UI for custom events
- **Agent Networks** (`src/pages/ai-sdk/agent-network-custom-events.tsx`) - Agent networks with custom event handling
- **Sub-agents and Workflows** (`src/pages/ai-sdk/sub-agents-and-workflows-custom-events.tsx`) - Sub-agents and workflows with custom events

### Workflow Patterns

- **Suspend/Resume** (`src/pages/ai-sdk/workflow-suspend-resume.tsx`) - Workflow with
  suspend and resume capabilities (Human in the Loop)

### Client Tools

See how to use client tools with each framework:

- **AI SDK + Client SDK** (`src/pages/client-tools/ai-sdk.tsx`)
- **Assistant UI + Client SDK** (`src/pages/client-tools/assistant-ui.tsx`)
- **CopilotKit + Client SDK** (`src/pages/client-tools/copilot-kit.tsx`)

## Common Issues

### "OPENAI_API_KEY is not set"

- Make sure you've created a `.env` file from `.env.example`
- Verify your API key is valid and properly formatted
- Restart the dev server after setting environment variables

### "Port already in use"

- Check if another Mastra or Vite process is running
- Kill the process or change the port in `vite.config.ts`

### "Agent not responding"

- Check the browser console and terminal for errors
- Verify your OpenAI API key has sufficient credits
- Ensure the Mastra server is running (check `http://localhost:4750`)

## Development

### Commands

- `pnpm run dev` - Start both Mastra and Vite servers
- `pnpm run mastra:dev` - Start only Mastra server
- `pnpm run vite:dev` - Start only Vite dev server
- `pnpm run vite:build` - Build for production
- `pnpm run lint` - Lint code
- `pnpm run format` - Format code with Prettier

### Customization

Modify the agents, tools, and workflows in `src/mastra/` to experiment with different capabilities. Each demo can be found in `src/pages/` and uses components from `src/components/`.

## Learn More

- [Mastra Documentation](https://mastra.ai/docs)
- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Assistant UI Documentation](https://assistant-ui.com)
- [CopilotKit Documentation](https://copilotkit.ai)
