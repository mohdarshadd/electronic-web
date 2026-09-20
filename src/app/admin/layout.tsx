import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminConfigured, verifyAdminToken } from "@/lib/admin-auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const store = await cookies();
  const authed = adminConfigured() && verifyAdminToken(store.get(ADMIN_COOKIE)?.value);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
        <AdminSidebar authed={authed} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}