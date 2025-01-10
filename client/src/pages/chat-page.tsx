import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { WorkspaceNavigation } from "@/components/workspace/WorkspaceNavigation";
import { ChannelList } from "@/components/workspace/ChannelList";

export default function ChatPage() {
  const [location] = useLocation();
  const workspaceId = location.startsWith("/workspaces/")
    ? location.split("/workspaces/")[1]
    : "default";

  const { data: workspace, isLoading } = useQuery({
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

        <div className="flex-1 bg-background">
          <div className="p-4">
            <h1 className="text-2xl font-bold">
              {workspace?.name ?? "Default Workspace"}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}