import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ADMIN_COOKIE, adminConfigured, verifyAdminToken } from "@/lib/admin-auth";
import { fetchOrder } from "@/lib/orders";
import { formatINR } from "@/lib/format";
import PrintButton from "@/components/admin/PrintButton";
import { site } from "@/lib/site";

export default async function AdminInvoicePage(props: { params: Promise<{ id: string }> }) {
  const store = await cookies();
  if (!adminConfigured() || !verifyAdminToken(store.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin");
  }
  const orderId = await props.params.then((p) => p.id);
  const order = fetchOrder(orderId);
  if (!order) notFound();

  const placed = new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href={`/admin/orders/${orderId}`} className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
          ← Back to order
        </Link>
        <PrintButton />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 print:rounded-none print:border-0 print:p-0">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2 3.5 13.5H11L9.5 22 19 10.5H11.5L13 2z" />
              </svg>
            </span>
            <div>
              <p className="text-lg font-extrabold text-gray-900">
                Volt<span className="text-indigo-600">Cart</span>
              </p>
              <p className="text-xs text-gray-500">{site.legalName}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-extrabold tracking-tight text-gray-900">INVOICE</p>
            <p className="text-sm text-gray-500">
              {order.orderId} <span className="ml-1 text-gray-300">·</span> {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
            </p>
          </div>
        </div>

        <div className="grid gap-6 py-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Bill to</p>
            <p className="mt-1.5 font-bold text-gray-900">{order.customer.fullName}</p>
            <p className="text-sm text-gray-600">{order.customer.phone}</p>
            <p className="text-sm text-gray-600">{order.customer.email}</p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {order.customer.line1}
              {order.customer.line2 ? `, ${order.customer.line2}` : ""}
              <br />
              {order.customer.city}, {order.customer.state} {order.customer.pincode}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Details</p>
            <p className="mt-1.5 text-sm text-gray-600">Issued {placed}</p>
            <p className="text-sm text-gray-600">
              Payment status:{" "}
              <span className="font-bold text-gray-900">{order.paymentStatus}</span>
            </p>
            <p className="text-sm text-gray-600">
              Order status: <span className="font-bold text-gray-900">{order.orderStatus}</span>
            </p>
            {order.cashfree?.referenceId && <p className="text-sm text-gray-600">Transaction ref: {order.cashfree.referenceId}</p>}
            {order.coupon && <p className="text-sm text-gray-600">Coupon: {order.coupon}</p>}
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-y border-gray-200 text-xs font-bold uppercase tracking-wide text-gray-400">
              <th className="py-2.5">Item</th>
              <th className="py-2.5">SKU</th>
              <th className="py-2.5 text-center">Qty</th>
              <th className="py-2.5 text-right">Unit price</th>
              <th className="py-2.5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.lines.map((l) => (
              <tr key={l.productId} className="border-b border-gray-100">
                <td className="py-3 font-semibold text-gray-900">{l.name}</td>
                <td className="py-3 font-mono text-xs text-gray-400">{l.productId}</td>
                <td className="py-3 text-center text-gray-600">{l.qty}</td>
                <td className="py-3 text-right text-gray-600">{formatINR(l.price)}</td>
                <td className="py-3 text-right font-bold text-gray-900">{formatINR(l.price * l.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto w-full max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatINR(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount {order.coupon ? `(${order.coupon})` : ""}</span>
              <span>− {formatINR(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? "FREE" : formatINR(order.shipping)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-extrabold text-gray-900">
            <span>Total</span>
            <span>{formatINR(order.total)}</span>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-5 text-xs leading-5 text-gray-400">
          <p className="font-semibold text-gray-500">Thank you for shopping with {site.name}!</p>
          <p>Questions about this order? Contact {site.contactEmail} or {site.contactPhone}.</p>
          <p className="mt-2">This is a computer-generated invoice for order {order.orderId}.</p>
        </div>
      </div>
    </div>
  );
}