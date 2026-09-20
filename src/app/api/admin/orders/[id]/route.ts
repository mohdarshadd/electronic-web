import type { NextRequest } from "next/server";
import { isAdminRequest } from "../../guard";
import { fetchOrder, updateOrder } from "@/lib/orders";

const ORDER_STATUSES = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED"] as const;

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/admin/orders/[id]">) {
  if (!isAdminRequest(_req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const order = fetchOrder((await ctx.params).id);
  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
  return Response.json({ order });
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/admin/orders/[id]">) {
  if (!isAdminRequest(req)) {
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

  const order = updateOrder((await ctx.params).id, patch, "admin");
  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
  return Response.json({ order });
}