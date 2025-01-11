import { FC } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
    name?: string;
    size?: number;
  }>;
}

interface Thread {
  id: string;
  parentMessage: ThreadMessage;
  replyCount: number;
  createdAt: string;
}

interface MessageThreadResponse {
  id: string;
  messageId: string;
}

export const ThreadViewer: FC<ThreadViewerProps> = ({ 
  isOpen = false, 
  selectedMessageId,
  onClose 
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // First fetch the thread ID for the selected message
  const { 
    data: messageThread,
    isLoading: messageThreadLoading,
    error: messageThreadError 
  } = useQuery<MessageThreadResponse>({
    queryKey: [`/api/messages/${selectedMessageId}/thread`],
    enabled: isOpen && !!selectedMessageId,
    retry: false,
    throwOnError: false,
  });

  // Then fetch the thread details using the thread ID
  const { 
    data: thread,
    isLoading: threadLoading,
    error: threadError 
  } = useQuery<Thread>({
    queryKey: [`/api/threads/${messageThread?.id}`],
    enabled: isOpen && !!messageThread?.id,
    retry: false,
    throwOnError: false,
  });

  // Finally fetch thread messages
  const { 
    data: threadMessages = [],
    isLoading: messagesLoading 
  } = useQuery<ThreadMessage[]>({
    queryKey: [`/api/threads/${thread?.id}/messages`],
    enabled: isOpen && !!thread?.id,
    retry: false,
    throwOnError: false,
  });

  if (!isOpen) return null;

  const isLoading = messageThreadLoading || threadLoading || messagesLoading;
  const hasError = !!messageThreadError || !!threadError;

  return (
    <Card className="w-96 border-l h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Thread</h2>
          {thread && thread.replyCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
            </p>
          )}
        </div>
        {onClose && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
            <p className="text-sm text-muted-foreground">Loading thread...</p>
          </div>
        </div>
      ) : hasError ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Failed to load thread</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: [`/api/messages/${selectedMessageId}/thread`] });
                queryClient.invalidateQueries({ queryKey: [`/api/threads/${messageThread?.id}`] });
              }}
            >
              Try again
            </Button>
          </div>
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
          <div className="border-t p-4">
            {thread && (
              <MessageInput 
                threadId={thread.id}
                placeholder="Reply in thread..."
              />
            )}
          </div>
        </>
      )}
    </Card>
  );
};