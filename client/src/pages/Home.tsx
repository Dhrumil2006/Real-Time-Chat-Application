import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChatSidebar, ChatArea } from "@/components/chat";
import { WebSocketProvider, useWS } from "@/context/WebSocketContext";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Room, ConversationWithParticipants, User } from "@shared/schema";

function ChatContent() {
  const { user } = useAuth();
  const { onlineUsers } = useWS();
  const [activeRoomId, setActiveRoomId] = useState<string | undefined>();
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  const { data: conversations = [] } = useQuery<ConversationWithParticipants[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createRoomMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; isPrivate: boolean }) => {
      return apiRequest("POST", "/api/rooms", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: async (otherUserId: string) => {
      const res = await apiRequest("POST", "/api/conversations", { participantId: otherUserId });
      return res.json();
    },
    onSuccess: (data: ConversationWithParticipants) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      if (data && data.id) {
        setActiveRoomId(undefined);
        setActiveConversationId(data.id);
      }
    },
  });

  const handleSelectRoom = useCallback((roomId: string) => {
    setActiveRoomId(roomId);
    setActiveConversationId(undefined);
  }, []);

  const handleSelectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
    setActiveRoomId(undefined);
  }, []);

  const handleCreateRoom = useCallback((data: { name: string; description: string; isPrivate: boolean }) => {
    createRoomMutation.mutate(data);
  }, [createRoomMutation]);

  const handleStartConversation = useCallback((userId: string) => {
    const existingConversation = conversations.find(
      c => (c.participant1Id === user?.id && c.participant2Id === userId) ||
           (c.participant2Id === user?.id && c.participant1Id === userId)
    );
    
    if (existingConversation) {
      setActiveRoomId(undefined);
      setActiveConversationId(existingConversation.id);
    } else {
      createConversationMutation.mutate(userId);
    }
  }, [conversations, user?.id, createConversationMutation]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (!user) return null;

  const sidebarStyle = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full">
        <ChatSidebar
          user={user}
          rooms={rooms}
          conversations={conversations}
          activeRoomId={activeRoomId}
          activeConversationId={activeConversationId}
          onlineUsers={onlineUsers}
          onSelectRoom={handleSelectRoom}
          onSelectConversation={handleSelectConversation}
          onCreateRoom={handleCreateRoom}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isCreatingRoom={createRoomMutation.isPending}
        />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-2 px-4 py-2 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-hidden">
            <ChatArea
              type={activeRoomId ? "room" : "conversation"}
              roomId={activeRoomId}
              conversationId={activeConversationId}
              currentUser={user}
              allUsers={allUsers}
              onlineUsers={onlineUsers}
              onStartConversation={handleStartConversation}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function Home() {
  const { user } = useAuth();

  return (
    <WebSocketProvider userId={user?.id}>
      <ChatContent />
    </WebSocketProvider>
  );
}
