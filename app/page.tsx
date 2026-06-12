import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-balance font-display text-6xl tracking-tight text-foreground sm:text-7xl md:text-8xl">
          REM<span className="text-brand">NAK</span>
        </h1>
        <p className="text-balance text-lg font-medium text-muted-foreground sm:text-xl">
          Nada sobra.
        </p>
        <Link
          href="/design"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Sistema de diseño
        </Link>
      </div>
    </main>
  );
}
