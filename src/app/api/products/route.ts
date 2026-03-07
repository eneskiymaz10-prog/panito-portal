import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { productSchema } from "@/lib/validations/product";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_translations(*)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("products")
    .insert(parsed.data)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Insert translations if provided
  if (body.translations) {
    for (const translation of body.translations) {
      await supabase.from("product_translations").insert({
        product_id: data.id,
        ...translation,
      });
    }
  }

  return NextResponse.json(data, { status: 201 });
}
