import { Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function WorkspaceDetails() {
  // This will be populated with actual workspace data later
  const workspaces = [
    { id: 1, name: "Workspace 1", role: "Owner" },
    { id: 2, name: "Workspace 2", role: "Member" },
  ];

  return (
    <div className="space-y-1">
      {workspaces.map((workspace) => (
        <TooltipProvider key={workspace.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => {}}
              >
                <Building className="h-4 w-4" />
                <div className="flex flex-col items-start">
                  <span className="text-sm">{workspace.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {workspace.role}
                  </span>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Switch to {workspace.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}
