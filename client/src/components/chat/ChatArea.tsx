import { FC, useState } from "react";
import { MessageDisplayArea } from "./MessageDisplayArea";
import { MessageInput } from "./MessageInput";
import { ThreadViewer } from "./ThreadViewer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatAreaProps {
  className?: string;
  channelId?: number;
}

export const ChatArea: FC<ChatAreaProps> = ({ className, channelId = 1 }) => {
  const [selectedMessageId, setSelectedMessageId] = useState<string | undefined>();

  const handleThreadOpen = (messageId: string) => {
    setSelectedMessageId(messageId);
  };

  const handleThreadClose = () => {
    setSelectedMessageId(undefined);
  };

  return (
    <div className={cn("flex flex-row h-full", className)}>
      <div className="flex-1 flex flex-col h-full">
        <ScrollArea className="flex-1">
          <MessageDisplayArea 
            channelId={channelId} 
            onThreadClick={handleThreadOpen}
          />
        </ScrollArea>
        <MessageInput channelId={channelId} />
      </div>
      <ThreadViewer 
        isOpen={!!selectedMessageId}
        selectedMessageId={selectedMessageId}
        onClose={handleThreadClose}
      />
    </div>
  );
};