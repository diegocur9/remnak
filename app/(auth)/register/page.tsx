import type { Metadata } from "next";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description:
    "Únete a Remnak: compra y vende materiales de construcción, maquinaria y fletes.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
