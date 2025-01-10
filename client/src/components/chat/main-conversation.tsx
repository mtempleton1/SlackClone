import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageSquare, ChevronDown, Hash } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { MessageInput } from "./message-input";
import { useWebSocket } from "@/contexts/websocket-context";
import { useQuery } from "@tanstack/react-query";

interface Message {
  id: number;
  content: string;
  sender: string;
  timestamp: string;
  avatar: string;
  channelId?: number; // Added channelId to Message interface
}

interface MainConversationAreaProps {
  onThreadOpen: () => void;
  selectedChannelId?: number;
}

export function MainConversationArea({ onThreadOpen, selectedChannelId }: MainConversationAreaProps) {
  const { messages: wsMessages } = useWebSocket();

  const { data: channel } = useQuery({
    queryKey: [`/api/channels/${selectedChannelId}`],
    enabled: !!selectedChannelId,
  });

  const { data: channelMessages = [] } = useQuery({
    queryKey: [`/api/channels/${selectedChannelId}/messages`],
    enabled: !!selectedChannelId,
  });

  // Combine websocket messages with fetched messages
  const allMessages = [...channelMessages, ...wsMessages.filter(msg => msg.channelId === selectedChannelId)];

  if (!selectedChannelId) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background text-muted-foreground">
        <Hash className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Welcome to the workspace!</h2>
        <p className="text-sm">Select a channel from the sidebar or create a new one to get started.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Conversation Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="font-semibold">#{channel?.name || 'loading...'}</h2>
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {allMessages.map((message) => (
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
        <MessageInput 
          placeholder={`Message #${channel?.name || 'loading...'}`}
          channelId={selectedChannelId}
        />
      </div>
    </div>
  );
}