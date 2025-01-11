import { FC } from "react";
import { MessageDisplayArea } from "./MessageDisplayArea";
import { ThreadViewer } from "./ThreadViewer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatAreaProps {
  className?: string;
}

export const ChatArea: FC<ChatAreaProps> = ({ className }) => {
  return (
    <div className={cn("flex flex-row h-full", className)}>
      <ScrollArea className="flex-1 h-full">
        <MessageDisplayArea />
      </ScrollArea>
      <ThreadViewer />
    </div>
  );
};
