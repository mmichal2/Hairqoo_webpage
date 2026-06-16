import { NextResponse } from "next/server";
import { search, suggestions } from "@/core/data/queries";
import type { EntityType, LanguageCode } from "@/core/entities/entity";

const LANGS = new Set(["pl", "en", "es", "pt", "fr"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const country = searchParams.get("country") ?? undefined;
  const language = searchParams.get("language") ?? undefined;
  const type = (searchParams.get("type") as EntityType | null) ?? undefined;
  const tagsParam = searchParams.get("tags");
  const tags = tagsParam ? tagsParam.split(",").filter(Boolean) : undefined;
  const langParam = searchParams.get("lang") ?? "pl";
  const lang = (LANGS.has(langParam) ? langParam : "pl") as LanguageCode;

  const groups = search(q, { country, language, type, tags }, lang);
  const suggest = suggestions(q);

  return NextResponse.json({ query: q, groups, suggestions: suggest });
}
