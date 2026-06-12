# DESIGN-SYSTEM.md — Remnak

Fuente de verdad del diseño. Si algo aquí contradice al scaffold, **manda este
archivo** (ver CLAUDE.md → "Design system"). Referencia viva renderizada en
`/design` (`app/(public)/design/page.tsx`).

## Concepto

Naranja constructor **#F26B2C** sobre **ink/negro**, con **canvas cálido**
(papel ligeramente tostado, no blanco puro). Industrial, legible, confiable.
UI en español MX; código en inglés.

## Tipografía

| Rol     | Familia          | Variable CSS     | Clase Tailwind | Uso                          |
| ------- | ---------------- | ---------------- | -------------- | ---------------------------- |
| Display | Archivo Black    | `--font-display` | `font-display` | Wordmark, títulos hero       |
| UI      | Hanken Grotesk   | `--font-sans`    | `font-sans`    | Texto general, controles     |
| Mono    | JetBrains Mono   | `--font-mono`    | `font-mono`    | Montos, RFC, IDs, datos      |

Cargadas con `next/font/google` en `app/layout.tsx` (Next 14). Los montos usan
`font-mono` + `.tabular-nums` para alinear cifras en columnas.

## Color (tokens semánticos)

Definidos como HSL en `app/globals.css` (`:root` y `.dark`) y expuestos en
`tailwind.config.ts`. **Usar siempre el token, nunca el hex crudo.**

| Token                   | Clase             | Claro (HSL)     | Significado                       |
| ----------------------- | ----------------- | --------------- | --------------------------------- |
| `--primary` / brand     | `bg-primary`      | `19 88% 56%`    | #F26B2C — marca, CTA principal    |
| `--brand`               | `text-brand`      | `19 88% 56%`    | Alias de marca (wordmark)         |
| `--background`          | `bg-background`   | `30 40% 98%`    | Canvas cálido                     |
| `--foreground`          | `text-foreground` | `20 14% 12%`    | Ink (texto)                       |
| `--secondary`           | `bg-secondary`    | `30 20% 94%`    | Superficie sutil                  |
| `--muted-foreground`    | —                 | `20 8% 42%`     | Texto secundario                  |
| `--success`             | `bg-success`      | `142 60% 38%`   | Verificado / pagado               |
| `--warning`             | `bg-warning`      | `38 92% 50%`    | Pendiente                         |
| `--destructive`         | `bg-destructive`  | `0 72% 51%`     | Error / rechazado / eliminar      |
| `--border` / `--input`  | `border-border`   | `28 18% 88%`    | Bordes y campos                   |
| `--ring`                | `ring-ring`       | `19 88% 56%`    | Foco de teclado (marca)           |

Tema oscuro: ink/negro dominante (`--background: 20 14% 8%`). Toggle por clase
`.dark` (`darkMode: ["class"]`).

Radio base: `--radius: 0.5rem` (`rounded-lg/md/sm` derivados).

> ⚠️ No nombrar tokens de color `constructor`, `prototype` ni `__proto__`:
> colisionan con `Object.prototype` en la resolución de Tailwind y rompen el
> build (`text-constructor` → `font-size: function Object()`). Por eso el alias
> de marca se llama `brand`.

## Componentes base (`components/ui/`)

Convención: los que envuelven inputs usan `React.forwardRef` (regla CLAUDE.md).

| Componente | Export(s)                                                        | Notas                                            |
| ---------- | --------------------------------------------------------------- | ------------------------------------------------ |
| `button`   | `Button`, `buttonVariants`                                      | Variantes: default/secondary/outline/ghost/destructive/link · tamaños sm/default/lg/icon. Sin Slot: para links usar `<Link className={buttonVariants()}>`. |
| `input`    | `Input`                                                         | forwardRef.                                      |
| `label`    | `Label`                                                         | forwardRef. `<label>` nativo estilizado.         |
| `card`     | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | Contenedor base de listings.   |
| `badge`    | `Badge`, `badgeVariants`                                        | Variantes mapeadas a estados: success/warning/destructive/default/secondary/outline. |

## Mapeo de estados → variantes (enums reales)

- `verification_status`: `verified` → success · `pending` → warning · `rejected` → destructive.
- `listing_status`: `active` → default · `draft`/`paused` → secondary · `flagged` → destructive.
- `order_status`: `paid`/`completed` → success · `pending`/`in_transit` → warning · `disputed`/`cancelled` → destructive.

## Dinero

`formatMXN(amount)` en `lib/utils.ts` →
`Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN' })`.
Columnas en **pesos** (no centavos); conversión a centavos solo en la frontera
Stripe (`Math.round(pesos * 100)`). Render con `font-mono tabular-nums`.

## Pendiente (siguientes iteraciones)

Al instalarse el resto del stack: TanStack Query + Sonner Toaster en
`components/shared/providers.tsx`; primitivas con Radix (select, dialog,
dropdown, toast) vía shadcn; `framer-motion` para transiciones.
