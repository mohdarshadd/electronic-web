import type { NextRequest } from "next/server";
import { isAdminRequest } from "../guard";
import { getSettings, saveSettings } from "@/lib/settings";
import type { SiteSettings } from "@/lib/settings";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json({ settings: getSettings() });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Partial<SiteSettings> | null;
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const patch: Partial<SiteSettings> = {};

  if (body.announcementEnabled !== undefined) patch.announcementEnabled = Boolean(body.announcementEnabled);
  if (body.announcement !== undefined) {
    if (typeof body.announcement !== "string") return Response.json({ error: "Announcement must be text" }, { status: 400 });
    patch.announcement = body.announcement.trim();
  }
  if (body.freeShippingEnabled !== undefined) patch.freeShippingEnabled = Boolean(body.freeShippingEnabled);
  if (body.freeShippingThreshold !== undefined) {
    const n = Number(body.freeShippingThreshold);
    if (!Number.isFinite(n) || n < 0) return Response.json({ error: "Free shipping threshold must be a positive ₹ amount" }, { status: 400 });
    patch.freeShippingThreshold = Math.round(n);
  }
  if (body.shippingFee !== undefined) {
    const n = Number(body.shippingFee);
    if (!Number.isFinite(n) || n < 0) return Response.json({ error: "Shipping fee must be a positive ₹ amount" }, { status: 400 });
    patch.shippingFee = Math.round(n);
  }
  if (body.coupons !== undefined && typeof body.coupons === "object") {
    const clean: SiteSettings["coupons"] = {};
    for (const [code, c] of Object.entries(body.coupons)) {
      clean[code] = c;
    }
    patch.coupons = clean;
  }

  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "Nothing to update" }, { status: 400 });
  }

  return Response.json({ settings: saveSettings(patch) });
}