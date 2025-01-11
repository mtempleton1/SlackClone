import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Hash, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
  description?: string;
  memberCount?: number;
}

interface AddChannelOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddChannelOverlay({ isOpen, onClose }: AddChannelOverlayProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: availableChannels } = useQuery<Channel[]>({
    queryKey: ["/api/channels/available"],
    enabled: isOpen,
  });

  const joinChannelMutation = useMutation({
    mutationFn: async (channelId: string) => {
      const response = await fetch(`/api/channels/${channelId}/join`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to join channel");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/channels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/channels/available"] });
      toast({
        title: "Success",
        description: "Channel joined successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join channel",
        variant: "destructive",
      });
    },
  });

  const filteredChannels = availableChannels?.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Browse Channels</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search channels"
            className="pl-8"
          />
        </div>

        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {filteredChannels?.map((channel) => (
              <div
                key={channel.id}
                className="p-2 hover:bg-muted rounded-md cursor-pointer"
                onClick={() => joinChannelMutation.mutate(channel.id)}
              >
                <div className="flex items-center gap-2 mb-1">
                  {channel.isPrivate ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Hash className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-medium">{channel.name}</span>
                </div>
                {channel.description && (
                  <p className="text-sm text-muted-foreground ml-6">
                    {channel.description}
                  </p>
                )}
                {channel.memberCount && (
                  <p className="text-xs text-muted-foreground ml-6 mt-1">
                    {channel.memberCount} members
                  </p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
