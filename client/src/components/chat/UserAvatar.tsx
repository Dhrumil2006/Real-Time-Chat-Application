import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@shared/schema";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: User | null;
  size?: "sm" | "md" | "lg";
  showStatus?: boolean;
  status?: "online" | "offline" | "away";
  className?: string;
}

export function UserAvatar({ user, size = "md", showStatus = false, status = "offline", className }: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const statusSizeClasses = {
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
  };

  const statusColors = {
    online: "bg-status-online",
    offline: "bg-status-offline",
    away: "bg-status-away",
  };

  const getInitials = (user: User | null) => {
    if (!user) return "?";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) {
      return user.firstName.slice(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar className={cn(sizeClasses[size], "object-cover")}>
        <AvatarImage 
          src={user?.profileImageUrl || undefined} 
          alt={user?.firstName || "User"} 
          className="object-cover"
        />
        <AvatarFallback className="text-xs font-medium bg-muted">
          {getInitials(user)}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <span 
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-background",
            statusSizeClasses[size],
            statusColors[status]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}
