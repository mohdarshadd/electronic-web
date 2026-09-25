import type { NextRequest } from "next/server";
import { getCatalogProductById } from "@/lib/catalog";
import { addRestockRequest } from "@/lib/restock-requests";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { email?: unknown; productId?: unknown }
    | null;
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const productId = typeof body.productId === "string" ? body.productId.trim() : "";
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  if (!productId) {
    return Response.json({ error: "Product is required" }, { status: 400 });
  }

  const product = getCatalogProductById(productId);
  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }
  if (product.inStock) {
    return Response.json({ error: "This product is back in stock" }, { status: 409 });
  }

  const request = addRestockRequest({
    productId,
    productSlug: product.slug,
    productName: product.name,
    email,
  });
  return Response.json({ ok: true, request });
}