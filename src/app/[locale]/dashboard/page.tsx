import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardRedirect() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role || "buyer";

  switch (role) {
    case "admin":
      redirect("/dashboard/admin");
    case "production":
      redirect("/dashboard/production");
    case "accounting":
      redirect("/dashboard/accounting");
    default:
      redirect("/dashboard/buyer");
  }
}
