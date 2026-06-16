import Link from "next/link";
import type { Entity } from "@/core/entities/entity";
import { Section } from "@/ui/primitives/Section";
import { HScroll } from "@/ui/primitives/HScroll";
import { EntityCard } from "@/ui/cards/EntityCard";

interface PreviewRowProps {
  id?: string;
  title: string;
  subtitle?: string;
  href: string;
  seeAllLabel: string;
  entities: Entity[];
}

/** Sekcja preview: nagłówek + link "zobacz wszystko" + poziomy carousel kart. */
export function PreviewRow({
  id,
  title,
  subtitle,
  href,
  seeAllLabel,
  entities,
}: PreviewRowProps) {
  return (
    <Section
      id={id}
      title={title}
      subtitle={subtitle}
      action={
        <Link href={href} style={{ fontWeight: 600, fontSize: "0.9rem" }}>
          {seeAllLabel} →
        </Link>
      }
    >
      <HScroll>
        {entities.map((e) => (
          <EntityCard key={e.id} entity={e} />
        ))}
      </HScroll>
    </Section>
  );
}
