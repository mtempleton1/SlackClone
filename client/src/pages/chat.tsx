import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { NavigationSidebar } from "@/components/chat/navigation-sidebar";
import { MainConversationArea } from "@/components/chat/main-conversation";
import { ThreadsPanel } from "@/components/chat/threads-panel";
import { useState } from "react";

export default function ChatPage() {
  const [showThreads, setShowThreads] = useState(false);
  
  return (
    <div className="h-screen w-full flex">
      <ResizablePanelGroup direction="horizontal">
        {/* Navigation Sidebar */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <NavigationSidebar />
        </ResizablePanel>
        
        <ResizableHandle />
        
        {/* Main Conversation Area */}
        <ResizablePanel defaultSize={showThreads ? 50 : 80}>
          <MainConversationArea onThreadOpen={() => setShowThreads(true)} />
        </ResizablePanel>
        
        {showThreads && (
          <>
            <ResizableHandle />
            {/* Threads Panel */}
            <ResizablePanel defaultSize={30}>
              <ThreadsPanel onClose={() => setShowThreads(false)} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
