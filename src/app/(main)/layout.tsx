import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/auth";
import { EmailVerificationBanner } from "@/components/email-verification-banner";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const showBanner = session?.user && !session.user.emailVerified;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 pb-20 md:pb-6 md:pt-16 px-4 md:px-8">
        <div className="mx-auto max-w-5xl">
          {showBanner && <EmailVerificationBanner />}
          {children}
        </div>
      </main>
    </>
  );
}
