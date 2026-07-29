"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import {
  countCompatibleForListing,
  createListingAction,
  updateListingAction,
} from "@/app/(proveedor)/panel/actions";
import {
  CARGO_CATEGORY_OPTIONS,
  SPECIAL_EQUIPMENT_OPTIONS,
  cargoCategoryLabel,
  suggestCargoCategory,
} from "@/lib/marketplace/freight";
import { FieldError } from "@/components/shared/auth-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { cn } from "@/lib/utils";
import { MUNICIPIOS } from "@/lib/constants";
import { CATEGORY_LABEL, CONDITION_META } from "@/lib/marketplace/catalog";
import type { z } from "zod";

import {
  LISTING_CATEGORIES,
  LISTING_CONDITIONS,
  MAX_PHOTOS,
  MIN_PHOTOS,
  listingSchema,
  type ListingInput,
} from "@/lib/validations/listing";

/** Valores del formulario ANTES de coerción zod (input ≠ output con z.coerce). */
type ListingFormValues = z.input<typeof listingSchema>;

const PRICE_TYPE_OPTIONS = [
  { value: "fijo", label: "Precio fijo" },
  { value: "renta_diaria", label: "Renta por día" },
] as const;

export interface PublishFormProps {
  userId: string;
  /** Presentes solo en modo edición. */
  listingId?: string;
  defaults?: Partial<ListingInput>;
}

export function PublishForm({ userId, listingId, defaults }: PublishFormProps) {
  const isEdit = Boolean(listingId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ListingFormValues, unknown, ListingInput>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      description: "",
      category: undefined as unknown as ListingInput["category"],
      condition: undefined as unknown as ListingInput["condition"],
      priceType: "fijo",
      priceMxn: undefined,
      quantity: 1,
      unit: "",
      brand: "",
      model: "",
      municipio: undefined as unknown as ListingInput["municipio"],
      fleteDisponible: false,
      fletePrecioMxn: undefined,
      cargoCategory: undefined,
      weightKg: undefined,
      cargoVolumeM3: undefined,
      unitWeightKg: undefined,
      unitLengthM: undefined,
      unitWidthM: undefined,
      unitHeightM: undefined,
      requiresEquipment: [],
      pickupDisponible: true,
      esRcd: false,
      volumenM3: undefined,
      photos: [],
      status: "active",
      ...defaults,
    },
  });

  const photos = watch("photos") as string[];
  const fleteDisponible = watch("fleteDisponible");
  const esRcd = watch("esRcd");
  const priceType = watch("priceType");
  const title = watch("title") as string;
  const category = watch("category") as string | undefined;
  const cargoCategory = watch("cargoCategory") as string | undefined;
  const weightKg = watch("weightKg");
  const cargoVolumeM3 = watch("cargoVolumeM3");
  const quantity = watch("quantity");
  const unitWeightKg = watch("unitWeightKg");
  const unitLengthM = watch("unitLengthM");
  const unitWidthM = watch("unitWidthM");
  const unitHeightM = watch("unitHeightM");
  const requiresEquipment = (watch("requiresEquipment") as string[]) ?? [];

  // Carga: granel captura totales; el resto declara la UNIDAD y el total
  // se calcula unidad × cantidad (el server lo recalcula igual).
  const isBulk = cargoCategory === "granel";
  const qty = Math.max(1, Math.floor(Number(quantity) || 1));
  const uW = Number(unitWeightKg) || 0;
  const uVol =
    Number(unitLengthM) > 0 && Number(unitWidthM) > 0 && Number(unitHeightM) > 0
      ? Number(unitLengthM) * Number(unitWidthM) * Number(unitHeightM)
      : null;
  const computedTotalKg = !isBulk && uW > 0 ? Math.round(uW * qty * 100) / 100 : null;
  const computedTotalM3 =
    !isBulk && uVol != null ? Math.round(uVol * qty * 100) / 100 : null;
  const effectiveWeightKg = isBulk ? Number(weightKg) || 0 : (computedTotalKg ?? 0);
  const effectiveVolumeM3 = isBulk
    ? Number(cargoVolumeM3) || null
    : computedTotalM3;

  // §6.2 — sugerencia de categoría por título + conteo en vivo de fleteros
  const suggestion = fleteDisponible
    ? suggestCargoCategory(title ?? "", category)
    : null;
  const [carrierCount, setCarrierCount] = useState<number | null>(null);
  useEffect(() => {
    if (!fleteDisponible || !cargoCategory || effectiveWeightKg <= 0) {
      setCarrierCount(null);
      return;
    }
    const t = setTimeout(() => {
      void countCompatibleForListing({
        cargoCategory,
        weightKg: effectiveWeightKg,
        requiresEquipment,
        totalVolumeM3: effectiveVolumeM3,
        unit:
          !isBulk && uW > 0
            ? {
                unitWeightKg: uW,
                unitLengthM: Number(unitLengthM) || null,
                unitWidthM: Number(unitWidthM) || null,
                unitHeightM: Number(unitHeightM) || null,
                quantity: qty,
              }
            : null,
      }).then(setCarrierCount);
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fleteDisponible,
    cargoCategory,
    effectiveWeightKg,
    effectiveVolumeM3,
    uW,
    qty,
    unitLengthM,
    unitWidthM,
    unitHeightM,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(requiresEquipment),
  ]);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const remaining = MAX_PHOTOS - photos.length;
    const selected = Array.from(files).slice(0, remaining);
    if (!selected.length) {
      toast.error(`Máximo ${MAX_PHOTOS} fotos.`);
      return;
    }
    setUploading(true);
    const supabase = createClient();
    const uploaded: string[] = [];
    for (const file of selected) {
      if (file.size > 8 * 1024 * 1024) {
        toast.error(`${file.name}: máximo 8 MB por foto.`);
        continue;
      }
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("listing-photos")
        .upload(path, file, { contentType: file.type || "image/jpeg" });
      if (error) {
        toast.error(`No se pudo subir ${file.name}.`);
        continue;
      }
      const { data } = supabase.storage.from("listing-photos").getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }
    if (uploaded.length) {
      setValue("photos", [...photos, ...uploaded], { shouldValidate: true });
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePhoto(url: string) {
    setValue(
      "photos",
      photos.filter((p) => p !== url),
      { shouldValidate: true }
    );
    // La limpieza del archivo en Storage se hace al guardar/expirar (no bloquea).
    const marker = "/listing-photos/";
    const idx = url.indexOf(marker);
    if (idx >= 0) {
      void createClient()
        .storage.from("listing-photos")
        .remove([decodeURIComponent(url.slice(idx + marker.length))]);
    }
  }

  async function submit(values: ListingInput, status: "draft" | "active") {
    const payload = { ...values, status };
    const result = isEdit
      ? await updateListingAction(listingId!, payload)
      : await createListingAction(payload);
    // En éxito la acción redirige a /panel; solo manejamos error.
    if (result?.error) toast.error(result.error);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/panel"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-texto-suave hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al panel
      </Link>

      <h1 className="mb-1 font-display text-[26px] tracking-tight text-ink">
        {isEdit ? "Editar anuncio" : "Publicar anuncio"}
      </h1>
      <p className="mb-7 text-sm text-texto-suave">
        Fotos reales y condición honesta venden más rápido.
      </p>

      <form className="space-y-6" noValidate>
        {/* Fotos */}
        <div className="space-y-2">
          <Label>
            Fotos ({photos.length}/{MAX_PHOTOS}) — mínimo {MIN_PHOTOS}
          </Label>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {photos.map((url) => (
              <div
                key={url}
                className="group relative aspect-square overflow-hidden rounded-xl border border-[#ECE4DB]"
              >
                <Image src={url} alt="Foto del anuncio" fill sizes="120px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  aria-label="Quitar foto"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
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
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => void handleFiles(e.target.files)}
          />
          <FieldError message={errors.photos?.message} />
        </div>

        {/* Título + descripción */}
        <div className="space-y-1.5">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            placeholder='Ej. Cemento CPC 30R — 38 sacos sobrantes'
            className="h-11"
            aria-invalid={!!errors.title}
            {...register("title")}
          />
          <FieldError message={errors.title?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Descripción</Label>
          <textarea
            id="description"
            rows={4}
            placeholder="Condición real, motivo de venta, detalles de entrega…"
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...register("description")}
          />
          <FieldError message={errors.description?.message} />
        </div>

        {/* Categoría / condición */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-invalid={!!errors.category}>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {LISTING_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CATEGORY_LABEL[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.category?.message} />
          </div>
          <div className="space-y-1.5">
            <Label>Condición</Label>
            <Controller
              control={control}
              name="condition"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-invalid={!!errors.condition}>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {LISTING_CONDITIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CONDITION_META[c].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.condition?.message} />
          </div>
        </div>

        {/* Precio */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Tipo de precio</Label>
            <Controller
              control={control}
              name="priceType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICE_TYPE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="priceMxn">
              {priceType === "renta_diaria" ? "Precio por día (MXN)" : "Precio (MXN)"}
            </Label>
            <Input
              id="priceMxn"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              placeholder="0.00"
              className="h-11 font-mono"
              aria-invalid={!!errors.priceMxn}
              {...register("priceMxn")}
            />
            <FieldError message={errors.priceMxn?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quantity">Cantidad</Label>
            <Input
              id="quantity"
              type="number"
              inputMode="numeric"
              min={1}
              className="h-11 font-mono"
              aria-invalid={!!errors.quantity}
              {...register("quantity")}
            />
            <FieldError message={errors.quantity?.message} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="unit">Unidad</Label>
            <Input
              id="unit"
              placeholder="sacos · día · m³ · pzas"
              className="h-11"
              aria-invalid={!!errors.unit}
              {...register("unit")}
            />
            <FieldError message={errors.unit?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brand">Marca (opcional)</Label>
            <Input id="brand" className="h-11" {...register("brand")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="model">Modelo (opcional)</Label>
            <Input id="model" className="h-11" {...register("model")} />
          </div>
        </div>

        {/* Ubicación */}
        <div className="space-y-1.5 sm:max-w-[240px]">
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

        {/* Entrega */}
        <div className="space-y-3 rounded-xl border border-[#ECE4DB] bg-superficie p-4">
          <div className="text-[13px] font-extrabold uppercase tracking-[.05em] text-ink">
            Entrega
          </div>
          <label className="flex items-center gap-2.5 text-sm text-ink">
            <Controller
              control={control}
              name="pickupDisponible"
              render={({ field }) => (
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            Recolección en sitio
          </label>
          <label className="flex items-center gap-2.5 text-sm text-ink">
            <Controller
              control={control}
              name="fleteDisponible"
              render={({ field }) => (
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            Flete disponible
          </label>
          {fleteDisponible && (
            <div className="space-y-4 pl-7">
              <div className="space-y-1.5 sm:max-w-[220px]">
                <Label htmlFor="fletePrecioMxn">Precio del flete (MXN)</Label>
                <Input
                  id="fletePrecioMxn"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  className="h-10 font-mono"
                  aria-invalid={!!errors.fletePrecioMxn}
                  {...register("fletePrecioMxn")}
                />
                <FieldError message={errors.fletePrecioMxn?.message} />
              </div>

              {/* Perfil de carga → matching de fleteros (§6.2) */}
              <div className="space-y-1.5">
                <Label>Categoría de manejo</Label>
                <div className="flex flex-wrap gap-2">
                  {CARGO_CATEGORY_OPTIONS.map((o) => {
                    const active = cargoCategory === o.value;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        title={o.examples}
                        onClick={() =>
                          setValue("cargoCategory", o.value, {
                            shouldValidate: true,
                          })
                        }
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
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
                {suggestion && suggestion !== cargoCategory && (
                  <button
                    type="button"
                    onClick={() =>
                      setValue("cargoCategory", suggestion, {
                        shouldValidate: true,
                      })
                    }
                    className="text-xs font-semibold text-brand-strong hover:underline"
                  >
                    Sugerencia según el título: {cargoCategoryLabel(suggestion)} →
                  </button>
                )}
                <FieldError message={errors.cargoCategory?.message} />
              </div>

              {isBulk ? (
                <div className="grid grid-cols-2 gap-4 sm:max-w-[340px]">
                  <div className="space-y-1.5">
                    <Label htmlFor="weightKg">Peso total (kg)</Label>
                    <Input
                      id="weightKg"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      className="h-10 font-mono"
                      aria-invalid={!!errors.weightKg}
                      {...register("weightKg")}
                    />
                    <FieldError message={errors.weightKg?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cargoVolumeM3">Volumen total (m³)</Label>
                    <Input
                      id="cargoVolumeM3"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.1"
                      className="h-10 font-mono"
                      {...register("cargoVolumeM3")}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="unitWeightKg">Peso x unidad (kg)</Label>
                      <Input
                        id="unitWeightKg"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        className="h-10 font-mono"
                        aria-invalid={!!errors.unitWeightKg}
                        {...register("unitWeightKg")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="unitLengthM">Largo (m)</Label>
                      <Input
                        id="unitLengthM"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        className="h-10 font-mono"
                        aria-invalid={!!errors.unitLengthM}
                        {...register("unitLengthM")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="unitWidthM">Ancho (m)</Label>
                      <Input
                        id="unitWidthM"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        className="h-10 font-mono"
                        {...register("unitWidthM")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="unitHeightM">Alto (m)</Label>
                      <Input
                        id="unitHeightM"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        className="h-10 font-mono"
                        {...register("unitHeightM")}
                      />
                    </div>
                  </div>
                  <FieldError message={errors.unitWeightKg?.message} />
                  <FieldError message={errors.unitLengthM?.message} />
                  {computedTotalKg != null && (
                    <p className="font-mono text-[12.5px] tabular-nums text-ink">
                      Total calculado:{" "}
                      <strong>
                        {computedTotalKg.toLocaleString("es-MX")} kg
                      </strong>
                      {computedTotalM3 != null && (
                        <>
                          {" "}
                          · <strong>{computedTotalM3.toLocaleString("es-MX")} m³</strong>
                        </>
                      )}{" "}
                      ({qty} {qty === 1 ? "unidad" : "unidades"}) — con esto se
                      calculan los viajes del flete
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Equipamiento que requiere el envío</Label>
                <div className="flex flex-wrap gap-2">
                  {SPECIAL_EQUIPMENT_OPTIONS.map((o) => {
                    const active = requiresEquipment.includes(o.value);
                    return (
                      <button
                        key={o.value}
                        type="button"
                        title={o.description}
                        onClick={() =>
                          setValue(
                            "requiresEquipment",
                            (active
                              ? requiresEquipment.filter((v) => v !== o.value)
                              : [...requiresEquipment, o.value]) as never,
                            { shouldValidate: true }
                          )
                        }
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
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
              </div>

              {carrierCount != null && (
                <p
                  className={cn(
                    "text-[13px] font-semibold",
                    carrierCount > 0 ? "text-exito" : "text-advertencia"
                  )}
                >
                  {carrierCount > 0
                    ? `Hay ${carrierCount} fletero${carrierCount === 1 ? "" : "s"} que ${carrierCount === 1 ? "puede" : "pueden"} transportar esto`
                    : "Aún no hay fleteros compatibles con esta carga — tu anuncio igual se publica"}
                </p>
              )}
            </div>
          )}
          <FieldError message={errors.pickupDisponible?.message} />
        </div>

        {/* RCD */}
        <div className="space-y-3 rounded-xl border border-[#ECE4DB] bg-superficie p-4">
          <label className="flex items-center gap-2.5 text-sm text-ink">
            <Controller
              control={control}
              name="esRcd"
              render={({ field }) => (
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            Es residuo de construcción y demolición (RCD)
          </label>
          {esRcd && (
            <div className="space-y-1.5 pl-7 sm:max-w-[220px]">
              <Label htmlFor="volumenM3">Volumen (m³)</Label>
              <Input
                id="volumenM3"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                className="h-10 font-mono"
                aria-invalid={!!errors.volumenM3}
                {...register("volumenM3")}
              />
              <FieldError message={errors.volumenM3?.message} />
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            size="lg"
            className="flex-1"
            disabled={isSubmitting || uploading}
            onClick={handleSubmit((v) => submit(v, "active"))}
          >
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isEdit ? "Guardar cambios" : "Publicar"}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            disabled={isSubmitting || uploading}
            onClick={handleSubmit((v) => submit(v, "draft"))}
          >
            Guardar borrador
          </Button>
        </div>
      </form>
    </div>
  );
}
