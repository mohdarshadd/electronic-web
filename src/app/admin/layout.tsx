import type { ReactNode } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminConfigured, verifyAdminToken } from "@/lib/admin-auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: "Admin – VoltCart",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const store = await cookies();
  const authed = adminConfigured() && verifyAdminToken(store.get(ADMIN_COOKIE)?.value);

  return (
    <div className="min-h-screen bg-gray-100 lg:h-screen lg:overflow-hidden">
      <div className="mx-auto flex max-w-[1400px] flex-col lg:h-full lg:flex-row">
        <AdminSidebar authed={authed} />
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:overflow-y-auto lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}