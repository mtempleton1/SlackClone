import { FC } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Smile } from "lucide-react";

interface EmojiReactionDisplayProps {
  messageId: string;
}

export const EmojiReactionDisplay: FC<EmojiReactionDisplayProps> = ({ messageId }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid grid-cols-8 gap-2 p-2">
          {/* Emoji grid will be populated here */}
        </div>
      </PopoverContent>
    </Popover>
  );
};
