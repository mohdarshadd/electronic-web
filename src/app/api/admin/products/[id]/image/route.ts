import type { NextRequest } from "next/server";
import { isAdminRequest } from "../../../guard";
import { getCustomProduct, setProductImage } from "@/lib/custom-products";
import { deleteProductJpg, writeProductJpg } from "@/lib/product-image";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = (await ctx.params).id;
  const product = getCustomProduct(id);
  if (!product) return Response.json({ error: "Product not found" }, { status: 404 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("image");
  if (!file || typeof file === "string" || !(file instanceof File)) {
    return Response.json({ error: "Upload a JPG file in the 'image' field" }, { status: 400 });
  }
  if (file.type !== "image/jpeg") {
    return Response.json({ error: "Only JPG images are supported" }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer().catch(() => new ArrayBuffer(0)));
  if (buffer.length === 0) return Response.json({ error: "The uploaded file is empty" }, { status: 400 });
  if (buffer.length > MAX_BYTES) return Response.json({ error: "Image must be 5 MB or smaller" }, { status: 413 });

  writeProductJpg(product.slug, buffer);
  const updated = setProductImage(id, "jpg");
  return Response.json({ product: updated });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = (await ctx.params).id;
  const product = getCustomProduct(id);
  if (!product) return Response.json({ error: "Product not found" }, { status: 404 });

  deleteProductJpg(product.slug);
  const updated = setProductImage(id, undefined);
  return Response.json({ product: updated });
}