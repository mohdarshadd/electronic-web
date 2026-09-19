import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";
import { listOrders } from "@/lib/orders";

export async function GET(req: NextRequest) {
  if (!verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json({ orders: listOrders() });
}