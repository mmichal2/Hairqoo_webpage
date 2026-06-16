"use client";

import { useDict } from "@/core/state/i18nStore";
import { getTrending } from "@/core/data/queries";
import { PreviewRow } from "@/ui/sections/PreviewRow";

export function TrendingPanel() {
  const dict = useDict();
  return (
    <PreviewRow
      id="trending"
      title={dict.sections.trending}
      subtitle={dict.sections.trendingSub}
      href="/discover"
      seeAllLabel={dict.sections.seeAll}
      entities={getTrending(8)}
    />
  );
}
