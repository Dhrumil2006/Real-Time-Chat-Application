import { Hash, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Room } from "@shared/schema";

interface RoomListItemProps {
  room: Room;
  isActive?: boolean;
  unreadCount?: number;
  onClick?: () => void;
}

export function RoomListItem({ room, isActive, unreadCount = 0, onClick }: RoomListItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors hover-elevate",
        isActive && "bg-sidebar-accent"
      )}
      data-testid={`room-item-${room.id}`}
    >
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-muted-foreground">
        {room.isPrivate ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm truncate">{room.name}</span>
          {unreadCount > 0 && (
            <Badge variant="default" className="text-xs px-1.5 py-0.5 min-w-[20px] text-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </div>
        {room.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{room.description}</p>
        )}
      </div>
    </button>
  );
}
