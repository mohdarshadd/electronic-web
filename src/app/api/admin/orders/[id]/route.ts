import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";
import { fetchOrder, updateOrderPayment } from "@/lib/orders";

const ORDER_STATUSES = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED"] as const;

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/admin/orders/[id]">) {
  if (!verifyAdminToken(_req.cookies.get(ADMIN_COOKIE)?.value)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const order = fetchOrder((await ctx.params).id);
  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
  return Response.json({ order });
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/admin/orders/[id]">) {
  if (!verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const patch: { orderStatus?: (typeof ORDER_STATUSES)[number]; paymentStatus?: (typeof PAYMENT_STATUSES)[number] } = {};
  if (body.orderStatus !== undefined) {
    if (!ORDER_STATUSES.includes(body.orderStatus)) {
      return Response.json({ error: "Invalid orderStatus" }, { status: 400 });
    }
    patch.orderStatus = body.orderStatus;
  }
  if (body.paymentStatus !== undefined) {
    if (!PAYMENT_STATUSES.includes(body.paymentStatus)) {
      return Response.json({ error: "Invalid paymentStatus" }, { status: 400 });
    }
    patch.paymentStatus = body.paymentStatus;
  }
  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "Nothing to update" }, { status: 400 });
  }

  const order = updateOrderPayment((await ctx.params).id, patch);
  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
  return Response.json({ order });
}