import { getCountrySeries, slugToEntity } from "@/lib/owid";
import { NextResponse } from "next/server";

export const revalidate = 86400; // 24h

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const entity = await slugToEntity(slug);
  const data = await getCountrySeries(entity);
  
  if (!data) {
    return NextResponse.json({ error: "Country not found" }, { status: 404 });
  }
  
  return NextResponse.json(data);
}
