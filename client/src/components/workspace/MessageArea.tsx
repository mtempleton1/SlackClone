import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Paperclip, Send, Smile, MessageCircle, PlusCircle, X, Image, FileText } from "lucide-react";
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
import { ThreadView } from "./ThreadView";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

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
  attachments?: Array<{
    id: string;
    type: "image" | "file";
    url: string;
    name: string;
    size?: number;
  }>;
}

export function MessageArea() {
  const [messageInput, setMessageInput] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageForReaction, setMessageForReaction] = useState<Message | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const channelId = 1; // TODO: Get from route or props

  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, files }: { content: string; files?: File[] }) => {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("channelId", channelId.toString());

      if (files?.length) {
        files.forEach(file => {
          formData.append("files", file);
        });
      }

      const response = await fetch("/api/messages", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.json();
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData<Message[]>(["/api/messages"], (oldMessages) => {
        if (!oldMessages) return [newMessage];
        return [...oldMessages, newMessage];
      });
      setMessageInput("");
      setSelectedFiles([]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const addReactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const response = await fetch(`/api/messages/${messageId}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emoji }),
      });

      if (!response.ok) {
        throw new Error("Failed to add reaction");
      }

      return response.json();
    },
    onSuccess: (reaction, { messageId }) => {
      queryClient.setQueryData<Message[]>(["/api/messages"], (oldMessages) => {
        if (!oldMessages) return [];
        return oldMessages.map((msg) => {
          if (msg.id === messageId) {
            return {
              ...msg,
              reactions: msg.reactions 
                ? [...msg.reactions, reaction]
                : [reaction],
            };
          }
          return msg;
        });
      });
      setShowEmojiPicker(false);
      setMessageForReaction(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = async () => {
    if (!messageInput.trim() && !selectedFiles.length) return;
    await sendMessageMutation.mutateAsync({
      content: messageInput.trim(),
      files: selectedFiles,
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleOpenThread = (message: Message) => {
    setSelectedMessage(message);
  };

  const handleAddReaction = (message: Message) => {
    setMessageForReaction(message);
    setShowEmojiPicker(true);
  };

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    if (messageForReaction) {
      addReactionMutation.mutate({
        messageId: messageForReaction.id,
        emoji: emojiData.emoji,
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center gap-2 p-2 rounded-md bg-accent/10"
                      >
                        {attachment.type === "image" ? (
                          <Image className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {attachment.name}
                        </a>
                        {attachment.size && (
                          <span className="text-xs text-muted-foreground">
                            ({formatFileSize(attachment.size)})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2">
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex gap-1">
                      {message.reactions.map((reaction, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs gap-1 hover:bg-primary/10"
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

      <div className="border-t p-4">
        {selectedFiles.length > 0 && (
          <div className="mb-2 space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 rounded-md bg-accent/10"
              >
                {file.type.startsWith('image/') ? (
                  <Image className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                <span className="text-sm flex-1 truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({formatFileSize(file.size)})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleRemoveFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
          />

          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => fileInputRef.current?.click()}
          >
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
            disabled={(!messageInput.trim() && !selectedFiles.length) || sendMessageMutation.isPending}
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
          <div className="mt-4">
            <EmojiPicker onEmojiClick={handleEmojiSelect} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}