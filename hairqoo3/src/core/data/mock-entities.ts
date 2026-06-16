import type { Entity, EntityType, LanguageCode } from "@/core/entities/entity";
import { entityMedia } from "./asset-catalog";

function engagement(base: number) {
  return {
    views: base * 37,
    likes: Math.round(base * 4.2),
    saves: Math.round(base * 1.6),
    shares: Math.round(base * 0.9),
    comments: Math.round(base * 0.7),
  };
}

interface Seed {
  type: EntityType;
  title: string;
  description: string;
  location?: string;
  country?: string;
  language?: LanguageCode;
  tags: string[];
  rating?: number;
  score?: number;
  verified?: boolean;
  dateEvent?: string;
  pop: number;
}

const SEEDS: Seed[] = [
  // EVENTS
  {
    type: "event",
    title: "Hairqoo World Summit 2026",
    description:
      "Największy zjazd branży fryzjerskiej — pokazy na żywo, premiery i networking z najlepszymi edukatorami.",
    location: "Warszawa, PL",
    country: "Polska",
    tags: ["summit", "pokazy", "networking"],
    score: 96,
    verified: true,
    dateEvent: "2026-09-18",
    pop: 980,
  },
  {
    type: "event",
    title: "Balayage Masterclass Live",
    description:
      "Intensywny warsztat techniki balayage z certyfikatem. Praca na modelkach i sesja Q&A.",
    location: "Kraków, PL",
    country: "Polska",
    tags: ["balayage", "warsztat", "kolor"],
    score: 88,
    verified: true,
    dateEvent: "2026-07-04",
    pop: 540,
  },
  {
    type: "event",
    title: "Barber Battle Europe",
    description:
      "Mistrzostwa barberingu — fade, brzytwa, stylizacja brody. Setki widzów i jury światowej klasy.",
    location: "Berlin, DE",
    country: "Niemcy",
    tags: ["barber", "zawody", "fade"],
    score: 91,
    verified: true,
    dateEvent: "2026-08-22",
    pop: 720,
  },
  {
    type: "event",
    title: "Color Trends Forum",
    description: "Premiera trendów koloryzacji na sezon — paleta, formuły i inspiracje.",
    location: "Lizbona, PT",
    country: "Portugalia",
    tags: ["kolor", "trendy"],
    score: 79,
    dateEvent: "2026-10-11",
    pop: 310,
  },

  // EDUCATORS
  {
    type: "educator",
    title: "Anna Kowalska",
    description:
      "Edukatorka koloryzacji z 12-letnim stażem. Specjalizacja: blonde & balayage. Ponad 200 przeszkolonych stylistów.",
    location: "Warszawa, PL",
    country: "Polska",
    tags: ["kolor", "blonde", "balayage"],
    score: 94,
    rating: 4.9,
    verified: true,
    pop: 860,
  },
  {
    type: "educator",
    title: "Marco Rossi",
    description:
      "Master barber i juror międzynarodowy. Autorskie techniki fade oraz stylizacji brody.",
    location: "Mediolan, IT",
    country: "Włochy",
    tags: ["barber", "fade", "broda"],
    score: 90,
    rating: 4.8,
    verified: true,
    pop: 690,
  },
  {
    type: "educator",
    title: "Sophie Laurent",
    description:
      "Stylistka redakcyjna i edukatorka cięć precyzyjnych. Współpraca z domami mody.",
    location: "Paryż, FR",
    country: "Francja",
    tags: ["cięcie", "editorial"],
    score: 87,
    rating: 4.7,
    verified: true,
    pop: 470,
  },

  // PRODUCTS
  {
    type: "product",
    title: "ProColor Bond 9%",
    description: "Profesjonalny utleniacz z technologią ochrony włókna. Stabilny czas pracy.",
    country: "Polska",
    tags: ["utleniacz", "kolor", "ochrona"],
    rating: 4.6,
    score: 84,
    verified: true,
    pop: 410,
  },
  {
    type: "product",
    title: "FadeMaster Clipper X",
    description: "Maszynka bezprzewodowa z ostrzem tytanowym. 4h pracy, idealna do fade.",
    country: "Niemcy",
    tags: ["maszynka", "barber", "narzędzia"],
    rating: 4.8,
    score: 89,
    verified: true,
    pop: 600,
  },
  {
    type: "product",
    title: "Toner Beige Silk",
    description: "Toner do neutralizacji ciepłych odcieni. Efekt jedwabistego beżu.",
    country: "Hiszpania",
    tags: ["toner", "blonde"],
    rating: 4.4,
    score: 76,
    pop: 240,
  },

  // VIDEOS
  {
    type: "video",
    title: "Balayage od podstaw — pełny proces",
    description: "Krok po kroku: sekcjonowanie, nakładanie i tonowanie.",
    country: "Polska",
    tags: ["balayage", "tutorial"],
    pop: 1500,
  },
  {
    type: "video",
    title: "Perfekcyjny skin fade w 8 minut",
    description: "Technika fade z brzytwą — tempo i precyzja.",
    country: "Niemcy",
    tags: ["fade", "barber"],
    pop: 2100,
  },
  {
    type: "video",
    title: "Wywiad: przyszłość edukacji fryzjerskiej",
    description: "Rozmowa z liderami branży o trendach i technologii.",
    country: "Francja",
    tags: ["wywiad", "edukacja"],
    pop: 760,
  },

  // ACADEMY / SALON / BRAND
  {
    type: "academy",
    title: "Hairqoo Academy Warszawa",
    description: "Certyfikowane kursy koloryzacji, strzyżenia i biznesu salonowego.",
    location: "Warszawa, PL",
    country: "Polska",
    tags: ["akademia", "certyfikat"],
    score: 92,
    verified: true,
    pop: 520,
  },
  {
    type: "salon",
    title: "Studio Glow",
    description: "Premium salon z zespołem 8 stylistów. Specjalizacja: koloryzacja i pielęgnacja.",
    location: "Gdańsk, PL",
    country: "Polska",
    tags: ["salon", "premium"],
    score: 81,
    verified: true,
    pop: 280,
  },
  {
    type: "brand",
    title: "LUMINA Professional",
    description: "Marka kosmetyków profesjonalnych — kolor, pielęgnacja i stylizacja.",
    country: "Hiszpania",
    tags: ["marka", "kosmetyki"],
    score: 85,
    verified: true,
    pop: 350,
  },

  // POSTS / COMMUNITY
  {
    type: "post",
    title: "Case study: ratowanie przefarbowanych włosów",
    description: "Jak bezpiecznie przejść z czerni do beżowego blondu w 3 sesjach.",
    country: "Polska",
    tags: ["case-study", "kolor"],
    pop: 430,
  },
  {
    type: "post",
    title: "Jak wycenić usługę balayage?",
    description: "Dyskusja biznesowa: koszty, czas i marża w usługach premium.",
    country: "Polska",
    tags: ["biznes", "wycena"],
    pop: 390,
  },
];

const LANG_CYCLE: LanguageCode[] = ["pl", "pl", "en", "es", "pt", "fr"];

export const MOCK_ENTITIES: Entity[] = SEEDS.map((s, i) => ({
  id: `${s.type}-${i + 1}`,
  type: s.type,
  title: s.title,
  description: s.description,
  location: s.location,
  country: s.country,
  language: s.language ?? LANG_CYCLE[i % LANG_CYCLE.length],
  tags: s.tags,
  media: [entityMedia(s.type, `${s.type}-${i + 1}`, s.title)],
  rating: s.rating,
  score: s.score,
  verified: Boolean(s.verified),
  dateCreated: new Date(2026, 0, 1 + i * 3).toISOString(),
  dateEvent: s.dateEvent,
  engagement: engagement(s.pop),
  ownerId: `owner-${(i % 5) + 1}`,
}));
