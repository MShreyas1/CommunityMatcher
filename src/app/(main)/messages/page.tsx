import { redirect } from "next/navigation";
import Link from "next/link";
import { getConversations } from "@/actions/message";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function MessagesPage() {
  const result = await getConversations();

  if (result.error) {
    if (result.error === "Not authenticated") {
      redirect("/login");
    }
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground text-sm">
          {typeof result.error === "string"
            ? result.error
            : "Something went wrong"}
        </p>
      </div>
    );
  }

  const conversations = result.conversations ?? [];

  return (
    <div className="mx-auto max-w-lg py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Messages</h1>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-2xl gradient-primary-subtle border border-primary/15 p-8 mb-6 glow-sm">
            <Sparkles className="size-12 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2 tracking-tight">
            No conversations yet
          </h2>
          <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
            Match with someone to start chatting!
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/30 overflow-hidden card-shadow divide-y divide-border/30">
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
                className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors duration-200 group"
              >
                <div className="relative shrink-0">
                  <Avatar className="size-12 ring-2 ring-border/50">
                    {avatar && (
                      <AvatarImage src={avatar} alt={displayName} />
                    )}
                    <AvatarFallback className="text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {convo.unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full gradient-primary text-[0.6rem] text-white font-semibold shadow-sm">
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
                      <span className="text-[0.65rem] text-muted-foreground shrink-0 ml-2 font-medium">
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
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {convo.lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-xs text-primary font-medium mt-0.5">
                      Start a conversation
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
