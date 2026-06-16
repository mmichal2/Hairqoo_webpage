import type { Entity } from "@/core/entities/entity";
import { EventCard } from "./EventCard";
import { EducatorCard } from "./EducatorCard";
import { ProductCard } from "./ProductCard";
import { VideoCard } from "./VideoCard";

/**
 * Uniwersalny renderer encji — wybiera wyspecjalizowaną kartę po `type`.
 */
export function EntityCard({ entity }: { entity: Entity }) {
  switch (entity.type) {
    case "event":
      return <EventCard entity={entity} />;
    case "educator":
    case "salon":
    case "brand":
    case "academy":
      return <EducatorCard entity={entity} />;
    case "product":
      return <ProductCard entity={entity} />;
    case "video":
    case "post":
      return <VideoCard entity={entity} />;
    default:
      return <EventCard entity={entity} />;
  }
}
