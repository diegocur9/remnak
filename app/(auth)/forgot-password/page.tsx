"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { forgotPasswordAction } from "@/app/(auth)/actions";
import { AuthCard, FieldError } from "@/components/shared/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    const result = await forgotPasswordAction(values);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard title="Revisa tu correo">
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-exito/10 text-exito">
            <MailCheck className="h-7 w-7" />
          </span>
          <p className="text-sm text-texto-suave">
            Si <span className="font-semibold text-ink">{getValues("email")}</span>{" "}
            está registrado, te enviamos un enlace para restablecer tu contraseña.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Volver a iniciar sesión</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Restablecer contraseña"
      description="Te enviaremos un enlace para crear una nueva contraseña."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            className="h-11"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Enviar enlace
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-texto-suave">
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </AuthCard>
  );
}
