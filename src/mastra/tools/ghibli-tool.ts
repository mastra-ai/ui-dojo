import { createTool } from "@mastra/core/tools";
import { z } from "zod";

async function getFilmByUrl(id: string) {
  const response = await fetch(id, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
}

export const ghibliFilms = createTool({
  id: "ghibli-films",
  description: "Get information about Ghibli films",
  inputSchema: z.object({}),
  execute: async () => {
    const films = await getFilmByUrl(`https://ghibliapi.vercel.app/films`);
    
    return films.map(
      (film: {
        title: string;
        description: string;
        movie_banner: string;
        release_date: string;
      }) => ({
        title: film.title,
        description: film.description,
        movie_banner: film.movie_banner,
        release_date: film.release_date,
      }),
    );
  },
});

export const ghibliCharacters = createTool({
  id: "ghibli-characters",
  description: "Get information about Ghibli characters",
  inputSchema: z.object({}),
  execute: async () => {
    const characters = await getFilmByUrl(`https://ghibliapi.vercel.app/people`);

    return await Promise.all(
      characters.map(
        async (character: {
          name: string;
          gender: string;
          age: number;
          eye_color: string;
          films: string[];
        }) => ({
          name: character.name,
          gender: character.gender,
          age: character.age,
          eye_color: character.eye_color,
          films: await Promise.all(
            character.films.map(async (filmUrl: string) => {
              const film = await getFilmByUrl(filmUrl);
              return {
                title: film.title,
              };
            }),
          ),
        }),
      ),
    );
  },
});
