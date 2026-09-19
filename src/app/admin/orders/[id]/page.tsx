import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminConfigured, verifyAdminToken } from "@/lib/admin-auth";
import AdminOrderDetail from "@/components/admin/AdminOrderDetail";

export default async function AdminOrderPage(props: PageProps<"/admin/orders/[id]">) {
  const store = await cookies();
  if (!adminConfigured() || !verifyAdminToken(store.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin");
  }
  const orderId = await props.params.then((p) => p.id);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <AdminOrderDetail orderId={orderId} />
    </div>
  );
}