import Link from "next/link";
import { site, footerLinks } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 2 3.5 13.5H11L9.5 22 19 10.5H11.5L13 2z" />
                </svg>
              </span>
              <span className="text-xl font-extrabold tracking-tight text-gray-900">
                Volt<span className="text-indigo-600">Cart</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-gray-600">{site.description}</p>
            <p className="mt-4 text-sm font-medium text-gray-800">{site.contactPhone}</p>
            <p className="text-sm text-gray-600">{site.contactEmail}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">{footerLinks.shop.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.shop.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-600 transition hover:text-indigo-600">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">{footerLinks.help.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.help.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-600 transition hover:text-indigo-600">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">{footerLinks.company.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.company.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-600 transition hover:text-indigo-600">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-gray-200 pt-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {site.legalName}. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700">UPI</span>
            <span className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700">Visa</span>
            <span className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700">Mastercard</span>
            <span className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700">RuPay</span>
            <span className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700">NetBanking</span>
            <span className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}