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
    refetchInterval: 5000, // Poll for new reactions every 5 seconds
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

  const removeReactionMutation = useMutation({
    mutationFn: async (reactionId: number) => {
      const response = await fetch(`/api/messages/${messageId}/reactions/${reactionId}`, {
        method: "DELETE",
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error("Failed to remove reaction");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${messageId}/reactions`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove reaction",
        variant: "destructive",
      });
    },
  });

  // Group reactions by emoji code
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!reaction.emoji) return acc;
    const code = reaction.emoji.code;
    if (!acc[code]) {
      acc[code] = { code, count: 0, userIds: [], reactionIds: [] };
    }
    acc[code].count++;
    acc[code].userIds.push(reaction.userId);
    acc[code].reactionIds.push(reaction.id);
    return acc;
  }, {} as Record<string, { code: string; count: number; userIds: number[]; reactionIds: number[] }>);

  const commonEmojis = ["👍", "❤️", "😄", "🎉", "👀", "🚀", "💯", "✅"];

  const handleReactionClick = (code: string, existingReaction?: { reactionIds: number[] }) => {
    if (existingReaction && existingReaction.reactionIds.length > 0) {
      // Remove the first reaction with this emoji (assuming one user can only react once with the same emoji)
      removeReactionMutation.mutate(existingReaction.reactionIds[0]);
    } else {
      addReactionMutation.mutate(code);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {Object.entries(groupedReactions).map(([code, reaction]) => (
        <Button
          key={code}
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs gap-1 hover:bg-primary/10 group"
          onClick={() => handleReactionClick(code, reaction)}
        >
          <span>{code}</span>
          <span>{reaction.count}</span>
          <span className="opacity-0 group-hover:opacity-100 ml-1">×</span>
        </Button>
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 hover:bg-primary/10"
          >
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
                className="h-8 w-8 p-0 hover:bg-primary/10"
                onClick={() => handleReactionClick(emoji)}
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