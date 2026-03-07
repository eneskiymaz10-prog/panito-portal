"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/routing";
import type { UserRole } from "@/lib/supabase/types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Factory,
  Boxes,
  FileText,
  Bell,
  User,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

function getNavItems(role: UserRole, t: ReturnType<typeof useTranslations>): NavItem[] {
  const base: NavItem[] = [
    {
      title: t("nav.dashboard"),
      href: `/dashboard/${role}`,
      icon: LayoutDashboard,
    },
  ];

  switch (role) {
    case "buyer":
      return [
        ...base,
        { title: t("nav.catalog"), href: "/dashboard/buyer/catalog", icon: Package },
        { title: t("nav.placeOrder"), href: "/dashboard/buyer/orders/new", icon: ShoppingCart },
        { title: t("nav.myOrders"), href: "/dashboard/buyer/orders", icon: FileText },
        { title: t("nav.myInvoices"), href: "/dashboard/buyer/invoices", icon: FileText },
        { title: t("nav.profile"), href: "/dashboard/buyer/profile", icon: User },
      ];
    case "admin":
      return [
        ...base,
        { title: t("nav.orders"), href: "/dashboard/admin/orders", icon: ShoppingCart },
        { title: t("nav.products"), href: "/dashboard/admin/products", icon: Package },
        { title: t("nav.customers"), href: "/dashboard/admin/customers", icon: Users },
        { title: t("nav.invoices"), href: "/dashboard/admin/invoices", icon: FileText },
      ];
    case "production":
      return [
        ...base,
        { title: t("nav.production"), href: "/dashboard/production", icon: Factory },
        { title: t("nav.materials"), href: "/dashboard/production/materials", icon: Boxes },
      ];
    case "accounting":
      return [
        ...base,
        { title: t("nav.invoices"), href: "/dashboard/accounting/invoices", icon: FileText },
      ];
    default:
      return base;
  }
}

export function AppSidebar({
  role,
  companyName,
  email,
}: {
  role: UserRole;
  companyName: string | null;
  email: string;
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const navItems = getNavItems(role, t);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="text-xl font-bold text-primary">PANITO</div>
        <div className="text-xs text-muted-foreground">
          {companyName || email}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.includes(item.href)}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/notifications">
                    <Bell className="h-4 w-4" />
                    <span>{t("nav.notifications")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>{t("auth.logout")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
