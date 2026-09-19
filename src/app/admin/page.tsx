import Link from "next/link";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminConfigured, verifyAdminToken } from "@/lib/admin-auth";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const store = await cookies();
  const configured = adminConfigured();
  const authed = verifyAdminToken(store.get(ADMIN_COOKIE)?.value);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">VoltCart Admin</p>
          <h1 className="mt-1 text-2xl font-extrabold text-gray-900">Orders dashboard</h1>
        </div>
        <Link href="/" className="text-sm font-semibold text-gray-500 transition hover:text-indigo-600">
          ← Back to store
        </Link>
      </div>

      {!configured ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-amber-800">
          The admin panel is disabled. Set <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono font-bold">ADMIN_PASSWORD</code> in
          <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono font-bold">.env.local</code> to enable it.
        </div>
      ) : authed ? (
        <AdminDashboard />
      ) : (
        <AdminLogin />
      )}
    </div>
  );
}