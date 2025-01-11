import { FC } from "react";
import { MessageBubble } from "./MessageBubble";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  // This will be replaced with actual data fetching
  const messages: Message[] = [];

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
        />
      ))}
    </div>
  );
};
