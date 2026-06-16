"use client";

import { useDict } from "@/core/state/i18nStore";
import { getByType } from "@/core/data/queries";
import { PreviewRow } from "@/ui/sections/PreviewRow";

export function EducationHubPreview() {
  const dict = useDict();
  const entities = [...getByType("academy", 4), ...getByType("event", 4)];
  return (
    <PreviewRow
      id="education"
      title={dict.sections.education}
      subtitle={dict.sections.educationSub}
      href="/education"
      seeAllLabel={dict.sections.seeAll}
      entities={entities}
    />
  );
}
