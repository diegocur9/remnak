"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  FileCheck2,
  FileUp,
  ImagePlus,
  Loader2,
  ShieldAlert,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { createVehicle, updateVehicle } from "@/lib/actions/vehicles";
import { FieldError } from "@/components/shared/auth-card";
import { VEHICLE_TYPE_ICONS } from "@/components/marketplace/vehicle-icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import {
  CARGO_CATEGORY_OPTIONS,
  SPECIAL_EQUIPMENT_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
} from "@/lib/marketplace/freight";
import {
  MAX_VEHICLE_PHOTOS,
  vehicleSchema,
  type VehicleFormValues,
  type VehicleInput,
} from "@/lib/validations/vehicle";
import { cn } from "@/lib/utils";

export interface VehicleFormProps {
  userId: string;
  /** Presentes solo en edición. */
  vehicleId?: string;
  currentStatus?: string;
  defaults?: Partial<VehicleInput>;
}

/** Sube un archivo y devuelve URL pública (fotos) o path (docs privados). */
async function uploadTo(
  bucket: "listing-photos" | "verification-docs",
  userId: string,
  file: File
): Promise<{ value: string } | { error: string }> {
  const supabase = createClient();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${userId}/vehiculos/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type || undefined });
  if (error) return { error: error.message };
  if (bucket === "listing-photos") {
    return { value: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl };
  }
  return { value: path };
}

function DocField({
  label,
  value,
  onUpload,
  onClear,
  accept,
}: {
  label: string;
  value: string;
  onUpload: (file: File) => void;
  onClear: () => void;
  accept: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#ECE4DB] bg-white px-4 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        {value ? (
          <FileCheck2 className="h-5 w-5 shrink-0 text-exito" />
        ) : (
          <FileUp className="h-5 w-5 shrink-0 text-texto-suave" />
        )}
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold text-ink">{label}</div>
          <div className="truncate text-xs text-texto-suave">
            {value ? "Documento cargado" : "PDF o imagen"}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {value && (
          <button
            type="button"
            onClick={onClear}
            aria-label={`Quitar ${label}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-texto-suave hover:bg-secondary hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => ref.current?.click()}
        >
          {value ? "Reemplazar" : "Subir"}
        </Button>
      </div>
      <input
        ref={ref}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function VehicleForm({
  userId,
  vehicleId,
  currentStatus,
  defaults,
}: VehicleFormProps) {
  const isEdit = Boolean(vehicleId);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormValues, unknown, VehicleInput>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      vehicleType: undefined as unknown as VehicleInput["vehicleType"],
      alias: "",
      placas: "",
      capacityKg: undefined,
      cargoLengthM: undefined,
      cargoWidthM: undefined,
      cargoHeightM: undefined,
      cargoVolumeM3: undefined,
      cargoCategories: [],
      specialEquipment: [],
      acceptsLooseBulk: false,
      photos: [],
      tarjetaCirculacionUrl: "",
      polizaSeguroUrl: "",
      permisoSct: "",
      permisoSctVigencia: "",
      ...defaults,
    },
  });

  const vehicleType = watch("vehicleType");
  const photos = (watch("photos") as string[]) ?? [];
  const cargoCategories = (watch("cargoCategories") as string[]) ?? [];
  const specialEquipment = (watch("specialEquipment") as string[]) ?? [];
  const tarjeta = (watch("tarjetaCirculacionUrl") as string) ?? "";
  const poliza = (watch("polizaSeguroUrl") as string) ?? "";
  const showLooseBulk = cargoCategories.includes("granel");

  async function handlePhotos(files: FileList | null) {
    if (!files?.length) return;
    const remaining = MAX_VEHICLE_PHOTOS - photos.length;
    const selected = Array.from(files).slice(0, Math.max(0, remaining));
    if (!selected.length) {
      toast.error(`Máximo ${MAX_VEHICLE_PHOTOS} fotos.`);
      return;
    }
    setUploading(true);
    const added: string[] = [];
    for (const f of selected) {
      if (f.size > 8 * 1024 * 1024) {
        toast.error(`${f.name}: máximo 8 MB.`);
        continue;
      }
      const r = await uploadTo("listing-photos", userId, f);
      if ("error" in r) toast.error(`No se pudo subir ${f.name}: ${r.error}`);
      else added.push(r.value);
    }
    if (added.length)
      setValue("photos", [...photos, ...added], { shouldValidate: true });
    setUploading(false);
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  async function handleDoc(
    field: "tarjetaCirculacionUrl" | "polizaSeguroUrl",
    file: File
  ) {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Máximo 10 MB por documento.");
      return;
    }
    setUploading(true);
    const r = await uploadTo("verification-docs", userId, file);
    if ("error" in r) toast.error(`No se pudo subir el documento: ${r.error}`);
    else setValue(field, r.value, { shouldValidate: true });
    setUploading(false);
  }

  function toggleIn(
    field: "cargoCategories" | "specialEquipment",
    current: string[],
    value: string
  ) {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setValue(field, next as never, { shouldValidate: true });
  }

  async function onSubmit(values: VehicleInput) {
    const result = isEdit
      ? await updateVehicle(vehicleId!, values)
      : await createVehicle(values);
    // En éxito la acción redirige; solo manejamos error.
    if (result?.error) toast.error(result.error);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/logistica/vehiculos"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-texto-suave hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Mis vehículos
      </Link>

      <h1 className="mb-1 font-display text-[26px] tracking-tight text-ink">
        {isEdit ? "Editar vehículo" : "Registrar vehículo"}
      </h1>
      <p className="mb-4 text-sm text-texto-suave">
        Declara con honestidad qué puede cargar tu unidad: el matching solo te
        mostrará envíos que sí puedes transportar.
      </p>

      {isEdit && currentStatus !== "pending" && (
        <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-advertencia/40 bg-advertencia/10 px-4 py-3 text-[13px] text-ink">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-advertencia" />
          <span>
            Al cambiar datos del vehículo (excepto el alias), la unidad{" "}
            <strong>regresa a revisión</strong> y saldrá del matching hasta ser
            verificada de nuevo.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Tipo de vehículo — cards visuales */}
        <div className="space-y-2">
          <Label>Tipo de vehículo</Label>
          <Controller
            control={control}
            name="vehicleType"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {VEHICLE_TYPE_OPTIONS.map((o) => {
                  const Icon = VEHICLE_TYPE_ICONS[o.value];
                  const active = field.value === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => field.onChange(o.value)}
                      className={cn(
                        "flex flex-col items-start gap-1.5 rounded-xl border bg-white p-3 text-left transition-colors",
                        active
                          ? "border-brand bg-brand/5"
                          : "border-[#E6DED4] hover:border-brand/60"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-6 w-6",
                          active ? "text-brand" : "text-texto-suave"
                        )}
                        strokeWidth={2}
                      />
                      <span className="text-[12.5px] font-bold leading-tight text-ink">
                        {o.label}
                      </span>
                      <span className="text-[10.5px] font-medium text-texto-suave">
                        {o.range}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          />
          <FieldError message={errors.vehicleType?.message} />
          {vehicleType && (
            <p className="text-xs text-texto-suave">
              Típico:{" "}
              {VEHICLE_TYPE_OPTIONS.find((o) => o.value === vehicleType)?.typical}
            </p>
          )}
        </div>

        {/* Identificación */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="alias">Alias (opcional)</Label>
            <Input
              id="alias"
              placeholder='"Volquete rojo", "La camioneta"'
              className="h-11"
              {...register("alias")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="placas">Placas</Label>
            <Input
              id="placas"
              placeholder="YUC-1234-A"
              className="h-11 font-mono uppercase"
              aria-invalid={!!errors.placas}
              {...register("placas")}
            />
            <FieldError message={errors.placas?.message} />
          </div>
        </div>

        {/* Capacidad y dimensiones */}
        <div className="space-y-3 rounded-xl border border-[#ECE4DB] bg-superficie p-4">
          <div className="text-[13px] font-extrabold uppercase tracking-[.05em] text-ink">
            Capacidad
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div className="col-span-2 space-y-1.5 sm:col-span-1">
              <Label htmlFor="capacityKg">Carga (kg)</Label>
              <Input
                id="capacityKg"
                type="number"
                inputMode="decimal"
                min={0}
                className="h-10 font-mono"
                aria-invalid={!!errors.capacityKg}
                {...register("capacityKg")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cargoLengthM">Largo (m)</Label>
              <Input id="cargoLengthM" type="number" step="0.1" min={0} className="h-10 font-mono" {...register("cargoLengthM")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cargoWidthM">Ancho (m)</Label>
              <Input id="cargoWidthM" type="number" step="0.1" min={0} className="h-10 font-mono" {...register("cargoWidthM")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cargoHeightM">Alto (m)</Label>
              <Input id="cargoHeightM" type="number" step="0.1" min={0} className="h-10 font-mono" {...register("cargoHeightM")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cargoVolumeM3">Vol. (m³)</Label>
              <Input id="cargoVolumeM3" type="number" step="0.1" min={0} className="h-10 font-mono" {...register("cargoVolumeM3")} />
            </div>
          </div>
          <FieldError message={errors.capacityKg?.message} />
          <FieldError message={errors.cargoLengthM?.message} />
        </div>

        {/* Categorías que puede transportar */}
        <div className="space-y-2">
          <Label>¿Qué puede transportar?</Label>
          <div className="flex flex-wrap gap-2">
            {CARGO_CATEGORY_OPTIONS.map((o) => {
              const active = cargoCategories.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  title={o.examples}
                  onClick={() =>
                    toggleIn("cargoCategories", cargoCategories, o.value)
                  }
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors",
                    active
                      ? "border-brand bg-[#FBEADF] text-brand-strong"
                      : "border-[#E6DED4] bg-white text-[#6B6259] hover:border-[#D7CCC0]"
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          <FieldError message={errors.cargoCategories?.message} />
          {showLooseBulk && (
            <label className="mt-1 flex items-center gap-2.5 text-sm text-ink">
              <Controller
                control={control}
                name="acceptsLooseBulk"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              Acepto granel <strong>suelto</strong> (sin costales) — aplica a
              redilas
            </label>
          )}
        </div>

        {/* Equipamiento especial */}
        <div className="space-y-2">
          <Label>Equipamiento especial</Label>
          <div className="flex flex-wrap gap-2">
            {SPECIAL_EQUIPMENT_OPTIONS.map((o) => {
              const active = specialEquipment.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  title={o.description}
                  onClick={() =>
                    toggleIn("specialEquipment", specialEquipment, o.value)
                  }
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors",
                    active
                      ? "border-brand bg-[#FBEADF] text-brand-strong"
                      : "border-[#E6DED4] bg-white text-[#6B6259] hover:border-[#D7CCC0]"
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          <FieldError message={errors.specialEquipment?.message} />
        </div>

        {/* Fotos */}
        <div className="space-y-2">
          <Label>
            Fotos del vehículo ({photos.length}/{MAX_VEHICLE_PHOTOS})
          </Label>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {photos.map((url) => (
              <div
                key={url}
                className="group relative aspect-square overflow-hidden rounded-xl border border-[#ECE4DB]"
              >
                <Image src={url} alt="Foto del vehículo" fill sizes="120px" className="object-cover" />
                <button
                  type="button"
                  onClick={() =>
                    setValue(
                      "photos",
                      photos.filter((p) => p !== url),
                      { shouldValidate: true }
                    )
                  }
                  aria-label="Quitar foto"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {photos.length < MAX_VEHICLE_PHOTOS && (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploading}
                className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#D7CCC0] text-texto-suave transition-colors hover:border-brand hover:text-brand-strong disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ImagePlus className="h-5 w-5" />
                )}
                <span className="text-[11px] font-semibold">
                  {uploading ? "Subiendo…" : "Agregar"}
                </span>
              </button>
            )}
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => void handlePhotos(e.target.files)}
          />
          <FieldError message={errors.photos?.message} />
        </div>

        {/* Documentos */}
        <div className="space-y-3">
          <Label>Documentos (privados — solo los ve el equipo de Remnak)</Label>
          <DocField
            label="Tarjeta de circulación"
            value={tarjeta}
            accept="image/*,application/pdf"
            onUpload={(f) => void handleDoc("tarjetaCirculacionUrl", f)}
            onClear={() => setValue("tarjetaCirculacionUrl", "")}
          />
          <DocField
            label="Póliza de seguro"
            value={poliza}
            accept="image/*,application/pdf"
            onUpload={(f) => void handleDoc("polizaSeguroUrl", f)}
            onClear={() => setValue("polizaSeguroUrl", "")}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="permisoSct">Permiso SCT (número)</Label>
              <Input
                id="permisoSct"
                placeholder="SCT-XXXXX"
                className="h-11 font-mono"
                {...register("permisoSct")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="permisoSctVigencia">Vigencia del permiso</Label>
              <Input
                id="permisoSctVigencia"
                type="date"
                className="h-11 font-mono"
                aria-invalid={!!errors.permisoSctVigencia}
                {...register("permisoSctVigencia")}
              />
              <FieldError message={errors.permisoSctVigencia?.message} />
            </div>
          </div>
          <p className="text-xs text-texto-suave">
            Sin permiso SCT vigente tu unidad no aparece en el matching, aunque
            esté verificada.
          </p>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting || uploading}
        >
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isEdit ? "Guardar cambios" : "Registrar vehículo"}
        </Button>
      </form>
    </div>
  );
}
