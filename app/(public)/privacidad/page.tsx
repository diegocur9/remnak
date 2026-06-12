import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description:
    "Aviso de privacidad de Remnak conforme a la LFPDPPP. Cómo tratamos tus datos personales.",
};

export default function PrivacidadPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl tracking-tight text-ink">
        Aviso de privacidad
      </h1>
      <p className="mt-2 text-sm text-texto-suave">
        Última actualización: {new Date().getFullYear()}
      </p>

      <div className="prose-remnak mt-8 space-y-6 text-ink [&_h2]:font-display [&_h2]:text-xl [&_h2]:tracking-tight [&_p]:text-[15px] [&_p]:leading-relaxed [&_p]:text-texto-suave">
        <p>
          Remnak (&ldquo;nosotros&rdquo;) es responsable del tratamiento de tus
          datos personales conforme a la Ley Federal de Protección de Datos
          Personales en Posesión de los Particulares (LFPDPPP), su Reglamento y
          los Lineamientos del Aviso de Privacidad.
        </p>

        <section className="space-y-2">
          <h2>Datos que recabamos</h2>
          <p>
            Nombre completo, correo electrónico, teléfono, municipio y, cuando
            corresponde, datos de verificación de identidad (INE, CURP) y datos
            fiscales (RFC, régimen, uso de CFDI) para la emisión de comprobantes.
          </p>
        </section>

        <section className="space-y-2">
          <h2>Finalidades</h2>
          <p>
            Crear y administrar tu cuenta, operar el marketplace (compras, ventas,
            rentas y fletes), procesar pagos en garantía (escrow), emitir CFDI 4.0,
            prevenir fraude y dar soporte. No usamos tus datos para fines distintos
            sin tu consentimiento.
          </p>
        </section>

        <section className="space-y-2">
          <h2>Derechos ARCO</h2>
          <p>
            Puedes ejercer tus derechos de Acceso, Rectificación, Cancelación y
            Oposición, así como revocar tu consentimiento, escribiendo a
            privacidad@remnak.com.mx.
          </p>
        </section>

        <section className="space-y-2">
          <h2>Conservación</h2>
          <p>
            Conservamos tus datos el tiempo necesario para cumplir las finalidades
            y las obligaciones legales y fiscales aplicables. Los mensajes dentro
            de órdenes tienen un periodo de retención limitado.
          </p>
        </section>

        <p className="text-xs">
          Este es un documento preliminar para el piloto y será sustituido por la
          versión legal definitiva antes del lanzamiento comercial.
        </p>
      </div>
    </article>
  );
}
