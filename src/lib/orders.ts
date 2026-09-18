import fs from "node:fs";
import path from "node:path";
import type { Order } from "./types";

interface Store {
  orders: Order[];
}

const CACHE: Store = { orders: [] };

function filePath(): string {
  return `${process.cwd()}/.data/orders.json`;
}

function load(): Store {
  try {
    if (fs.existsSync(filePath())) {
      const raw = fs.readFileSync(filePath(), "utf-8");
      const parsed = JSON.parse(raw);
      const orders = Array.isArray(parsed) ? parsed : Array.isArray(parsed.orders) ? parsed.orders : [];
      return { orders };
    }
  } catch {
    // ignore fs errors — fall back to in-memory (e.g. serverless)
  }
  return { orders: [] };
}

function save(store: Store): void {
  CACHE.orders = store.orders;
  try {
    fs.mkdirSync(path.dirname(filePath()), { recursive: true });
    fs.writeFileSync(filePath(), JSON.stringify(store, null, 2), "utf-8");
  } catch {
    // in-memory only
  }
}

export function persistOrder(order: Order): Order {
  const store = load();
  store.orders.unshift(order);
  CACHE.orders = store.orders;
  save(store);
  return order;
}

export function fetchOrder(id: string): Order | undefined {
  const store = load();
  return store.orders.find((o) => o.orderId === id || o.id === id);
}

export function updateOrderPayment(orderId: string, patch: Partial<Order>): Order | undefined {
  const store = load();
  const order = store.orders.find((o) => o.orderId === orderId || o.id === orderId);
  if (!order) return undefined;
  Object.assign(order, patch);
  CACHE.orders = store.orders;
  save(store);
  return order;
}

export function generateOrderId(): string {
  return `VOLT${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;
}