import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Hash, Lock, ChevronDown, Plus, User } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const createChannelSchema = z.object({
  name: z.string().min(1, "Channel name is required").max(100),
  topic: z.string().max(500).optional(),
});

type CreateChannelForm = z.infer<typeof createChannelSchema>;

interface Channel {
  id: number;
  name: string;
  topic?: string;
  isPrivate?: boolean;
}

interface NavigationSidebarProps {
  onChannelSelect: (channelId: number) => void;
  selectedChannelId?: number;
}

export function NavigationSidebar({ onChannelSelect, selectedChannelId }: NavigationSidebarProps) {
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<CreateChannelForm>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      name: "",
      topic: "",
    },
  });

  const { data: channels = [] } = useQuery<Channel[]>({
    queryKey: ["/api/channels"],
  });

  const createChannelMutation = useMutation({
    mutationFn: async (data: CreateChannelForm) => {
      const response = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to create channel");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/channels"] });
      setIsCreateChannelOpen(false);
      form.reset();
    },
  });

  const onSubmit = async (data: CreateChannelForm) => {
    await createChannelMutation.mutateAsync(data);
  };

  return (
    <div className="h-full flex flex-col bg-sidebar">
      {/* Workspace Menu */}
      <div className="p-4 border-b border-sidebar-border">
        <Button variant="ghost" className="w-full justify-between">
          <span className="font-semibold">Workspace Name</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {/* Channels Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold">Channels</h2>
            <Dialog open={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a new channel</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Channel name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. team-updates" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Topic (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="What's this channel about?" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Create Channel
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {channels.map((channel) => (
            <Button
              key={channel.id}
              variant={selectedChannelId === channel.id ? "secondary" : "ghost"}
              className="w-full justify-start mb-1"
              onClick={() => onChannelSelect(channel.id)}
            >
              {channel.isPrivate ? (
                <Lock className="h-4 w-4 mr-2" />
              ) : (
                <Hash className="h-4 w-4 mr-2" />
              )}
              {channel.name}
            </Button>
          ))}

          {channels.length === 0 && (
            <p className="text-sm text-muted-foreground px-2">
              No channels yet. Create one to get started!
            </p>
          )}
        </div>
      </ScrollArea>

      {/* User Profile Section */}
      <div className="p-4 border-t border-sidebar-border">
        <Button variant="ghost" className="w-full justify-start">
          <User className="h-4 w-4 mr-2" />
          <span>Your Profile</span>
        </Button>
      </div>
    </div>
  );
}