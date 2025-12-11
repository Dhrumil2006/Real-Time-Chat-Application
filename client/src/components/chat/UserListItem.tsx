import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "./UserAvatar";
import type { User } from "@shared/schema";
import { cn } from "@/lib/utils";

interface UserListItemProps {
  user: User;
  isOnline?: boolean;
  onMessageClick?: () => void;
  className?: string;
}

export function UserListItem({ user, isOnline = false, onMessageClick, className }: UserListItemProps) {
  const displayName = user.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : user.email?.split("@")[0] || "Unknown";

  return (
    <div 
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md group hover-elevate",
        className
      )}
      data-testid={`user-list-item-${user.id}`}
    >
      <UserAvatar
        user={user}
        size="md"
        showStatus
        status={isOnline ? "online" : "offline"}
      />
      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm truncate block">{displayName}</span>
        {user.email && (
          <span className="text-xs text-muted-foreground truncate block">{user.email}</span>
        )}
      </div>
      {onMessageClick && (
        <Button
          size="icon"
          variant="ghost"
          onClick={onMessageClick}
          className="opacity-0 group-hover:opacity-100 transition-opacity visibility-visible"
          data-testid={`button-message-user-${user.id}`}
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
