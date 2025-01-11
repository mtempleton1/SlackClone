import { FC } from "react";
import { MessageDisplayArea } from "./MessageDisplayArea";
import { MessageInput } from "./MessageInput";
import { ThreadViewer } from "./ThreadViewer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatAreaProps {
  className?: string;
}

export const ChatArea: FC<ChatAreaProps> = ({ className }) => {
  return (
    <div className={cn("flex flex-row h-full", className)}>
      <div className="flex-1 flex flex-col h-full">
        <ScrollArea className="flex-1">
          <MessageDisplayArea />
        </ScrollArea>
        <MessageInput />
      </div>
      <ThreadViewer />
    </div>
  );
};