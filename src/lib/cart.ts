import type { CartLine, Product } from "./types";
import { COUPONS, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "./products";
import { products } from "./products";

export interface ComputedCart {
  lines: { product: Product; qty: number; lineTotal: number }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

export function computeCart(lines: CartLine[], coupon?: string): ComputedCart {
  const detailed = lines
    .map((l) => {
      const product = products.find((p) => p.id === l.productId);
      if (!product) return null;
      return { product, qty: Math.max(1, l.qty), lineTotal: product.price * Math.max(1, l.qty) };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const subtotal = detailed.reduce((acc, d) => acc + d.lineTotal, 0);
  const couponInfo = coupon ? COUPONS[coupon] : undefined;
  const discount = couponInfo ? Math.round((subtotal * couponInfo.pct) / 100) : 0;
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = afterDiscount + shipping;

  return { lines: detailed, subtotal, discount, shipping, total };
}

export function cartLineCount(lines: CartLine[]): number {
  return lines.reduce((acc, l) => acc + l.qty, 0);
}