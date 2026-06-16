import { NextResponse } from "next/server";
import { aiAsk } from "@/core/data/queries";
import type { LanguageCode } from "@/core/entities/entity";

const LANGS = new Set(["pl", "en", "es", "pt", "fr"]);

export async function POST(request: Request) {
  let prompt = "";
  let lang: LanguageCode = "pl";
  try {
    const body = await request.json();
    prompt = typeof body?.prompt === "string" ? body.prompt : "";
    const raw = typeof body?.lang === "string" ? body.lang : "pl";
    lang = (LANGS.has(raw) ? raw : "pl") as LanguageCode;
  } catch {
    prompt = "";
  }
  const result = aiAsk(prompt, lang);
  return NextResponse.json(result);
}
