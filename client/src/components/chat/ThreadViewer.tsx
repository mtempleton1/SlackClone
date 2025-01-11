import { FC, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThreadViewerProps {
  isOpen?: boolean;
  selectedMessageId?: string;
  onClose?: () => void;
}

interface ThreadMessage {
  id: string;
  content: string;
  userId: number;
  timestamp: string;
  attachments?: Array<{
    type: string;
    url: string;
  }>;
}

interface Thread {
  id: string;
  parentMessage: ThreadMessage;
  createdAt: string;
}

export const ThreadViewer: FC<ThreadViewerProps> = ({ 
  isOpen = false, 
  selectedMessageId,
  onClose 
}) => {
  const queryClient = useQueryClient();

  const { data: thread, isLoading: threadLoading } = useQuery<Thread>({
    queryKey: [`/api/threads/${selectedMessageId}`],
    enabled: isOpen && !!selectedMessageId,
  });

  const { data: threadMessages = [], isLoading: messagesLoading } = useQuery<ThreadMessage[]>({
    queryKey: [`/api/threads/${thread?.id}/messages`],
    enabled: isOpen && !!thread?.id,
  });

  if (!isOpen) return null;

  const isLoading = threadLoading || messagesLoading;

  return (
    <Card className="w-96 border-l h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Thread</h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {thread && (
                <div className="pb-4 border-b">
                  <MessageBubble 
                    message={thread.parentMessage}
                    hideThread={true}
                  />
                </div>
              )}
              {threadMessages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  hideThread={true}
                />
              ))}
            </div>
          </ScrollArea>
          <div className="border-t">
            {thread && (
              <MessageInput 
                threadId={thread.id}
                placeholder="Reply to thread..."
              />
            )}
          </div>
        </>
      )}
    </Card>
  );
};