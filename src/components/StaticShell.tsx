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
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {crumbs && (
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          <span>/</span>
          <span className="text-gray-600">{crumbs}</span>
        </nav>
      )}
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">{title}</h1>
      {subtitle && <p className="mt-3 max-w-2xl text-base leading-7 text-gray-500">{subtitle}</p>}
      <div className="mt-8 space-y-6">{children}</div>
    </div>
  );
}

export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
      <h2 className="text-lg font-bold text-gray-900">{heading}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-gray-600">{children}</div>
    </section>
  );
}