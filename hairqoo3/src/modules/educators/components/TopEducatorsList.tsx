"use client";

import { useDict } from "@/core/state/i18nStore";
import { getByType } from "@/core/data/queries";
import { PreviewRow } from "@/ui/sections/PreviewRow";

export function TopEducatorsList() {
  const dict = useDict();
  return (
    <PreviewRow
      id="educators"
      title={dict.sections.educators}
      subtitle={dict.sections.educatorsSub}
      href="/educators"
      seeAllLabel={dict.sections.seeAll}
      entities={getByType("educator", 8)}
    />
  );
}
