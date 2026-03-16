"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { getMessages, sendMessage, markAsRead } from "@/actions/message";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date | string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  otherUserName: string;
  otherUserAvatar: string | null;
}

function MessageBubble({
  message,
  isSent,
}: {
  message: Message;
  isSent: boolean;
}) {
  return (
    <div
      className={`flex ${isSent ? "justify-end" : "justify-start"} mb-3`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isSent
            ? "gradient-primary text-white rounded-br-lg"
            : "bg-muted/80 rounded-bl-lg"
        }`}
      >
        <p className="break-words">{message.content}</p>
        <p
          className={`text-[0.6rem] mt-1.5 ${
            isSent ? "text-white/60" : "text-muted-foreground/70"
          }`}
        >
          {formatDistanceToNow(new Date(message.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>
    </div>
  );
}

export function ChatWindow({
  conversationId,
  currentUserId,
  otherUserName,
  otherUserAvatar,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, startSendTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const initials = otherUserName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Load initial messages and mark as read
  useEffect(() => {
    async function loadMessages() {
      try {
        const result = await getMessages(conversationId);
        if (result.messages) {
          setMessages([...result.messages].reverse());
        }
        await markAsRead(conversationId);
      } catch {
        toast.error("Failed to load messages");
      } finally {
        setIsLoading(false);
      }
    }
    loadMessages();
  }, [conversationId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = messageInput.trim();
    if (!content) return;

    setMessageInput("");

    startSendTransition(async () => {
      const result = await sendMessage(conversationId, content);

      if (result.error) {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : Object.values(result.error).flat().join(", ");
        toast.error(errorMsg);
        setMessageInput(content);
        return;
      }

      if (result.message) {
        setMessages((prev) => [
          ...prev,
          {
            ...result.message,
            sender: {
              id: currentUserId,
              name: null,
              image: null,
            },
          } as Message,
        ]);
      }
    });
  }

  // Poll for new messages
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const result = await getMessages(conversationId);
        if (result.messages) {
          setMessages([...result.messages].reverse());
          await markAsRead(conversationId);
        }
      } catch {
        // Silently fail on poll
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [conversationId]);

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] md:h-[calc(100vh-5.5rem)] max-w-lg mx-auto -mt-6">
      {/* Header */}
      <div className="flex items-center gap-3 glass border-b border-border/30 px-3 py-3.5 shrink-0 rounded-b-xl">
        <Link href="/messages">
          <Button
            variant="ghost"
            size="sm"
            className="size-9 p-0 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <Avatar className="size-9 ring-2 ring-border/50">
          {otherUserAvatar && (
            <AvatarImage src={otherUserAvatar} alt={otherUserName} />
          )}
          <AvatarFallback className="text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-sm leading-tight">
            {otherUserName}
          </h2>
          <p className="text-[0.65rem] text-muted-foreground">Online</p>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="rounded-2xl gradient-primary-subtle border border-primary/15 p-6 mb-4 glow-sm">
              <Avatar className="size-16 ring-2 ring-primary/20 mx-auto">
                {otherUserAvatar && (
                  <AvatarImage src={otherUserAvatar} alt={otherUserName} />
                )}
                <AvatarFallback className="text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <p className="text-sm font-medium mb-1">
              You matched with {otherUserName}
            </p>
            <p className="text-muted-foreground text-xs">
              Send a message to start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isSent={msg.senderId === currentUserId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-3 border-t border-border/30 px-4 py-4 shrink-0 glass"
      >
        <Input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 h-11 rounded-xl bg-muted/30 border-border/50 focus:bg-background transition-colors duration-200"
          disabled={isSending}
          autoComplete="off"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isSending || !messageInput.trim()}
          className="shrink-0 size-11 rounded-xl gradient-primary border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-40 glow hover:glow-lg"
        >
          {isSending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
