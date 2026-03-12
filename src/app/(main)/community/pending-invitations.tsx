"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Check, X, Loader2 } from "lucide-react";
import { respondToInvite } from "@/actions/community";

interface Invitation {
  id: string;
  role: string;
  status: string;
  owner: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface PendingInvitationsProps {
  invitations: Invitation[];
}

function InvitationCard({ invitation }: { invitation: Invitation }) {
  const [isPending, startTransition] = useTransition();

  const initials = (invitation.owner.name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  function handleRespond(response: "ACCEPTED" | "DECLINED") {
    startTransition(async () => {
      const result = await respondToInvite(invitation.id, response);

      if (result.error) {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : Object.values(result.error).flat().join(", ");
        toast.error(errorMsg);
        return;
      }

      toast.success(
        response === "ACCEPTED"
          ? "Invitation accepted!"
          : "Invitation declined."
      );
    });
  }

  return (
    <div className="flex items-center gap-3 py-3">
      <Avatar>
        {invitation.owner.image && (
          <AvatarImage
            src={invitation.owner.image}
            alt={invitation.owner.name ?? "User"}
          />
        )}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {invitation.owner.name ?? invitation.owner.email}
        </p>
        <p className="text-xs text-muted-foreground">
          Wants you as: {invitation.role}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRespond("ACCEPTED")}
          disabled={isPending}
          className="gap-1 h-7 text-xs"
        >
          {isPending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Check className="size-3" />
          )}
          Accept
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRespond("DECLINED")}
          disabled={isPending}
          className="gap-1 h-7 text-xs text-destructive hover:text-destructive"
        >
          <X className="size-3" />
          Decline
        </Button>
      </div>
    </div>
  );
}

export function PendingInvitations({ invitations }: PendingInvitationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="size-5" />
          Pending Invitations ({invitations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {invitations.map((invitation) => (
            <InvitationCard key={invitation.id} invitation={invitation} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
