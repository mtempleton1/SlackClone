import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Plus, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CreateWorkspaceOverlay } from "./CreateWorkspaceOverlay";

interface Workspace {
  id: string;
  name: string;
}

export function WorkspaceNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateOverlayOpen, setIsCreateOverlayOpen] = useState(false);

  const { data: workspaces } = useQuery<Workspace[]>({
    queryKey: ["/api/workspaces"],
  });

  return (
    <>
      <div className="bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center justify-between p-4">
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-sidebar-foreground">
                <span className="font-semibold">
                  {workspaces?.[0]?.name || "Loading..."}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {workspaces?.map((workspace) => (
                <DropdownMenuItem key={workspace.id}>
                  {workspace.name}
                </DropdownMenuItem>
              ))}
              <Separator className="my-2" />
              <DropdownMenuItem onSelect={() => setIsCreateOverlayOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4 text-sidebar-foreground" />
          </Button>
        </div>
      </div>

      <CreateWorkspaceOverlay 
        isOpen={isCreateOverlayOpen}
        onClose={() => setIsCreateOverlayOpen(false)}
      />
    </>
  );
}