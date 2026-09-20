import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminConfigured, verifyAdminToken } from "@/lib/admin-auth";
import AdminCustomers from "@/components/admin/AdminCustomers";

export default async function AdminCustomersPage() {
  const store = await cookies();
  if (!adminConfigured() || !verifyAdminToken(store.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin");
  }
  return <AdminCustomers />;
}