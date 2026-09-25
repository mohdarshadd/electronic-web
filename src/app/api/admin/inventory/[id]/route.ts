import type { NextRequest } from "next/server";
import { isAdminRequest } from "../../guard";
import { applyOverride, getLiveProduct, loadOverrides } from "@/lib/inventory";
import type { StockOverride } from "@/lib/inventory";
import { markNotifiedForProduct } from "@/lib/restock-requests";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = (await ctx.params).id;
  const body = (await req.json().catch(() => null)) as StockOverride | null;
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const before = getLiveProduct(id);
    const product = applyOverride(id, body);
    if (!product) return Response.json({ error: "Product not found" }, { status: 404 });
    let notifiedCount = 0;
    if (product.inStock && before && !before.inStock) {
      notifiedCount = markNotifiedForProduct(id);
    }
    return Response.json({ product, override: loadOverrides()[id] ?? null, notifiedCount });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Invalid values" }, { status: 400 });
  }
}