import { useEffect } from "react";
import {
  useAgent,
  UseAgentUpdate,
  useAgentContext,
} from "@copilotkit/react-core/v2";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
const COOKING_TIMES = [
  "5 min",
  "15 min",
  "30 min",
  "45 min",
  "60+ min",
] as const;
const PREFERENCES = [
  "High Protein",
  "Low Carb",
  "Spicy",
  "Budget-Friendly",
  "One-Pot Meal",
  "Vegetarian",
  "Vegan",
] as const;

interface Ingredient {
  icon: string;
  name: string;
  amount: string;
}

interface Recipe {
  skill_level: string;
  cooking_time: string;
  special_preferences: string[];
  ingredients: Ingredient[];
  instructions: string[];
}

interface RecipeState {
  recipe: Recipe;
}

const INITIAL: RecipeState = {
  recipe: {
    skill_level: "Beginner",
    cooking_time: "30 min",
    special_preferences: [],
    ingredients: [{ icon: "🥕", name: "Carrots", amount: "2" }],
    instructions: ["Wash and chop the carrots."],
  },
};

/**
 * Shared recipe editor that reads and writes CopilotKit agent state.
 */
export function SharedRecipeCard() {
  const { agent } = useAgent({
    agentId: "ck_shared_state",
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });

  useAgentContext({
    description: "The kind of cuisine the user is in the mood for",
    value: "Mediterranean",
  });

  const state = (agent.state as RecipeState | undefined) ?? INITIAL;
  const raw = state.recipe ?? INITIAL.recipe;
  const recipe: Recipe = {
    skill_level: raw.skill_level ?? "Beginner",
    cooking_time: raw.cooking_time ?? "30 min",
    special_preferences: raw.special_preferences ?? [],
    ingredients: raw.ingredients ?? [],
    instructions: raw.instructions ?? [],
  };

  useEffect(() => {
    if (!(agent.state as RecipeState | undefined)?.recipe) {
      agent.setState(INITIAL);
    }
  }, [agent]);

  const update = (partial: Partial<Recipe>) =>
    agent.setState({ recipe: { ...recipe, ...partial } });

  const togglePref = (pref: string) => {
    const has = recipe.special_preferences.includes(pref);
    update({
      special_preferences: has
        ? recipe.special_preferences.filter((value) => value !== pref)
        : [...recipe.special_preferences, pref],
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Shared Recipe</CardTitle>
        <CardDescription>
          Shared state — edit it here and the agent sees your changes; ask the
          agent to change it and the fields update live (streamed via
          STATE_DELTA).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Skill level
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm shadow-xs"
              value={recipe.skill_level}
              onChange={(event) => update({ skill_level: event.target.value })}
            >
              {SKILL_LEVELS.map((skill) => (
                <option key={skill}>{skill}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Cooking time
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm shadow-xs"
              value={recipe.cooking_time}
              onChange={(event) => update({ cooking_time: event.target.value })}
            >
              {COOKING_TIMES.map((time) => (
                <option key={time}>{time}</option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Preferences</p>
          <div className="flex flex-wrap gap-2">
            {PREFERENCES.map((pref) => {
              const on = recipe.special_preferences.includes(pref);
              return (
                <Button
                  key={pref}
                  type="button"
                  size="sm"
                  variant={on ? "default" : "outline"}
                  className="h-7 rounded-full px-3 text-xs"
                  onClick={() => togglePref(pref)}
                >
                  {pref}
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="mb-2 text-sm font-medium">Ingredients</p>
            <ul className="space-y-1.5 text-sm">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex gap-2">
                  <span>{ingredient.icon}</span>
                  <span className="text-muted-foreground">
                    {ingredient.amount}
                  </span>
                  <span>{ingredient.name}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Instructions</p>
            <ol className="list-decimal space-y-1.5 pl-5 text-sm">
              {recipe.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
