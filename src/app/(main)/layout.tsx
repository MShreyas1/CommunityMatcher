import { Navbar } from "@/components/navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 pb-20 md:pb-6 md:pt-16 px-4 md:px-8">
        <div className="mx-auto max-w-5xl">
          {children}
        </div>
      </main>
    </>
  );
}
