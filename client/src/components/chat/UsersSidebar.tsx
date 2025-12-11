import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { UserListItem } from "./UserListItem";
import type { User } from "@shared/schema";

interface UsersSidebarProps {
  users: User[];
  onlineUsers: Set<string>;
  currentUserId: string;
  onMessageUser: (userId: string) => void;
  onClose: () => void;
}

export function UsersSidebar({
  users,
  onlineUsers,
  currentUserId,
  onMessageUser,
  onClose,
}: UsersSidebarProps) {
  const onlineUsersList = users.filter(u => onlineUsers.has(u.id) && u.id !== currentUserId);
  const offlineUsersList = users.filter(u => !onlineUsers.has(u.id) && u.id !== currentUserId);

  return (
    <div className="w-72 border-l bg-sidebar flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-semibold text-sm">Members</h3>
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-users">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        {onlineUsersList.length > 0 && (
          <div className="p-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
              Online - {onlineUsersList.length}
            </p>
            {onlineUsersList.map(user => (
              <UserListItem
                key={user.id}
                user={user}
                isOnline
                onMessageClick={() => onMessageUser(user.id)}
              />
            ))}
          </div>
        )}

        {onlineUsersList.length > 0 && offlineUsersList.length > 0 && (
          <Separator className="my-2" />
        )}

        {offlineUsersList.length > 0 && (
          <div className="p-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
              Offline - {offlineUsersList.length}
            </p>
            {offlineUsersList.map(user => (
              <UserListItem
                key={user.id}
                user={user}
                isOnline={false}
                onMessageClick={() => onMessageUser(user.id)}
              />
            ))}
          </div>
        )}

        {users.length <= 1 && (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">No other members yet</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
