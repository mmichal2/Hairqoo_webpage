"use client";

import { useDict } from "@/core/state/i18nStore";
import { getByType } from "@/core/data/queries";
import { PreviewRow } from "@/ui/sections/PreviewRow";

export function ProductFeedPreview() {
  const dict = useDict();
  return (
    <PreviewRow
      id="products"
      title={dict.sections.products}
      subtitle={dict.sections.productsSub}
      href="/products"
      seeAllLabel={dict.sections.seeAll}
      entities={getByType("product", 8)}
    />
  );
}
