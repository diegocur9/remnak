"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { resendOtpAction, verifyOtpAction } from "@/app/(auth)/actions";
import { AuthCard } from "@/components/shared/auth-card";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";
import { OTP_LENGTH, OTP_RESEND_COOLDOWN_SECONDS } from "@/lib/constants";

export function VerifyForm({ email }: { email: string }) {
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(OTP_RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const submit = useCallback(
    async (value: string) => {
      if (value.length !== OTP_LENGTH || submitting) return;
      setSubmitting(true);
      const result = await verifyOtpAction({ email, token: value });
      // En éxito la acción redirige; si volvemos, hubo error.
      if (result?.error) {
        toast.error(result.error);
        setToken("");
      }
      setSubmitting(false);
    },
    [email, submitting]
  );

  async function resend() {
    if (cooldown > 0) return;
    const result = await resendOtpAction(email);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Enviamos un nuevo código.");
    setCooldown(OTP_RESEND_COOLDOWN_SECONDS);
  }

  return (
    <AuthCard
      title="Verifica tu correo"
      description={
        <>
          Ingresa el código de {OTP_LENGTH} dígitos que enviamos a{" "}
          <span className="font-semibold text-ink">{email}</span>.
        </>
      }
    >
      <div className="space-y-6">
        <OtpInput
          length={OTP_LENGTH}
          value={token}
          onChange={setToken}
          onComplete={submit}
          disabled={submitting}
          autoFocus
        />

        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={submitting || token.length !== OTP_LENGTH}
          onClick={() => submit(token)}
        >
          {submitting && <Loader2 className="animate-spin" />}
          Verificar
        </Button>

        <p className="text-center text-sm text-texto-suave">
          ¿No recibiste el código?{" "}
          <button
            type="button"
            onClick={resend}
            disabled={cooldown > 0}
            className="font-semibold text-brand hover:underline disabled:cursor-not-allowed disabled:text-texto-suave disabled:no-underline"
          >
            {cooldown > 0 ? `Reenviar en ${cooldown}s` : "Reenviar código"}
          </button>
        </p>
      </div>
    </AuthCard>
  );
}
