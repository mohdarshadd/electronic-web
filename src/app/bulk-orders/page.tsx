import StaticShell, { Section } from "@/components/StaticShell";
import { site } from "@/lib/site";

export default function BulkOrdersPage() {
  return (
    <StaticShell
      crumbs="Bulk / College orders"
      title="Bulk & college orders"
      subtitle="Robotics clubs, hackathon organisers, STEM labs and event sponsors — get volume pricing, GST invoices and priority dispatch."
    >
      <Section heading="What we can do">
        <ul className="space-y-2">
          <li>• <strong>Event kits</strong> — ready-mixed kits for 10, 25, 50 or 100 participants</li>
          <li>• <strong>Lab supplies</strong> — recurring consumables at contract pricing</li>
          <li>• <strong>Custom bundles</strong> — hand-picked BOMs for your specific project</li>
          <li>• <strong>GST invoicing</strong> and one P.O. against one delivery</li>
          <li>• <strong>Priority dispatch</strong> so deadlines are never missed</li>
        </ul>
      </Section>
      <Section heading="How to get a quote">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Email us at <a className="font-semibold text-indigo-600" href={`mailto:bulk@volcart.in`}>bulk@volcart.in</a> with your quantity and deadline</li>
          <li>Share your list, or we&apos;ll recommend a kit</li>
          <li>Receive a formal quote with GST — valid for 15 days</li>
          <li>Approve, and we dispatch with a dedicated coordinator</li>
        </ol>
        <p className="mt-4 text-sm text-gray-500">For urgent events, call {site.contactPhone} and mention “bulk”.</p>
      </Section>
    </StaticShell>
  );
}