import { Logo } from "@/components/shared/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex items-center justify-center px-4 py-6">
        <Logo size="md" href="/" />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-2 sm:items-center">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
