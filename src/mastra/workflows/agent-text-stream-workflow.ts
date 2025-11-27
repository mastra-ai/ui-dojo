import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { weatherAgent } from "../agents/weather-agent";

const analyzeWeatherWithAgent = createStep({
  id: "analyze-weather",
  description: "Use an agent to analyze weather conditions and provide insights",
  inputSchema: z.object({
    location: z.string().describe("The location to analyze weather for"),
  }),
  outputSchema: z.object({
    analysis: z.string().describe("Weather analysis from the agent"),
    location: z.string(),
  }),
  execute: async ({ inputData, writer}) => {
    // Pipe the agent's stream to the step writer to enable text chunk streaming
    const response = await weatherAgent
      .stream(
        `Analyze the weather conditions in ${inputData.location} and provide detailed insights about temperature, conditions, and recommendations for outdoor activities.`,
      )
      
      await response.fullStream.pipeTo(writer);

    return {
      analysis: await response.text,
      location: inputData.location,
    };
  },
});

const calculateComfortScore = createStep({
  id: "calculate-comfort",
  description: "Calculate a comfort score based on the weather analysis",
  inputSchema: z.object({
    analysis: z.string(),
    location: z.string(),
  }),
  outputSchema: z.object({
    comfortScore: z.number().describe("Comfort score from 0-100"),
    summary: z.string(),
    location: z.string(),
  }),
  execute: async ({ inputData }) => {
    // Simple calculation based on analysis length and keywords
    const analysis = inputData.analysis.toLowerCase();
    let score = 50; // Base score

    // Adjust score based on positive keywords
    if (analysis.includes("sunny") || analysis.includes("clear")) score += 20;
    if (analysis.includes("warm") || analysis.includes("comfortable")) score += 15;
    if (analysis.includes("cool") || analysis.includes("pleasant")) score += 10;
    
    // Adjust score based on negative keywords
    if (analysis.includes("rain") || analysis.includes("storm")) score -= 20;
    if (analysis.includes("hot") || analysis.includes("humid")) score -= 15;
    if (analysis.includes("cold") || analysis.includes("freezing")) score -= 15;

    // Keep score within bounds
    score = Math.max(0, Math.min(100, score));

    const summary = `Based on the weather analysis for ${inputData.location}, the comfort score is ${score}/100. ${
      score >= 70
        ? "Great conditions for outdoor activities!"
        : score >= 40
          ? "Decent weather, but consider the conditions."
          : "Not ideal weather conditions today."
    }`;

    return {
      comfortScore: score,
      summary,
      location: inputData.location,
    };
  },
});

export const agentTextStreamWorkflow = createWorkflow({
  id: "agent-text-stream-workflow",
  description:
    "A workflow that uses an agent to analyze weather with text streaming, then calculates a comfort score",
  inputSchema: z.object({
    location: z.string().describe("The location to analyze weather for"),
  }),
  outputSchema: z.object({
    comfortScore: z.number(),
    summary: z.string(),
    location: z.string(),
  }),
})
  .then(analyzeWeatherWithAgent)
  .then(calculateComfortScore);

agentTextStreamWorkflow.commit();

