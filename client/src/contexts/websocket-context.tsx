import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

interface Message {
  id: number;
  content: string;
  sender: string;
  timestamp: string;
  avatar: string;
  channelId: number;
  userId: number;
}

interface WebSocketContextType {
  messages: Message[];
  sendMessage: (content: string, channelId: number) => Promise<void>;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Create WebSocket connection using the same protocol as the page
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received websocket message:", data); // Debug log

        if (data.type === "message") {
          setMessages((prev) => [...prev, data.message]);
        } else if (data.type === "error") {
          console.error("WebSocket error:", data.error);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket");
      // Attempt to reconnect after a delay
      setTimeout(() => {
        console.log("Attempting to reconnect...");
        setSocket(null);
      }, 5000);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = useCallback(
    async (content: string, channelId: number) => {
      if (!content.trim()) return;

      if (socket?.readyState === WebSocket.OPEN) {
        try {
          console.log("Sending message:", { content, channelId }); // Debug log
          socket.send(
            JSON.stringify({
              type: "message",
              channelId,
              content,
            })
          );
        } catch (error) {
          console.error("Error sending message:", error);
          throw error;
        }
      } else {
        console.error("WebSocket is not open");
        throw new Error("WebSocket connection is not open");
      }
    },
    [socket]
  );

  return (
    <WebSocketContext.Provider value={{ messages, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}