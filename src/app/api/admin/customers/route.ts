import type { NextRequest } from "next/server";
import { isAdminRequest } from "../guard";
import { listOrders } from "@/lib/orders";
import { aggregateCustomers } from "@/lib/admin-metrics";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const customers = aggregateCustomers(listOrders());
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  return Response.json({ customers, totalRevenue });
}