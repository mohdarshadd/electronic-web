const SDK_URL = "https://sdk.cashfree.com/js/v3/cashfree.js";

type CheckoutClient = {
  checkout: {
    render: (opts: CheckoutRenderOptions) => Promise<void> | void;
  };
};

declare global {
  interface Window {
    Cashfree?: new (opts: { mode: CashfreeMode }) => CheckoutClient;
  }
}

export type CashfreeMode = "sandbox" | "production";

export interface CheckoutRenderOptions {
  paymentSessionId: string;
  redirectTarget?: "_self" | "_top" | "_blank";
}

export async function loadCashfreeSdk(): Promise<NonNullable<Window["Cashfree"]>> {
  if (typeof window === "undefined") {
    throw new Error("Cashfree SDK can only be loaded in the browser");
  }
  if (window.Cashfree) return window.Cashfree;

  const script = document.createElement("script");
  script.src = SDK_URL;
  script.async = true;
  await new Promise<void>((resolve, reject) => {
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Cashfree SDK"));
    document.head.appendChild(script);
  });

  if (!window.Cashfree) throw new Error("Cashfree SDK failed to initialise");
  return window.Cashfree;
}

export async function renderCashfreeCheckout(
  mode: CashfreeMode,
  options: CheckoutRenderOptions
): Promise<void> {
  const Cashfree = await loadCashfreeSdk();
  const cf = new Cashfree({ mode });
  await cf.checkout.render(options);
}