export interface Category {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  imageHue: string;
  emoji: string;
}

export interface Spec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  sku: string;
  brand: string;
  categorySlug: string;
  price: number;
  mrp: number;
  inStock: boolean;
  stock: number;
  rating: number;
  reviewCount: number;
  featured?: boolean;
  isNew?: boolean;
  webOnly?: boolean;
  onlineOnly?: boolean;
  description: string;
  highlights: string[];
  specs: Spec[];
  tags: string[];
  imageHue: string;
  emoji: string;
}

export interface CartLine {
  productId: string;
  qty: number;
}

export type PaymentMethod = "cashfree" | "cod";

export interface Address {
  fullName: string;
  phone: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderLine {
  productId: string;
  name: string;
  slug: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  orderId: string;
  createdAt: string;
  customer: Address;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  orderStatus: "PLACED" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  cashfree?: {
    orderId?: string;
    paymentSessionId?: string;
    paymentLink?: string;
    referenceId?: string;
  };
}