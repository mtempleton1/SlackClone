import { FC } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MessageCircle, Pin, Bookmark, Share } from "lucide-react";

interface MessageActionsProps {
  message: {
    id: string;
    hasThread?: boolean;
  };
  onThreadClick?: () => void;
}

export const MessageActions: FC<MessageActionsProps> = ({ message, onThreadClick }) => {
  const queryClient = useQueryClient();

  const handleThreadClick = () => {
    if (onThreadClick) {
      onThreadClick();
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2"
          onClick={handleThreadClick}
        >
          <MessageCircle className="h-4 w-4" />
          {message.hasThread && (
            <span className="ml-1 text-xs">View thread</span>
          )}
        </Button>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Pin className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Bookmark className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Share className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};