import fs from "node:fs";
import path from "node:path";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, COUPONS } from "./products";
import { site } from "./site";

export interface CouponSetting {
  name: string;
  pct: number;
  enabled: boolean;
}

export interface SiteSettings {
  announcementEnabled: boolean;
  announcement: string;
  freeShippingEnabled: boolean;
  freeShippingThreshold: number;
  shippingFee: number;
  coupons: Record<string, CouponSetting>;
  updatedAt?: string;
}

function defaults(): SiteSettings {
  const coupons: Record<string, CouponSetting> = {};
  for (const [code, c] of Object.entries(COUPONS)) {
    coupons[code] = { name: c.name, pct: c.pct, enabled: true };
  }
  return {
    announcementEnabled: true,
    announcement: site.announcement,
    freeShippingEnabled: true,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    shippingFee: SHIPPING_FEE,
    coupons,
  };
}

function filePath(): string {
  return `${process.cwd()}/.data/settings.json`;
}

export function getSettings(): SiteSettings {
  const d = defaults();
  try {
    if (fs.existsSync(filePath())) {
      const parsed = JSON.parse(fs.readFileSync(filePath(), "utf-8")) as Partial<SiteSettings>;
      return {
        ...d,
        announcementEnabled: parsed.announcementEnabled ?? d.announcementEnabled,
        announcement: typeof parsed.announcement === "string" ? parsed.announcement : d.announcement,
        freeShippingEnabled: parsed.freeShippingEnabled ?? d.freeShippingEnabled,
        freeShippingThreshold: parsed.freeShippingThreshold ?? d.freeShippingThreshold,
        shippingFee: parsed.shippingFee ?? d.shippingFee,
        coupons: { ...d.coupons, ...(parsed.coupons ?? {}) },
      };
    }
  } catch {
    // ignore
  }
  return d;
}

export function saveSettings(patch: Partial<SiteSettings>): SiteSettings {
  const current = getSettings();
  const next: SiteSettings = { ...current, ...patch, updatedAt: new Date().toISOString() };
  try {
    fs.mkdirSync(path.dirname(filePath()), { recursive: true });
    fs.writeFileSync(filePath(), JSON.stringify(next, null, 2), "utf-8");
  } catch {
    // ignore
  }
  return next;
}

export function getShippingPolicy() {
  const s = getSettings();
  return {
    freeShippingEnabled: s.freeShippingEnabled,
    freeShippingThreshold: s.freeShippingEnabled ? s.freeShippingThreshold : Number.POSITIVE_INFINITY,
    shippingFee: s.shippingFee,
  };
}

export function getPublicSettings() {
  const s = getSettings();
  const couponsEnabled: Record<string, boolean> = {};
  for (const [code, c] of Object.entries(s.coupons)) {
    couponsEnabled[code] = c.enabled;
  }
  return {
    announcementEnabled: s.announcementEnabled,
    announcement: s.announcement,
    freeShippingEnabled: s.freeShippingEnabled,
    freeShippingThreshold: s.freeShippingThreshold,
    shippingFee: s.shippingFee,
    couponsEnabled,
  };
}