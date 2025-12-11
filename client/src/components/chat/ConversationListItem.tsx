import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "./UserAvatar";
import type { User, ConversationWithParticipants } from "@shared/schema";

interface ConversationListItemProps {
  conversation: ConversationWithParticipants;
  currentUserId: string;
  isActive?: boolean;
  isOnline?: boolean;
  unreadCount?: number;
  onClick?: () => void;
}

export function ConversationListItem({
  conversation,
  currentUserId,
  isActive,
  isOnline = false,
  unreadCount = 0,
  onClick,
}: ConversationListItemProps) {
  const otherUser = conversation.participant1Id === currentUserId
    ? conversation.participant2
    : conversation.participant1;

  const displayName = otherUser.firstName
    ? `${otherUser.firstName}${otherUser.lastName ? ` ${otherUser.lastName}` : ""}`
    : otherUser.email?.split("@")[0] || "Unknown";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors hover-elevate",
        isActive && "bg-sidebar-accent"
      )}
      data-testid={`conversation-item-${conversation.id}`}
    >
      <UserAvatar
        user={otherUser}
        size="md"
        showStatus
        status={isOnline ? "online" : "offline"}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm truncate">{displayName}</span>
          {unreadCount > 0 && (
            <Badge variant="default" className="text-xs px-1.5 py-0.5 min-w-[20px] text-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </div>
        {conversation.lastMessage && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {conversation.lastMessage.content}
          </p>
        )}
      </div>
    </button>
  );
}
