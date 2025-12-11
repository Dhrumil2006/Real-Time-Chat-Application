import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupWebSocket, getOnlineUsers } from "./websocket";
import { insertRoomSchema, insertMessageSchema, insertConversationSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  setupWebSocket(httpServer);

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/online", isAuthenticated, async (req, res) => {
    try {
      const onlineUsers = getOnlineUsers();
      res.json(onlineUsers);
    } catch (error) {
      console.error("Error fetching online users:", error);
      res.status(500).json({ message: "Failed to fetch online users" });
    }
  });

  app.get("/api/rooms", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const rooms = await storage.getUserRooms(userId);
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  app.post("/api/rooms", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertRoomSchema.parse({
        ...req.body,
        createdById: userId,
      });

      const room = await storage.createRoom(data);
      
      await storage.addRoomMember({
        roomId: room.id,
        userId,
      });

      res.json(room);
    } catch (error) {
      console.error("Error creating room:", error);
      res.status(500).json({ message: "Failed to create room" });
    }
  });

  app.get("/api/rooms/:roomId", isAuthenticated, async (req, res) => {
    try {
      const room = await storage.getRoom(req.params.roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      console.error("Error fetching room:", error);
      res.status(500).json({ message: "Failed to fetch room" });
    }
  });

  app.get("/api/rooms/:roomId/members", isAuthenticated, async (req, res) => {
    try {
      const members = await storage.getRoomMembers(req.params.roomId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching room members:", error);
      res.status(500).json({ message: "Failed to fetch room members" });
    }
  });

  app.post("/api/rooms/:roomId/join", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const member = await storage.addRoomMember({
        roomId: req.params.roomId,
        userId,
      });
      res.json(member);
    } catch (error) {
      console.error("Error joining room:", error);
      res.status(500).json({ message: "Failed to join room" });
    }
  });

  app.post("/api/rooms/:roomId/leave", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.removeRoomMember(req.params.roomId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error leaving room:", error);
      res.status(500).json({ message: "Failed to leave room" });
    }
  });

  app.get("/api/rooms/:roomId/messages", isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const messages = await storage.getRoomMessages(req.params.roomId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching room messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/rooms/:roomId/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertMessageSchema.parse({
        content: req.body.content,
        senderId: userId,
        roomId: req.params.roomId,
      });

      const message = await storage.createMessage(data);
      const messageWithSender = await storage.getMessage(message.id);
      res.json(messageWithSender);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.get("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const participantId = req.body.participantId;

      const existing = await storage.findConversation(userId, participantId);
      if (existing) {
        const fullConversation = await storage.getConversation(existing.id);
        return res.json(fullConversation);
      }

      const data = insertConversationSchema.parse({
        participant1Id: userId,
        participant2Id: participantId,
      });

      const conversation = await storage.createConversation(data);
      const fullConversation = await storage.getConversation(conversation.id);
      res.json(fullConversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations/:conversationId", isAuthenticated, async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.get("/api/conversations/:conversationId/messages", isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const messages = await storage.getConversationMessages(req.params.conversationId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:conversationId/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertMessageSchema.parse({
        content: req.body.content,
        senderId: userId,
        conversationId: req.params.conversationId,
      });

      const message = await storage.createMessage(data);
      const messageWithSender = await storage.getMessage(message.id);
      res.json(messageWithSender);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  return httpServer;
}
