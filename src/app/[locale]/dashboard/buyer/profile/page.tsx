"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
    }
    load();
  }, []);

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({
      company_name: profile.company_name,
      country: profile.country,
      contact_email: profile.contact_email,
      contact_phone: profile.contact_phone,
      address: profile.address,
    }).eq("id", profile.id);
    if (error) { toast.error("Failed to update"); setSaving(false); return; }
    toast.success("Profile updated");
    setSaving(false);
    router.refresh();
  }

  if (!profile) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("companyName")}</Label>
              <Input value={profile.company_name || ""} onChange={(e) => setProfile({...profile, company_name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>{t("country")}</Label>
              <Input value={profile.country || ""} onChange={(e) => setProfile({...profile, country: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>{t("contactEmail")}</Label>
              <Input value={profile.contact_email || ""} onChange={(e) => setProfile({...profile, contact_email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>{t("contactPhone")}</Label>
              <Input value={profile.contact_phone || ""} onChange={(e) => setProfile({...profile, contact_phone: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("address")}</Label>
            <Textarea value={profile.address || ""} onChange={(e) => setProfile({...profile, address: e.target.value})} />
          </div>
          <Button onClick={saveProfile} disabled={saving}>
            {saving ? "..." : t("updateProfile")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
