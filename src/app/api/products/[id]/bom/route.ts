import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_bom")
    .select("*, raw_materials(id, name, unit)")
    .eq("product_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("product_bom")
    .insert({
      product_id: id,
      raw_material_id: body.raw_material_id,
      quantity_per_unit: body.quantity_per_unit,
    })
    .select("*, raw_materials(id, name, unit)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: _productId } = await params;
  const supabase = await createClient();
  const { bomId } = await request.json();

  const { error } = await supabase
    .from("product_bom")
    .delete()
    .eq("id", bomId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
