import { Suspense } from "react";
import { notFound } from "next/navigation";
import ShopContent, { ShopSuspense } from "@/components/ShopContent";
import { categories } from "@/lib/products";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export default function CategoryPage(props: PageProps<"/category/[slug]">) {
  return (
    <Suspense fallback={<ShopSuspense />}>
      <CategoryContent slug={props.params.then((p) => p.slug)} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function CategoryContent({ slug, searchParams }: { slug: Promise<string>; searchParams: PageProps<"/category/[slug]">["searchParams"] }) {
  const resolved = await slug;
  const category = categories.find((c) => c.slug === resolved);
  if (!category) notFound();
  return (
    <ShopContent
      title={category.name}
      subtitle={category.description}
      category={category}
      params={searchParams.then((sp) => ({ ...sp, category: category.slug }))}
    />
  );
}