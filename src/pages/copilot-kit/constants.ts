const COPILOT_KIT_THREAD_PREFIX = "ui-dojo:copilot-kit";

export const COPILOT_KIT_THREAD_IDS = {
  basic: `${COPILOT_KIT_THREAD_PREFIX}:basic:v1`,
  toolBasedGenerativeUi: `${COPILOT_KIT_THREAD_PREFIX}:tool-based-generative-ui:v1`,
  hitl: `${COPILOT_KIT_THREAD_PREFIX}:hitl:v1`,
  toolRendering: `${COPILOT_KIT_THREAD_PREFIX}:tool-rendering:v1`,
  reasoning: `${COPILOT_KIT_THREAD_PREFIX}:reasoning:v1`,
  frontendTools: `${COPILOT_KIT_THREAD_PREFIX}:frontend-tools:v1`,
  multimodal: `${COPILOT_KIT_THREAD_PREFIX}:multimodal:v1`,
  subagents: `${COPILOT_KIT_THREAD_PREFIX}:subagents:v1`,
  openGenerativeUi: `${COPILOT_KIT_THREAD_PREFIX}:open-generative-ui:v1`,
  sharedState: `${COPILOT_KIT_THREAD_PREFIX}:shared-state:v1`,
  backgroundTasks: `${COPILOT_KIT_THREAD_PREFIX}:background-tasks:v1`,
  observationalMemory: `${COPILOT_KIT_THREAD_PREFIX}:observational-memory:v1`,
  a2ui: `${COPILOT_KIT_THREAD_PREFIX}:a2ui:v1`,
  byoc: `${COPILOT_KIT_THREAD_PREFIX}:byoc:v1`,
} as const;
