import fs from "node:fs";
import path from "node:path";

// "Notify me when back in stock" requests live in the (git-ignored) .data dir,
// keyed to products by id so they survive slug renames.
export type RestockStatus = "pending" | "notified";

export interface RestockRequest {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  email: string;
  requestedAt: string;
  status: RestockStatus;
}

export interface RestockRequestInput {
  productId: string;
  productSlug: string;
  productName: string;
  email: string;
}

function filePath(): string {
  return `${process.cwd()}/.data/restock-requests.json`;
}

export function loadRequests(): RestockRequest[] {
  try {
    if (fs.existsSync(filePath())) {
      const parsed = JSON.parse(fs.readFileSync(filePath(), "utf-8"));
      if (Array.isArray(parsed)) return parsed as RestockRequest[];
    }
  } catch {
    // ignore
  }
  return [];
}

function saveRequests(list: RestockRequest[]): void {
  try {
    fs.mkdirSync(path.dirname(filePath()), { recursive: true });
    fs.writeFileSync(filePath(), JSON.stringify(list, null, 2), "utf-8");
  } catch {
    // ignore
  }
}

// Idempotent: one pending request per email + product. Repeats return the original.
export function addRestockRequest(input: RestockRequestInput): RestockRequest {
  const list = loadRequests();
  const existing = list.find(
    (r) => r.email === input.email && r.productId === input.productId && r.status === "pending"
  );
  if (existing) return existing;

  const request: RestockRequest = {
    id: `rst-${Date.now().toString(36)}${list.length.toString(36)}`,
    ...input,
    requestedAt: new Date().toISOString(),
    status: "pending",
  };
  saveRequests([...list, request]);
  return request;
}

export function removeRestockRequest(id: string): boolean {
  const list = loadRequests();
  const next = list.filter((r) => r.id !== id);
  if (next.length === list.length) return false;
  saveRequests(next);
  return true;
}

export function markRestockRequestNotified(id: string): RestockRequest | undefined {
  const list = loadRequests();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  const updated: RestockRequest = { ...list[idx], status: "notified" };
  list[idx] = updated;
  saveRequests(list);
  return updated;
}

// Marks every pending request for a product as notified. Returns how many flipped.
export function markNotifiedForProduct(productId: string): number {
  const list = loadRequests();
  let count = 0;
  const next = list.map((r) => {
    if (r.productId === productId && r.status === "pending") {
      count += 1;
      return { ...r, status: "notified" as const };
    }
    return r;
  });
  if (count > 0) saveRequests(next);
  return count;
}

export function countPendingForProduct(productId: string): number {
  return loadRequests().filter((r) => r.productId === productId && r.status === "pending").length;
}

export function countPending(): number {
  return loadRequests().filter((r) => r.status === "pending").length;
}