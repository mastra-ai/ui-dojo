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
} from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Button } from "@/components/ui/button";

type SidebarEntry = {
  id: string;
  name: string;
  url: `/${string}`;
  description: string;
  icon: LucideIcon;
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
        description: "Basic example how to use AI SDK Chat with Mastra",
      },
      {
        id: "assistant-ui",
        name: "Assistant UI",
        url: "/assistant-ui/ghibliAgent/chat/new",
        icon: Bot,
        description: "Basic example how to use Assistant UI with Mastra",
      },
      {
        id: "copilot-kit",
        name: "CopilotKit",
        url: "/copilot-kit",
        icon: MessageSquare,
        description: "Basic example how to use CopilotKit with Mastra",
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
        description: "How to build custom UIs for tool responses",
      },
      {
        id: "workflow",
        name: "Workflow",
        url: "/ai-sdk/workflow",
        icon: Workflow,
        description: "Building multi-step workflows with AI SDK",
      },
      {
        id: "agent-network",
        name: "Agent Network",
        url: "/ai-sdk/network",
        icon: Network,
        description: "Coordinating multiple AI agents for complex tasks",
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
        description: "How to use custom events with Generative UIs",
      },
      {
        id: "sub-agents-and-workflows-custom-events",
        name: "Sub Agents & Workflows",
        url: "/ai-sdk/sub-agents-and-workflows-custom-events",
        icon: Workflow,
        description: "How to use custom events with Sub Agents & Workflows",
      },
      {
        id: "agent-network-custom-events",
        name: "Report Agent Network",
        url: "/ai-sdk/agent-network-custom-events",
        icon: Network,
        description: "How to use custom events with Report Agent Network",
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
        description: "How to call frontend tools with AI SDK + Client Tools",
      },
      {
        id: "client-assistant-ui",
        name: "Assistant UI",
        url: "/client-tools/assistant-ui",
        icon: Bot,
        description:
          "How to call frontend tools in Asssistant UI + Client Tools",
      },
      {
        id: "client-copilot-kit",
        name: "Copilot Kit",
        url: "/client-tools/copilot-kit",
        icon: MessageSquare,
        description: "How to call frontend tools in Copilot Kit + Client Tools",
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
        description: "How to suspend and resume a workflow",
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
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="font-bold text-xl">
              {
                SIDEBAR.flatMap((group) => group.items).find(
                  (item) => item.url === normalizedPathname,
                )?.name
              }
            </h1>
          </div>
          <div>
            {
              SIDEBAR.flatMap((group) => group.items).find(
                (item) => item.url === normalizedPathname,
              )?.description
            }
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
