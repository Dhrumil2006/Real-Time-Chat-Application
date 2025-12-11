import { WebSocketServer, WebSocket } from "ws";
import type { Server, IncomingMessage } from "http";
import type { Request, Response } from "express";
import { storage } from "./storage";
import { getSession } from "./replitAuth";
import { parse as parseCookie } from "cookie";

interface WSClient {
  ws: WebSocket;
  userId: string;
}

const clients = new Map<string, WSClient>();

export function setupWebSocket(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const sessionMiddleware = getSession();

  wss.on("connection", async (ws, request: IncomingMessage) => {
    let userId: string | null = null;

    try {
      const user = await authenticateWebSocket(request, sessionMiddleware);
      if (!user) {
        ws.close(4001, "Unauthorized");
        return;
      }
      userId = user.claims.sub as string;

      clients.set(userId, { ws, userId });
      await storage.updateUserStatus(userId, "online");

      broadcast({
        type: "presence",
        data: { userId, status: "online" },
      });

      ws.send(JSON.stringify({
        type: "connected",
        data: { userId },
      }));

      const onlineUserIds = Array.from(clients.keys());
      ws.send(JSON.stringify({
        type: "online_users",
        data: { userIds: onlineUserIds },
      }));
    } catch (error) {
      console.error("WebSocket authentication error:", error);
      ws.close(4001, "Unauthorized");
      return;
    }

    ws.on("message", async (data) => {
      if (!userId) return;

      try {
        const message = JSON.parse(data.toString());

        if (message.type === "message" && userId) {
          if (message.roomId) {
            const isMember = await storage.isRoomMember(message.roomId, userId);
            const room = await storage.getRoom(message.roomId);
            if (!room) {
              ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
              return;
            }
            if (room.isPrivate && !isMember) {
              ws.send(JSON.stringify({ type: "error", message: "Not a member of this room" }));
              return;
            }
          } else if (message.conversationId) {
            const conversation = await storage.getConversation(message.conversationId);
            if (!conversation) {
              ws.send(JSON.stringify({ type: "error", message: "Conversation not found" }));
              return;
            }
            if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
              ws.send(JSON.stringify({ type: "error", message: "Not a participant in this conversation" }));
              return;
            }
          }

          const newMessage = await storage.createMessage({
            content: message.content,
            senderId: userId,
            roomId: message.roomId || null,
            conversationId: message.conversationId || null,
          });

          const messageWithSender = await storage.getMessage(newMessage.id);

          if (messageWithSender) {
            if (message.roomId) {
              broadcastToRoom(message.roomId, {
                type: "message",
                data: messageWithSender,
              });
            } else if (message.conversationId) {
              const conversation = await storage.getConversation(message.conversationId);
              if (conversation) {
                const recipientId = conversation.participant1Id === userId
                  ? conversation.participant2Id
                  : conversation.participant1Id;

                sendToUser(userId, {
                  type: "message",
                  data: messageWithSender,
                });
                sendToUser(recipientId, {
                  type: "message",
                  data: messageWithSender,
                });
              }
            }
          }
        }

        if (message.type === "typing" && userId) {
          const typingData = {
            type: "typing",
            data: {
              userId,
              roomId: message.roomId,
              conversationId: message.conversationId,
              isTyping: message.isTyping,
            },
          };

          if (message.roomId) {
            broadcastToRoom(message.roomId, typingData, userId);
          } else if (message.conversationId) {
            const conversation = await storage.getConversation(message.conversationId);
            if (conversation) {
              const recipientId = conversation.participant1Id === userId
                ? conversation.participant2Id
                : conversation.participant1Id;
              sendToUser(recipientId, typingData);
            }
          }
        }

        if (message.type === "join_room" && userId) {
          const room = await storage.getRoom(message.roomId);
          if (!room) {
            ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
            return;
          }
          
          if (!room.isPrivate) {
            await storage.addRoomMember({
              roomId: message.roomId,
              userId,
            });

            const user = await storage.getUser(userId);
            broadcastToRoom(message.roomId, {
              type: "user_joined",
              data: { roomId: message.roomId, user },
            });
          }
        }

        if (message.type === "leave_room" && userId) {
          await storage.removeRoomMember(message.roomId, userId);

          broadcastToRoom(message.roomId, {
            type: "user_left",
            data: { roomId: message.roomId, userId },
          });
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", async () => {
      if (userId) {
        clients.delete(userId);
        await storage.updateUserStatus(userId, "offline");

        broadcast({
          type: "presence",
          data: { userId, status: "offline" },
        });
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return wss;
}

async function authenticateWebSocket(
  request: IncomingMessage,
  sessionMiddleware: ReturnType<typeof getSession>
): Promise<any | null> {
  return new Promise((resolve) => {
    const req = request as unknown as Request;
    const res = {} as Response;
    
    (req as any).sessionStore = undefined;

    sessionMiddleware(req, res, () => {
      const session = (req as any).session;
      if (session?.passport?.user) {
        resolve(session.passport.user);
      } else {
        resolve(null);
      }
    });
  });
}

function broadcast(message: any, excludeUserId?: string) {
  const data = JSON.stringify(message);
  clients.forEach((client, id) => {
    if (id !== excludeUserId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(data);
    }
  });
}

function sendToUser(userId: string, message: any) {
  const client = clients.get(userId);
  if (client && client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify(message));
  }
}

async function broadcastToRoom(roomId: string, message: any, excludeUserId?: string) {
  const members = await storage.getRoomMembers(roomId);
  const data = JSON.stringify(message);

  members.forEach((member) => {
    if (member.id !== excludeUserId) {
      const client = clients.get(member.id);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    }
  });
}

export function getOnlineUsers(): string[] {
  return Array.from(clients.keys());
}
