import { createContext, useContext, type ReactNode } from "react";
import { useWebSocket, type WebSocketMessage } from "@/hooks/useWebSocket";

type WebSocketContextType = ReturnType<typeof useWebSocket>;

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ userId, children }: { userId?: string; children: ReactNode }) {
  const ws = useWebSocket(userId);

  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWS() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWS must be used within a WebSocketProvider");
  }
  return context;
}
