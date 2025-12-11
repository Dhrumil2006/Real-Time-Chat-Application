import {
  users,
  rooms,
  roomMembers,
  messages,
  conversations,
  type User,
  type UpsertUser,
  type Room,
  type InsertRoom,
  type Message,
  type InsertMessage,
  type Conversation,
  type InsertConversation,
  type RoomMember,
  type InsertRoomMember,
  type MessageWithSender,
  type ConversationWithParticipants,
  type RoomWithMembers,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserStatus(id: string, status: string): Promise<void>;

  createRoom(room: InsertRoom): Promise<Room>;
  getRoom(id: string): Promise<Room | undefined>;
  getRoomWithMembers(id: string): Promise<RoomWithMembers | undefined>;
  getAllRooms(): Promise<Room[]>;
  getUserRooms(userId: string): Promise<Room[]>;
  deleteRoom(id: string): Promise<void>;

  addRoomMember(data: InsertRoomMember): Promise<RoomMember>;
  removeRoomMember(roomId: string, userId: string): Promise<void>;
  getRoomMembers(roomId: string): Promise<User[]>;
  isRoomMember(roomId: string, userId: string): Promise<boolean>;

  createConversation(data: InsertConversation): Promise<Conversation>;
  getConversation(id: string): Promise<ConversationWithParticipants | undefined>;
  getUserConversations(userId: string): Promise<ConversationWithParticipants[]>;
  findConversation(participant1Id: string, participant2Id: string): Promise<Conversation | undefined>;

  createMessage(data: InsertMessage): Promise<Message>;
  getMessage(id: string): Promise<MessageWithSender | undefined>;
  getRoomMessages(roomId: string, limit?: number): Promise<MessageWithSender[]>;
  getConversationMessages(conversationId: string, limit?: number): Promise<MessageWithSender[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(asc(users.firstName));
  }

  async updateUserStatus(id: string, status: string): Promise<void> {
    await db.update(users).set({ status, lastSeen: new Date() }).where(eq(users.id, id));
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const [newRoom] = await db.insert(rooms).values(room).returning();
    return newRoom;
  }

  async getRoom(id: string): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room;
  }

  async getRoomWithMembers(id: string): Promise<RoomWithMembers | undefined> {
    const room = await this.getRoom(id);
    if (!room) return undefined;

    const members = await db
      .select({
        roomMember: roomMembers,
        user: users,
      })
      .from(roomMembers)
      .innerJoin(users, eq(roomMembers.userId, users.id))
      .where(eq(roomMembers.roomId, id));

    const creator = room.createdById ? await this.getUser(room.createdById) : undefined;

    return {
      ...room,
      members: members.map(m => ({ ...m.roomMember, user: m.user })),
      creator,
    };
  }

  async getAllRooms(): Promise<Room[]> {
    return db.select().from(rooms).where(eq(rooms.isPrivate, false)).orderBy(asc(rooms.name));
  }

  async getUserRooms(userId: string): Promise<Room[]> {
    const memberRooms = await db
      .select({ room: rooms })
      .from(roomMembers)
      .innerJoin(rooms, eq(roomMembers.roomId, rooms.id))
      .where(eq(roomMembers.userId, userId));

    const publicRooms = await this.getAllRooms();
    
    const allRooms = [...memberRooms.map(r => r.room), ...publicRooms];
    const uniqueRooms = Array.from(new Map(allRooms.map(r => [r.id, r])).values());
    
    return uniqueRooms.sort((a, b) => a.name.localeCompare(b.name));
  }

  async deleteRoom(id: string): Promise<void> {
    await db.delete(messages).where(eq(messages.roomId, id));
    await db.delete(roomMembers).where(eq(roomMembers.roomId, id));
    await db.delete(rooms).where(eq(rooms.id, id));
  }

  async addRoomMember(data: InsertRoomMember): Promise<RoomMember> {
    const existing = await this.isRoomMember(data.roomId, data.userId);
    if (existing) {
      const [member] = await db
        .select()
        .from(roomMembers)
        .where(and(eq(roomMembers.roomId, data.roomId), eq(roomMembers.userId, data.userId)));
      return member;
    }
    const [member] = await db.insert(roomMembers).values(data).returning();
    return member;
  }

  async removeRoomMember(roomId: string, userId: string): Promise<void> {
    await db
      .delete(roomMembers)
      .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId)));
  }

  async getRoomMembers(roomId: string): Promise<User[]> {
    const members = await db
      .select({ user: users })
      .from(roomMembers)
      .innerJoin(users, eq(roomMembers.userId, users.id))
      .where(eq(roomMembers.roomId, roomId));
    return members.map(m => m.user);
  }

  async isRoomMember(roomId: string, userId: string): Promise<boolean> {
    const [member] = await db
      .select()
      .from(roomMembers)
      .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId)));
    return !!member;
  }

  async createConversation(data: InsertConversation): Promise<Conversation> {
    const [conversation] = await db.insert(conversations).values(data).returning();
    return conversation;
  }

  async getConversation(id: string): Promise<ConversationWithParticipants | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    if (!conversation) return undefined;

    const participant1 = await this.getUser(conversation.participant1Id);
    const participant2 = await this.getUser(conversation.participant2Id);

    if (!participant1 || !participant2) return undefined;

    const lastMessages = await this.getConversationMessages(id, 1);

    return {
      ...conversation,
      participant1,
      participant2,
      lastMessage: lastMessages[0],
    };
  }

  async getUserConversations(userId: string): Promise<ConversationWithParticipants[]> {
    const userConversations = await db
      .select()
      .from(conversations)
      .where(or(eq(conversations.participant1Id, userId), eq(conversations.participant2Id, userId)))
      .orderBy(desc(conversations.updatedAt));

    const result: ConversationWithParticipants[] = [];
    for (const conv of userConversations) {
      const fullConv = await this.getConversation(conv.id);
      if (fullConv) result.push(fullConv);
    }

    return result;
  }

  async findConversation(participant1Id: string, participant2Id: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(
        or(
          and(eq(conversations.participant1Id, participant1Id), eq(conversations.participant2Id, participant2Id)),
          and(eq(conversations.participant1Id, participant2Id), eq(conversations.participant2Id, participant1Id))
        )
      );
    return conversation;
  }

  async createMessage(data: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(data).returning();
    
    if (data.conversationId) {
      await db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, data.conversationId));
    }
    
    return message;
  }

  async getMessage(id: string): Promise<MessageWithSender | undefined> {
    const result = await db
      .select({ message: messages, sender: users })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.id, id));

    if (result.length === 0) return undefined;
    return { ...result[0].message, sender: result[0].sender };
  }

  async getRoomMessages(roomId: string, limit = 100): Promise<MessageWithSender[]> {
    const result = await db
      .select({ message: messages, sender: users })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.roomId, roomId))
      .orderBy(asc(messages.createdAt))
      .limit(limit);

    return result.map(r => ({ ...r.message, sender: r.sender }));
  }

  async getConversationMessages(conversationId: string, limit = 100): Promise<MessageWithSender[]> {
    const result = await db
      .select({ message: messages, sender: users })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt))
      .limit(limit);

    return result.map(r => ({ ...r.message, sender: r.sender }));
  }
}

export const storage = new DatabaseStorage();
