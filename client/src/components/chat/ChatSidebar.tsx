import { Search, MessageCircle, Users, Settings, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserAvatar } from "./UserAvatar";
import { RoomListItem } from "./RoomListItem";
import { ConversationListItem } from "./ConversationListItem";
import { CreateRoomDialog } from "./CreateRoomDialog";
import type { Room, ConversationWithParticipants, User } from "@shared/schema";

interface ChatSidebarProps {
  user: User;
  rooms: Room[];
  conversations: ConversationWithParticipants[];
  activeRoomId?: string;
  activeConversationId?: string;
  onlineUsers: Set<string>;
  onSelectRoom: (roomId: string) => void;
  onSelectConversation: (conversationId: string) => void;
  onCreateRoom: (data: { name: string; description: string; isPrivate: boolean }) => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isCreatingRoom?: boolean;
}

export function ChatSidebar({
  user,
  rooms,
  conversations,
  activeRoomId,
  activeConversationId,
  onlineUsers,
  onSelectRoom,
  onSelectConversation,
  onCreateRoom,
  onLogout,
  searchQuery,
  onSearchChange,
  isCreatingRoom,
}: ChatSidebarProps) {
  const displayName = user.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : user.email?.split("@")[0] || "User";

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.participant1Id === user.id ? conv.participant2 : conv.participant1;
    const name = otherUser.firstName || otherUser.email || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar user={user} size="md" showStatus status="online" />
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate" data-testid="text-current-user-name">
                {displayName}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarGroup>
            <div className="flex items-center justify-between px-3 py-2">
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider p-0">
                Rooms
              </SidebarGroupLabel>
              <CreateRoomDialog onCreateRoom={onCreateRoom} isPending={isCreatingRoom} />
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredRooms.length === 0 ? (
                  <p className="text-sm text-muted-foreground px-3 py-2">
                    {searchQuery ? "No rooms found" : "No rooms yet"}
                  </p>
                ) : (
                  filteredRooms.map(room => (
                    <SidebarMenuItem key={room.id}>
                      <RoomListItem
                        room={room}
                        isActive={room.id === activeRoomId}
                        onClick={() => onSelectRoom(room.id)}
                      />
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator className="my-2" />

          <SidebarGroup>
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Direct Messages
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredConversations.length === 0 ? (
                  <p className="text-sm text-muted-foreground px-3 py-2">
                    {searchQuery ? "No conversations found" : "No conversations yet"}
                  </p>
                ) : (
                  filteredConversations.map(conversation => (
                    <SidebarMenuItem key={conversation.id}>
                      <ConversationListItem
                        conversation={conversation}
                        currentUserId={user.id}
                        isActive={conversation.id === activeConversationId}
                        isOnline={onlineUsers.has(
                          conversation.participant1Id === user.id
                            ? conversation.participant2Id
                            : conversation.participant1Id
                        )}
                        onClick={() => onSelectConversation(conversation.id)}
                      />
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
