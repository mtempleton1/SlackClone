import { FC } from "react";
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
  return (
    <div className={cn("flex flex-row h-full", className)}>
      <div className="flex-1 flex flex-col h-full">
        <ScrollArea className="flex-1">
          <MessageDisplayArea channelId={channelId} />
        </ScrollArea>
        <MessageInput channelId={channelId} />
      </div>
      <ThreadViewer />
    </div>
  );
};