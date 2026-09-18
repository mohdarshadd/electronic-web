import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4 py-16 text-center">
      <div>
        <p className="text-6xl font-extrabold text-indigo-200">404</p>
        <h1 className="mt-4 text-2xl font-extrabold text-gray-900">Page not found</h1>
        <p className="mt-2 text-sm text-gray-500">
          That link doesn&apos;t exist — or the part you&apos;re after isn&apos;t live yet.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">
            Back home
          </Link>
          <Link href="/shop" className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50">
            Browse products
          </Link>
        </div>
      </div>
    </div>
  );
}