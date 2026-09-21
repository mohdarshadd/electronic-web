import type { NextRequest } from "next/server";
import { isAdminRequest } from "../../guard";
import {
  deleteCustomProduct,
  getCustomProduct,
  loadCustomProducts,
  updateCustomProduct,
  type CustomProductPatch,
} from "@/lib/custom-products";
import { deleteProductSvg, writeProductSvg } from "@/lib/product-image";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = (await ctx.params).id;
  const body = (await req.json().catch(() => null)) as CustomProductPatch | null;
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const before = getCustomProduct(id);
  if (!before) return Response.json({ error: "Product not found" }, { status: 404 });

  if (Object.keys(body).length === 0) {
    return Response.json({ product: before });
  }

  try {
    const updated = updateCustomProduct(id, body);
    if (!updated) return Response.json({ error: "Product not found" }, { status: 404 });
    if (updated.slug !== before.slug) deleteProductSvg(before.slug);
    writeProductSvg(updated);
    return Response.json({ product: updated });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Invalid product data" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = (await ctx.params).id;
  const product = loadCustomProducts().find((p) => p.id === id);
  if (!product) return Response.json({ error: "Product not found" }, { status: 404 });

  deleteCustomProduct(id);
  deleteProductSvg(product.slug);
  return Response.json({ ok: true });
}