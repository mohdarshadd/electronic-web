import StaticShell, { Section } from "@/components/StaticShell";
import { site } from "@/lib/site";

export default function AboutPage() {
  return (
    <StaticShell
      crumbs="About us"
      title="We make building possible for Indian students."
      subtitle="VoltCart started the way most good ideas do — with a student who couldn't find the right part for a hackathon."
    >
      <Section heading="Why we exist">
        <p>
          Finding components for electronics projects in India is painful. Prices are opaque,
          stock is unreliable, and the parts you need are scattered across half a dozen sellers.
          We started VoltCart to fix that for the people who build: students, makers, robotics
          clubs and college labs.
        </p>
        <p>
          Everything we stock is tested, priced clearly (MRP, offers and GST always visible) and
          ships fast from our Mumbai warehouse — with checkout that actually fits how India pays
          (UPI, cards, netbanking and cash on delivery).
        </p>
      </Section>
      <Section heading="What we believe">
        <ul className="space-y-3">
          <li><span className="font-bold text-gray-900">Students first.</span> Discounts, kits sized for budgets, and guides written for beginners — not just datasheets.</li>
          <li><span className="font-bold text-gray-900">Honest specs.</span> Real ratings, real photos-info, real stock. If a clone is a clone, we say so.</li>
          <li><span className="font-bold text-gray-900">Built in India, for India.</span> Local support in your language and currency, priced for our market.</li>
        </ul>
      </Section>
      <Section heading="The team">
        <p>
          A small team of engineers and former competition-builders who still get excited about
          a clean PCB. We answer support ourselves — no bots.
        </p>
      </Section>
      <Section heading="Contact">
        <p>
          {site.legalName} · {site.address}
          <br />
          Email: <a className="font-semibold text-indigo-600" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
          <br />
          Phone: {site.contactPhone}
        </p>
      </Section>
    </StaticShell>
  );
}