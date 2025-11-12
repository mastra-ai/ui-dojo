import { ThemeProvider } from "@/components/theme-provider";
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
import { useState } from "react";
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
import { AISdkDemo } from "@/demos/ai-sdk";
import { CopilotKitDemo } from "@/demos/copilot-kit";
import { AssistantUIDemo } from "@/demos/assistant-ui";
import { GenerativeUserInterfacesDemo } from "./demos/ai-sdk/generative-user-interfaces";
import { GenerativeUserInterfacesCustomEventsDemo } from "./demos/ai-sdk/generative-user-interfaces-custom-events";
import { WorkflowDemo } from "./demos/ai-sdk/workflow";
import { NetworkDemo } from "./demos/ai-sdk/network";
import { ClientAISdkDemo } from "./demos/client-sdk/ai-sdk";
import { ClientAssistantUIDemo } from "./demos/client-sdk/assistant-ui";
import { ClientCopilotKitDemo } from "./demos/client-sdk/copilot-kit";
import { Button } from "./components/ui/button";

type SidebarId =
  | "aisdk"
  | "assistant-ui"
  | "copilot-kit"
  | "generative-user-interfaces"
  | "workflow"
  | "agent-network"
  | "generative-user-interfaces-with-custom-events"
  | "client-ai-sdk"
  | "client-assistant-ui"
  | "client-copilot-kit";

type SidebarEntry = {
  id: SidebarId;
  name: string;
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
        icon: Sparkles,
        description: "Basic example how to use AI SDK Chat with Mastra",
      },
      {
        id: "assistant-ui",
        name: "Assistant UI",
        icon: Bot,
        description: "Basic example how to use Assistant UI with Mastra",
      },
      {
        id: "copilot-kit",
        name: "CopilotKit",
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
        icon: AppWindowMac,
        description: "How to build custom UIs for tool responses",
      },
      {
        id: "workflow",
        name: "Workflow",
        icon: Workflow,
        description: "Building multi-step workflows with AI SDK",
      },
      {
        id: "agent-network",
        name: "Agent Network",
        icon: Network,
        description: "Coordinating multiple AI agents for complex tasks",
      },
    ],
  },
  {
    groupId: "with-custom-events",
    groupName: "With Custom Events",
    items: [
      {
        id: "generative-user-interfaces-with-custom-events",
        name: "Generative UIs",
        icon: AppWindowMac,
        description: "How to use custom events with Generative UIs",
      },
    ],
  },
  {
    groupId: "client-js",
    groupName: "With Client Tools",
    items: [
      {
        id: "client-ai-sdk",
        name: "AI SDK",
        icon: Sparkles,
        description: "How to call frontend tools with AI SDK + Client Tools",
      },
      {
        id: "client-assistant-ui",
        name: "Assistant UI",
        icon: Bot,
        description: "How to call frontend tools in Asssistant UI + Client Tools",
      },
      {
        id: "client-copilot-kit",
        name: "Copilot Kit",
        icon: MessageSquare,
        description: "How to call frontend tools in Copilot Kit + Client Tools",
      },
    ],
  },
];

export default function Page() {
  const [activeId, setActiveId] = useState<SidebarId>("aisdk");

  const renderDemo = () => {
    switch (activeId) {
      case "aisdk":
        return <AISdkDemo />;
      case "copilot-kit":
        return <CopilotKitDemo />;
      case "assistant-ui":
        return <AssistantUIDemo />;
      case "generative-user-interfaces":
        return <GenerativeUserInterfacesDemo />;
      case "workflow":
        return <WorkflowDemo />;
      case "agent-network":
        return <NetworkDemo />;
      case "generative-user-interfaces-with-custom-events":
        return <GenerativeUserInterfacesCustomEventsDemo />;
      case "client-ai-sdk":
        return <ClientAISdkDemo />;
      case "client-assistant-ui":
        return <ClientAssistantUIDemo />;
      case "client-copilot-kit":
        return <ClientCopilotKitDemo />;
    }
  };

  return (
    <ThemeProvider>
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
                        onClick={() => setActiveId(item.id)}
                        isActive={item.id === activeId}
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
                    (item) => item.id === activeId,
                  )?.name
                }
              </h1>
            </div>
            <div>
              {
                SIDEBAR.flatMap((group) => group.items).find(
                  (item) => item.id === activeId,
                )?.description
              }
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {renderDemo()}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
