import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

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
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold">
        {workspace ? workspace.name : "Default Workspace"}
      </h1>
    </div>
  );
}
