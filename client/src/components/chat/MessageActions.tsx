import { FC } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, ThumbsUp, Pin, Bookmark, Share } from "lucide-react";
import { EmojiReactionDisplay } from "./EmojiReactionDisplay";

interface MessageActionsProps {
  message: {
    id: string;
    hasThread?: boolean;
  };
}

export const MessageActions: FC<MessageActionsProps> = ({ message }) => {
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <MessageCircle className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <ThumbsUp className="h-4 w-4" />
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
      <EmojiReactionDisplay messageId={message.id} />
    </div>
  );
};
