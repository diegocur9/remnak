import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/shared/auth-card";
import { Button } from "@/components/ui/button";
import { VerifyForm } from "./verify-form";

export const metadata: Metadata = {
  title: "Verifica tu correo",
  description: "Ingresa el código que enviamos a tu correo.",
};

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const email = searchParams.email;

  if (!email) {
    return (
      <AuthCard
        title="Verifica tu correo"
        description="No encontramos a qué correo verificar."
      >
        <Button asChild className="w-full">
          <Link href="/register">Volver al registro</Link>
        </Button>
      </AuthCard>
    );
  }

  return <VerifyForm email={email} />;
}
