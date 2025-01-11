import { FC, useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
  channelId?: number;
}

export const MessageInput: FC<MessageInputProps> = ({ channelId = 1 }) => {
  const [messageText, setMessageText] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("content", messageText);
      formData.append("channelId", String(channelId));

      attachments.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/messages", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.json();
    },
    onSuccess: () => {
      setMessageText("");
      setAttachments([]);
      queryClient.invalidateQueries({ queryKey: [`/api/channels/${channelId}/messages`] });
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
    if (!messageText.trim() && attachments.length === 0) return;
    await sendMessageMutation.mutateAsync();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setAttachments(Array.from(event.target.files));
    }
  };

  return (
    <div className="border-t p-4 bg-background">
      {attachments.length > 0 && (
        <div className="mb-2 text-sm text-muted-foreground">
          {attachments.length} file(s) selected
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
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button
          variant="default"
          size="icon"
          className="shrink-0"
          onClick={handleSendMessage}
          disabled={(!messageText.trim() && attachments.length === 0) || sendMessageMutation.isPending}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};