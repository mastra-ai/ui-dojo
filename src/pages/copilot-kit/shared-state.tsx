import "@copilotkit/react-core/v2/styles.css";
import { useEffect } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotSidebar,
  useAgent,
  UseAgentUpdate,
  useAgentContext,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { MASTRA_BASE_URL } from "@/constants";
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

function RecipeCard() {
  const { agent } = useAgent({
    agentId: "ck_shared_state",
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });

  // Agent-context: a hint the agent can read alongside the shared state.
  useAgentContext({
    description: "The kind of cuisine the user is in the mood for",
    value: "Mediterranean",
  });

  const state = (agent.state as RecipeState | undefined) ?? INITIAL;
  const raw = state.recipe ?? INITIAL.recipe;
  // State can arrive partial mid-stream (STATE_DELTA), so normalize arrays/fields
  // to safe defaults before rendering.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (partial: Partial<Recipe>) =>
    agent.setState({ recipe: { ...recipe, ...partial } });

  const togglePref = (pref: string) => {
    const has = recipe.special_preferences.includes(pref);
    update({
      special_preferences: has
        ? recipe.special_preferences.filter((p) => p !== pref)
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
              onChange={(e) => update({ skill_level: e.target.value })}
            >
              {SKILL_LEVELS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Cooking time
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm shadow-xs"
              value={recipe.cooking_time}
              onChange={(e) => update({ cooking_time: e.target.value })}
            >
              {COOKING_TIMES.map((t) => (
                <option key={t}>{t}</option>
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
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex gap-2">
                  <span>{ing.icon}</span>
                  <span className="text-muted-foreground">{ing.amount}</span>
                  <span>{ing.name}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Instructions</p>
            <ol className="list-decimal space-y-1.5 pl-5 text-sm">
              {recipe.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Sidebar() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Create a recipe",
        message: "Create a delicious Italian pasta recipe.",
      },
      { title: "Make it vegan", message: "Make this recipe vegan." },
      { title: "Add a spicy kick", message: "Add some heat to the recipe." },
    ],
    available: "always",
  });
  return (
    <CopilotSidebar
      agentId="ck_shared_state"
      defaultOpen
      labels={{ modalHeaderTitle: "AI Recipe Assistant" }}
    />
  );
}

export default function SharedStateDemo() {
  return (
    <CopilotKit
      runtimeUrl={`${MASTRA_BASE_URL}/copilotkit`}
      showDevConsole={false}
      agent="ck_shared_state"
    >
      <div className="flex min-h-full w-full items-start justify-center p-6">
        <RecipeCard />
        <Sidebar />
      </div>
    </CopilotKit>
  );
}
