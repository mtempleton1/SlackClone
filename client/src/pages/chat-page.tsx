import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { WorkspaceNavigation } from "@/components/workspace/WorkspaceNavigation";
import { ChannelList } from "@/components/workspace/ChannelList";
import { ChatArea } from "@/components/chat/ChatArea";

interface Workspace {
  id: string;
  name: string;
  organizationId: number;
}

export default function ChatPage() {
  const [location] = useLocation();
  const workspaceId = location.startsWith("/workspaces/")
    ? location.split("/workspaces/")[1]
    : "default";

  const { data: workspace, isLoading } = useQuery<Workspace>({
    queryKey: [`/api/workspaces/${workspaceId}`],
    enabled: workspaceId !== "default",
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <WorkspaceNavigation />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-sidebar border-r border-sidebar-border">
          <ChannelList />
        </div>

        <div className="flex-1 bg-background flex flex-col">
          <div className="border-b border-border px-4 py-3">
            <h1 className="text-lg font-semibold">
              {workspace?.name ?? "Default Workspace"}
            </h1>
          </div>
          <div className="flex-1">
            <ChatArea />
          </div>
        </div>
      </div>
    </div>
  );
}