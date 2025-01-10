import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Hash, Lock, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
  unreadCount: number;
}

export function ChannelList() {
  const [channelsExpanded, setChannelsExpanded] = useState(true);
  
  const { data: channels } = useQuery<Channel[]>({
    queryKey: ["/api/channels"],
  });

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-4">
        <div className="space-y-2">
          <Collapsible
            open={channelsExpanded}
            onOpenChange={setChannelsExpanded}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center justify-between w-full px-2 hover:bg-sidebar-accent"
              >
                <span className="text-sm font-medium text-sidebar-foreground">
                  Channels
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${channelsExpanded ? "" : "-rotate-90"}`} />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="mt-1 space-y-[2px]">
                {channels?.map((channel) => (
                  <Button
                    key={channel.id}
                    variant="ghost"
                    size="sm"
                    className="flex items-center justify-between w-full px-2 hover:bg-sidebar-accent"
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
                    </div>
                    {channel.unreadCount > 0 && (
                      <span className="text-xs bg-primary text-primary-foreground px-1.5 rounded-full">
                        {channel.unreadCount}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 w-full px-2 hover:bg-sidebar-accent"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm">Add Channel</span>
          </Button>
        </div>

        <Separator className="my-2 bg-sidebar-border" />
      </div>
    </ScrollArea>
  );
}
