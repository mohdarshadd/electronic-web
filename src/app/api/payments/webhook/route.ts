import type { NextRequest } from "next/server";
import { fetchCashfreeOrder, verifyWebhookSignature } from "@/lib/cashfree";
import { updateOrderPayment } from "@/lib/orders";

// Cashfree sends payment webhooks to this URL (set as notify_url when the
// order is created). We verify the HMAC signature on the raw body before
// trusting the payload, then update the stored order.
export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-webhook-signature") || "";
  const timestamp = req.headers.get("x-webhook-timestamp") || "";
  const rawBody = await req.text();

  if (!signature || !timestamp) {
    return Response.json({ error: "Missing webhook headers" }, { status: 400 });
  }

  const valid = verifyWebhookSignature(signature, rawBody, timestamp);
  if (!valid) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: {
    data?: { order?: { order_id?: string }; payment?: { payment_status?: string } };
    type?: string;
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const orderId = payload.data?.order?.order_id;
  const status = payload.data?.payment?.payment_status;
  if (!orderId || !status) {
    return Response.json({ error: "Unrecognised payload" }, { status: 400 });
  }

  const updated = updateOrderPayment(orderId, {
    paymentStatus: status === "SUCCESS" ? "PAID" : "FAILED",
    orderStatus: status === "SUCCESS" ? "CONFIRMED" : "PLACED",
  });

  if (!updated) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }
  return Response.json({ received: true });
}

export async function GET(req: NextRequest) {
  const orderId = new URL(req.url).searchParams.get("order_id");
  if (!orderId) return Response.json({ error: "Missing order_id" }, { status: 400 });

  let cf;
  try {
    cf = await fetchCashfreeOrder(orderId);
  } catch {
    return Response.json({ error: "Gateway error" }, { status: 502 });
  }

  if (cf.order_status === "PAID") {
    updateOrderPayment(cf.order_id, { paymentStatus: "PAID", orderStatus: "CONFIRMED" });
  } else if (["FAILED", "CANCELLED", "CANCELED"].includes(cf.order_status)) {
    updateOrderPayment(cf.order_id, { paymentStatus: "FAILED" });
  }

  return Response.json({ order_id: cf.order_id, order_status: cf.order_status });
}