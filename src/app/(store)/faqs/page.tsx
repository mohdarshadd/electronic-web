import StaticShell, { Section } from "@/components/StaticShell";
import { site } from "@/lib/site";

const faqs = [
  {
    q: "Do you offer Cash on Delivery?",
    a: "Yes. UPI, cards, netbanking and cash on delivery are all supported at checkout. COD is free until we reach a minimum total is applied, which we show before you confirm.",
  },
  {
    q: "How do I use the student discount?",
    a: "Apply code STUDENT10 on the cart page, then use your college email at checkout. Share your student ID via the link in the order email within 48 hours to keep the discount active.",
  },
  {
    q: "Are your components genuine?",
    a: "We source from authorised distributors and test stock at three quality gates. Where a product is a compatible clone, we label it honestly in the listing.",
  },
  {
    q: "Do you ship to college hostels and PGs?",
    a: "Absolutely — most of our orders go there. Just add your hostel/building in the address, and our couriers will call before delivery.",
  },
  {
    q: "What if I order the wrong part for my hackathon?",
    a: "Return it within 7 days with free pickup. For urgent builds, chat with support first — we'll help you pick the right pinout in minutes.",
  },
  {
    q: "Can my college club buy in bulk?",
    a: "Yes. Volume pricing, GST invoice and priority dispatch are available — see the Bulk / College Orders page.",
  },
];

export default function FaqPage() {
  return (
    <StaticShell crumbs="FAQs" title="Frequently asked questions">
      <Section heading="Quick answers">
        <div className="space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-xl border border-gray-200 p-4 open:bg-gray-50">
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-bold text-gray-900">
                {f.q}
                <span className="text-gray-400 transition group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-gray-600">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Anything else? Email <a className="font-semibold text-indigo-600" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> or call {site.contactPhone}.
        </p>
      </Section>
    </StaticShell>
  );
}