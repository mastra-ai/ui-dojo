import { useLocation, useNavigate } from "react-router";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Sparkles,
  Bot,
  MessageSquare,
  type LucideIcon,
  Workflow,
  AppWindowMac,
  Network,
  Info,
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

type SidebarEntry = {
  id: string;
  name: string;
  url: `/${string}`;
  description: string;
  explanation: string;
  icon: LucideIcon;
  docsUrl?: string;
};

type SidebarGroupEntry = {
  groupId: string;
  groupName: string;
  items: SidebarEntry[];
};

const SIDEBAR: SidebarGroupEntry[] = [
  {
    groupId: "chat-examples",
    groupName: "Chat Examples",
    items: [
      {
        id: "aisdk",
        name: "AI SDK",
        url: "/",
        icon: Sparkles,
        description: "How to use AI SDK + AI Elements with Mastra",
        explanation:
          'This example demonstrates how to use "@mastra/ai-sdk" chatRoute() function to create an AI SDK-compatible stream that can be used with AI SDK useChat() hook.',
        docsUrl: "https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk",
      },
      {
        id: "assistant-ui",
        name: "Assistant UI",
        url: "/assistant-ui/ghibliAgent/chat/new",
        icon: Bot,
        description: "How to use Assistant UI with Mastra",
        explanation:
          "This example demonstrates a more complex integration between Mastra and Assistant UI (a simpler example can be found in the Client Tools section). The useExternalStoreRuntime() hook allows a tight integration into Mastra and can be used for for message, memory, and thread storage.",
        docsUrl: "https://mastra.ai/docs/frameworks/agentic-uis/assistant-ui",
      },
      {
        id: "copilot-kit",
        name: "CopilotKit",
        url: "/copilot-kit",
        icon: MessageSquare,
        description: "How to use CopilotKit with Mastra",
        explanation:
          'By using the "@ag-ui/mastra" registerCopilotKit() function, a CopilotKit-compatible stream is automatically created with Mastra. This endpoint is defined as a runtimeUrl prop in the CopilotKit component.',
        docsUrl: "https://mastra.ai/docs/frameworks/agentic-uis/copilotkit",
      },
    ],
  },
  {
    groupId: "ai-sdk",
    groupName: "AI SDK UI",
    items: [
      {
        id: "generative-user-interfaces",
        name: "Generative UIs",
        url: "/ai-sdk/generative-user-interfaces",
        icon: AppWindowMac,
        description: "Building custom UIs for tool responses",
        explanation:
          "This example shows how AI SDK's tool UI parts work with Mastra tools. The weatherTool returns structured data that AI SDK automatically types as tool-weatherTool, allowing you to render custom React components based on tool state (input-available, output-available, output-error).",
        docsUrl:
          "https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk#custom-ui",
      },
      {
        id: "workflow",
        name: "Workflow",
        url: "/ai-sdk/workflow",
        icon: Workflow,
        description: "Building multi-step workflows with AI SDK",
        explanation:
          "Demonstrates Mastra workflows with AI SDK by using prepareSendMessagesRequest() to transform user input into workflow inputData. The activitiesWorkflow returns step-by-step results via data-workflow parts, which can be rendered with custom UI components showing each step's status.",
      },
      {
        id: "agent-network",
        name: "Agent Network",
        url: "/ai-sdk/network",
        icon: Network,
        description: "Coordinating multiple AI agents for complex tasks",
        explanation:
          "Shows Mastra's agent composition pattern where a routing agent coordinates multiple specialized agents and workflows. The routingAgent uses its agents and workflows properties to delegate requests, with all responses unified in a single chat stream.",
      },
      {
        id: "workflow-agent-text-streaming",
        name: "Workflow Agent TextStream",
        url: "/ai-sdk/workflow-agent-text-streaming",
        icon: Workflow,
        description: "Streaming text from an agent in a workflow",
        explanation:
          "Shows how to stream text from an agent in a workflow step",
      },
    ],
  },
  {
    groupId: "with-custom-events",
    groupName: "AI SDK Custom Events",
    items: [
      {
        id: "generative-user-interfaces-with-custom-events",
        name: "Tools",
        url: "/ai-sdk/generative-user-interfaces-with-custom-events",
        icon: AppWindowMac,
        description: "Using custom events with generative UIs",
        explanation:
          "Demonstrates custom streaming events using writer.custom() in Mastra tools. The taskTool emits data-tool-progress events during execution, which AI SDK surfaces as custom data parts in the message stream for building real-time progress UIs.",
        docsUrl:
          "https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk#custom-tool-streaming",
      },
      {
        id: "sub-agents-and-workflows-custom-events",
        name: "Sub Agents & Workflows",
        url: "/ai-sdk/sub-agents-and-workflows-custom-events",
        icon: Workflow,
        description: "Using custom events with subagents & workflows",
        explanation:
          "Shows how writer.write() in workflow steps emits custom events during agent delegation. The orderProcessingAgent coordinates inventoryCheckAgent and orderFulfillmentWorkflow, with each emitting stage-specific data-tool-progress events for granular progress tracking across the entire execution chain.",
        docsUrl:
          "https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk#custom-tool-streaming",
      },
      {
        id: "agent-network-custom-events",
        name: "Agent Network",
        url: "/ai-sdk/agent-network-custom-events",
        icon: Network,
        description: "Using custom events in an agent network",
        explanation:
          "Combines agent networks with custom events by having multiple agents emit progress updates. The reportAgentNetwork delegates sequentially to reportGenerationAgent and reportReviewAgent, with each agent's tools using writer.custom() to stream stage-specific progress events.",
        docsUrl:
          "https://mastra.ai/docs/frameworks/agentic-uis/ai-sdk#custom-tool-streaming",
      },
    ],
  },
  {
    groupId: "client-tools",
    groupName: "Client Tools",
    items: [
      {
        id: "client-ai-sdk",
        name: "AI SDK",
        url: "/client-tools/ai-sdk",
        icon: Sparkles,
        description: "Calling frontend tools with AI SDK + client tools",
        explanation:
          "Demonstrates client-side tool execution using AI SDK's onToolCall callback. When the bgColorAgent calls colorChangeTool, the callback intercepts it on the client and executes the DOM manipulation directly in the browser instead of on the server.",
      },
      {
        id: "client-assistant-ui",
        name: "Assistant UI",
        url: "/client-tools/assistant-ui",
        icon: Bot,
        description: "Calling frontend tools in Asssistant UI + client tools",
        explanation:
          "Same client-side tool pattern using Assistant UI's onToolCall callback in useChatRuntime(). The colorChangeTool is intercepted and executed client-side, showing how to implement browser-only tools with any UI framework that exposes tool call hooks.",
      },
      {
        id: "client-copilot-kit",
        name: "Copilot Kit",
        url: "/client-tools/copilot-kit",
        icon: MessageSquare,
        description: "Calling frontend tools in Copilot Kit + client tools",
        explanation:
          "Uses CopilotKit's useFrontendTool() hook to register client-side tools. The colorChangeTool is defined with parameters and a handler that runs in the browser, allowing the Mastra agent to trigger frontend-only actions without server roundtrips.",
      },
    ],
  },
  {
    groupId: "HITL",
    groupName: "HITL",
    items: [
      {
        id: "workflow-suspend-resume",
        name: "Workflow Suspend/Resume",
        url: "/ai-sdk/workflow-suspend-resume",
        icon: Workflow,
        description: "Using suspend and resume in a workflow",
        explanation:
          "Shows Mastra's workflow suspend/resume pattern using suspend() and resumeSchema. The approvalWorkflow pauses at the request-approval step, returns suspendPayload to the client, then resumes when called with matching resumeData or bails if rejected, enabling human-in-the-loop approval flows.",
      },
    ],
  },
];

export default function Page({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const normalizedPathname = location.pathname.includes("/chat/")
    ? location.pathname.split("/chat/")[0] + "/chat/new"
    : location.pathname;

  function findEntry(item: SidebarEntry): boolean {
    return item.url === normalizedPathname;
  }

  const pageTitle =
    SIDEBAR.flatMap((group) => group.items).find(findEntry)?.name ??
    "Title missing";
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
          {SIDEBAR.map((group) => (
            <SidebarGroup
              key={group.groupId}
              className="group-data-[collapsible=icon]:hidden"
            >
              <SidebarGroupLabel>{group.groupName}</SidebarGroupLabel>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      className="hover:cursor-pointer"
                      onClick={() => navigate(item.url)}
                      isActive={item.url === normalizedPathname}
                    >
                      <item.icon />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))}
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
