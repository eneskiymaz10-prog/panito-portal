"use client";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { PieLabelRenderProps, PieLabel } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
}

export interface OrdersByStatusData {
  status: string;
  count: number;
}

export interface TopProductData {
  name: string;
  revenue: number;
}

interface SalesChartsProps {
  monthlyRevenue: MonthlyRevenueData[];
  ordersByStatus: OrdersByStatusData[];
  topProducts: TopProductData[];
}

const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  submitted: "#f59e0b",
  confirmed: "#3b82f6",
  in_production: "#8b5cf6",
  manufactured: "#6366f1",
  packed: "#14b8a6",
  invoiced: "#f97316",
  paid: "#22c55e",
  cancelled: "#ef4444",
};

const PIE_FALLBACK_COLORS = [
  "#3b82f6",
  "#f59e0b",
  "#22c55e",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#94a3b8",
];

const PRODUCT_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#14b8a6",
  "#f59e0b",
  "#ef4444",
];

function formatStatusLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function SalesCharts({
  monthlyRevenue,
  ordersByStatus,
  topProducts,
}: SalesChartsProps) {
  return (
    <div className="space-y-6">
      {/* Monthly Revenue Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={monthlyRevenue}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  tickFormatter={(value: number) =>
                    new Intl.NumberFormat("en-US", {
                      notation: "compact",
                      compactDisplay: "short",
                    }).format(value)
                  }
                />
                <Tooltip
                  formatter={(value) => [
                    new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(value as number),
                    "Revenue",
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-10">
              No revenue data available.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Orders by Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={((props: PieLabelRenderProps) =>
                      `${formatStatusLabel(String((props as any).status ?? ""))} (${(props as any).count})`
                    ) as PieLabel}
                  >
                    {ordersByStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          STATUS_COLORS[entry.status] ||
                          PIE_FALLBACK_COLORS[index % PIE_FALLBACK_COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      value as number,
                      formatStatusLabel(String(name)),
                    ]}
                  />
                  <Legend
                    formatter={(value: string) => formatStatusLabel(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-10">
                No order data available.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Products by Revenue Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={topProducts}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    tickFormatter={(value: number) =>
                      new Intl.NumberFormat("en-US", {
                        notation: "compact",
                        compactDisplay: "short",
                      }).format(value)
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    width={120}
                  />
                  <Tooltip
                    formatter={(value) => [
                      new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(value as number),
                      "Revenue",
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    radius={[0, 4, 4, 0]}
                  >
                    {topProducts.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PRODUCT_COLORS[index % PRODUCT_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-10">
                No product data available.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
