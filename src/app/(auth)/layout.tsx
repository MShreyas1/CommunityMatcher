export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="gradient-hero noise-bg flex min-h-screen items-center justify-center px-4 relative">
      <div className="relative z-10">{children}</div>
    </div>
  );
}
