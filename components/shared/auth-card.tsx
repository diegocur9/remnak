import { cn } from "@/lib/utils";

/** Tarjeta contenedora de los formularios de autenticación. */
export function AuthCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-superficie p-6 shadow-sm sm:p-8",
        className
      )}
    >
      <div className="mb-6 space-y-1.5">
        <h1 className="font-display text-2xl tracking-tight text-ink">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-texto-suave">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/** Mensaje de error de campo (rojo, accesible). */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs font-medium text-error">
      {message}
    </p>
  );
}
