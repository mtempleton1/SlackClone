import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

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
  };
}

export function ThreadView({ parentMessage }: ThreadViewProps) {
  const [replyInput, setReplyInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: replies } = useQuery<ThreadMessage[]>({
    queryKey: [`/api/messages/${parentMessage.id}/replies`],
  });

  const sendReplyMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/messages/${parentMessage.id}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
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
    if (!replyInput.trim()) return;
    await sendReplyMutation.mutateAsync(replyInput.trim());
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <div className="bg-primary/10 h-full w-full flex items-center justify-center text-primary font-medium">
              {parentMessage.sender.name[0]}
            </div>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{parentMessage.sender.name}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(parentMessage.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="mt-1">{parentMessage.content}</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {replies?.map((reply) => (
            <div key={reply.id} className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <div className="bg-primary/10 h-full w-full flex items-center justify-center text-primary font-medium">
                  {reply.sender.name[0]}
                </div>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{reply.sender.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(reply.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="mt-1">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex items-center gap-2">
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
            disabled={!replyInput.trim() || sendReplyMutation.isPending}
            className="shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
