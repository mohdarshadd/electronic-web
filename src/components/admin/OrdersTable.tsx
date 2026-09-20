"use client";

import Link from "next/link";
import type { Order } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { ORDER_STATUS_CLASS, PAYMENT_STATUS_CLASS } from "./status";

export default function OrdersTable({ orders, limit }: { orders: Order[]; limit?: number }) {
  const rows = limit ? orders.slice(0, limit) : orders;

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 px-6 py-12 text-center">
        <p className="text-sm font-semibold text-gray-500">No orders match — they all land here.</p>
        <p className="mt-1 text-sm text-gray-400">Place an order from the store to see it appear.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs font-bold uppercase tracking-wide text-gray-400">
            <th className="px-4 py-3">Order</th>
            <th className="hidden px-4 py-3 sm:table-cell">Customer</th>
            <th className="hidden px-4 py-3 md:table-cell">Placed</th>
            <th className="hidden px-4 py-3 lg:table-cell">Payment</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.orderId} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
              <td className="px-4 py-3">
                <Link href={`/admin/orders/${o.orderId}`} className="font-bold text-indigo-600 hover:text-indigo-700">
                  {o.orderId}
                </Link>
              </td>
              <td className="hidden px-4 py-3 sm:table-cell">
                <p className="font-semibold text-gray-900">{o.customer.fullName}</p>
                <p className="text-xs text-gray-400">{o.customer.city}</p>
              </td>
              <td className="hidden px-4 py-3 text-gray-500 md:table-cell">
                {new Date(o.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="hidden px-4 py-3 lg:table-cell">
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${PAYMENT_STATUS_CLASS[o.paymentStatus]}`}>
                  {o.paymentStatus}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-bold text-gray-900">{formatINR(o.total)}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${ORDER_STATUS_CLASS[o.orderStatus]}`}>
                  {o.orderStatus}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}