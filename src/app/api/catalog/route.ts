import { getCatalog } from "@/lib/catalog";

export async function GET() {
  return Response.json({ products: getCatalog() });
}