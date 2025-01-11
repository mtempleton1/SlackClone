import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageBubble } from "./MessageBubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  userId: number;
  timestamp: string;
  hasThread?: boolean;
  attachments?: Array<{
    type: string;
    url: string;
  }>;
}

interface MessageDisplayAreaProps {
  channelId?: number;
  onThreadClick?: (messageId: string) => void;
}

export const MessageDisplayArea: FC<MessageDisplayAreaProps> = ({ 
  channelId = 1,
  onThreadClick 
}) => {
  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: [`/api/channels/${channelId}/messages`],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No messages yet. Start a conversation!
      </div>
    );
  }

  return (
    <ScrollArea className="h-full px-2">
      <div className="space-y-4 py-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onThreadClick={() => onThreadClick?.(message.id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
};