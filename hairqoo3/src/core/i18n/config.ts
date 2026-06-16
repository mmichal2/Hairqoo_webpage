import type { LanguageCode } from "@/core/entities/entity";

export const DEFAULT_LANGUAGE: LanguageCode = "pl";

export const SUPPORTED_LANGUAGES: {
  code: LanguageCode;
  flag: string;
  label: string;
}[] = [
  { code: "pl", flag: "🇵🇱", label: "Polski" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "pt", flag: "🇵🇹", label: "Português" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
];
