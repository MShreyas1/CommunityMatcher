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
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
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
  const { theme, setTheme } = useTheme();

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
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 items-center border-b border-primary/10 px-8 bg-[oklch(0.99_0.004_70/88%)] backdrop-blur-xl backdrop-saturate-120 shadow-[0_1px_8px_oklch(0.40_0.02_50/6%),0_4px_16px_oklch(0.40_0.02_50/4%)]">
        <Link
          href="/feed"
          className="mr-10 flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          <div className="flex size-8 items-center justify-center rounded-lg gradient-primary glow-sm">
            <Heart className="size-4 text-white" />
          </div>
          <span className="gradient-primary-text">
            SamuDate
          </span>
        </Link>

        <nav className="flex items-center gap-1.5">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 rounded-xl px-4 py-2 font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold border border-primary/20 shadow-[0_0_10px_oklch(0.65_0.19_25/12%)]"
                      : "text-muted-foreground border border-transparent hover:text-foreground hover:bg-primary/5 hover:border-border/60"
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </Button>
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden h-[4.5rem] items-center justify-around border-t border-primary/10 px-2 pb-safe bg-[oklch(0.99_0.004_70/90%)] backdrop-blur-xl backdrop-saturate-120 shadow-[0_-1px_8px_oklch(0.40_0.02_50/6%),0_-4px_16px_oklch(0.40_0.02_50/4%)]">
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
                  isActive && "bg-primary/10 border border-primary/20 shadow-[0_0_8px_oklch(0.65_0.19_25/15%)]"
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
