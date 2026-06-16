"use client";

import { useDict } from "@/core/state/i18nStore";
import { getByType } from "@/core/data/queries";
import { PreviewRow } from "@/ui/sections/PreviewRow";

export function CommunityFeedPreview() {
  const dict = useDict();
  return (
    <PreviewRow
      id="community"
      title={dict.sections.community}
      subtitle={dict.sections.communitySub}
      href="/community"
      seeAllLabel={dict.sections.seeAll}
      entities={getByType("post", 8)}
    />
  );
}
