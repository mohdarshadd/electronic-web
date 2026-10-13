import Link from "next/link";
import { site, footerLinks } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-auto bg-gradient-to-b from-navy-950 to-[#081020] text-cream-100/70">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-coral-500 text-navy-950 shadow-glow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 2 3.5 13.5H11L9.5 22 19 10.5H11.5L13 2z" />
                </svg>
              </span>
              <span className="text-xl font-extrabold tracking-tight text-cream-100">
                Volt<span className="text-coral-400">Cart</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-cream-100/60">{site.description}</p>
            <p className="mt-4 text-sm font-medium text-cream-100/90">{site.contactPhone}</p>
            <a href={`mailto:${site.contactEmail}`} className="text-sm text-cream-100/60 transition hover:text-coral-300">{site.contactEmail}</a>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-cream-100/40">{footerLinks.shop.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.shop.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-cream-100/60 transition hover:text-coral-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-cream-100/40">{footerLinks.help.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.help.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-cream-100/60 transition hover:text-coral-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-cream-100/40">{footerLinks.company.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.company.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-cream-100/60 transition hover:text-coral-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-cream-100/45 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {site.legalName}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-cream-100/70">UPI</span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-cream-100/70">Visa</span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-cream-100/70">Mastercard</span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-cream-100/70">RuPay</span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-cream-100/70">NetBanking</span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-cream-100/70">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}