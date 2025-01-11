import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CloseButtonProps {
  onClick: () => void;
}

export function CloseButton({ onClick }: CloseButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={onClick}
    >
      <X className="h-4 w-4" />
    </Button>
  );
}
