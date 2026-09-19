export const ORDER_STATUSES = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
export const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED"] as const;

export const ORDER_STATUS_CLASS: Record<(typeof ORDER_STATUSES)[number], string> = {
  PLACED: "bg-indigo-50 text-indigo-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-amber-50 text-amber-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
};

export const PAYMENT_STATUS_CLASS: Record<(typeof PAYMENT_STATUSES)[number], string> = {
  PENDING: "bg-amber-50 text-amber-700",
  PAID: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-red-50 text-red-700",
};