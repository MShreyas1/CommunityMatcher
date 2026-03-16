import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Verify Email | SamuDate",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center space-y-4">
          <XCircle className="mx-auto size-12 text-destructive" />
          <h1 className="text-2xl font-bold">Invalid Link</h1>
          <p className="text-muted-foreground">
            No verification token provided.
          </p>
          <Link href="/feed">
            <Button className="gradient-primary border-0 rounded-xl">
              Go to Feed
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Find the token
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center space-y-4">
          <XCircle className="mx-auto size-12 text-destructive" />
          <h1 className="text-2xl font-bold">Invalid Token</h1>
          <p className="text-muted-foreground">
            This verification link is invalid or has already been used.
          </p>
          <Link href="/feed">
            <Button className="gradient-primary border-0 rounded-xl">
              Go to Feed
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check if expired
  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { token },
    });

    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center space-y-4">
          <XCircle className="mx-auto size-12 text-destructive" />
          <h1 className="text-2xl font-bold">Link Expired</h1>
          <p className="text-muted-foreground">
            This verification link has expired. Please request a new one from
            the banner in the app.
          </p>
          <Link href="/feed">
            <Button className="gradient-primary border-0 rounded-xl">
              Go to Feed
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Verify the user
  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  });

  // Delete the used token
  await prisma.verificationToken.delete({
    where: { token },
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center space-y-4">
        <CheckCircle className="mx-auto size-12 text-green-500" />
        <h1 className="text-2xl font-bold">Email Verified</h1>
        <p className="text-muted-foreground">
          Your email has been verified successfully. You can now use all
          features of SamuDate.
        </p>
        <Link href="/feed">
          <Button className="gradient-primary border-0 rounded-xl">
            Go to Feed
          </Button>
        </Link>
      </div>
    </div>
  );
}
