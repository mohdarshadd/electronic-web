import type { NextRequest } from "next/server";
import { isAdminRequest } from "../../../guard";
import { getCustomProduct, setProductDatasheet } from "@/lib/custom-products";
import { deleteDatasheet, writeDatasheet } from "@/lib/datasheet";

const MAX_BYTES = 20 * 1024 * 1024;

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = (await ctx.params).id;
  const product = getCustomProduct(id);
  if (!product) return Response.json({ error: "Product not found" }, { status: 404 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string" || !(file instanceof File)) {
    return Response.json({ error: "Upload a PDF file in the 'file' field" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return Response.json({ error: "Only PDF datasheets are supported" }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer().catch(() => new ArrayBuffer(0)));
  if (buffer.length === 0) return Response.json({ error: "The uploaded file is empty" }, { status: 400 });
  if (buffer.length > MAX_BYTES) return Response.json({ error: "Datasheet must be 20 MB or smaller" }, { status: 413 });

  writeDatasheet(product.slug, buffer);
  const updated = setProductDatasheet(id, "pdf");
  return Response.json({ product: updated });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = (await ctx.params).id;
  const product = getCustomProduct(id);
  if (!product) return Response.json({ error: "Product not found" }, { status: 404 });

  deleteDatasheet(product.slug);
  const updated = setProductDatasheet(id, undefined);
  return Response.json({ product: updated });
}