"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { OrderStatus } from "@/lib/supabase/types";
import { CheckCircle, XCircle } from "lucide-react";

export function OrderActions({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const t = useTranslations("orders");
  const router = useRouter();

  async function confirmOrder() {
    const res = await fetch(`/api/orders/${orderId}/confirm`, { method: "POST" });
    if (!res.ok) {
      toast.error("Failed to confirm order");
      return;
    }
    toast.success(t("orderConfirmed"));
    router.refresh();
  }

  async function updateStatus(status: OrderStatus) {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error("Failed to update order");
      return;
    }
    toast.success("Order updated");
    router.refresh();
  }

  if (currentStatus === "submitted") {
    return (
      <div className="flex gap-2">
        <Button onClick={confirmOrder} size="sm">
          <CheckCircle className="mr-2 h-4 w-4" />
          {t("confirmOrder")}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => updateStatus("cancelled")}
        >
          <XCircle className="mr-2 h-4 w-4" />
          {t("rejectOrder")}
        </Button>
      </div>
    );
  }

  if (currentStatus === "cancelled" || currentStatus === "paid") {
    return null;
  }

  return null;
}
