import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Hash, Lock, ChevronDown, Plus, MessageSquare, User } from "lucide-react";
import { useState } from "react";

export function NavigationSidebar() {
  const [channels] = useState([
    { id: 1, name: "general", type: "public" },
    { id: 2, name: "team-updates", type: "private" },
  ]);
  
  const [directMessages] = useState([
    { id: 1, name: "John Doe", online: true },
    { id: 2, name: "Jane Smith", online: false },
  ]);

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
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {channels.map((channel) => (
            <Button
              key={channel.id}
              variant="ghost"
              className="w-full justify-start mb-1"
            >
              {channel.type === "public" ? (
                <Hash className="h-4 w-4 mr-2" />
              ) : (
                <Lock className="h-4 w-4 mr-2" />
              )}
              {channel.name}
            </Button>
          ))}
        </div>

        {/* Direct Messages Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold">Direct Messages</h2>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {directMessages.map((dm) => (
            <Button
              key={dm.id}
              variant="ghost"
              className="w-full justify-start mb-1"
            >
              <div className="relative mr-2">
                <User className="h-4 w-4" />
                <div
                  className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ${
                    dm.online ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              </div>
              {dm.name}
            </Button>
          ))}
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
