import type { NextRequest } from "next/server";
import type { Address, Order, PaymentMethod } from "@/lib/types";
import { computeCart } from "@/lib/cart";
import { getLiveProduct } from "@/lib/inventory";
import { getShippingPolicy, getSettings } from "@/lib/settings";
import { createCashfreeOrder, cashfreeConfigured } from "@/lib/cashfree";
import { generateOrderId, persistOrder, updateOrderPayment } from "@/lib/orders";

interface CheckoutBody {
  lines?: { productId: string; qty: number }[];
  coupon?: string;
  paymentMethod?: PaymentMethod;
  address?: Address;
  returnUrl?: string;
}

export async function POST(req: NextRequest) {
  let body: CheckoutBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { lines = [], coupon, paymentMethod = "cashfree", address } = body;

  if (!Array.isArray(lines) || lines.length === 0) {
    return Response.json({ error: "Your cart is empty" }, { status: 400 });
  }
  if (!address || typeof address.phone !== "string") {
    return Response.json({ error: "Delivery address is required" }, { status: 400 });
  }
  if (paymentMethod !== "cashfree" && paymentMethod !== "cod") {
    return Response.json({ error: "Unknown payment method" }, { status: 400 });
  }

  const policy = getShippingPolicy();
  const settings = getSettings();
  const allowedCoupon = coupon && settings.coupons[coupon]?.enabled ? coupon : undefined;
  const cart = computeCart(lines, allowedCoupon, {
    products: getLiveProduct,
    freeShippingThreshold: policy.freeShippingThreshold,
    shippingFee: policy.shippingFee,
  });
  if (cart.lines.length === 0) {
    return Response.json({ error: "Some items in your cart are no longer available" }, { status: 400 });
  }

  for (const l of cart.lines) {
    if (!l.product.inStock || l.qty > l.product.stock) {
      return Response.json(
        { error: `${l.product.name} is out of stock or exceeds available quantity` },
        { status: 400 }
      );
    }
  }

  const orderId = generateOrderId();
  const origin = req.nextUrl.origin;

  const order: Order = {
    id: orderId,
    orderId,
    createdAt: new Date().toISOString(),
    customer: address,
    lines: cart.lines.map((l) => ({
      productId: l.product.id,
      name: l.product.name,
      slug: l.product.slug,
      price: l.product.price,
      qty: l.qty,
    })),
    subtotal: cart.subtotal,
    discount: cart.discount,
    shipping: cart.shipping,
    total: cart.total,
    coupon,
    paymentMethod,
    paymentStatus: "PENDING",
    orderStatus: "PLACED",
  };

  persistOrder(order);

  if (paymentMethod === "cod") {
    return Response.json({ mode: "cod", redirectUrl: `/order/${orderId}` });
  }

  if (cashfreeConfigured()) {
    try {
      const cf = await createCashfreeOrder({
        orderId,
        amount: cart.total,
        customer: address,
        returnUrl: `${origin}/order/${orderId}`,
        notifyUrl: `${origin}/api/payments/webhook`,
      });
      updateOrderPayment(orderId, {
        cashfree: { orderId: cf.order_id, paymentSessionId: cf.payment_session_id },
      });
      return Response.json({
        mode: process.env.CASHFREE_ENV || "SANDBOX",
        paymentSessionId: cf.payment_session_id,
        redirectUrl: `/order/${orderId}`,
      });
    } catch (e) {
      return Response.json(
        { error: e instanceof Error ? e.message : "Could not reach payment gateway" },
        { status: 502 }
      );
    }
  }

  // No Cashfree credentials — demo mode: simulate a successful payment so the
  // whole funnel can be tested end-to-end without keys.
  updateOrderPayment(orderId, {
    paymentStatus: "PAID",
    orderStatus: "CONFIRMED",
    cashfree: { paymentSessionId: "demo_payment_session" },
  });
  return Response.json({ demo: true, redirectUrl: `/order/${orderId}` });
}