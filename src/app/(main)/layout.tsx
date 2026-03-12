import { Navbar } from "@/components/navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {/* offset for fixed navbar: top bar on desktop, bottom bar on mobile */}
      <main className="min-h-screen pt-14 pb-0 md:pb-0 pb-16 md:pt-14 px-4 md:px-8">
        {children}
      </main>
    </>
  );
}
