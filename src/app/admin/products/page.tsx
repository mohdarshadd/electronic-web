import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminConfigured, verifyAdminToken } from "@/lib/admin-auth";
import AdminProducts from "@/components/admin/AdminProducts";

export default async function AdminProductsPage() {
  const store = await cookies();
  if (!adminConfigured() || !verifyAdminToken(store.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin");
  }
  return <AdminProducts />;
}