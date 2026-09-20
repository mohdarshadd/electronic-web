"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
  { href: "/admin/orders", label: "Orders", icon: "M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h10v2H4v-2z" },
  { href: "/admin/customers", label: "Customers", icon: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2m20 0v-2a4 4 0 00-3-3.87M14 3.13A4 4 0 0116 7m-2 9a4 4 0 008 0 4 4 0 00-8 0z" },
  { href: "/admin/inventory", label: "Inventory", icon: "M20 7l-8-4-8 4v10l8 4 8-4V7zm-8 13V7M6 11l12-2m-12 6l12-2" },
  { href: "/admin/settings", label: "Settings", icon: "M4 21v-7m6 7V3m6 18v-4m6 4H2M4 14h4v4H4zM10 3h4v4h-4zm6 10h4v4h-4z" },
];

export default function AdminSidebar({ authed }: { authed: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <aside className="flex w-full shrink-0 flex-col gap-1 border-b border-gray-200 bg-white p-3 lg:h-[calc(100vh-0px)] lg:w-60 lg:border-b-0 lg:border-r lg:py-6">
      <div className="mb-3 flex items-center gap-2.5 px-2 lg:mb-6">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2 3.5 13.5H11L9.5 22 19 10.5H11.5L13 2z" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-extrabold leading-tight text-gray-900">
            Volt<span className="text-indigo-600">Cart</span>
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Admin</p>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto lg:flex-col">
        {NAV.map((n) => {
          const active = pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href));
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                active ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className={active ? "text-indigo-600" : "text-gray-400"}>
                <path d={n.icon} />
              </svg>
              <span className="whitespace-nowrap">{n.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden flex-col gap-1 pt-6 lg:flex">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-400">
            <path d="M19 12H5m7 7-7-7 7-7" />
          </svg>
          Back to store
        </Link>
        {authed ? (
          <button
            onClick={logout}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14 5-5-5-5m5 5H9" />
            </svg>
            Sign out
          </button>
        ) : (
          <p className="px-3 py-2 text-xs font-medium text-gray-400">Signed out</p>
        )}
      </div>
    </aside>
  );
}