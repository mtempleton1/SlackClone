import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CreateButtonProps {
  onClick: () => void;
}

export function CreateButton({ onClick }: CreateButtonProps) {
  return (
    <Button
      variant="outline"
      className="w-full justify-start gap-2"
      onClick={onClick}
    >
      <Plus className="h-4 w-4" />
      Create New Workspace
    </Button>
  );
}
