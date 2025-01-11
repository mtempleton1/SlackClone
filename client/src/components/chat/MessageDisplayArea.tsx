import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageBubble } from "./MessageBubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  hasThread?: boolean;
  attachments?: Array<{
    type: string;
    url: string;
  }>;
}

export const MessageDisplayArea: FC = () => {
  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"], // This will be updated to include channelId
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
          />
        ))}
      </div>
    </ScrollArea>
  );
};