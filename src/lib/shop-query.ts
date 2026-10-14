export type ShopParams = {
  category?: string;
  brand?: string;
  sort?: string;
  min?: string;
  max?: string;
  instock?: string;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

export function normalizeShopParams(raw: RawSearchParams): ShopParams {
  const pick = (k: string): string | undefined => (typeof raw[k] === "string" ? (raw[k] as string) : undefined);
  return {
    category: pick("category"),
    brand: pick("brand"),
    sort: pick("sort"),
    min: pick("min"),
    max: pick("max"),
    instock: pick("instock"),
  };
}

export function buildShopQuery(params: ShopParams): string {
  const sp = new URLSearchParams();
  if (params.category) sp.set("category", params.category);
  if (params.brand) sp.set("brand", params.brand);
  if (params.sort) sp.set("sort", params.sort);
  if (params.min) sp.set("min", params.min);
  if (params.max) sp.set("max", params.max);
  if (params.instock) sp.set("instock", params.instock);
  const q = sp.toString();
  return q ? `?${q}` : "";
}
