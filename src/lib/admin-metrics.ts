import type { Order } from "./types";

export interface Metrics {
  totalOrders: number;
  paidRevenue: number;
  codExpected: number;
  pendingAmount: number;
  failedOrders: number;
  cancelledOrders: number;
  cancellationRate: number;
  distinctCustomers: number;
  itemsSold: number;
  aov: number;
}

export function computeMetrics(orders: Order[]): Metrics {
  const paid = orders.filter((o) => o.paymentStatus === "PAID");
  const paidRevenue = paid.reduce((s, o) => s + o.total, 0);
  const codExpected = orders
    .filter((o) => o.paymentMethod === "cod" && o.paymentStatus === "PENDING")
    .reduce((s, o) => s + o.total, 0);
  const pendingAmount = orders.filter((o) => o.paymentStatus === "PENDING").reduce((s, o) => s + o.total, 0);
  const failedOrders = orders.filter((o) => o.paymentStatus === "FAILED").length;
  const cancelledOrders = orders.filter((o) => o.orderStatus === "CANCELLED").length;
  const distinctCustomers = new Set(
    orders.map((o) => `${(o.customer.phone || "").trim()}::${(o.customer.email || "").trim().toLowerCase()}`)
  ).size;
  const itemsSold = orders.reduce((s, o) => s + o.lines.reduce((x, l) => x + l.qty, 0), 0);
  const aov = orders.length > 0 ? Math.round(paidRevenue / orders.length) : 0;
  return {
    totalOrders: orders.length,
    paidRevenue,
    codExpected,
    pendingAmount,
    failedOrders,
    cancelledOrders,
    cancellationRate: orders.length > 0 ? Math.round((cancelledOrders / orders.length) * 100) : 0,
    distinctCustomers,
    itemsSold,
    aov,
  };
}

export interface DayStat {
  key: string;
  label: string;
  total: number;
  paid: number;
  orders: number;
}

export function dailyStats(orders: Order[], days = 14): DayStat[] {
  const out: DayStat[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fmt = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" });
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayOrders = orders.filter((o) => o.createdAt.slice(0, 10) === key);
    const paid = dayOrders.filter((o) => o.paymentStatus === "PAID").reduce((s, o) => s + o.total, 0);
    out.push({
      key,
      label: fmt.format(d),
      total: dayOrders.reduce((s, o) => s + o.total, 0),
      paid,
      orders: dayOrders.length,
    });
  }
  return out;
}

export function countBy<T extends string>(orders: Order[], pick: (o: Order) => T, all: readonly T[]): { key: T; count: number }[] {
  const counts = new Map<T, number>();
  all.forEach((k) => counts.set(k, 0));
  orders.forEach((o) => counts.set(pick(o), (counts.get(pick(o)) ?? 0) + 1));
  return all.map((k) => ({ key: k, count: counts.get(k) ?? 0 }));
}

export interface TopProduct {
  productId: string;
  name: string;
  slug: string;
  qty: number;
  revenue: number;
}

export function topProducts(orders: Order[], limit = 5): TopProduct[] {
  const map = new Map<string, TopProduct>();
  for (const o of orders) {
    for (const l of o.lines) {
      const cur = map.get(l.productId);
      if (cur) {
        cur.qty += l.qty;
        cur.revenue += l.price * l.qty;
      } else {
        map.set(l.productId, { productId: l.productId, name: l.name, slug: l.slug, qty: l.qty, revenue: l.price * l.qty });
      }
    }
  }
  return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, limit);
}

export interface Customer {
  key: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  ordersCount: number;
  totalSpent: number;
  paidSpent: number;
  lastOrderAt: string;
  orderStatuses: string[];
}

export function aggregateCustomers(orders: Order[]): Customer[] {
  const map = new Map<string, Customer>();
  for (const o of orders) {
    const key = `${(o.customer.phone || "").trim()}::${(o.customer.email || "").trim().toLowerCase()}`;
    const cur = map.get(key);
    const c = o.customer;
    if (cur) {
      cur.ordersCount += 1;
      cur.totalSpent += o.total;
      if (o.paymentStatus === "PAID") cur.paidSpent += o.total;
      if (o.createdAt > cur.lastOrderAt) cur.lastOrderAt = o.createdAt;
      if (!cur.orderStatuses.includes(o.orderStatus)) cur.orderStatuses.push(o.orderStatus);
    } else {
      map.set(key, {
        key,
        fullName: c.fullName || (c as unknown as { name?: string }).name || "Unknown",
        phone: c.phone,
        email: c.email,
        city: c.city,
        ordersCount: 1,
        totalSpent: o.total,
        paidSpent: o.paymentStatus === "PAID" ? o.total : 0,
        lastOrderAt: o.createdAt,
        orderStatuses: [o.orderStatus],
      });
    }
  }
  return [...map.values()].sort((a, b) => b.ordersCount - a.ordersCount || b.totalSpent - a.totalSpent);
}