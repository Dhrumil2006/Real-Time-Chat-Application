import { useState } from "react";
import { Plus, Hash, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface CreateRoomDialogProps {
  onCreateRoom: (data: { name: string; description: string; isPrivate: boolean }) => void;
  isPending?: boolean;
}

export function CreateRoomDialog({ onCreateRoom, isPending }: CreateRoomDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateRoom({ name: name.trim(), description: description.trim(), isPrivate });
      setName("");
      setDescription("");
      setIsPrivate(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-create-room">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a new room</DialogTitle>
            <DialogDescription>
              Create a chat room to have conversations with multiple people.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="room-name">Room name</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {isPrivate ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
                </span>
                <Input
                  id="room-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="general"
                  className="pl-10"
                  data-testid="input-room-name"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room-description">Description (optional)</Label>
              <Textarea
                id="room-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this room about?"
                rows={3}
                data-testid="input-room-description"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="room-private">Private room</Label>
                <p className="text-xs text-muted-foreground">
                  Only invited members can join
                </p>
              </div>
              <Switch
                id="room-private"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
                data-testid="switch-room-private"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isPending} data-testid="button-submit-room">
              Create Room
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
