"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/supabase/types";

const statusColors: Record<OrderStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  submitted: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  in_production: "bg-yellow-100 text-yellow-700",
  manufactured: "bg-orange-100 text-orange-700",
  packed: "bg-purple-100 text-purple-700",
  invoiced: "bg-cyan-100 text-cyan-700",
  paid: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusKeys: Record<OrderStatus, string> = {
  draft: "statusDraft",
  submitted: "statusSubmitted",
  confirmed: "statusConfirmed",
  in_production: "statusInProduction",
  manufactured: "statusManufactured",
  packed: "statusPacked",
  invoiced: "statusInvoiced",
  paid: "statusPaid",
  cancelled: "statusCancelled",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations("orders");

  return (
    <Badge variant="outline" className={statusColors[status]}>
      {t(statusKeys[status])}
    </Badge>
  );
}
