import { createOpenAI } from '@ai-sdk/openai';

export const glm = createOpenAI({
  name: 'glm',
  baseURL: process.env.GLM_BASE_URL || 'https://api.glm.com/v1',
  apiKey: process.env.GLM_API_KEY!,
});

// Helper function for GLM 4.7
export const glm47 = (options?: any) => glm('glm-4-7b', options);
