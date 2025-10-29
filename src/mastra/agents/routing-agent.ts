import { Agent } from "@mastra/core/agent";
import { weatherAgent } from "./weather-agent";
import { ghibliAgent } from "./ghibli-agent";
import { weatherTool } from "../tools/weather-tool";
import { ghibliCharacters, ghibliFilms } from "../tools/ghibli-tool";
import { Memory } from "@mastra/memory";
import { activitiesWorkflow } from "../workflows/activities-workflow";

export const routingAgent = new Agent({
  name: "Routing Agent",
  instructions: `You are a routing agent that directs user queries to the appropriate specialized agent based on the topic of the query.
  
  Names of the available agents:
  - weatherAgent: Provides weather information for specific locations.
  - ghibliAgent: Answers questions about Studio Ghibli films and characters.

  Names of available workflows:
  - activitiesWorkflow: Helps plan activities in various cities.
  
  If the query is about weather, route it to the Weather Agent. If they want to plan activities in a city, route it to the activities workflow. If it's about Studio Ghibli films or characters, route it to the Ghibli Agent. Always ensure that the user's query is handled by the most relevant agent or workflow.`,
  model: "openai/gpt-4o-mini",
  agents: {
    weatherAgent,
    ghibliAgent,
  },
  workflows: {
    activitiesWorkflow,
  },
  tools: {
    weatherTool,
    ghibliFilms,
    ghibliCharacters
  },
  memory: new Memory()
})