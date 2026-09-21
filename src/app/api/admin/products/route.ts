import type { NextRequest } from "next/server";
import { isAdminRequest } from "../guard";
import { createCustomProduct, loadCustomProducts, type CustomProductInput } from "@/lib/custom-products";
import { writeProductSvg } from "@/lib/product-image";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json({ products: loadCustomProducts() });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as CustomProductInput | null;
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  try {
    const product = createCustomProduct(body);
    writeProductSvg(product);
    return Response.json({ product }, { status: 201 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Invalid product data" }, { status: 400 });
  }
}