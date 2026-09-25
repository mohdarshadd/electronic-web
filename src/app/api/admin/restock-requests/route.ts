import type { NextRequest } from "next/server";
import { isAdminRequest } from "../guard";
import {
  loadRequests,
  markRestockRequestNotified,
  removeRestockRequest,
  type RestockStatus,
} from "@/lib/restock-requests";

const STATUSES: RestockStatus[] = ["pending", "notified"];

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const status = new URL(req.url).searchParams.get("status");
  let list = loadRequests();
  if (status && (status === "pending" || status === "notified")) {
    list = list.filter((r) => r.status === status);
  }
  list.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  return Response.json({ requests: list, statuses: STATUSES });
}

export async function PATCH(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Request id is required" }, { status: 400 });
  const updated = markRestockRequestNotified(id);
  if (!updated) return Response.json({ error: "Request not found" }, { status: 404 });
  return Response.json({ request: updated });
}

export async function DELETE(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Request id is required" }, { status: 400 });
  if (!removeRestockRequest(id)) return Response.json({ error: "Request not found" }, { status: 404 });
  return Response.json({ ok: true });
}