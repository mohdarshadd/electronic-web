import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, adminConfigured, verifyAdminToken } from "@/lib/admin-auth";

export function isAdminRequest(req: NextRequest): boolean {
  return adminConfigured() && verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value);
}