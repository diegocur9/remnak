import type { Database } from "@/types/database";

type FlagReason = Database["public"]["Enums"]["message_flag_reason"];

/**
 * Moderación de chat anti-fuga (guía MVP §6.3). SIEMPRE server-side:
 * content (original) → content_clean (filtrado). Nunca confiar en cliente.
 */

const PATTERNS: { reason: FlagReason; re: RegExp; label: string }[] = [
  {
    reason: "email",
    re: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    label: "correo",
  },
  {
    // WhatsApp antes que teléfono para reportar la razón más específica.
    reason: "whatsapp",
    re: /(?:wa\.me\/|whatsapp\.com\/|\bwhats?app\b|\bwa\b[:.]?\s*\+?\d)/gi,
    label: "WhatsApp",
  },
  {
    // Teléfonos MX: 10 dígitos con separadores opcionales, +52 opcional.
    reason: "phone",
    re: /(?:\+?52[\s.-]?)?(?:\(?\d{2,3}\)?[\s.-]?)\d{3}[\s.-]?\d{2}[\s.-]?\d{2}(?:[\s.-]?\d{2})?/g,
    label: "teléfono",
  },
  {
    // URLs externas (remnak.com whitelisted).
    reason: "external_url",
    re: /https?:\/\/(?!(?:www\.)?remnak\.com)[^\s]+|(?:www\.)(?!remnak\.com)[^\s]+/gi,
    label: "enlace externo",
  },
  {
    // Dirección: calle + número (+ colonia/CP heurístico).
    reason: "address",
    re: /\b(?:calle|av(?:enida)?\.?|blvd\.?|carretera|privada|andador)\s+[^\s,]{2,}\s*(?:#|no\.?|núm\.?|numero)?\s*\d{1,5}\b|\bc\.?p\.?\s*\d{5}\b/gi,
    label: "dirección",
  },
];

export interface ModerationResult {
  /** Texto con los datos sensibles sustituidos por [bloqueado]. */
  clean: string;
  flagged: boolean;
  /** true si el mensaje era esencialmente el dato de contacto (se oculta entero). */
  blocked: boolean;
  reason: FlagReason | null;
  detail: string | null;
}

const MASK = "[bloqueado]";

export function moderateMessage(content: string): ModerationResult {
  let clean = content;
  let reason: FlagReason | null = null;
  const details: string[] = [];
  let maskedChars = 0;

  for (const p of PATTERNS) {
    clean = clean.replace(p.re, (m) => {
      reason = reason ?? p.reason;
      if (!details.includes(p.label)) details.push(p.label);
      maskedChars += m.length;
      return MASK;
    });
  }

  const flagged = reason !== null;
  // Si lo enmascarado domina el mensaje, bloquéalo entero.
  const blocked =
    flagged && maskedChars / Math.max(content.trim().length, 1) > 0.5;

  return {
    clean,
    flagged,
    blocked,
    reason,
    detail: details.length ? `Detectado: ${details.join(", ")}` : null,
  };
}

/** Strikes: mensajes flaggeados del usuario en las últimas 24 h. */
export const STRIKE_WINDOW_HOURS = 24;
export const STRIKE_LIMIT = 3;
