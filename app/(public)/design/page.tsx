import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMXN } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sistema de diseño",
  robots: { index: false, follow: false },
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-display text-2xl tracking-tight">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="space-y-1.5">
      <div className={`h-16 rounded-md border ${className}`} />
      <p className="font-mono text-xs text-muted-foreground">{name}</p>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-14 px-6 py-16">
      <header className="space-y-3 border-b pb-8">
        <Badge variant="outline">v0 · Sprint 0</Badge>
        <h1 className="font-display text-5xl tracking-tight">
          REM<span className="text-brand">NAK</span> · Sistema de diseño
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Tokens, tipografía y componentes base. Naranja constructor{" "}
          <span className="font-mono text-foreground">#F26B2C</span> sobre canvas
          cálido. Esta página es la referencia viva de{" "}
          <span className="font-mono text-foreground">DESIGN-SYSTEM.md</span>.
        </p>
      </header>

      <Section
        title="Tipografía"
        description="Archivo Black (display) · Hanken Grotesk (UI) · JetBrains Mono (montos)."
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="font-display text-4xl tracking-tight">
              Nada sobra.
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              font-display — Archivo Black
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-lg">
              Marketplace de materiales de construcción, maquinaria y fletes.
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              font-sans — Hanken Grotesk
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-mono text-lg tabular-nums">
              {formatMXN(12450.5)}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              font-mono tabular-nums — JetBrains Mono
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Color"
        description="Tokens semánticos HSL. Soportan tema claro y oscuro."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Swatch name="primary / brand" className="bg-primary" />
          <Swatch name="foreground (ink)" className="bg-foreground" />
          <Swatch name="secondary" className="bg-secondary" />
          <Swatch name="muted" className="bg-muted" />
          <Swatch name="success" className="bg-success" />
          <Swatch name="warning" className="bg-warning" />
          <Swatch name="destructive" className="bg-destructive" />
          <Swatch name="border" className="bg-border" />
        </div>
      </Section>

      <Section title="Botones" description="Variantes y tamaños.">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Publicar</Button>
          <Button variant="secondary">Guardar borrador</Button>
          <Button variant="outline">Cancelar</Button>
          <Button variant="ghost">Ver más</Button>
          <Button variant="destructive">Eliminar</Button>
          <Button variant="link">Términos</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Pequeño</Button>
          <Button size="default">Normal</Button>
          <Button size="lg">Grande</Button>
          <Button disabled>Deshabilitado</Button>
        </div>
      </Section>

      <Section
        title="Insignias"
        description="Mapeo a estados reales del marketplace."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="success">verified</Badge>
          <Badge variant="warning">pending</Badge>
          <Badge variant="destructive">rejected</Badge>
          <Badge>active</Badge>
          <Badge variant="secondary">draft</Badge>
          <Badge variant="outline">sobrante</Badge>
        </div>
      </Section>

      <Section title="Formulario" description="Input + Label con foco de marca.">
        <div className="grid max-w-sm gap-2">
          <Label htmlFor="precio">Precio (MXN)</Label>
          <Input id="precio" type="number" placeholder="0.00" />
          <p className="text-xs text-muted-foreground">
            Montos en pesos. Conversión a centavos solo en la frontera Stripe.
          </p>
        </div>
      </Section>

      <Section title="Tarjeta" description="Contenedor base para listings.">
        <Card className="max-w-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">materiales</Badge>
              <Badge variant="success">verified</Badge>
            </div>
            <CardTitle className="pt-2">Cemento CPC 30R — 40 sacos</CardTitle>
            <CardDescription>Sobrante de obra · Mérida, Yuc.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl tabular-nums">
              {formatMXN(3200)}
            </p>
          </CardContent>
          <CardFooter className="gap-2">
            <Button className="flex-1">Comprar</Button>
            <Button variant="outline">Guardar</Button>
          </CardFooter>
        </Card>
      </Section>
    </main>
  );
}
