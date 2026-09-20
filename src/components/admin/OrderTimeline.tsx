"use client";

import type { Order } from "@/lib/types";
import { ORDER_STATUS_CLASS } from "./status";

const FLOW = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"] as const;
const FLOW_DESC: Record<(typeof FLOW)[number], string> = {
  PLACED: "Order received from the customer",
  CONFIRMED: "Order confirmed by the store",
  SHIPPED: "Packed and handed to courier",
  DELIVERED: "Delivered to the customer",
};

export default function OrderTimeline({ order }: { order: Order }) {
  if (order.orderStatus === "CANCELLED") {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-6">
        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400">Order timeline</h3>
        <div className="mt-4 flex items-center gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-red-600 text-xs font-extrabold text-white">✕</span>
          <div>
            <p className="text-sm font-bold text-red-600">Cancelled</p>
            <p className="text-xs text-gray-400">This order was cancelled and will not be fulfilled.</p>
          </div>
        </div>
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-400">
            Placed {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
      </div>
    );
  }

  const current = FLOW.indexOf(order.orderStatus as (typeof FLOW)[number]);
  const reached = Math.max(current, 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400">Order timeline</h3>
      <ol className="mt-4 space-y-0">
        {FLOW.map((step, i) => {
          const done = i <= reached;
          return (
            <li key={step} className="relative flex gap-3 pb-5 last:pb-0">
              {i < FLOW.length - 1 && <span className={`absolute left-[15px] top-7 h-[calc(100%-28px)] w-0.5 ${done ? "bg-indigo-300" : "bg-gray-200"}`} />}
              <span
                className={`z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-extrabold ${
                  done ? "bg-indigo-600 text-white" : "border-2 border-gray-200 text-gray-300"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <div className="pt-1">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-bold ${done ? "text-gray-900" : "text-gray-300"}`}>
                    {step[0] + step.slice(1).toLowerCase()}
                  </p>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${ORDER_STATUS_CLASS[order.orderStatus]}`}>
                    {i === reached ? "current" : done ? "done" : "upcoming"}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{FLOW_DESC[step]}</p>
                <p className="text-xs font-medium text-gray-500">
                  {i === 0 ? `Placed ${new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}` : done ? "Updated by store" : "Not reached yet"}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}