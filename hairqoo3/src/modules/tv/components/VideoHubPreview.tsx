"use client";

import { useDict } from "@/core/state/i18nStore";
import { getByType } from "@/core/data/queries";
import { PreviewRow } from "@/ui/sections/PreviewRow";

export function VideoHubPreview() {
  const dict = useDict();
  return (
    <PreviewRow
      id="tv"
      title={dict.sections.tv}
      subtitle={dict.sections.tvSub}
      href="/tv"
      seeAllLabel={dict.sections.seeAll}
      entities={getByType("video", 8)}
    />
  );
}
