import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getByType, getEntityById } from "@/core/data/queries";
import type { EntityType } from "@/core/entities/entity";
import { EntityDetail } from "@/ui/sections/EntityDetail";

interface Params {
  params: Promise<{ type: string; id: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { type, id } = await params;
  const entity = getEntityById(type, id);
  if (!entity) return { title: "Nie znaleziono — Hairqoo" };
  return {
    title: `${entity.title} — Hairqoo`,
    description: entity.description,
  };
}

export default async function EntityPage({ params }: Params) {
  const { type, id } = await params;
  const entity = getEntityById(type, id);
  if (!entity) notFound();

  const related = getByType(entity.type as EntityType, 5).filter(
    (e) => e.id !== entity.id
  );

  return <EntityDetail entity={entity} related={related} />;
}
