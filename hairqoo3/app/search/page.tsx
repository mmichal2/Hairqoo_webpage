import { Suspense } from "react";
import { Section } from "@/ui/primitives/Section";
import { SearchResults } from "@/modules/search";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return (
    <Section>
      <Suspense fallback={null}>
        <SearchResults initialQuery={q ?? ""} />
      </Suspense>
    </Section>
  );
}
