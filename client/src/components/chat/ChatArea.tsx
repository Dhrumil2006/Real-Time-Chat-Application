import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { UsersSidebar } from "./UsersSidebar";
import { useWS } from "@/context/WebSocketContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Room, User, MessageWithSender, ConversationWithParticipants } from "@shared/schema";

interface ChatAreaProps {
  type: "room" | "conversation";
  roomId?: string;
  conversationId?: string;
  currentUser: User;
  allUsers: User[];
  onlineUsers: Set<string>;
  onStartConversation: (userId: string) => void;
}

export function ChatArea({
  type,
  roomId,
  conversationId,
  currentUser,
  allUsers,
  onlineUsers,
  onStartConversation,
}: ChatAreaProps) {
  const [showMembers, setShowMembers] = useState(false);
  const { sendChatMessage, sendTyping, addMessageHandler, typingUsers } = useWS();

  const { data: room } = useQuery<Room>({
    queryKey: ["/api/rooms", roomId],
    enabled: type === "room" && !!roomId,
  });

  const { data: conversation } = useQuery<ConversationWithParticipants>({
    queryKey: ["/api/conversations", conversationId],
    enabled: type === "conversation" && !!conversationId,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<MessageWithSender[]>({
    queryKey: type === "room" 
      ? ["/api/rooms", roomId, "messages"] 
      : ["/api/conversations", conversationId, "messages"],
    enabled: (type === "room" && !!roomId) || (type === "conversation" && !!conversationId),
  });

  const { data: roomMembers = [] } = useQuery<User[]>({
    queryKey: ["/api/rooms", roomId, "members"],
    enabled: type === "room" && !!roomId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const endpoint = type === "room"
        ? `/api/rooms/${roomId}/messages`
        : `/api/conversations/${conversationId}/messages`;
      return apiRequest("POST", endpoint, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: type === "room" 
          ? ["/api/rooms", roomId, "messages"]
          : ["/api/conversations", conversationId, "messages"],
      });
    },
  });

  useEffect(() => {
    const removeHandler = addMessageHandler((message) => {
      if (message.type === "message") {
        const msg = message.data;
        if (
          (type === "room" && msg.roomId === roomId) ||
          (type === "conversation" && msg.conversationId === conversationId)
        ) {
          queryClient.invalidateQueries({
            queryKey: type === "room"
              ? ["/api/rooms", roomId, "messages"]
              : ["/api/conversations", conversationId, "messages"],
          });
        }
      }
    });
    return removeHandler;
  }, [addMessageHandler, type, roomId, conversationId]);

  const handleSendMessage = useCallback((content: string) => {
    sendMessageMutation.mutate(content);
    sendChatMessage(content, roomId, conversationId);
  }, [sendMessageMutation, sendChatMessage, roomId, conversationId]);

  const handleTyping = useCallback((isTyping: boolean) => {
    sendTyping(roomId, conversationId, isTyping);
  }, [sendTyping, roomId, conversationId]);

  const otherUser = conversation
    ? (conversation.participant1Id === currentUser.id 
        ? conversation.participant2 
        : conversation.participant1)
    : undefined;

  const relevantTypingUsers = new Map<string, User>();
  typingUsers.forEach((location, userId) => {
    if (userId === currentUser.id) return;
    if (type === "room" && location.roomId === roomId) {
      const user = allUsers.find(u => u.id === userId);
      if (user) relevantTypingUsers.set(userId, user);
    } else if (type === "conversation" && location.conversationId === conversationId) {
      const user = allUsers.find(u => u.id === userId);
      if (user) relevantTypingUsers.set(userId, user);
    }
  });

  if (!roomId && !conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Welcome to Chat
          </h2>
          <p className="text-muted-foreground" data-testid="text-no-chat-selected">
            Select a room or start a conversation to begin chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full">
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          type={type}
          room={room}
          otherUser={otherUser}
          memberCount={roomMembers.length}
          isOnline={otherUser ? onlineUsers.has(otherUser.id) : false}
          onToggleMembers={() => setShowMembers(!showMembers)}
        />
        <MessageList
          messages={messages}
          currentUserId={currentUser.id}
          typingUsers={relevantTypingUsers}
          isLoading={messagesLoading}
        />
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          disabled={sendMessageMutation.isPending}
        />
      </div>
      
      {showMembers && type === "room" && (
        <UsersSidebar
          users={roomMembers}
          onlineUsers={onlineUsers}
          currentUserId={currentUser.id}
          onMessageUser={onStartConversation}
          onClose={() => setShowMembers(false)}
        />
      )}
    </div>
  );
}
