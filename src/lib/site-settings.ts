export interface PublicSiteSettings {
  announcementEnabled: boolean;
  announcement: string;
  freeShippingEnabled: boolean;
  freeShippingThreshold: number;
  shippingFee: number;
  couponsEnabled: Record<string, boolean>;
}

let settingsPromise: Promise<PublicSiteSettings | null> | null = null;

/**
 * Shares one /api/site/settings request between the header and the cart so
 * every page load only pays for it once.
 */
export function loadSiteSettings(): Promise<PublicSiteSettings | null> {
  if (!settingsPromise) {
    settingsPromise = fetch("/api/site/settings")
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        return (data?.settings ?? null) as PublicSiteSettings | null;
      })
      .catch(() => null);
  }
  return settingsPromise;
}
