"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Loader2 } from "lucide-react";
import { inviteVetter } from "@/actions/community";
import type { CommunityRole } from "@/generated/prisma/client";

export function InviteForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CommunityRole>("FRIEND");
  const [isPending, startTransition] = useTransition();

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    startTransition(async () => {
      const result = await inviteVetter(email.trim(), role);

      if (result.error) {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : Object.values(result.error).flat().join(", ");
        toast.error(errorMsg);
        return;
      }

      toast.success("Invitation sent!");
      setEmail("");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserPlus className="size-5" />
          Invite to Your Circle
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as CommunityRole)}
            className="flex h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="FRIEND">Friend</option>
            <option value="FAMILY">Family</option>
            <option value="COLLEAGUE">Colleague</option>
            <option value="MENTOR">Mentor</option>
          </select>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Invite"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
