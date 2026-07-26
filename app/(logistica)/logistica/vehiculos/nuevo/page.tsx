import type { Metadata } from "next";

import { VehicleForm } from "@/components/marketplace/vehicle-form";
import { getSessionProfile } from "@/lib/auth/profile";

export const metadata: Metadata = { title: "Registrar vehículo" };

export default async function NuevoVehiculoPage() {
  const { profile } = await getSessionProfile();
  if (!profile) return null; // el layout ya redirige

  return <VehicleForm userId={profile.id} />;
}
