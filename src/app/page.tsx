import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Heart, Users, MessageCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-24 text-center">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Find meaningful connections through{" "}
          <span className="text-primary">shared communities</span>
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          CommunityMatcher helps you meet people who already share your
          interests, values, and social circles. Join communities you care
          about and get matched with like-minded individuals.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto px-8">
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto grid w-full max-w-5xl gap-6 px-4 pb-24 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <Users className="size-8 text-primary mb-2" />
            <CardTitle>Community First</CardTitle>
            <CardDescription>
              Join communities that reflect who you are -- hobby groups, local
              organizations, professional networks, and more.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Heart className="size-8 text-primary mb-2" />
            <CardTitle>Smarter Matches</CardTitle>
            <CardDescription>
              Our matching considers shared communities, mutual interests, and
              compatibility signals to surface the people you are most likely to
              click with.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <MessageCircle className="size-8 text-primary mb-2" />
            <CardTitle>Real Conversations</CardTitle>
            <CardDescription>
              Start conversations with context. Shared communities give you
              something genuine to talk about from the very first message.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </div>
  );
}
