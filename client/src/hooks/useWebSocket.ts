import { useEffect, useRef, useState, useCallback } from "react";
import type { User, MessageWithSender } from "@shared/schema";

export type WebSocketMessage =
  | { type: "message"; data: MessageWithSender }
  | { type: "typing"; data: { userId: string; roomId?: string; conversationId?: string; isTyping: boolean } }
  | { type: "presence"; data: { userId: string; status: "online" | "offline" | "away" } }
  | { type: "user_joined"; data: { roomId: string; user: User } }
  | { type: "user_left"; data: { roomId: string; userId: string } }
  | { type: "room_created"; data: any }
  | { type: "connected"; data: { userId: string } }
  | { type: "online_users"; data: { userIds: string[] } }
  | { type: "error"; message: string };

export function useWebSocket(userId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, { roomId?: string; conversationId?: string }>>(new Map());
  const socketRef = useRef<WebSocket | null>(null);
  const messageHandlersRef = useRef<((message: WebSocketMessage) => void)[]>([]);

  const addMessageHandler = useCallback((handler: (message: WebSocketMessage) => void) => {
    messageHandlersRef.current.push(handler);
    return () => {
      messageHandlersRef.current = messageHandlersRef.current.filter(h => h !== handler);
    };
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  const sendTyping = useCallback((roomId?: string, conversationId?: string, isTyping: boolean = true) => {
    sendMessage({
      type: "typing",
      roomId,
      conversationId,
      isTyping,
    });
  }, [sendMessage]);

  const sendChatMessage = useCallback((content: string, roomId?: string, conversationId?: string) => {
    sendMessage({
      type: "message",
      content,
      roomId,
      conversationId,
    });
  }, [sendMessage]);

  useEffect(() => {
    if (!userId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        if (message.type === "connected") {
          console.log("WebSocket connected, user authenticated");
        }

        if (message.type === "online_users") {
          const data = message as { type: "online_users"; data: { userIds: string[] } };
          setOnlineUsers(new Set(data.data.userIds));
        }

        if (message.type === "presence") {
          setOnlineUsers(prev => {
            const next = new Set(prev);
            if (message.data.status === "online") {
              next.add(message.data.userId);
            } else {
              next.delete(message.data.userId);
            }
            return next;
          });
        }

        if (message.type === "typing") {
          setTypingUsers(prev => {
            const next = new Map(prev);
            if (message.data.isTyping) {
              next.set(message.data.userId, {
                roomId: message.data.roomId,
                conversationId: message.data.conversationId,
              });
            } else {
              next.delete(message.data.userId);
            }
            return next;
          });
        }

        messageHandlersRef.current.forEach(handler => handler(message));
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    socket.onclose = (event) => {
      setIsConnected(false);
      if (event.code === 4001) {
        console.log("WebSocket closed: Unauthorized");
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, [userId]);

  return {
    isConnected,
    onlineUsers,
    typingUsers,
    sendMessage,
    sendTyping,
    sendChatMessage,
    addMessageHandler,
  };
}
