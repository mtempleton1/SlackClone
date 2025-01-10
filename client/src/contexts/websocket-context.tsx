import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

interface Message {
  id: number;
  content: string;
  sender: string;
  timestamp: string;
  avatar: string;
  reactions?: { emoji: string; count: number; users: string[] }[];
}

interface WebSocketContextType {
  messages: Message[];
  sendMessage: (content: string) => void;
  addReaction: (messageId: number, emoji: string) => void;
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
      const data = JSON.parse(event.data);
      if (data.type === "message") {
        setMessages((prev) => [...prev, data.message]);
      } else if (data.type === "reaction") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId
              ? {
                  ...msg,
                  reactions: [...(msg.reactions || []), data.reaction],
                }
              : msg
          )
        );
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
    (content: string) => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "message",
            content,
          })
        );
      }
    },
    [socket]
  );

  const addReaction = useCallback(
    (messageId: number, emoji: string) => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "reaction",
            messageId,
            emoji,
          })
        );
      }
    },
    [socket]
  );

  return (
    <WebSocketContext.Provider value={{ messages, sendMessage, addReaction }}>
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