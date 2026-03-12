import { redirect } from "next/navigation";
import Link from "next/link";
import { getConversations } from "@/actions/message";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function MessagesPage() {
  const result = await getConversations();

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

  const conversations = result.conversations ?? [];

  return (
    <div className="mx-auto max-w-lg py-6 space-y-4">
      <h1 className="text-2xl font-bold">Messages</h1>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <MessageCircle className="size-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No conversations yet</h2>
          <p className="text-muted-foreground max-w-xs">
            Match with someone to start chatting!
          </p>
        </div>
      ) : (
        <div className="divide-y rounded-lg border overflow-hidden">
          {conversations.map((convo) => {
            const otherUser = convo.otherUser;
            const displayName =
              otherUser?.profile?.displayName ??
              otherUser?.name ??
              "Unknown";
            const avatar =
              otherUser?.profile?.photos?.[0]?.url ??
              otherUser?.image ??
              null;
            const initials = displayName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <Link
                key={convo.id}
                href={`/messages/${convo.id}`}
                className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="relative">
                  <Avatar className="size-10">
                    {avatar && (
                      <AvatarImage src={avatar} alt={displayName} />
                    )}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  {convo.unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[0.6rem] text-primary-foreground font-medium">
                      {convo.unreadCount > 9 ? "9+" : convo.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-sm truncate ${
                        convo.unreadCount > 0
                          ? "font-semibold"
                          : "font-medium"
                      }`}
                    >
                      {displayName}
                    </h3>
                    {convo.lastMessage && (
                      <span className="text-[0.65rem] text-muted-foreground shrink-0 ml-2">
                        {formatDistanceToNow(
                          new Date(convo.lastMessage.createdAt),
                          { addSuffix: true }
                        )}
                      </span>
                    )}
                  </div>
                  {convo.lastMessage ? (
                    <p
                      className={`text-xs truncate mt-0.5 ${
                        convo.unreadCount > 0
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {convo.lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      No messages yet
                    </p>
                  )}
                </div>

                {convo.unreadCount > 0 && (
                  <Badge variant="default" className="shrink-0 text-[0.6rem] px-1.5">
                    {convo.unreadCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
