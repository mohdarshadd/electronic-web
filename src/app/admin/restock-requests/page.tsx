import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminConfigured, verifyAdminToken } from "@/lib/admin-auth";
import AdminRestockRequests from "@/components/admin/AdminRestockRequests";

export default async function AdminRestockRequestsPage() {
  const store = await cookies();
  if (!adminConfigured() || !verifyAdminToken(store.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin");
  }
  return <AdminRestockRequests />;
}