import { FC } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { ThreadReplyInput } from "./ThreadReplyInput";

interface ThreadViewerProps {
  isOpen?: boolean;
}

export const ThreadViewer: FC<ThreadViewerProps> = ({ isOpen = false }) => {
  if (!isOpen) return null;

  return (
    <Card className="w-96 border-l h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Thread</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Original message will be displayed here */}
          {/* Thread replies will be mapped here */}
        </div>
      </ScrollArea>
      <ThreadReplyInput />
    </Card>
  );
};
