import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Smile } from "lucide-react";
import { useWebSocket } from "@/contexts/websocket-context";

interface MessageInputProps {
  placeholder?: string;
  onSubmit?: (content: string, attachments: File[]) => void;
  className?: string;
}

export function MessageInput({ 
  placeholder = "Type a message...", 
  onSubmit,
  className = ""
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const { sendMessage } = useWebSocket();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() && attachments.length === 0) return;

    try {
      // If there's a custom onSubmit handler, use it
      if (onSubmit) {
        onSubmit(message, attachments);
      } else {
        // Otherwise use the default WebSocket handler
        await sendMessage(message);
      }

      // Clear the input after successful send
      setMessage("");
      setAttachments([]);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col space-y-2 ${className}`}>
      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-md">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center gap-1 bg-background rounded px-2 py-1">
              <span className="text-sm truncate max-w-[200px]">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-center space-x-2">
        {/* File attachment button */}
        <Button type="button" variant="ghost" size="icon" className="shrink-0">
          <label className="cursor-pointer">
            <Paperclip className="h-4 w-4" />
            <input
              type="file"
              className="hidden"
              multiple
              onChange={handleFileSelect}
            />
          </label>
        </Button>

        {/* Message input */}
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />

        {/* Emoji button */}
        <Button type="button" variant="ghost" size="icon" className="shrink-0">
          <Smile className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
