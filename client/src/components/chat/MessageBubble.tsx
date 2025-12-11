import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./UserAvatar";
import type { MessageWithSender } from "@shared/schema";

interface MessageBubbleProps {
  message: MessageWithSender;
  isOwn: boolean;
  showAvatar?: boolean;
  showName?: boolean;
}

export function MessageBubble({ message, isOwn, showAvatar = true, showName = true }: MessageBubbleProps) {
  const messageTime = message.createdAt ? format(new Date(message.createdAt), "h:mm a") : "";

  return (
    <div
      className={cn(
        "flex gap-2 px-4 py-1 group",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
      data-testid={`message-bubble-${message.id}`}
    >
      {showAvatar && !isOwn && (
        <div className="flex-shrink-0 mt-1">
          <UserAvatar user={message.sender} size="sm" />
        </div>
      )}
      {!showAvatar && !isOwn && <div className="w-6" />}
      
      <div
        className={cn(
          "flex flex-col max-w-[70%]",
          isOwn ? "items-end" : "items-start"
        )}
      >
        {showName && !isOwn && (
          <span className="text-xs font-medium text-muted-foreground mb-1 px-1">
            {message.sender?.firstName || message.sender?.email?.split("@")[0] || "Unknown"}
          </span>
        )}
        <div
          className={cn(
            "px-3 py-2 rounded-md text-sm break-words",
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          {message.content}
        </div>
        <span 
          className="text-xs text-muted-foreground mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {messageTime}
        </span>
      </div>
    </div>
  );
}
