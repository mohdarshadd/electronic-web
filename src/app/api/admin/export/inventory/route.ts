import type { NextRequest } from "next/server";
import { isAdminRequest } from "../../guard";
import { getLiveProducts } from "@/lib/inventory";
import { toCSV, csvNow } from "@/lib/csv";
import { calcDiscount } from "@/lib/format";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows: (string | number)[][] = [
    ["ProductId", "Sku", "Name", "Brand", "Category", "Price", "MRP", "DiscountPct", "Stock", "Active", "Rated"],
    ...getLiveProducts().map((p) => [
      p.id,
      p.sku,
      p.name,
      p.brand,
      p.categorySlug,
      p.price,
      p.mrp,
      calcDiscount(p.price, p.mrp),
      p.stock,
      p.inStock ? "yes" : "no",
      p.rating,
    ]),
  ];

  return new Response(toCSV(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="voltcart-inventory-${csvNow()}.csv"`,
    },
  });
}