"use client";

import type { EntityType } from "@/core/entities/entity";
import { useDict } from "@/core/state/i18nStore";
import { ListingPage } from "@/ui/sections/ListingPage";

type SectionKey =
  | "discover"
  | "events"
  | "educators"
  | "products"
  | "education"
  | "community"
  | "tv"
  | "career";

const TYPE_MAP: Record<SectionKey, EntityType[] | undefined> = {
  discover: undefined,
  events: ["event"],
  educators: ["educator"],
  products: ["product"],
  education: ["academy", "event"],
  community: ["post"],
  tv: ["video"],
  career: ["salon", "academy"],
};

export function RouteListing({ section }: { section: SectionKey }) {
  const dict = useDict();
  const title = dict.sections[section];
  const subtitle = dict.sections[`${section}Sub` as keyof typeof dict.sections];
  return (
    <ListingPage
      title={title}
      subtitle={subtitle as string}
      types={TYPE_MAP[section]}
    />
  );
}
