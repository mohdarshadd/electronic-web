"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLine } from "@/lib/types";
import { computeCart } from "@/lib/cart";
import { STUDENT_DISCOUNT_CODE } from "@/lib/products";

interface CartContextValue {
  lines: CartLine[];
  coupon: string | null;
  count: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  add: (productId: string, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "voltcart.cart.v1";

function loadLines(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((l) => l && typeof l.productId === "string" && typeof l.qty === "number");
  } catch {
    return [];
  }
}

function loadCoupon(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("voltcart.coupon.v1");
    return raw || null;
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Hydrate from localStorage once on mount. This is the recommended pattern for
    // restoring client-side persisted UI state after SSR, so the lint rule is bypassed.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLines(loadLines());
    setCoupon(loadCoupon());
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignore quota
    }
  }, [lines]);

  useEffect(() => {
    try {
      if (coupon) window.localStorage.setItem("voltcart.coupon.v1", coupon);
      else window.localStorage.removeItem("voltcart.coupon.v1");
    } catch {
      // ignore
    }
  }, [coupon]);

  const add = useCallback((productId: string, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      if (existing) {
        return prev.map((l) =>
          l.productId === productId ? { ...l, qty: l.qty + qty } : l
        );
      }
      return [...prev, { productId, qty }];
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setLines((prev) => {
      if (qty <= 0) return prev.filter((l) => l.productId !== productId);
      return prev.map((l) => (l.productId === productId ? { ...l, qty } : l));
    });
  }, []);

  const applyCoupon = useCallback(
    (code: string): boolean => {
      const valid = code.trim().toUpperCase();
      if (valid === STUDENT_DISCOUNT_CODE) {
        setCoupon(STUDENT_DISCOUNT_CODE);
        return true;
      }
      return false;
    },
    []
  );

  const removeCoupon = useCallback(() => setCoupon(null), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const clear = useCallback(() => {
    setLines([]);
    setCoupon(null);
  }, []);

  const computed = useMemo(() => computeCart(lines, coupon || undefined), [lines, coupon]);
  const count = useMemo(() => lines.reduce((acc, l) => acc + l.qty, 0), [lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      coupon,
      count,
      subtotal: computed.subtotal,
      discount: computed.discount,
      shipping: computed.shipping,
      total: computed.total,
      add,
      remove,
      setQty,
      applyCoupon,
      removeCoupon,
      isOpen,
      openCart,
      closeCart,
      clear,
    }),
    [
      lines,
      coupon,
      count,
      computed,
      add,
      remove,
      setQty,
      applyCoupon,
      removeCoupon,
      isOpen,
      openCart,
      closeCart,
      clear,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}