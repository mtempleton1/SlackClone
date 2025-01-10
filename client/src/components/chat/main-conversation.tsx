import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MessageSquare, ChevronDown } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { MessageInput } from "./message-input";
import { useWebSocket } from "@/contexts/websocket-context";

interface Message {
  id: number;
  content: string;
  sender: string;
  timestamp: string;
  avatar: string;
}

interface MainConversationAreaProps {
  onThreadOpen: () => void;
}

export function MainConversationArea({ onThreadOpen }: MainConversationAreaProps) {
  const { messages } = useWebSocket();
  const [localMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hey team! How's everyone doing?",
      sender: "John Doe",
      timestamp: "10:30 AM",
      avatar: "https://github.com/shadcn.png",
    },
    {
      id: 2,
      content: "Working on the new feature!",
      sender: "Jane Smith",
      timestamp: "10:32 AM",
      avatar: "https://github.com/shadcn.png",
    },
  ]);

  const displayMessages = messages.length > 0 ? messages : localMessages;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Conversation Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="font-semibold">#general</h2>
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {displayMessages.map((message) => (
            <div key={message.id} className="flex items-start space-x-3">
              <Avatar>
                <AvatarImage src={message.avatar} alt={message.sender} />
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{message.sender}</span>
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp}
                  </span>
                </div>
                <p className="text-sm mt-1">{message.content}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={onThreadOpen}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Reply in thread
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input Area */}
      <div className="p-4 border-t">
        <MessageInput placeholder="Message #general" />
      </div>
    </div>
  );
}