import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchOrder } from "@/lib/orders";
import { getCatalogProductBySlug } from "@/lib/catalog";
import { formatINR } from "@/lib/format";
import { ProductImage } from "@/components/ProductImage";
import { Icon } from "@/components/Icon";
import { cashfreeConfigured, fetchCashfreeOrder } from "@/lib/cashfree";

export default function OrderPage(props: PageProps<"/order/[id]">) {
  return (
    <Suspense fallback={<OrderLoading />}>
      <OrderContent id={props.params.then((p) => p.id)} />
    </Suspense>
  );
}

function OrderLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center text-navy-400">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-navy-200 border-t-coral-500" />
      <p className="mt-4 text-sm">Fetching your order…</p>
    </div>
  );
}

async function OrderContent({ id }: { id: Promise<string> }) {
  const orderId = await id;
  const order = fetchOrder(orderId);
  if (!order) notFound();

  // If we're back from the gateway with a pending Cashfree order, sync status
  // now so the confirmation is accurate on first paint.
  if (order.paymentMethod === "cashfree" && order.paymentStatus === "PENDING" && cashfreeConfigured()) {
    try {
      const cf = await fetchCashfreeOrder(orderId);
      if (cf.order_status === "PAID") {
        order.paymentStatus = "PAID";
        order.orderStatus = "CONFIRMED";
      }
    } catch {
      // keep pending — webhook will resolve later
    }
  }

  const paid = order.paymentStatus === "PAID";
  const isCod = order.paymentMethod === "cod";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        {paid || isCod ? (
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100">
            <svg className="h-10 w-10 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
        ) : (
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-amber-100">
            <svg className="h-10 w-10 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8v5l3 2" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </div>
        )}
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-navy-900">
          {paid || isCod ? "Order confirmed" : "Payment pending"}
        </h1>
        <p className="mt-3 max-w-md mx-auto text-sm leading-6 text-navy-500">
          {paid
            ? "Thanks! We've received your payment and are packing your parts. A confirmation email is on its way."
            : isCod
              ? "Thanks! Pay by cash when your order arrives. We'll email the delivery updates."
              : "We haven't confirmed payment yet. If you paid, this updates in a few seconds — or check the email for the receipt."}
        </p>
        <p className="mt-4 text-sm font-semibold text-navy-700">
          Order ID: <span className="font-mono text-coral-700">{order.orderId}</span>
        </p>
      </div>

      {/* Status timeline */}
      <div className="mt-10 grid grid-cols-4 gap-2 text-center">
        {[
          { label: "Confirmed", done: order.orderStatus !== "PLACED" || paid || isCod },
          { label: "Packed", done: false },
          { label: "Shipped", done: false },
          { label: "Delivered", done: false },
        ].map((s, i) => (
          <div key={s.label} className={`rounded-xl border px-2 py-3 ${s.done ? "border-emerald-200 bg-emerald-50" : "border-navy-200 bg-white"}`}>
            <div className={`mx-auto mb-1.5 grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${s.done ? "bg-emerald-500 text-white" : "bg-cream-200 text-navy-400"}`}>
              {s.done ? "✓" : i + 1}
            </div>
            <p className={`text-[11px] font-semibold ${s.done ? "text-emerald-700" : "text-navy-400"}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Items */}
      <div className="mt-8 rounded-2xl border border-navy-900/10 bg-white">
        <div className="border-b border-navy-100 px-6 py-4">
          <h2 className="font-bold text-navy-900">Items ({order.lines.reduce((a, l) => a + l.qty, 0)})</h2>
        </div>
        <div className="divide-y divide-navy-100 px-6">
          {order.lines.map((l) => {
            const product = getCatalogProductBySlug(l.slug);
            return (
              <div key={l.productId} className="flex items-center gap-4 py-4">
                {product ? (
                  <ProductImage product={product} className="h-14 w-14 rounded-xl" />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-xl bg-cream-100 text-navy-400">
                    <Icon name="package" size={22} strokeWidth={1.6} />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-navy-900">{l.name}</p>
                  <p className="text-xs text-navy-400">Qty {l.qty}</p>
                </div>
                <span className="text-sm font-bold text-navy-900">{formatINR(l.price * l.qty)}</span>
              </div>
            );
          })}
        </div>
        <div className="space-y-2 border-t border-dashed border-navy-200 px-6 py-4 text-sm">
          <div className="flex justify-between text-navy-600"><span>Subtotal</span><span className="font-semibold text-navy-900">{formatINR(order.subtotal)}</span></div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600"><span>Discount {order.coupon ? `(${order.coupon})` : ""}</span><span className="font-semibold">− {formatINR(order.discount)}</span></div>
          )}
          <div className="flex justify-between text-navy-600"><span>Shipping</span><span className={`font-semibold ${order.shipping === 0 ? "text-emerald-600" : ""}`}>{order.shipping === 0 ? "FREE" : formatINR(order.shipping)}</span></div>
          <div className="flex justify-between border-t border-navy-200 pt-3 text-base font-bold text-navy-900">
            <span>Total {isCod && "(pay on delivery)"}</span>
            <span>{formatINR(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-navy-900/10 bg-white p-5">
          <h3 className="text-sm font-bold text-navy-900">Deliver to</h3>
          <p className="mt-2 text-sm text-navy-600">{order.customer.fullName}</p>
          <p className="text-sm text-navy-600">{order.customer.line1}</p>
          {order.customer.line2 && <p className="text-sm text-navy-600">{order.customer.line2}</p>}
          <p className="text-sm text-navy-600">{order.customer.city}, {order.customer.state} — {order.customer.pincode}</p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-navy-500">
            <Icon name="phone" size={14} className="shrink-0" />
            {order.customer.phone}
          </p>
        </div>
        <div className="rounded-2xl border border-navy-900/10 bg-white p-5">
          <h3 className="text-sm font-bold text-navy-900">Payment</h3>
          <p className="mt-2 text-sm text-navy-600">
            {isCod ? "Cash on Delivery" : "Card / UPI / NetBanking (Cashfree)"}
          </p>
          <p className="mt-1 text-sm">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${order.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${order.paymentStatus === "PAID" ? "bg-emerald-500" : "bg-amber-500"}`} />
              {order.paymentStatus === "PAID" ? "Payment received" : isCod ? "Pay on delivery" : "Pending"}
            </span>
          </p>
          <p className="mt-3 text-sm text-navy-500">Placed on {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="rounded-xl bg-navy-900 px-6 py-3 text-sm font-bold text-cream-100 shadow-glow hover:bg-navy-800">
          Continue shopping
        </Link>
        <Link href="/" className="rounded-xl border border-navy-300 bg-white px-6 py-3 text-sm font-bold text-navy-700 hover:bg-cream-100">
          Back to home
        </Link>
      </div>
    </div>
  );
}