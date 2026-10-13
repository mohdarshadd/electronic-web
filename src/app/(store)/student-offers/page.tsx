import Link from "next/link";
import { site } from "@/lib/site";
import { STUDENT_DISCOUNT_CODE } from "@/lib/products";

export default function StudentOffersPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-coral-600 via-coral-500 to-coral-400 text-navy-950">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              🎓 Students save more
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Flat 10% off, every build.
            </h1>
            <p className="mt-4 text-base leading-7 text-navy-900/80">
              VoltCart is built for students — whether you&apos;re making your first line follower,
              grinding toward a hackathon trophy, or running the college robotics club. Verify
              your student status once and keep saving.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <code className="rounded-xl bg-white/20 px-4 py-2 font-mono text-lg font-bold">{STUDENT_DISCOUNT_CODE}</code>
              <Link href="/shop" className="rounded-xl bg-navy-900 px-6 py-3 text-sm font-bold text-cream-100 shadow-lift hover:bg-navy-800">
                Shop now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-navy-900/10 bg-white p-8 shadow-soft">
            <span className="text-3xl">✅</span>
            <h2 className="mt-3 text-xl font-bold text-navy-900">Is everyone eligible?</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-navy-600">
              <li>• School & college students with a valid ID</li>
              <li>• College clubs & societies (volume pricing separately)</li>
              <li>• Hackathon teams sponsored by colleges</li>
              <li>• STEM / robotics coaches buying for labs</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-navy-900/10 bg-white p-8 shadow-soft">
            <span className="text-3xl">🔓</span>
            <h2 className="mt-3 text-xl font-bold text-navy-900">How to claim your discount</h2>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-navy-600">
              <li><span className="mr-1.5 font-bold text-coral-700">1.</span> Order with your college email on checkout</li>
              <li><span className="mr-1.5 font-bold text-coral-700">2.</span> Apply code <code className="rounded bg-coral-50 px-1 font-mono font-bold text-coral-700">{STUDENT_DISCOUNT_CODE}</code> in the cart</li>
              <li><span className="mr-1.5 font-bold text-coral-700">3.</span> Share your ID photo with support within 48 hours (link in the order email)</li>
              <li><span className="mr-1.5 font-bold text-coral-700">4.</span> Save 10% on every future order for the academic year</li>
            </ol>
          </div>
        </div>

        <div className="mt-10 rounded-3xl bg-navy-900 px-8 py-10 text-cream-100">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-extrabold">Running an event or a robotics club?</h2>
            <p className="mt-3 text-sm leading-6 text-cream-100/80">
              Colleges and hackathon organisers get volume pricing, GST invoices and priority
              dispatch. Get a quote for your competition or exhibition batch.
            </p>
            <Link href="/bulk-orders" className="mt-5 inline-block rounded-xl bg-coral-500 px-6 py-3 text-sm font-bold text-navy-950 hover:bg-coral-400">
              Request a bulk quote
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-navy-500">
          Questions? Reach us at <a className="font-semibold text-coral-700" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> or call {site.contactPhone}.
        </p>
      </section>
    </>
  );
}