import StaticShell, { Section } from "@/components/StaticShell";
import { site } from "@/lib/site";

export default function ReturnsPage() {
  return (
    <StaticShell crumbs="Returns & refunds" title="Returns & refunds">
      <Section heading="Easy 7-day returns">
        <p>
          Changed your mind or got a faulty part? Raise a return within <strong>7 days</strong> of
          delivery and we&apos;ll pick it up for free.
        </p>
      </Section>
      <Section heading="When you can return">
        <ul className="space-y-2">
          <li>• Wrong or damaged product received</li>
          <li>• DOA (Dead On Arrival) — confirmed within 7 days</li>
          <li>• Item doesn&apos;t match the listing description</li>
        </ul>
        <p className="mt-4">Refunds are processed to your original payment method within 5–7 working days after pickup. COD refunds go to your bank account.</p>
      </Section>
      <Section heading="Exceptions">
        <p>
          Cut cables, torn packaging, and parts that show burn marks or physical damage from
          misuse can&apos;t be returned. Custom/bulk orders follow their own agreement.
        </p>
      </Section>
      <Section heading="Start a return">
        <p>
          Email <a className="font-semibold text-indigo-600" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> with
          your order ID and reason — we reply within one working day.
        </p>
      </Section>
    </StaticShell>
  );
}