import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Only admins can invite
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { email, company_name, country, contact_phone, address } = body;

  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Invite user — Supabase sends a magic link email
  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    email,
    {
      data: {
        role: "buyer",
        company_name,
      },
    }
  );

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  // Create the profile record immediately so admin can set pricing, etc.
  if (inviteData.user) {
    await adminClient.from("profiles").upsert({
      id: inviteData.user.id,
      role: "buyer",
      company_name: company_name || null,
      country: country || null,
      contact_email: email,
      contact_phone: contact_phone || null,
      address: address || null,
      language: "en",
    });
  }

  return NextResponse.json({ success: true });
}
