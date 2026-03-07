"use client";

import { useTranslations } from "next-intl";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { NotificationBell } from "./notification-bell";
import { LanguageToggle } from "./language-toggle";

export function AppHeader() {
  const t = useTranslations("common");

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex-1" />
      <LanguageToggle />
      <NotificationBell />
    </header>
  );
}
