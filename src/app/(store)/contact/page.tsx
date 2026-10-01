import StaticShell, { Section } from "@/components/StaticShell";
import { site } from "@/lib/site";

export default function ContactPage() {
  return (
    <StaticShell crumbs="Contact" title="Talk to a human">
      <Section heading="Support">
        <p>Real engineers, not bots. For order questions, wiring help or a part you can&apos;t find.</p>
        <ul className="space-y-1.5">
          <li>• Email: <a className="font-semibold text-indigo-600" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a></li>
          <li>• Phone: {site.contactPhone} (Mon–Sat, 10 AM – 7 PM IST)</li>
          <li>• Live chat: bottom-right of every page</li>
        </ul>
      </Section>
      <Section heading="Our address">
        <p>{site.legalName}</p>
        <p>{site.address}</p>
      </Section>
    </StaticShell>
  );
}