"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Newspaper,
  Heart,
  MessageCircle,
  Users,
  UserCircle,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/feed", label: "Feed", icon: Newspaper },
  { href: "/matches", label: "Matches", icon: Heart },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/community", label: "Community", icon: Users },
  { href: "/profile", label: "Profile", icon: UserCircle },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <>
      {/* Desktop top bar */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 items-center glass border-b border-border/30 px-8">
        <Link
          href="/feed"
          className="mr-10 flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          <div className="flex size-8 items-center justify-center rounded-lg gradient-primary glow-sm">
            <Heart className="size-4 text-white" />
          </div>
          <span className="gradient-primary bg-clip-text text-transparent">
            CommunityMatcher
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 rounded-xl px-4 font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/15 text-primary font-semibold border border-primary/20 glow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Avatar size="sm" className="ring-2 ring-primary/20">
            {session?.user?.image && (
              <AvatarImage
                src={session.user.image}
                alt={session.user.name ?? "User"}
              />
            )}
            <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => signOut({ callbackUrl: "/" })}
            aria-label="Sign out"
            className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden h-[4.5rem] items-center justify-around glass border-t border-border/30 px-2 pb-safe">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[0.65rem] font-medium transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-xl p-1.5 transition-all duration-200",
                  isActive && "bg-primary/15 border border-primary/20 glow-sm"
                )}
              >
                <Icon className="size-5" />
              </div>
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
