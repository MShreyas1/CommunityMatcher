import { redirect } from "next/navigation";
import Link from "next/link";
import { getCommunityMembers } from "@/actions/community";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, ClipboardCheck } from "lucide-react";
import { InviteForm } from "./invite-form";
import { PendingInvitations } from "./pending-invitations";

export default async function CommunityPage() {
  const result = await getCommunityMembers();

  if (result.error) {
    if (result.error === "Not authenticated") {
      redirect("/login");
    }
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">
          {typeof result.error === "string" ? result.error : "Something went wrong"}
        </p>
      </div>
    );
  }

  const members = result.members ?? [];
  const vettingFor = result.vettingFor ?? [];

  const pendingInvitations = vettingFor.filter(
    (v: { status: string }) => v.status === "PENDING"
  );

  return (
    <div className="mx-auto max-w-2xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Community Circle</h1>
        <Link href="/community/vetting">
          <Badge variant="secondary" className="gap-1 cursor-pointer">
            <ClipboardCheck className="size-3" />
            Vetting Queue
          </Badge>
        </Link>
      </div>

      {/* Invite Form */}
      <InviteForm />

      {/* Pending invitations received */}
      {pendingInvitations.length > 0 && (
        <PendingInvitations invitations={pendingInvitations} />
      )}

      {/* Community Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Your Community ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No community members yet. Invite friends and family to join your
              circle and help vet your matches!
            </p>
          ) : (
            <div className="divide-y">
              {members.map(
                (member: {
                  id: string;
                  role: string;
                  status: string;
                  vetter: {
                    id: string;
                    name: string | null;
                    email: string | null;
                    image: string | null;
                  };
                }) => {
                  const initials = (member.vetter.name ?? "?")
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 py-3"
                    >
                      <Avatar>
                        {member.vetter.image && (
                          <AvatarImage
                            src={member.vetter.image}
                            alt={member.vetter.name ?? "User"}
                          />
                        )}
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.vetter.name ?? member.vetter.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.role}
                        </p>
                      </div>
                      <Badge
                        variant={
                          member.status === "ACCEPTED"
                            ? "default"
                            : member.status === "PENDING"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {member.status.toLowerCase()}
                      </Badge>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Communities you vet for */}
      {vettingFor.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Communities You Vet For</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {vettingFor.map(
                (membership: {
                  id: string;
                  role: string;
                  status: string;
                  owner: {
                    id: string;
                    name: string | null;
                    email: string | null;
                    image: string | null;
                  };
                }) => {
                  const initials = (membership.owner.name ?? "?")
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <div
                      key={membership.id}
                      className="flex items-center gap-3 py-3"
                    >
                      <Avatar>
                        {membership.owner.image && (
                          <AvatarImage
                            src={membership.owner.image}
                            alt={membership.owner.name ?? "User"}
                          />
                        )}
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {membership.owner.name ?? membership.owner.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Role: {membership.role}
                        </p>
                      </div>
                      <Badge
                        variant={
                          membership.status === "ACCEPTED"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {membership.status.toLowerCase()}
                      </Badge>
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
