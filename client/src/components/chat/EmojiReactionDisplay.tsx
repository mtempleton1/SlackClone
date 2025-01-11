import { FC } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Smile } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmojiReactionDisplayProps {
  messageId: string;
}

interface Reaction {
  id: number;
  emoji: {
    code: string;
  };
  userId: number;
}

export const EmojiReactionDisplay: FC<EmojiReactionDisplayProps> = ({ messageId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reactions } = useQuery<Reaction[]>({
    queryKey: [`/api/messages/${messageId}/reactions`],
  });

  const addReactionMutation = useMutation({
    mutationFn: async (emojiCode: string) => {
      const response = await fetch(`/api/messages/${messageId}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emojiCode }),
      });

      if (!response.ok) {
        throw new Error("Failed to add reaction");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${messageId}/reactions`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive",
      });
    },
  });

  const commonEmojis = ["👍", "❤️", "😄", "🎉", "👀", "🚀", "💯", "✅"];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid grid-cols-8 gap-2 p-2">
          {commonEmojis.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => addReactionMutation.mutate(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>
        {reactions && reactions.length > 0 && (
          <div className="border-t mt-2 pt-2">
            <div className="text-sm font-medium mb-2">Recent Reactions</div>
            <div className="flex flex-wrap gap-1">
              {reactions.map((reaction) => (
                <Button
                  key={reaction.id}
                  variant="secondary"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => addReactionMutation.mutate(reaction.emoji.code)}
                >
                  {reaction.emoji.code}
                </Button>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};