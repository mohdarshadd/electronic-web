import Link from "next/link";
import type { ReactNode } from "react";

export default function StaticShell({
  crumbs,
  title,
  subtitle,
  children,
}: {
  crumbs?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      {crumbs && (
        <nav className="flex items-center gap-1.5 text-xs text-navy-400">
          <Link href="/" className="hover:text-coral-700">Home</Link>
          <span>/</span>
          <span className="text-navy-600">{crumbs}</span>
        </nav>
      )}
      <h1 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-navy-900">{title}</h1>
      {subtitle && <p className="mt-3 max-w-2xl text-base leading-7 text-navy-500">{subtitle}</p>}
      <div className="mt-8 space-y-6">{children}</div>
    </div>
  );
}

export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-navy-900/5 sm:p-8">
      <h2 className="text-lg font-bold text-navy-900">{heading}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-navy-600">{children}</div>
    </section>
  );
}