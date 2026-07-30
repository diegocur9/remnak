import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { OrderDetail } from "@/components/marketplace/order-detail";
import { fetchOrder } from "@/lib/marketplace/orders";
import { getSessionProfile } from "@/lib/auth/profile";

export const metadata: Metadata = { title: "Orden" };

export default async function OrdenCompradorPage({
  params,
}: {
  params: { id: string };
}) {
  const { profile } = await getSessionProfile();
  if (!profile) return null; // el layout redirige

  const order = await fetchOrder(params.id);
  if (!order || order.buyer_id !== profile.id) notFound();

  return (
    <div>
      <Link
        href="/cuenta"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-texto-suave hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Mis compras
      </Link>
      <OrderDetail order={order} meId={profile.id} role="buyer" />
    </div>
  );
}
