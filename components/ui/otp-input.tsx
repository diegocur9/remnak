"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  "aria-label"?: string;
}

/**
 * Input OTP de N dígitos (por defecto 8). Solo números.
 * Soporta pegar el código completo, retroceso y flechas.
 */
export function OtpInput({
  length = 8,
  value,
  onChange,
  onComplete,
  disabled,
  autoFocus,
  "aria-label": ariaLabel = "Código de verificación",
}: OtpInputProps) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);
  const digits = React.useMemo(
    () => Array.from({ length }, (_, i) => value[i] ?? ""),
    [value, length]
  );

  React.useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  function setDigit(index: number, digit: string) {
    const next = value.split("");
    next[index] = digit;
    const joined = next.join("").slice(0, length);
    onChange(joined);
    if (joined.length === length && !joined.includes("")) {
      onComplete?.(joined);
    }
  }

  function handleChange(
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setDigit(index, "");
      return;
    }
    // Si pegan varios dígitos, los distribuye desde la posición actual.
    if (raw.length > 1) {
      const chars = raw.slice(0, length - index).split("");
      const next = value.split("");
      chars.forEach((c, i) => {
        next[index + i] = c;
      });
      const joined = next.join("").slice(0, length);
      onChange(joined);
      const last = Math.min(index + chars.length, length - 1);
      refs.current[last]?.focus();
      if (joined.length === length && !joined.includes("")) onComplete?.(joined);
      return;
    }
    setDigit(index, raw);
    if (index < length - 1) refs.current[index + 1]?.focus();
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        setDigit(index, "");
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
        setDigit(index - 1, "");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2" role="group" aria-label={ariaLabel}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Dígito ${i + 1}`}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-12 w-9 rounded-md border border-input bg-background text-center font-mono text-lg font-semibold text-ink ring-offset-background transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 sm:w-11 sm:text-xl",
            digit && "border-brand/60"
          )}
        />
      ))}
    </div>
  );
}
