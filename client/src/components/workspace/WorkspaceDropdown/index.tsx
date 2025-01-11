import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownArrowIcon } from "./DropdownArrowIcon";
import { WorkspaceToggle } from "./WorkspaceToggle";
import { CreateButton } from "./CreateButton";
import { CloseButton } from "./CloseButton";
import { WorkspaceDetails } from "./WorkspaceDetails";
import { DropdownDivider } from "./DropdownDivider";

export function WorkspaceDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          Select Workspace
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px] p-2" align="start">
        <div className="flex items-center gap-2 mb-2">
          <Input
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <WorkspaceToggle />
        <DropdownDivider />
        <WorkspaceDetails />
        <CreateButton onClick={() => setIsOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
