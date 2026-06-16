/**
 * HAIRQOO 3.0 — Core entity model (GLOBAL).
 * Wszystko w systemie (event, educator, product, ...) to Entity.
 */

export type EntityType =
  | "event"
  | "educator"
  | "product"
  | "academy"
  | "salon"
  | "brand"
  | "post"
  | "video";

export type LanguageCode = "pl" | "en" | "es" | "pt" | "fr";

export interface MediaAsset {
  type: "image" | "video";
  url: string;
  alt?: string;
  poster?: string;
  /** CSS object-position dla kadrowania lokalnych assetów. */
  focalPoint?: string;
}

export interface EngagementMetrics {
  views: number;
  likes: number;
  saves: number;
  shares: number;
  comments: number;
}

export interface Entity {
  id: string;
  type: EntityType;
  title: string;
  description: string;
  location?: string;
  country?: string;
  language: LanguageCode;
  tags: string[];
  media: MediaAsset[];
  rating?: number;
  /** HairQoo Score (0-100) */
  score?: number;
  verified: boolean;
  dateCreated: string;
  dateEvent?: string;
  engagement: EngagementMetrics;
  ownerId?: string;
}

/** Typy encji, które mogą otrzymać znaczek "Verified". */
export const VERIFIABLE_TYPES: EntityType[] = [
  "educator",
  "brand",
  "event",
  "academy",
  "salon",
];

/** Typy encji objęte systemem HairQoo Score. */
export const SCORABLE_TYPES: EntityType[] = [
  "educator",
  "event",
  "product",
  "academy",
];

export interface SearchGroup {
  type: EntityType;
  label: string;
  items: Entity[];
}

export interface FeedPage {
  items: Entity[];
  nextCursor: string | null;
}

export interface AIResponse {
  answer: string;
  entities: Entity[];
  links: { label: string; href: string }[];
}
