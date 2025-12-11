import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { Skeleton } from "@/components/ui/skeleton";
import type { MessageWithSender, User } from "@shared/schema";
import { format, isSameDay } from "date-fns";

interface MessageListProps {
  messages: MessageWithSender[];
  currentUserId: string;
  typingUsers?: Map<string, User>;
  isLoading?: boolean;
}

function DateSeparator({ date }: { date: Date }) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let label: string;
  if (isSameDay(date, today)) {
    label = "Today";
  } else if (isSameDay(date, yesterday)) {
    label = "Yesterday";
  } else {
    label = format(date, "MMMM d, yyyy");
  }

  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="flex gap-2 px-4 py-2">
      <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-12 w-48" />
      </div>
    </div>
  );
}

export function MessageList({
  messages,
  currentUserId,
  typingUsers = new Map(),
  isLoading = false,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  useEffect(() => {
    if (isAtBottomRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 50;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <MessageSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-muted-foreground" data-testid="text-empty-messages">
            No messages yet. Start the conversation!
          </p>
        </div>
      </div>
    );
  }

  let lastDate: Date | null = null;
  let lastSenderId: string | null = null;

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto py-4"
    >
      {messages.map((message, index) => {
        const messageDate = message.createdAt ? new Date(message.createdAt) : new Date();
        const showDateSeparator = !lastDate || !isSameDay(messageDate, lastDate);
        const showAvatar = message.senderId !== lastSenderId || showDateSeparator;
        const showName = showAvatar;
        
        lastDate = messageDate;
        const previousSenderId = lastSenderId;
        lastSenderId = message.senderId;

        return (
          <div key={message.id}>
            {showDateSeparator && <DateSeparator date={messageDate} />}
            <MessageBubble
              message={message}
              isOwn={message.senderId === currentUserId}
              showAvatar={showAvatar}
              showName={showName}
            />
          </div>
        );
      })}
      
      {Array.from(typingUsers.entries()).map(([userId, user]) => (
        <TypingIndicator
          key={userId}
          userName={user.firstName || user.email?.split("@")[0]}
        />
      ))}
    </div>
  );
}
