import type { NextRequest } from "next/server";
import { isAdminRequest } from "../guard";
import { listInventory } from "@/lib/inventory";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const overridesOnly = req.nextUrl.searchParams.get("overridesOnly") === "1";
  const inventory = listInventory(overridesOnly);
  return Response.json({ inventory, count: inventory.length });
}