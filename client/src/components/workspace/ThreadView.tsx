import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Paperclip, X, Image, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ThreadMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  parentId: string;
  attachments?: Array<{
    id: string;
    type: "image" | "file";
    url: string;
    name: string;
    size?: number;
  }>;
}

interface ThreadViewProps {
  parentMessage: {
    id: string;
    content: string;
    sender: {
      id: string;
      name: string;
      avatar?: string;
    };
    timestamp: string;
    attachments?: Array<{
      id: string;
      type: "image" | "file";
      url: string;
      name: string;
      size?: number;
    }>;
  };
}

export function ThreadView({ parentMessage }: ThreadViewProps) {
  const [replyInput, setReplyInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: replies } = useQuery<ThreadMessage[]>({
    queryKey: [`/api/messages/${parentMessage.id}/replies`],
  });

  const sendReplyMutation = useMutation({
    mutationFn: async ({ content, files }: { content: string; files?: File[] }) => {
      const formData = new FormData();
      formData.append("content", content);

      if (files?.length) {
        files.forEach(file => {
          formData.append("files", file);
        });
      }

      const response = await fetch(`/api/messages/${parentMessage.id}/replies`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to send reply");
      }

      return response.json();
    },
    onSuccess: (newReply) => {
      queryClient.setQueryData<ThreadMessage[]>(
        [`/api/messages/${parentMessage.id}/replies`],
        (oldReplies) => {
          if (!oldReplies) return [newReply];
          return [...oldReplies, newReply];
        }
      );
      setReplyInput("");
      setSelectedFiles([]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    },
  });

  const handleSendReply = async () => {
    if (!replyInput.trim() && !selectedFiles.length) return;
    await sendReplyMutation.mutateAsync({
      content: replyInput.trim(),
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderMessage = (message: ThreadMessage | typeof parentMessage) => (
    <div className="flex items-start gap-3">
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
                className="flex items-center gap-2 p-2 rounded-md bg-accent/10 group hover:bg-accent/20 transition-colors"
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
                  className="text-sm text-primary hover:underline flex-1 truncate"
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
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        {renderMessage(parentMessage)}
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {replies?.map((reply) => renderMessage(reply))}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        {selectedFiles.length > 0 && (
          <div className="mb-2 space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 rounded-md bg-accent/10 group hover:bg-accent/20 transition-colors"
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
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
            value={replyInput}
            onChange={(e) => setReplyInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendReply()}
            placeholder="Reply in thread..."
            className="flex-1"
          />

          <Button
            variant="default"
            size="icon"
            onClick={handleSendReply}
            disabled={(!replyInput.trim() && !selectedFiles.length) || sendReplyMutation.isPending}
            className="shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}