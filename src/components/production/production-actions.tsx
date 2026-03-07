"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { OrderStatus, ProductionStatus } from "@/lib/supabase/types";
import { Play, CheckCircle } from "lucide-react";

export function ProductionActions({
  orderId,
  productionOrderId,
  orderStatus,
  productionStatus,
}: {
  orderId: string;
  productionOrderId: string;
  orderStatus: OrderStatus;
  productionStatus: ProductionStatus;
}) {
  const t = useTranslations("production");
  const router = useRouter();

  async function startProduction() {
    const res = await fetch("/api/orders/" + orderId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "in_production" }),
    });
    if (!res.ok) { toast.error("Failed"); return; }

    await fetch("/api/production/" + productionOrderId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "in_progress", started_at: new Date().toISOString() }),
    });

    toast.success("Production started");
    router.refresh();
  }

  async function completeProduction() {
    const res = await fetch("/api/orders/" + orderId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "manufactured" }),
    });
    if (!res.ok) { toast.error("Failed"); return; }

    await fetch("/api/production/" + productionOrderId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed", completed_at: new Date().toISOString() }),
    });

    toast.success("Production completed");
    router.refresh();
  }

  if (orderStatus === "confirmed" && productionStatus === "pending") {
    return (
      <Button onClick={startProduction} size="sm">
        <Play className="mr-2 h-4 w-4" />
        {t("startProduction")}
      </Button>
    );
  }

  if (orderStatus === "in_production" && productionStatus === "in_progress") {
    return (
      <Button onClick={completeProduction} size="sm">
        <CheckCircle className="mr-2 h-4 w-4" />
        {t("completeProduction")}
      </Button>
    );
  }

  return null;
}
