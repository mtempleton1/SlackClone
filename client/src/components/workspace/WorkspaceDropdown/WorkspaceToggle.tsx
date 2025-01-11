import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Building } from "lucide-react";

export function WorkspaceToggle() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 mb-1"
            onClick={() => {}}
          >
            <Building className="h-4 w-4" />
            <span>Current Workspace</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch to this workspace</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
