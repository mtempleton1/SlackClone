import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Paperclip, Send, Smile, MessageCircle, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { io, Socket } from "socket.io-client";
import { ThreadView } from "./ThreadView";

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
  thread?: {
    count: number;
    lastReply?: string;
  };
}

export function MessageArea() {
  const [messageInput, setMessageInput] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const channelId = 1; // TODO: Get from route or props

  // Set up socket connection
  useEffect(() => {
    const newSocket = io(window.location.origin);

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server");
      newSocket.emit("joinChannel", channelId);
    });

    newSocket.on("message", (message: Message) => {
      queryClient.setQueryData<Message[]>(["/api/messages"], (oldMessages) => {
        if (!oldMessages) return [message];
        return [...oldMessages, message];
      });
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit("leaveChannel", channelId);
        newSocket.disconnect();
      }
    };
  }, [channelId, queryClient]);

  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          channelId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.json();
    },
    onSuccess: (newMessage) => {
      socket?.emit("sendMessage", newMessage);
      queryClient.setQueryData<Message[]>(["/api/messages"], (oldMessages) => {
        if (!oldMessages) return [newMessage];
        return [...oldMessages, newMessage];
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    await sendMessageMutation.mutateAsync(messageInput.trim());
    setMessageInput("");
  };

  const handleOpenThread = (message: Message) => {
    setSelectedMessage(message);
  };

  const handleAddReaction = (message: Message) => {
    // TODO: Implement reaction adding
    setShowEmojiPicker(true);
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

                <div className="flex items-center gap-2 mt-2">
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex gap-1">
                      {message.reactions.map((reaction, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs gap-1"
                          onClick={() => handleAddReaction(message)}
                        >
                          <span>{reaction.emoji}</span>
                          <span>{reaction.count}</span>
                        </Button>
                      ))}
                    </div>
                  )}

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => handleAddReaction(message)}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => handleOpenThread(message)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      {message.thread?.count && (
                        <span className="ml-1 text-xs">{message.thread.count}</span>
                      )}
                    </Button>
                  </div>
                </div>
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
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1"
          />

          <Button 
            variant="ghost" 
            size="icon" 
            className="shrink-0"
            onClick={() => setShowEmojiPicker(true)}
          >
            <Smile className="h-5 w-5" />
          </Button>

          <Button 
            variant="default"
            size="icon"
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || sendMessageMutation.isPending}
            className="shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Thread Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Thread</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <ThreadView parentMessage={selectedMessage} />
          )}
        </DialogContent>
      </Dialog>

      {/* Emoji Picker Dialog */}
      <Dialog open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Reaction</DialogTitle>
          </DialogHeader>
          {/* TODO: Implement emoji picker */}
        </DialogContent>
      </Dialog>
    </div>
  );
}