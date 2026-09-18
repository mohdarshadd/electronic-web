import { Suspense } from "react";
import ShopContent, { ShopSuspense } from "@/components/ShopContent";

export default function ShopPage(props: PageProps<"/shop">) {
  return (
    <Suspense fallback={<ShopSuspense />}>
      <ShopContent title="All Products" subtitle="Browse the full VoltCart catalogue — sensors, boards, motors, kits and everything in between." params={props.searchParams} />
    </Suspense>
  );
}