import { Hash, Lock, Users, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "./UserAvatar";
import type { Room, User } from "@shared/schema";

interface ChatHeaderProps {
  type: "room" | "conversation";
  room?: Room;
  otherUser?: User;
  memberCount?: number;
  isOnline?: boolean;
  onToggleMembers?: () => void;
}

export function ChatHeader({
  type,
  room,
  otherUser,
  memberCount = 0,
  isOnline = false,
  onToggleMembers,
}: ChatHeaderProps) {
  if (type === "room" && room) {
    return (
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b bg-background">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-muted-foreground">
            {room.isPrivate ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-sm truncate" data-testid="text-room-name">
              {room.name}
            </h2>
            {room.description && (
              <p className="text-xs text-muted-foreground truncate">{room.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {memberCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMembers}
              className="gap-1.5"
              data-testid="button-toggle-members"
            >
              <Users className="h-4 w-4" />
              <span className="text-xs">{memberCount}</span>
            </Button>
          )}
          <Button variant="ghost" size="icon" data-testid="button-room-options">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (type === "conversation" && otherUser) {
    const displayName = otherUser.firstName
      ? `${otherUser.firstName}${otherUser.lastName ? ` ${otherUser.lastName}` : ""}`
      : otherUser.email?.split("@")[0] || "Unknown";

    return (
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b bg-background">
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar
            user={otherUser}
            size="md"
            showStatus
            status={isOnline ? "online" : "offline"}
          />
          <div className="min-w-0">
            <h2 className="font-semibold text-sm truncate" data-testid="text-conversation-name">
              {displayName}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" data-testid="button-conversation-options">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return null;
}
