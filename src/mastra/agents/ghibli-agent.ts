import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { ghibliFilms, ghibliCharacters } from "../tools/ghibli-tool";

export const ghibliAgent = new Agent({
  name: "Ghibli Agent",
  description: "This agent answers questions about Studio Ghibli films and characters.",
  instructions:
    "You are my Ghibli Films assistant. I will ask you questions and you must use the two tools ghibliFilms and ghibliCharacters to answer my questions. Always use the tools to get information about Studio Ghibli films and characters. If you don't know the answer, say 'I don't know'.",
  model: [
    {
      model: "openai/gpt-4o-mini",
    },
    {
      model: "vercel/deepseek/deepseek-r1",
    },
  ],
  tools: { ghibliFilms, ghibliCharacters },
  memory: new Memory(),
});
