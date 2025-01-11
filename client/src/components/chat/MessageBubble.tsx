import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { MessageContent } from "./MessageContent";
import { MessageActions } from "./MessageActions";

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    hasThread?: boolean;
    attachments?: Array<{
      type: string;
      url: string;
    }>;
  };
}

export const MessageBubble: FC<MessageBubbleProps> = ({ message }) => {
  return (
    <Card className="p-4 hover:bg-accent/50 transition-colors">
      <div className="flex gap-4">
        <Avatar>
          <div className="h-8 w-8 rounded-full bg-primary" />
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">{message.sender}</span>
            <span className="text-sm text-muted-foreground">{message.timestamp}</span>
          </div>
          <MessageContent message={message} />
          <MessageActions message={message} />
        </div>
      </div>
    </Card>
  );
};
