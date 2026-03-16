import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Sparkles, Users, Zap } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col noise-bg">
      {/* Hero */}
      <section className="gradient-hero flex flex-1 flex-col items-center justify-center gap-10 px-6 py-28 text-center relative z-10">
        <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-5 py-2 text-sm font-medium text-primary glow-sm">
          <Sparkles className="size-4" />
          Community-vetted dating
        </div>

        <h1 className="max-w-3xl text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
          <span className="gradient-primary-text text-glow">
            SamuDate.
          </span>
          <br />
          Dates your people believe in.
        </h1>

        <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
          Your friends, family, and trusted circle vet your matches before
          you ever meet. Real connections, backed by the people who know
          you best.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/register">
            <Button
              size="lg"
              className="w-full sm:w-auto px-8 py-6 text-base font-semibold rounded-xl gradient-primary border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] glow pulse-glow"
            >
              Get Started
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-8 py-6 text-base font-semibold rounded-xl border-primary/25 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:glow-sm"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-24 sm:grid-cols-3 relative z-10">
        {[
          {
            icon: Users,
            title: "Your Inner Circle",
            description:
              "Invite the friends and family who know you best. They review your matches and give their honest take before you connect.",
            glow: "group-hover:glow-sm",
          },
          {
            icon: Zap,
            title: "Community Score",
            description:
              "Every match gets a vetting score from your circle. See at a glance who your people approve of — and who they don't.",
            glow: "group-hover:glow-cyan",
          },
          {
            icon: MessageCircle,
            title: "Conversations with Confidence",
            description:
              "Only chat with matches your circle has approved. No more guessing — start every conversation knowing someone has your back.",
            glow: "group-hover:glow-sm",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className={`gradient-card group rounded-2xl border border-border/40 p-8 card-shadow transition-all duration-500 hover:card-shadow-lg hover:-translate-y-1 hover:border-primary/25 ${feature.glow}`}
          >
            <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/15 transition-all duration-300 group-hover:bg-primary/20 group-hover:border-primary/30 group-hover:glow-sm">
              <feature.icon className="size-6 text-primary" />
            </div>
            <h3 className="mb-3 text-lg font-semibold tracking-tight">
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </section>
      {/* Footer */}
      <footer className="border-t border-border/20 py-8 px-6 relative z-10">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SamuDate. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
