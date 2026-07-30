"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateProfileAction } from "@/app/perfil/actions";
import { FieldError } from "@/components/shared/auth-card";
import { initialsFromName } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { MUNICIPIOS } from "@/lib/constants";
import {
  REGIMENES_FISCALES,
  USOS_CFDI,
  profileSchema,
  type ProfileFormValues,
  type ProfileInput,
} from "@/lib/validations/profile";

export function ProfileForm({
  userId,
  defaults,
  isProvider,
}: {
  userId: string;
  defaults: Partial<ProfileInput>;
  isProvider: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues, unknown, ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      municipio: undefined as never,
      avatarUrl: "",
      razonSocial: "",
      rfc: "",
      regimenFiscal: "",
      usoCfdi: "",
      cp: "",
      ...defaults,
    },
  });

  const avatarUrl = (watch("avatarUrl") as string) ?? "";
  const fullName = (watch("fullName") as string) ?? "";

  async function uploadAvatar(file: File) {
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Máximo 4 MB para la foto de perfil.");
      return;
    }
    setUploading(true);
    const supabase = createClient();
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${userId}/avatar/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("listing-photos")
      .upload(path, file, { contentType: file.type || "image/jpeg" });
    if (error) {
      toast.error(`No se pudo subir la foto: ${error.message}`);
    } else {
      const { data } = supabase.storage.from("listing-photos").getPublicUrl(path);
      setValue("avatarUrl", data.publicUrl, { shouldValidate: true });
    }
    setUploading(false);
  }

  async function onSubmit(values: ProfileInput) {
    const result = await updateProfileAction(values);
    if (result?.error) toast.error(result.error);
    else toast.success("Perfil actualizado");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Avatar */}
      <div className="flex items-center gap-4 rounded-[18px] border border-[#ECE4DB] bg-white p-5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          aria-label="Cambiar foto de perfil"
          className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-brand text-2xl font-semibold text-brand-foreground"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Foto de perfil"
              fill
              sizes="80px"
              className="object-cover"
              unoptimized={!avatarUrl.includes(".supabase.co/storage/")}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              {initialsFromName(fullName)}
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-ink/50 opacity-0 transition-opacity group-hover:opacity-100">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            ) : (
              <Camera className="h-6 w-6 text-white" />
            )}
          </span>
        </button>
        <div>
          <p className="text-sm font-bold text-ink">Foto de perfil</p>
          <p className="text-xs text-texto-suave">
            JPG/PNG hasta 4 MB. Haz clic en la foto para cambiarla.
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void uploadAvatar(f);
            e.target.value = "";
          }}
        />
      </div>

      {/* Datos personales */}
      <div className="space-y-4 rounded-[18px] border border-[#ECE4DB] bg-white p-5">
        <h2 className="font-display text-[15px] text-ink">Datos personales</h2>
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Nombre completo</Label>
          <Input
            id="fullName"
            autoComplete="name"
            className="h-11"
            aria-invalid={!!errors.fullName}
            {...register("fullName")}
          />
          <FieldError message={errors.fullName?.message} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              className="h-11"
              aria-invalid={!!errors.phone}
              {...register("phone")}
            />
            <FieldError message={errors.phone?.message} />
          </div>
          <div className="space-y-1.5">
            <Label>Municipio</Label>
            <Controller
              control={control}
              name="municipio"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-invalid={!!errors.municipio}>
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
      </div>

      {/* Datos fiscales */}
      <div className="space-y-4 rounded-[18px] border border-[#ECE4DB] bg-white p-5">
        <div>
          <h2 className="font-display text-[15px] text-ink">
            Datos fiscales (CFDI)
          </h2>
          <p className="mt-1 text-xs text-texto-suave">
            {isProvider
              ? "Como vendedor, tu RFC es clave: sin él, la ley obliga a retenerte ~36% de cada venta (régimen de plataformas). Con RFC la retención baja a 1% ISR + 8% IVA."
              : "Opcionales — se usan para emitir tu factura CFDI 4.0. Sin RFC facturamos a público general."}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="rfc">RFC</Label>
            <Input
              id="rfc"
              placeholder="XAXX010101000"
              className="h-11 font-mono uppercase"
              aria-invalid={!!errors.rfc}
              {...register("rfc")}
            />
            <FieldError message={errors.rfc?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="razonSocial">Razón social</Label>
            <Input
              id="razonSocial"
              placeholder="Como aparece en tu CSF"
              className="h-11"
              {...register("razonSocial")}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Régimen fiscal</Label>
            <Controller
              control={control}
              name="regimenFiscal"
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIMENES_FISCALES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Uso de CFDI</Label>
            <Controller
              control={control}
              name="usoCfdi"
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {USOS_CFDI.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5 sm:max-w-[160px]">
            <Label htmlFor="cp">Código postal</Label>
            <Input
              id="cp"
              inputMode="numeric"
              placeholder="24000"
              className="h-11 font-mono"
              aria-invalid={!!errors.cp}
              {...register("cp")}
            />
            <FieldError message={errors.cp?.message} />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting || uploading}
      >
        {isSubmitting && <Loader2 className="animate-spin" />}
        Guardar cambios
      </Button>
    </form>
  );
}
