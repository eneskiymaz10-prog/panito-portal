"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function toggleLocale() {
    const newLocale = locale === "en" ? "tr" : "en";
    // Replace the locale segment in the pathname
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggleLocale} className="gap-2">
      <Globe className="h-4 w-4" />
      {locale === "en" ? "TR" : "EN"}
    </Button>
  );
}
