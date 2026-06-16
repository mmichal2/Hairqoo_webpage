"use client";

import { useDict } from "@/core/state/i18nStore";
import { getByType } from "@/core/data/queries";
import { PreviewRow } from "@/ui/sections/PreviewRow";

export function EventsPreview() {
  const dict = useDict();
  return (
    <PreviewRow
      id="events"
      title={dict.sections.events}
      subtitle={dict.sections.eventsSub}
      href="/events"
      seeAllLabel={dict.sections.seeAll}
      entities={getByType("event", 8)}
    />
  );
}
