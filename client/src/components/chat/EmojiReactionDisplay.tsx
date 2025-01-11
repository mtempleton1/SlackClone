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
    id: number;
    code: string;
  };
  userId: number;
}

export const EmojiReactionDisplay: FC<EmojiReactionDisplayProps> = ({ messageId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reactions = [] } = useQuery<Reaction[]>({
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
        credentials: 'include',
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

  // Group reactions by emoji code
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!reaction.emoji) return acc;
    const code = reaction.emoji.code;
    if (!acc[code]) {
      acc[code] = { code, count: 0, userIds: [] };
    }
    acc[code].count++;
    acc[code].userIds.push(reaction.userId);
    return acc;
  }, {} as Record<string, { code: string; count: number; userIds: number[] }>);

  const commonEmojis = ["👍", "❤️", "😄", "🎉", "👀", "🚀", "💯", "✅"];

  return (
    <div className="flex items-center gap-1">
      {Object.values(groupedReactions).map(({ code, count }) => (
        <Button
          key={code}
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs gap-1 hover:bg-primary/10"
          onClick={() => addReactionMutation.mutate(code)}
        >
          <span>{code}</span>
          <span>{count}</span>
        </Button>
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="grid grid-cols-8 gap-1">
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
        </PopoverContent>
      </Popover>
    </div>
  );
};