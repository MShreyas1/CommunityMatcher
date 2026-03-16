import { redirect } from "next/navigation";
import Link from "next/link";
import { getCommunityMembers } from "@/actions/community";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, Eye, UserPlus as UserPlusIcon } from "lucide-react";
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
  const acceptedVettingFor = vettingFor.filter(
    (v: { status: string }) => v.status === "ACCEPTED"
  );

  return (
    <div className="mx-auto max-w-2xl py-6 space-y-6">
      {/* ============ OWNER SECTION ============ */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Community Circle</h1>
      </div>

      {/* Invite Form — only for owners */}
      <InviteForm />

      {/* Pending invitations the user received as a vetter */}
      {pendingInvitations.length > 0 && (
        <PendingInvitations invitations={pendingInvitations} />
      )}

      {/* Owner view: Full member list */}
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
              circle and help find your matches!
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

      {/* ============ VETTER SECTION ============ */}
      {acceptedVettingFor.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="size-5" />
              Vetting Assignments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {acceptedVettingFor.map(
              (membership: {
                id: string;
                role: string;
                status: string;
                owner: {
                  id: string;
                  name: string | null;
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
                    className="flex items-center gap-3 py-2"
                  >
                    <Avatar className="size-8">
                      {membership.owner.image && (
                        <AvatarImage
                          src={membership.owner.image}
                          alt={membership.owner.name ?? "User"}
                        />
                      )}
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm flex-1">
                      You&apos;re vetting for{" "}
                      <span className="font-semibold">
                        {membership.owner.name ?? "someone"}
                      </span>
                    </p>
                    <Link href={`/community/suggest/${membership.owner.id}`}>
                      <Badge variant="secondary" className="gap-1 cursor-pointer">
                        <UserPlusIcon className="size-3" />
                        Suggest profiles
                      </Badge>
                    </Link>
                  </div>
                );
              }
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
