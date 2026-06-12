import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta de Remnak.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { reset?: string; redirect?: string };
}) {
  return <LoginForm resetOk={searchParams.reset === "ok"} />;
}
