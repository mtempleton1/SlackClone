import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Hash, Lock, ChevronDown, Plus, Star, Pin, Settings, ArrowDown, ArrowUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AddChannelOverlay } from "./AddChannelOverlay";
import { cn } from "@/lib/utils";

interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
  unreadCount: number;
  isStarred?: boolean;
  isPinned?: boolean;
  description?: string;
  memberCount?: number;
  lastActivity?: string;
}

type SortOrder = "alphabetical" | "recent" | "unread";
type SortDirection = "asc" | "desc";
type ConfirmActionType = "star" | "pin" | "leave" | null;

interface ConfirmAction {
  type: ConfirmActionType;
  channelId: string;
  channelName: string;
}

export function ChannelList() {
  const [channelsExpanded, setChannelsExpanded] = useState(true);
  const [sortOrder, setSortOrder] = useState<SortOrder>("alphabetical");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [showSettings, setShowSettings] = useState(false);
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [showStarOverlay, setShowStarOverlay] = useState(false);
  const [starAnimationChannel, setStarAnimationChannel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const { data: channels, refetch: refetchChannels } = useQuery<Channel[]>({
    queryKey: ["/api/channels"],
  });

  const filteredChannels = channels?.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedChannels = filteredChannels?.slice().sort((a, b) => {
    let comparison = 0;

    if (sortOrder === "alphabetical") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortOrder === "unread") {
      comparison = b.unreadCount - a.unreadCount;
    } else if (sortOrder === "recent") {
      if (a.lastActivity && b.lastActivity) {
        comparison = new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      }
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const pinnedChannels = sortedChannels?.filter(channel => channel.isPinned);
  const unpinnedChannels = sortedChannels?.filter(channel => !channel.isPinned);

  const handleStarChannel = async (channelId: string, channelName: string) => {
    setConfirmAction({
      type: "star",
      channelId,
      channelName,
    });
  };

  const handlePinChannel = async (channelId: string, channelName: string) => {
    setConfirmAction({
      type: "pin",
      channelId,
      channelName,
    });
  };

  const executeChannelAction = async () => {
    if (!confirmAction) return;

    try {
      const { type, channelId } = confirmAction;

      if (type === "star") {
        setStarAnimationChannel(channelId);
        await fetch(`/api/channels/${channelId}/star`, {
          method: "POST",
          credentials: "include",
        });
        setTimeout(() => setStarAnimationChannel(null), 1000);
      } else if (type === "pin") {
        await fetch(`/api/channels/${channelId}/pin`, {
          method: "POST",
          credentials: "include",
        });
      }

      await refetchChannels();
    } catch (error) {
      console.error(`Failed to ${confirmAction.type} channel:`, error);
      if (confirmAction.type === "star") {
        setStarAnimationChannel(null);
      }
    } finally {
      setConfirmAction(null);
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  const getActionDescription = (type: ConfirmActionType, channelName: string) => {
    switch (type) {
      case "star":
        return `Are you sure you want to star #${channelName}? This will add it to your starred items for quick access.`;
      case "pin":
        return `Are you sure you want to pin #${channelName}? This will keep it at the top of your channel list.`;
      case "leave":
        return `Are you sure you want to leave #${channelName}? You'll need to be re-invited to join again.`;
      default:
        return "";
    }
  };

  const renderChannelItem = (channel: Channel) => (
    <div key={channel.id} className="group relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center justify-between w-full px-2 hover:bg-sidebar-accent group-hover:bg-sidebar-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {channel.isPrivate ? (
                  <Lock className="h-4 w-4 text-sidebar-foreground/70" />
                ) : (
                  <Hash className="h-4 w-4 text-sidebar-foreground/70" />
                )}
                <span className="text-sm text-sidebar-foreground">
                  {channel.name}
                </span>
                {channel.isStarred && (
                  <Star 
                    className={cn(
                      "h-3 w-3 text-yellow-400 transition-transform",
                      starAnimationChannel === channel.id && "animate-spin"
                    )} 
                  />
                )}
              </div>
              {channel.unreadCount > 0 && (
                <span className="text-xs bg-primary text-primary-foreground px-1.5 rounded-full">
                  {channel.unreadCount}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex flex-col gap-1">
            <p>{channel.description || `#${channel.name}`}</p>
            {channel.memberCount && (
              <p className="text-xs text-muted-foreground">
                {channel.memberCount} members
              </p>
            )}
            {channel.isPinned && (
              <p className="text-xs text-muted-foreground">
                Pinned to top of channel list
              </p>
            )}
            {channel.lastActivity && (
              <p className="text-xs text-muted-foreground">
                Last active: {new Date(channel.lastActivity).toLocaleDateString()}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="hidden group-hover:flex items-center absolute right-2 top-1/2 -translate-y-1/2 bg-sidebar">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-sidebar-accent/30"
          onClick={(e) => {
            e.stopPropagation();
            handleStarChannel(channel.id, channel.name);
          }}
        >
          <Star 
            className={cn(
              "h-3 w-3 transition-all duration-200",
              channel.isStarred && "text-yellow-400",
              starAnimationChannel === channel.id && "animate-spin"
            )} 
          />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-sidebar-accent/30"
          onClick={(e) => {
            e.stopPropagation();
            handlePinChannel(channel.id, channel.name);
          }}
        >
          <Pin className={cn(
            "h-3 w-3 transition-all duration-200",
            channel.isPinned && "text-primary"
          )} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-sidebar-accent/30"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedChannel(channel);
            setShowSettings(true);
          }}
        >
          <Settings className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-4 bg-sidebar">
        <div className="space-y-2">
          <div className="px-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search channels"
                className="pl-8 bg-sidebar-accent/20 border-sidebar-border focus:bg-sidebar-accent/30 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs gap-2 hover:bg-sidebar-accent/30"
                  onClick={toggleSortDirection}
                >
                  Sort: {sortOrder}
                  {sortDirection === "asc" ? (
                    <ArrowUp className="h-3 w-3 transition-transform" />
                  ) : (
                    <ArrowDown className="h-3 w-3 transition-transform" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortOrder("alphabetical")}>
                  Alphabetical
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("recent")}>
                  Recent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("unread")}>
                  Unread
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {pinnedChannels && pinnedChannels.length > 0 && (
            <div className="space-y-[2px]">
              <div className="px-2 text-xs text-sidebar-foreground/70">
                Pinned
              </div>
              {pinnedChannels.map(renderChannelItem)}
              <Separator className="my-2 bg-sidebar-border/50" />
            </div>
          )}

          <Collapsible
            open={channelsExpanded}
            onOpenChange={setChannelsExpanded}
            className="space-y-2"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center justify-between w-full px-2 hover:bg-sidebar-accent/30"
              >
                <span className="text-sm font-medium text-sidebar-foreground">
                  Channels {unpinnedChannels?.length ? `(${unpinnedChannels.length})` : ''}
                </span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  !channelsExpanded && "-rotate-90"
                )} />
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="animate-accordion-down">
              <div className="mt-1 space-y-[2px]">
                {unpinnedChannels?.map(renderChannelItem)}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 w-full px-2 hover:bg-sidebar-accent/30 group"
            onClick={() => setShowAddChannel(true)}
          >
            <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span className="text-sm">Add Channel</span>
          </Button>
        </div>

        <Separator className="my-2 bg-sidebar-border/50" />
      </div>

      {/* Channel Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedChannel ? `#${selectedChannel.name} Settings` : 'Channel Settings'}
            </DialogTitle>
          </DialogHeader>
          {selectedChannel && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Channel Description</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedChannel.description || 'No description'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Privacy</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedChannel.isPrivate ? 'Private Channel' : 'Public Channel'}
                </p>
              </div>
              {selectedChannel.memberCount && (
                <div>
                  <h3 className="text-sm font-medium">Members</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedChannel.memberCount} members
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "star" ? "Star Channel" :
               confirmAction?.type === "pin" ? "Pin Channel" :
               confirmAction?.type === "leave" ? "Leave Channel" : ""}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction && getActionDescription(confirmAction.type, confirmAction.channelName)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeChannelAction}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddChannelOverlay 
        isOpen={showAddChannel}
        onClose={() => setShowAddChannel(false)}
      />
    </ScrollArea>
  );
}