import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminConfigured, verifyAdminToken } from "@/lib/admin-auth";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const store = await cookies();
  const configured = adminConfigured();
  const authed = verifyAdminToken(store.get(ADMIN_COOKIE)?.value);

  if (!configured) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-amber-800">
        The admin panel is disabled. Set <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono font-bold">ADMIN_PASSWORD</code> in
        <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono font-bold">.env.local</code> to enable it.
      </div>
    );
  }

  return authed ? <AdminDashboard /> : <AdminLogin />;
}