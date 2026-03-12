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
      className={`flex ${isSent ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
          isSent
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted rounded-bl-md"
        }`}
      >
        <p className="break-words">{message.content}</p>
        <p
          className={`text-[0.6rem] mt-1 ${
            isSent
              ? "text-primary-foreground/70"
              : "text-muted-foreground"
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
          // Messages come in desc order, reverse for display
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
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3.5rem)] max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-2 py-3 shrink-0">
        <Link href="/messages">
          <Button variant="ghost" size="sm" className="size-8 p-0">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <Avatar size="sm">
          {otherUserAvatar && (
            <AvatarImage src={otherUserAvatar} alt={otherUserName} />
          )}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <h2 className="font-semibold text-sm">{otherUserName}</h2>
      </div>

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground text-sm">
              No messages yet. Say hello!
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
        className="flex items-center gap-2 border-t px-4 py-3 shrink-0"
      >
        <Input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          disabled={isSending}
          autoComplete="off"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isSending || !messageInput.trim()}
          className="shrink-0"
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
