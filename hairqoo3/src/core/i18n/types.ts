import type { EntityType, LanguageCode } from "@/core/entities/entity";

export interface Dict {
  brand: string;
  tagline: string;
  hero: {
    title: string;
    highlight: string;
    lead: string;
  };
  nav: {
    discover: string;
    events: string;
    calendar: string;
    map: string;
    education: string;
    educators: string;
    products: string;
    community: string;
    career: string;
    tv: string;
    awards: string;
    passport: string;
  };
  search: {
    placeholder: string;
    trending: string;
    submit: string;
    voice: string;
    voiceListening: string;
    voiceUnsupported: string;
    voiceDenied: string;
    allResults: string;
    noResults: string;
    resultsFor: string;
    itemsCount: string;
  };
  ai: {
    title: string;
    subtitle: string;
    placeholder: string;
    send: string;
    open: string;
    thinking: string;
    suggestionsTitle: string;
    prompts: string[];
  };
  portals: {
    businessHeadline: string;
    clientHeadline: string;
    salonTitle: string;
    salonDesc: string;
    salonCta: string;
    clientTitle: string;
    clientDesc: string;
    clientCta: string;
  };
  sections: {
    discover: string;
    discoverSub: string;
    trending: string;
    trendingSub: string;
    events: string;
    eventsSub: string;
    calendar: string;
    calendarSub: string;
    map: string;
    mapSub: string;
    education: string;
    educationSub: string;
    educators: string;
    educatorsSub: string;
    products: string;
    productsSub: string;
    community: string;
    communitySub: string;
    career: string;
    careerSub: string;
    tv: string;
    tvSub: string;
    awards: string;
    awardsSub: string;
    passport: string;
    passportSub: string;
    seeAll: string;
  };
  newsletter: {
    title: string;
    desc: string;
    placeholder: string;
    cta: string;
    success: string;
  };
  footer: {
    product: string;
    company: string;
    legal: string;
    language: string;
    rights: string;
    privacy: string;
    terms: string;
    cookies: string;
  };
  common: {
    verified: string;
    loading: string;
    loadMore: string;
    country: string;
    language: string;
    allCountries: string;
    close: string;
    apply: string;
    backHome: string;
    similar: string;
    noFilterResults: string;
    profile: string;
    items: string;
  };
  theme: {
    light: string;
    dark: string;
  };
  entityTypes: Record<EntityType, string>;
  /** Etykiety grup w wynikach wyszukiwania (liczba mnoga). */
  entityGroups: Record<EntityType, string>;
  verified: Record<EntityType, string> & { default: string };
  entityDetail: {
    views: string;
    likes: string;
    saves: string;
    shares: string;
  };
  calendar: {
    month: string;
    week: string;
    year: string;
  };
  awards: {
    educatorOfYear: string;
    eventOfYear: string;
    productOfYear: string;
    vote: string;
    voted: string;
  };
  career: {
    roles: string[];
    apply: string;
  };
  map: {
    ecosystemLabel: string;
  };
  passport: {
    items: { year: string; label: string }[];
  };
  feed: {
    end: string;
  };
  profile: {
    label: string;
    itemsInEcosystem: string;
  };
  errors: {
    searchFailed: string;
    aiFailed: string;
    aiNoMatch: string;
  };
  aiAnswers: {
    found: string;
    foundOne: string;
    typeEvent: string;
    typeEducator: string;
    typeProduct: string;
    typeVideo: string;
    typeDefault: string;
    allResults: string;
    eventsLink: string;
    educatorsLink: string;
    productsLink: string;
  };
  layout: {
    mainNav: string;
    mobileNav: string;
    homeTab: string;
  };
}

export type { LanguageCode };

export function getEntityTypeLabels(dict: Dict): Record<EntityType, string> {
  return dict.entityTypes;
}
