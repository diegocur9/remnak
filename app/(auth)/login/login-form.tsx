"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { loginAction } from "@/app/(auth)/actions";
import { AuthCard, FieldError } from "@/components/shared/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export function LoginForm({ resetOk }: { resetOk?: boolean }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (resetOk) toast.success("Contraseña actualizada. Inicia sesión.");
  }, [resetOk]);

  async function onSubmit(values: LoginInput) {
    const result = await loginAction(values);
    // Si la acción redirige, no llegamos aquí. Sólo manejamos el error.
    if (result?.error) {
      setError("password", { message: result.error });
      toast.error(result.error);
    }
  }

  return (
    <AuthCard
      title="Iniciar sesión"
      description="Bienvenido de vuelta a Remnak."
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-brand hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldError message={errors.password?.message} />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-texto-suave">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="font-semibold text-brand hover:underline">
          Crear cuenta
        </Link>
      </p>
    </AuthCard>
  );
}
