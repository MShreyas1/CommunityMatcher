export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="gradient-hero flex min-h-screen items-center justify-center px-4">
      {children}
    </div>
  );
}
