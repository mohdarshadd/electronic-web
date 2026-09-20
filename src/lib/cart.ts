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

export type ProductResolver = (id: string) => Product | undefined;

export interface CartComputeOptions {
  products?: ProductResolver;
  freeShippingThreshold?: number;
  shippingFee?: number;
}

export function computeCart(lines: CartLine[], coupon?: string, opts: CartComputeOptions = {}): ComputedCart {
  const lookup = opts.products ?? ((id: string) => products.find((p) => p.id === id));
  const threshold = opts.freeShippingThreshold ?? FREE_SHIPPING_THRESHOLD;
  const fee = opts.shippingFee ?? SHIPPING_FEE;

  const detailed = lines
    .map((l) => {
      const product = lookup(l.productId);
      if (!product) return null;
      return { product, qty: Math.max(1, l.qty), lineTotal: product.price * Math.max(1, l.qty) };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const subtotal = detailed.reduce((acc, d) => acc + d.lineTotal, 0);
  const couponInfo = coupon ? COUPONS[coupon] : undefined;
  const discount = couponInfo ? Math.round((subtotal * couponInfo.pct) / 100) : 0;
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= threshold ? 0 : fee;
  const total = afterDiscount + shipping;

  return { lines: detailed, subtotal, discount, shipping, total };
}

export function cartLineCount(lines: CartLine[]): number {
  return lines.reduce((acc, l) => acc + l.qty, 0);
}