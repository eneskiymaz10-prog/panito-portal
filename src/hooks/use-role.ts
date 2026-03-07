"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/supabase/types";

interface UserProfile {
  id: string;
  role: UserRole;
  company_name: string | null;
  language: string;
}

export function useRole() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function getProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, role, company_name, language")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data as UserProfile);
      }
      setLoading(false);
    }

    getProfile();
  }, []);

  return { profile, loading, role: profile?.role ?? null };
}
