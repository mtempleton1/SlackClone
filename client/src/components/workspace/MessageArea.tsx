import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Paperclip, Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
}

export function MessageArea() {
  const [messageInput, setMessageInput] = useState("");
  
  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    // TODO: Implement message sending
    setMessageInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages?.map((message) => (
            <div key={message.id} className="flex items-start gap-3 group">
              <Avatar className="h-8 w-8">
                <div className="bg-primary/10 h-full w-full flex items-center justify-center text-primary font-medium">
                  {message.sender.name[0]}
                </div>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{message.sender.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <p className="mt-1">{message.content}</p>
                
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {message.reactions.map((reaction, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs gap-1"
                      >
                        <span>{reaction.emoji}</span>
                        <span>{reaction.count}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1"
          />
          
          <Button variant="ghost" size="icon" className="shrink-0">
            <Smile className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="default"
            size="icon"
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className="shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
