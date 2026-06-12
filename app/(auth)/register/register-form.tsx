"use client";

import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  HardHat,
  Loader2,
  ShoppingBag,
  Store,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { registerAction } from "@/app/(auth)/actions";
import { AuthCard, FieldError } from "@/components/shared/auth-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MUNICIPIOS, ROLE_OPTIONS, type RegistrableRole } from "@/lib/constants";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

const ROLE_ICONS: Record<RoleIcon, LucideIcon> = {
  ShoppingBag,
  Store,
  HardHat,
  Truck,
};
type RoleIcon = "ShoppingBag" | "Store" | "HardHat" | "Truck";

export function RegisterForm() {
  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: undefined as unknown as RegistrableRole,
      fullName: "",
      email: "",
      password: "",
      phone: "",
      municipio: undefined as unknown as RegisterInput["municipio"],
      acceptPrivacy: false,
    },
  });

  const role = watch("role");
  const selectedRole = ROLE_OPTIONS.find((r) => r.value === role);

  function chooseRole(value: RegistrableRole) {
    setValue("role", value, { shouldValidate: true });
    setStep(2);
  }

  async function onSubmit(values: RegisterInput) {
    const result = await registerAction(values);
    // En éxito la acción redirige a /verify; sólo manejamos error.
    if (result?.error) {
      toast.error(result.error);
      if (/correo/i.test(result.error)) {
        setError("email", { message: result.error });
      }
    }
  }

  if (step === 1) {
    return (
      <AuthCard
        title="Crear cuenta"
        description="Primero, ¿cómo vas a usar Remnak?"
      >
        <div className="space-y-3">
          {ROLE_OPTIONS.map((option) => {
            const Icon = ROLE_ICONS[option.icon as RoleIcon];
            const active = role === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => chooseRole(option.value)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-xl border bg-superficie p-4 text-left transition-colors hover:border-brand/60 hover:bg-brand/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  active ? "border-brand bg-brand/5" : "border-border"
                )}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink">
                    {option.label}
                  </span>
                  <span className="block text-sm text-texto-suave">
                    {option.tagline}
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-texto-suave" />
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-center text-sm text-texto-suave">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Inicia sesión
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Crea tu cuenta"
      description={
        selectedRole ? (
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4 text-exito" />
            {selectedRole.label} — {selectedRole.tagline}
          </span>
        ) : undefined
      }
    >
      <button
        type="button"
        onClick={() => setStep(1)}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-texto-suave hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Cambiar tipo de cuenta
      </button>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Nombre completo</Label>
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="Juan Pérez García"
            className="h-11"
            aria-invalid={!!errors.fullName}
            {...register("fullName")}
          />
          <FieldError message={errors.fullName?.message} />
        </div>

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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="999 123 4567"
              className="h-11"
              aria-invalid={!!errors.phone}
              {...register("phone")}
            />
            <FieldError message={errors.phone?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="municipio">Municipio</Label>
            <Controller
              control={control}
              name="municipio"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="municipio" aria-invalid={!!errors.municipio}>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {MUNICIPIOS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.municipio?.message} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldError message={errors.password?.message} />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-start gap-2.5">
            <Controller
              control={control}
              name="acceptPrivacy"
              render={({ field }) => (
                <Checkbox
                  id="acceptPrivacy"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5"
                  aria-invalid={!!errors.acceptPrivacy}
                />
              )}
            />
            <Label
              htmlFor="acceptPrivacy"
              className="text-sm font-normal leading-snug text-texto-suave"
            >
              He leído y acepto el{" "}
              <Link
                href="/privacidad"
                target="_blank"
                className="font-semibold text-brand hover:underline"
              >
                aviso de privacidad
              </Link>
              .
            </Label>
          </div>
          <FieldError message={errors.acceptPrivacy?.message} />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Crear cuenta
        </Button>
      </form>
    </AuthCard>
  );
}
