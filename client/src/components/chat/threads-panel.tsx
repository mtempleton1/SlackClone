import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";

interface ThreadsPanelProps {
  onClose: () => void;
}

export function ThreadsPanel({ onClose }: ThreadsPanelProps) {
  return (
    <div className="h-full flex flex-col bg-background border-l">
      {/* Thread Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Thread</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Original Message */}
      <div className="p-4 border-b">
        <div className="flex items-start space-x-3">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="John Doe" />
          </Avatar>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold">John Doe</span>
              <span className="text-xs text-muted-foreground">10:30 AM</span>
            </div>
            <p className="text-sm mt-1">Hey team! How's everyone doing?</p>
          </div>
        </div>
      </div>

      {/* Thread Replies */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="Jane Smith" />
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Jane Smith</span>
                <span className="text-xs text-muted-foreground">10:35 AM</span>
              </div>
              <p className="text-sm mt-1">Good! Making progress on my tasks.</p>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Reply Input */}
      <div className="p-4 border-t">
        <Input
          placeholder="Reply in thread..."
          className="w-full"
        />
      </div>
    </div>
  );
}
