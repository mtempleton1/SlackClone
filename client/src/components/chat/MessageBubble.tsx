import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { MessageContent } from "./MessageContent";
import { MessageActions } from "./MessageActions";
import { EmojiReactionDisplay } from "./EmojiReactionDisplay";

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    userId: number;
    timestamp: string;
    hasThread?: boolean;
    attachments?: Array<{
      type: string;
      url: string;
    }>;
  };
  onThreadClick?: () => void;
}

export const MessageBubble: FC<MessageBubbleProps> = ({ message, onThreadClick }) => {
  return (
    <div className="group hover:bg-accent/5 transition-colors rounded-lg px-4 py-2">
      <div className="flex gap-4">
        <Avatar className="h-8 w-8">
          <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              U
            </span>
          </div>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">User {message.userId}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <MessageContent message={message} />
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-2">
              <EmojiReactionDisplay messageId={message.id} />
            </div>
            <MessageActions 
              message={message} 
              onThreadClick={onThreadClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};