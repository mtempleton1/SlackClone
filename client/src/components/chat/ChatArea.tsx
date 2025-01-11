import { FC, useState } from "react";
import { MessageDisplayArea } from "./MessageDisplayArea";
import { MessageInput } from "./MessageInput";
import { ThreadViewer } from "./ThreadViewer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface ChatAreaProps {
  className?: string;
  channelId?: number;
}

interface Channel {
  id: number;
  name: string;
  description?: string;
  workspaceId: number;
}

export const ChatArea: FC<ChatAreaProps> = ({ className, channelId = 1 }) => {
  const [selectedMessageId, setSelectedMessageId] = useState<string | undefined>();

  const { data: channel } = useQuery<Channel>({
    queryKey: [`/api/channels/${channelId}`],
    enabled: !!channelId,
  });

  const handleThreadOpen = (messageId: string) => {
    setSelectedMessageId(messageId);
  };

  const handleThreadClose = () => {
    setSelectedMessageId(undefined);
  };

  return (
    <div className={cn("flex flex-row h-full", className)}>
      <div className="flex-1 flex flex-col h-full">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-lg font-semibold">
            #{channel?.name || 'general'}
          </h2>
          {channel?.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {channel.description}
            </p>
          )}
        </div>
        <ScrollArea className="flex-1">
          <MessageDisplayArea 
            channelId={channelId} 
            onThreadClick={handleThreadOpen}
          />
        </ScrollArea>
        <div className="border-t p-4">
          <MessageInput channelId={channelId} />
        </div>
      </div>
      <ThreadViewer 
        isOpen={!!selectedMessageId}
        selectedMessageId={selectedMessageId}
        onClose={handleThreadClose}
      />
    </div>
  );
};