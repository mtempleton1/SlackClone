import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send } from "lucide-react";

export const ThreadReplyInput: FC = () => {
  return (
    <div className="p-4 border-t">
      <div className="flex items-end gap-2">
        <Textarea
          placeholder="Reply to thread..."
          className="min-h-[80px] resize-none"
        />
        <div className="flex flex-col gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
