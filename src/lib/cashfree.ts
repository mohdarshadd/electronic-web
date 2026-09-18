import { createHmac } from "node:crypto";
import type { Address } from "./types";

const API_VERSION = "2025-01-01";

function baseUrl(): string {
  return process.env.CASHFREE_ENV === "PROD"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
}

function headers(extra?: Record<string, string>): HeadersInit {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-api-version": API_VERSION,
    "x-client-id": process.env.CASHFREE_CLIENT_ID || "",
    "x-client-secret": process.env.CASHFREE_CLIENT_SECRET || "",
    ...extra,
  };
}

export function cashfreeConfigured(): boolean {
  return Boolean(process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_CLIENT_SECRET);
}

export interface CreateOrderParams {
  orderId: string;
  amount: number;
  customer: Address;
  returnUrl: string;
  notifyUrl?: string;
}

export async function createCashfreeOrder(params: CreateOrderParams) {
  const body = {
    order_amount: params.amount / 100,
    order_currency: "INR",
    order_id: params.orderId,
    customer_details: {
      customer_id: `cust_${params.customer.phone}_${Date.now().toString(36)}`,
      customer_name: params.customer.fullName,
      customer_email: params.customer.email,
      customer_phone: `+91${params.customer.phone}`,
      customer_uid: params.customer.email,
    },
    order_meta: {
      return_url: params.returnUrl,
      notify_url: params.notifyUrl,
      payment_methods: "upi,card,netbanking,wallets",
    },
  };

  const res = await fetch(`${baseUrl()}/orders`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Cashfree create order failed: ${res.status} ${JSON.stringify(data)}`);
  }
  return data as {
    cf_order_id: string;
    order_id: string;
    order_amount: number;
    order_currency: string;
    payment_session_id: string;
    order_status: string;
  };
}

export async function fetchCashfreeOrder(orderId: string) {
  const res = await fetch(`${baseUrl()}/orders/${orderId}`, {
    method: "GET",
    headers: headers(),
    cache: "no-store",
  });
  const data = await res.json();
  return data as {
    order_id: string;
    order_status: string;
    cf_order_id: string;
    order_amount: number;
    payment_session_id: string;
    payments?: {
      cf_payment_id: string;
      payment_status: string;
      payment_amount: number;
      payment_time: string;
      payment_group?: string;
    }[];
  };
}

export function verifyWebhookSignature(
  signature: string,
  rawBody: string,
  timestamp: string
): boolean {
  const secret = process.env.CASHFREE_CLIENT_SECRET || "";
  if (!secret) return false;
  const genSig = createHmac("sha256", secret).update(`${timestamp}${rawBody}`).digest("base64");
  return genSig === signature;
}