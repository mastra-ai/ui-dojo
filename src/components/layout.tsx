import { useLocation, useNavigate } from "react-router";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Sparkles,
  Bot,
  MessageSquare,
  type LucideIcon,
  Info,
  Minus,
  Plus,
} from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { newThreadLink } from "@/lib/utils";

type SidebarItemEntry = {
  id: string;
  title: string;
  url: `/${string}`;
  description: string;
  explanation: string;
  docsUrl?: string;
  concept?: string; // Items without concept appear at the root level
};

type SidebarEntry = {
  id: string;
  title: string;
  icon: LucideIcon;
  items: SidebarItemEntry[];
};

type GroupedItems = {
  rootItems: SidebarItemEntry[];
  conceptGroups: Record<string, SidebarItemEntry[]>;
};

const SIDEBAR: SidebarEntry[] = [
  {
    id: "ai-sdk",
    title: "AI SDK",
    icon: Sparkles,
    items: [
      {
        id: "ai-sdk-chat",
        title: "Chat",
        url: "/",
        description: "How to use AI SDK + AI Elements with Mastra",
        explanation:
          'This example demonstrates how to use "@mastra/ai-sdk" chatRoute() function to create an AI SDK-compatible stream that can be used with AI SDK useChat() hook.',
        docsUrl: "https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk",
      },
      {
        id: "sub-agents-and-workflows-custom-events",
        title: "Sub Agents & Workflows",
        url: "/ai-sdk/sub-agents-and-workflows-custom-events",
        description: "Using custom events with subagents & workflows",
        explanation:
          "Shows how writer.write() in workflow steps emits custom events during agent delegation. The orderProcessingAgent coordinates inventoryCheckAgent and orderFulfillmentWorkflow, with each emitting stage-specific data-tool-progress events for granular progress tracking across the entire execution chain.",
        docsUrl:
          "https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk#custom-tool-streaming",
      },
      {
        id: "client-ai-sdk",
        title: "Client Tools",
        url: "/ai-sdk/client-tools",
        description: "Calling frontend tools with AI SDK",
        explanation:
          "Demonstrates client-side tool execution using AI SDK's onToolCall callback. When the bgColorAgent calls colorChangeTool, the callback intercepts it on the client and executes the DOM manipulation directly in the browser instead of on the server.",
      },
      {
        id: "workflow",
        title: "Basic",
        url: "/ai-sdk/workflow",
        description: "Building multi-step workflows with AI SDK",
        explanation:
          "Demonstrates Mastra workflows with AI SDK by using prepareSendMessagesRequest() to transform user input into workflow inputData. The activitiesWorkflow returns step-by-step results via data-workflow parts, which can be rendered with custom UI components showing each step's status.",
        concept: "Workflow",
      },
      {
        id: "workflow-agent-text-stream",
        title: "Streaming",
        url: "/ai-sdk/workflow-agent-text-stream",
        description: "Streaming text from an agent in a workflow",
        explanation:
          "Shows how to stream text from an agent in a workflow step, using the includeTextStreamParts option in the workflowRoute() function and piping the agent's stream to the workflow step writer to enable text chunk streaming",
        docsUrl:
          "https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk#workflowroute",
        concept: "Workflow",
      },
      {
        id: "workflow-suspend-resume",
        title: "Suspend/Resume",
        url: "/ai-sdk/workflow-suspend-resume",
        description: "Using suspend and resume in a workflow",
        explanation:
          "Shows Mastra's workflow suspend/resume pattern using suspend() and resumeSchema. The approvalWorkflow pauses at the request-approval step, returns suspendPayload to the client, then resumes when called with matching resumeData or bails if rejected, enabling human-in-the-loop approval flows.",
        concept: "Workflow",
      },
      {
        id: "workflow-custom-events",
        title: "Branching",
        url: "/ai-sdk/workflow-custom-events",
        description: "Custom events from workflow steps with branching",
        explanation:
          "Demonstrates custom events from workflow steps with conditional branching using .branch(). The branchingWorkflow validates an order, then branches to either standardWorkflow or expressWorkflow based on order type. Each nested workflow step emits data-tool-progress events using writer.custom() showing how custom events propagate from branched nested workflows to the root stream.",
        docsUrl:
          "https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk#custom-tool-streaming",
        concept: "Workflow",
      },
      {
        id: "generative-user-interfaces",
        title: "Generative",
        url: "/ai-sdk/generative-user-interfaces",
        description: "Building custom UIs for tool responses",
        explanation:
          "This example shows how AI SDK's tool UI parts work with Mastra tools. The weatherTool returns structured data that AI SDK automatically types as tool-weatherTool, allowing you to render custom React components based on tool state (input-available, output-available, output-error).",
        docsUrl:
          "https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk#custom-ui",
        concept: "UI",
      },
      {
        id: "generative-user-interfaces-with-custom-events",
        title: "Tool Events",
        url: "/ai-sdk/generative-user-interfaces-with-custom-events",
        description: "Using custom events with generative UIs",
        explanation:
          "Demonstrates custom streaming events using writer.custom() in Mastra tools. The taskTool emits data-tool-progress events during execution, which AI SDK surfaces as custom data parts in the message stream for building real-time progress UIs.",
        docsUrl:
          "https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk#custom-tool-streaming",
        concept: "UI",
      },
      {
        id: "tool-nested-streams",
        title: "Nested Streams",
        url: "/ai-sdk/tool-nested-streams",
        description:
          "Nested agent & workflow streams emitted from within a tool run",
        explanation:
          "Demonstrates a tool that calls another Mastra agent and pipes its stream into the tool writer, emitting nested data-tool-agent and data-tool-workflow parts that can be rendered alongside the parent tool run in a single AI SDK UI.",
        docsUrl:
          "https://mastra.ai/docs/streaming/tool-streaming#tool-using-an-agent",
        concept: "UI",
      },
      {
        id: "agent-network",
        title: "Basic",
        url: "/ai-sdk/network",
        description:
          "Coordinating multiple AI agents with full lifecycle visibility",
        explanation:
          "Shows Mastra's agent composition pattern where a routing agent coordinates multiple specialized agents and workflows. The data-network events display each delegated agent's execution as steps, showing their status, input, and output - providing transparency into which agents were called and what they did.",
        concept: "Network",
      },
      {
        id: "agent-network-custom-events",
        title: "Events",
        url: "/ai-sdk/agent-network-custom-events",
        description: "Using custom events in an agent network",
        explanation:
          "Combines agent networks with custom events by having multiple agents emit progress updates. The reportAgentNetwork delegates sequentially to reportGenerationAgent and reportReviewAgent, with each agent's tools using writer.custom() to stream stage-specific progress events.",
        docsUrl:
          "https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk#custom-tool-streaming",
        concept: "Network",
      },
    ],
  },
  {
    id: "assistant-ui",
    title: "Assistant UI",
    icon: Bot,
    items: [
      {
        id: "assistant-ui-chat",
        title: "Chat",
        url: newThreadLink("assistant-ui", "ghibliAgent"),
        description: "How to use Assistant UI with Mastra",
        explanation:
          "This example demonstrates a more complex integration between Mastra and Assistant UI (a simpler example can be found in the Client Tools section). The useExternalStoreRuntime() hook allows a tight integration into Mastra and can be used for for message, memory, and thread storage.",
        docsUrl: "https://mastra.ai/docs/frameworks/agentic-uis/assistant-ui",
      },
      {
        id: "client-assistant-ui",
        title: "Client Tools",
        url: "/assistant-ui/client-tools",
        description: "Calling frontend tools in Assistant UI",
        explanation:
          "Same client-side tool pattern using Assistant UI's onToolCall callback in useChatRuntime(). The colorChangeTool is intercepted and executed client-side, showing how to implement browser-only tools with any UI framework that exposes tool call hooks.",
      },
      {
        id: "assistant-ui-human-in-the-loop",
        title: "Human-in-the-Loop",
        url: "/assistant-ui/human-in-the-loop",
        description: "Involving humans in the AI decision-making process",
        explanation:
          "TODO",
      },
    ],
  },
  {
    id: "copilot-kit",
    title: "CopilotKit",
    icon: MessageSquare,
    items: [
      {
        id: "copilot-kit-chat",
        title: "Chat",
        url: "/copilot-kit",
        description: "How to use CopilotKit with Mastra",
        explanation:
          'By using the "@ag-ui/mastra" registerCopilotKit() function, a CopilotKit-compatible stream is automatically created with Mastra. This endpoint is defined as a runtimeUrl prop in the CopilotKit component.',
        docsUrl: "https://mastra.ai/docs/frameworks/agentic-uis/copilotkit",
      },
      {
        id: "generative-user-interfaces",
        title: "Generative UI",
        url: "/copilot-kit/generative-user-interfaces",
        description: "Building custom UIs for tool responses",
        explanation:
          "Uses useCopilotAction() to intercept tool calls in CopilotKit and render custom UI.",
      },
      {
        id: "copilot-kit-human-in-the-loop",
        title: "Human-in-the-Loop",
        url: "/copilot-kit/human-in-the-loop",
        description: "Involving humans in the AI decision-making process",
        explanation:
          "Demonstrates how to set up a human-in-the-loop workflow using CopilotKit with Mastra. This example showcases how to route specific tasks to human agents for review or approval before finalizing the AI's response, ensuring higher accuracy and reliability in critical applications.",
      },
      {
        id: "client-copilot-kit",
        title: "Client Tools",
        url: "/copilot-kit/client-tools",
        description: "Calling frontend tools in Copilot Kit",
        explanation:
          "Uses CopilotKit's useFrontendTool() hook to register client-side tools. The colorChangeTool is defined with parameters and a handler that runs in the browser, allowing the Mastra agent to trigger frontend-only actions without server roundtrips.",
      },
    ],
  },
];

function groupByConcept(items: SidebarItemEntry[]): GroupedItems {
  const rootItems: SidebarItemEntry[] = [];
  const conceptGroups: Record<string, SidebarItemEntry[]> = {};

  for (const item of items) {
    if (item.concept) {
      if (!conceptGroups[item.concept]) {
        conceptGroups[item.concept] = [];
      }
      conceptGroups[item.concept].push(item);
    } else {
      rootItems.push(item);
    }
  }

  return { rootItems, conceptGroups };
}

function SidebarItem({
  item,
  isActive,
  onNavigate,
}: {
  item: SidebarItemEntry;
  isActive: boolean;
  onNavigate: (url: string) => void;
}) {
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        onClick={() => onNavigate(item.url)}
        isActive={isActive}
        className="hover:cursor-pointer"
      >
        {item.title}
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

function ConceptGroup({
  concept,
  items,
  activeUrl,
  onNavigate,
}: {
  concept: string;
  items: SidebarItemEntry[];
  activeUrl: string;
  onNavigate: (url: string) => void;
}) {
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton className="font-medium pointer-events-none">
        {concept}
      </SidebarMenuSubButton>
      <SidebarMenuSub>
        {items.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            isActive={item.url === activeUrl}
            onNavigate={onNavigate}
          />
        ))}
      </SidebarMenuSub>
    </SidebarMenuSubItem>
  );
}

function SidebarSection({
  sdk,
  activeUrl,
  onNavigate,
}: {
  sdk: SidebarEntry;
  activeUrl: string;
  onNavigate: (url: string) => void;
}) {
  const { rootItems, conceptGroups } = groupByConcept(sdk.items);

  return (
    <SidebarMenuSub>
      {rootItems.map((item) => (
        <SidebarItem
          key={item.id}
          item={item}
          isActive={item.url === activeUrl}
          onNavigate={onNavigate}
        />
      ))}
      {Object.entries(conceptGroups).map(([concept, conceptItems]) => (
        <ConceptGroup
          key={concept}
          concept={concept}
          items={conceptItems}
          activeUrl={activeUrl}
          onNavigate={onNavigate}
        />
      ))}
    </SidebarMenuSub>
  );
}

export default function Page({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const fullUrl = location.pathname + location.search;

  function findEntry(item: SidebarItemEntry): boolean {
    return item.url === fullUrl;
  }

  const pageTitleEntry = SIDEBAR.flatMap((group) => group.items).find(
    findEntry,
  );
  const pageTitle = pageTitleEntry?.concept
    ? `${pageTitleEntry.concept}: ${pageTitleEntry.title}`
    : (pageTitleEntry?.title ?? "Title missing");
  const pageDescription =
    SIDEBAR.flatMap((group) => group.items).find(findEntry)?.description ??
    "Description missing";
  const pageExplanation =
    SIDEBAR.flatMap((group) => group.items).find(findEntry)?.explanation ??
    "Explanation missing";
  const docsUrl = SIDEBAR.flatMap((group) => group.items).find(
    findEntry,
  )?.docsUrl;

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <div className="font-bold">UI Frameworks</div>
          <div className="text-sm text-sidebar-foreground/70">
            Learn how you can use Mastra with different UI frameworks.
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {SIDEBAR.map((sdk) => (
                <Collapsible
                  key={sdk.id}
                  defaultOpen={true}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="hover:cursor-pointer">
                        <sdk.icon /> {sdk.title}{" "}
                        <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                        <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {sdk.items?.length ? (
                      <CollapsibleContent>
                        <SidebarSection
                          sdk={sdk}
                          activeUrl={fullUrl}
                          onNavigate={navigate}
                        />
                      </CollapsibleContent>
                    ) : null}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Button asChild variant="outline">
            <a href="https://github.com/mastra-ai/ui-dojo" target="_blank">
              <SiGithub /> Source Code
            </a>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex flex-col py-4 lg:py-0 lg:flex-row h-26 lg:h-18 shrink-0 items-start lg:items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="flex flex-row gap-2 items-center">
              <h1 className="font-bold text-xl">{pageTitle}</h1>
              <Dialog>
                <form>
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="hover:cursor-pointer"
                    >
                      <Info className="size-5" />
                      <span className="sr-only">Open dialog</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{pageTitle}</DialogTitle>
                      <DialogDescription className="sr-only">
                        Explanation for {pageTitle}
                      </DialogDescription>
                    </DialogHeader>
                    <div>
                      <p>{pageExplanation}</p>
                    </div>
                    {docsUrl ? (
                      <DialogFooter className="sm:justify-center">
                        <Button asChild variant="link">
                          <a href={docsUrl} target="_blank">
                            Read documentation to learn more.
                          </a>
                        </Button>
                      </DialogFooter>
                    ) : null}
                  </DialogContent>
                </form>
              </Dialog>
            </div>
          </div>
          <div className="px-4 lg:px-0">{pageDescription}</div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
