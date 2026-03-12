import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, Users, MessageCircle, Sparkles, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="gradient-hero flex flex-1 flex-col items-center justify-center gap-10 px-6 py-28 text-center">
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-medium text-primary">
          <Sparkles className="size-4" />
          Community-powered connections
        </div>

        <h1 className="max-w-3xl text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
          Find meaningful connections through{" "}
          <span className="gradient-primary bg-clip-text text-transparent">
            shared communities
          </span>
        </h1>

        <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
          CommunityMatcher helps you meet people who already share your
          interests, values, and social circles. Join communities you care
          about and get matched with like-minded individuals.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/register">
            <Button
              size="lg"
              className="w-full sm:w-auto px-8 py-6 text-base font-semibold rounded-xl gradient-primary border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              Get Started
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-8 py-6 text-base font-semibold rounded-xl border-2 hover:bg-primary/5 transition-all duration-300"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-24 sm:grid-cols-3">
        {[
          {
            icon: Users,
            title: "Community First",
            description:
              "Join communities that reflect who you are -- hobby groups, local organizations, professional networks, and more.",
          },
          {
            icon: Heart,
            title: "Smarter Matches",
            description:
              "Our matching considers shared communities, mutual interests, and compatibility signals to surface the people you are most likely to click with.",
          },
          {
            icon: MessageCircle,
            title: "Real Conversations",
            description:
              "Start conversations with context. Shared communities give you something genuine to talk about from the very first message.",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="gradient-card group rounded-2xl border border-border/50 p-8 card-shadow transition-all duration-300 hover:card-shadow-lg hover:-translate-y-1"
          >
            <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 transition-colors duration-300 group-hover:bg-primary/15">
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
    </div>
  );
}
