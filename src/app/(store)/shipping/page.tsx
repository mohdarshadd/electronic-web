import StaticShell, { Section } from "@/components/StaticShell";
import { site } from "@/lib/site";

export default function ShippingPage() {
  return (
    <StaticShell crumbs="Shipping policy" title="Shipping policy">
      <Section heading="How fast will it arrive?">
        <p>• Orders placed before 4 PM IST are dispatched the same day.</p>
        <p>• Standard delivery: 1–3 working days to metros, 3–5 days to other cities.</p>
        <p>• We ship from Mumbai across all of India, via trusted partners.</p>
      </Section>
      <Section heading="Costs">
        <p>• Free shipping on orders above ₹499.</p>
        <p>• Below ₹499 a flat ₹49 shipping fee applies.</p>
        <p>• COD orders carry a small convenience fee at checkout where applicable.</p>
      </Section>
      <Section heading="Tracking">
        <p>You&apos;ll receive a tracking link by SMS/email the moment your parcel ships. Current location, expected delivery — everything live.</p>
        <p>Support email: <a className="font-semibold text-indigo-600" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a></p>
      </Section>
    </StaticShell>
  );
}