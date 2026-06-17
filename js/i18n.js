import es from "./locales/es.js?version=6.6.0";
import pt from "./locales/pt.js?version=6.6.0";
import fr from "./locales/fr.js?version=6.6.0";

export const SUPPORTED_LANGUAGES = [
  { code: "pl", flag: "🇵🇱", labelKey: "languages.pl" },
  { code: "en", flag: "🇬🇧", labelKey: "languages.en" },
  { code: "es", flag: "🇪🇸", labelKey: "languages.es" },
  { code: "pt", flag: "🇵🇹", labelKey: "languages.pt" },
  { code: "fr", flag: "🇫🇷", labelKey: "languages.fr" },
];

export const CHAMBER_CONFIG = {
  salon: [
    "home",
    "clients",
    "visit",
    "calendar",
    "wallet",
    "formulas",
    "timers",
    "portfolio",
    "social",
    "retention",
    "notifications",
  ],
  client: ["home", "book", "bookings", "ai-consultant"],
};

export const translations = {
  pl: {
    meta: {
      title: "Hairqoo — Twój przewodnik po aplikacji",
      description:
        "Zobacz Hairqoo od środka — przejdź przez portal fryzjera albo klienta i odkryj, jak wygląda praca w salonie na co dzień.",
    },
    preloader: {
      tag: "MISJA: PIĘKNO",
      s1: "Kalibrujemy system…",
      s2: "Ładujemy Twoje doświadczenie…",
      s3: "Otwieramy portale…",
      s4: "Prawie gotowe…",
      ready: "Witaj w Hairqoo",
    },
    header: { backToGate: "Wróć na start", home: "Strona główna" },
    languages: {
      menuTooltip: "Język aplikacji",
      pl: "Polski",
      en: "Angielski",
      es: "Hiszpański",
      pt: "Portugalski",
      fr: "Francuski",
    },
    theme: {
      toggleLight: "Tryb jasny",
      toggleDark: "Tryb ciemny",
      ariaLabel: "Przełącz motyw",
    },
    gate: {
      headlineLeft: "Twój biznes",
      headlineRight: "Twoje wizyty",
      subtitle:
        "Rezerwacje, formuły, zdjęcia i podziękowania po wizycie — wszystko w jednym miejscu. Bez przełączania aplikacji, bez chaosu.",
      salonTitle: "Portal Fryzjera",
      salonDesc: "Zajrzyj do środka i zobacz, jak wygląda Twój dzień pracy w salonie.",
      salonEnter: "Startuję tour salonu →",
      clientTitle: "Portal Klienta",
      clientDesc: "Umów wizytę w kilka kliknięć i trzymaj swoje terminy pod kontrolą.",
      clientEnter: "Wchodzę jako klient →",
    },
    nav: {
      next: "Dalej",
      back: "Cofnij",
      finish: "Zakończ tour",
      scrollDown: "Następna sekcja",
      scrollFinish: "Zakończ tour",
      scrollDownAria: "Przejdź do następnej sekcji",
      scrollFinishAria: "Przejdź do zakończenia tour",
    },
    salon: {
      home: {
        title: "Twój punkt startu",
        subtitle: "Tu zaczynasz dzień — masz pod ręką wszystko, czego potrzebujesz w salonie.",
        hint: "To Twój kokpit. Jedno spojrzenie i wiesz, co się dzieje: wizyty, klienci, formuły.",
        f1: "Baza klientów i formuły",
        f2: "Kalendarz i portfel",
        f3: "Portfolio i social media",
      },
      clients: {
        title: "Twoi klienci",
        subtitle: "Historia wizyt, notatki, formuły i zdjęcia — wszystko przy jednej osobie.",
        hint: "Szukasz kogoś? Wpisz imię lub numer — możesz też użyć wyszukiwania głosowego.",
        f1: "Pełna historia klienta",
        f2: "Preferencje i alergie",
        f3: "Nadchodzące wizyty",
      },
      visit: {
        title: "Karta wizyty",
        subtitle: "Zapisz formułę, zdjęcia przed/po, koszt i notatki — wszystko podczas jednej wizyty.",
        hint: "Po wizycie możesz od razu wysłać klientowi podziękowanie mailem. Miły gest, zero wysiłku.",
        f1: "Receptura koloryzacji",
        f2: "Zdjęcia przed i po",
        f3: "Koszt usługi trafia do portfela",
      },
      calendar: {
        title: "Kalendarz",
        subtitle: "Wizyty, blokady czasu i rezerwacje online — wszystko w jednym widoku.",
        hint: "Klient rezerwuje sam, a Ty widzisz to od razu w kalendarzu. Bez telefonów w pośpiechu.",
        f1: "Widok dnia i tygodnia",
        f2: "Blokady czasu",
        f3: "Grafik zespołu",
      },
      wallet: {
        title: "Portfel",
        subtitle: "Przychody salonu, statystyki per klient i raporty PDF — na wyciągnięcie ręki.",
        hint: "Koszt z karty wizyty wpada tu automatycznie. Nie musisz nic przepisywać ręcznie.",
        f1: "Przychody per klient",
        f2: "Kalendarz przychodów",
        f3: "Raport PDF do pobrania",
      },
      formulas: {
        title: "Formuły pod ręką",
        subtitle: "Ostatnie receptury koloryzacji — od razu widzisz, co robiłaś ostatnio.",
        hint: "Wybierz klienta i przejrzyj wszystkie formuły chronologicznie. Koniec z zgadywaniem.",
        f1: "Szybkie wyszukiwanie klienta",
        f2: "Historia wszystkich formuł",
        f3: "Kopiuj recepturę jednym kliknięciem",
      },
      timers: {
        title: "Timery koloryzacji",
        subtitle: "Farba, rozjaśniacz, toner — kilka procesów naraz, każdy z własnym czasem.",
        hint: "Gdy czas minie, dostaniesz powiadomienie. Nawet jeśli aplikacja jest w tle.",
        f1: "Wiele timerów jednocześnie",
        f2: "Farba, rozjaśniacz, toner",
        f3: "Alarm działa w tle",
      },
      portfolio: {
        title: "Portfolio",
        subtitle: "Twoje najlepsze transformacje — uporządkowane i gotowe do pokazania.",
        hint: "Zdjęcia przed/po i rolki posegregowane po klientach. Łatwo znaleźć to, czego szukasz.",
        f1: "Galeria transformacji",
        f2: "Foldery per klient",
        f3: "Eksport do social mediów",
      },
      social: {
        title: "Social media",
        subtitle: "Zaplanuj post albo wyślij go od razu — prosto z portfolio.",
        hint: "Zobacz podgląd Posta i Story zanim coś opublikujesz. Bez niespodzianek.",
        f1: "Planowanie postów",
        f2: "Szybki post z portfolio",
        f3: "Instagram i TikTok",
      },
      retention: {
        title: "Klienci do odzyskania",
        subtitle: "Osoby, które dawno nie wróciły — pomóż im wrócić do salonu.",
        hint: "Wyślij SMS, maila albo umów termin — wszystko z jednego ekranu.",
        f1: "Lista klientów bez wizyty",
        f2: "Kontakt SMS lub e-mail",
        f3: "Buduj relacje na lata",
      },
      notifications: {
        title: "Powiadomienia",
        subtitle: "Rezerwacje, posty i alerty — jeden inbox zamiast pięciu miejsc.",
        hint: "Ważne rzeczy trafiają tu jako pierwsze: anulowana wizyta, błąd publikacji, aktywność zespołu.",
        f1: "Nowe rezerwacje",
        f2: "Posty social",
        f3: "Aktywność zespołu",
      },
    },
    client: {
      home: {
        title: "Twój portal",
        subtitle: "Umów wizytę, sprawdź terminy i skorzystaj z AI — wszystko w jednym, prostym miejscu.",
        hint: "Bez zbędnych kroków. Kilka kliknięć i masz to, czego potrzebujesz.",
        f1: "Umów wizytę",
        f2: "Moje rezerwacje",
        f3: "Konsultant AI",
      },
      book: {
        title: "Umów wizytę",
        subtitle: "Wybierz fryzjera, usługę i wolny termin — tak prosto.",
        hint: "Przeglądasz usługi, ekspertów i wolne godziny. Rezerwujesz, kiedy Ci pasuje.",
        f1: "Wybór salonu lub fryzjera",
        f2: "Karta usług z cenami",
        f3: "Rezerwacja online 24/7",
      },
      bookings: {
        title: "Moje rezerwacje",
        subtitle: "Wszystkie nadchodzące wizyty w jednym miejscu — możesz też je anulować.",
        hint: "Koniec z szukaniem potwierdzeń w mailach. Tu masz pełny przegląd terminów.",
        f1: "Nadchodzące wizyty",
        f2: "Szczegóły każdej rezerwacji",
        f3: "Anulowanie online",
      },
      "ai-consultant": {
        title: "Konsultant AI",
        subtitle: "Zobacz, jak może wyglądać Twój nowy kolor — zanim usiądziesz w fotelu.",
        hint: "Selfie, długość włosów, paleta kolorów, podgląd AI — i od razu możesz umówić wizytę.",
        f1: "Podgląd koloru z AI",
        f2: "Dopasowanie do Twojej urody",
        f3: "Od razu przejście do rezerwacji",
      },
    },
    finale: {
      salon: {
        title: "To jest Hairqoo",
        lead: "Znasz już narzędzia, które trzymają salon w ryzach. Zapisz się na listę i testuj Hairqoo z nami — zanim premiera.",
        story:
          "Klientka wraca po dwóch miesiącach. Otwierasz kartę i od razu masz: ostatnią formułę, zdjęcia, notatki, pełną historię. Nie domyślasz się — wiesz, od czego zacząć.",
        ctaTitle: "Chcesz testować Hairqoo przed oficjalną premierą?",
        ctaBody:
          "Dołącz do listy oczekujących. Pomóż nam dopracować narzędzie dla stylistów, którzy pracują na danych — nie na pamięci.",
        footer: "Hairqoo — Twój salon w jednej aplikacji. Dla stylistów, barberów i zespołów beauty.",
      },
      client: {
        title: "To jest Hairqoo",
        lead: "Widziałeś, jak prosto może wyglądać umawianie wizyt i planowanie koloru. Zapisz się i przetestuj portal klienta — jako jeden z pierwszych.",
        story:
          "Myślisz o nowym kolorze? Selfie, paleta, podgląd AI — i od razu wiesz, czy to ten odcień. Potem jednym kliknięciem rezerwujesz termin u swojego fryzjera. Bez telefonów, bez stresu.",
        ctaTitle: "Chcesz wypróbować Hairqoo jako klient?",
        ctaBody:
          "Dołącz do listy oczekujących i pomóż nam dopracować aplikację, która ułatwia życie — od pomysłu na kolor po wizytę w salonie.",
        footer: "Hairqoo — umów wizytę, trzymaj terminy i planuj swój look. Prosto, wygodnie, po Twojemu.",
      },
      formName: "Imię",
      formEmail: "Email",
      formBusinessType: "Typ działalności",
      formSelect: "Wybierz",
      formFreelancer: "freelancer",
      formBarber: "barber",
      formSalon: "salon",
      formClient: "klient",
      formOther: "inne",
      formSubmit: "Zapisz mnie",
      formError: "Uzupełnij poprawnie wszystkie pola formularza.",
      formThanks: "Dziękujemy",
      formSaved: "Zgłoszenie zostało zapisane.",
      themeDark: "Cyber-Luxury",
      themeLight: "Light Luxury",
      social: "@hairqoo",
      privacy: "Prywatność",
    },
    checklist: {
      home: "Home",
      clients: "Klienci",
      visit: "Wizyta",
      calendar: "Kalendarz",
      wallet: "Portfel",
      formulas: "Formuły",
      timers: "Timery",
      portfolio: "Portfolio",
      social: "Social",
      retention: "Retencja",
      notifications: "Powiadomienia",
      book: "Rezerwacja",
      bookings: "Moje wizyty",
      "ai-consultant": "AI",
    },
  },
  en: {
    meta: {
      title: "Hairqoo — Your app walkthrough",
      description:
        "See Hairqoo from the inside — walk through the stylist or client portal and discover how salon work feels day to day.",
    },
    preloader: {
      tag: "MISSION: BEAUTY",
      s1: "Calibrating systems…",
      s2: "Loading your experience…",
      s3: "Opening portals…",
      s4: "Almost ready…",
      ready: "Welcome to Hairqoo",
    },
    header: { backToGate: "Back to start", home: "Home" },
    languages: {
      menuTooltip: "App language",
      pl: "Polish",
      en: "English",
      es: "Spanish",
      pt: "Portuguese",
      fr: "French",
    },
    theme: {
      toggleLight: "Light mode",
      toggleDark: "Dark mode",
      ariaLabel: "Toggle theme",
    },
    gate: {
      headlineLeft: "Your business",
      headlineRight: "Your appointments",
      subtitle:
        "Bookings, formulas, photos, and thank-you notes after every visit — all in one place. No app-hopping, no chaos.",
      salonTitle: "Stylist Portal",
      salonDesc: "Step inside and see what your workday in the salon actually looks like.",
      salonEnter: "Start salon tour →",
      clientTitle: "Client Portal",
      clientDesc: "Book in a few taps and keep your appointments under control.",
      clientEnter: "Enter as client →",
    },
    nav: {
      next: "Next",
      back: "Back",
      finish: "Finish tour",
      scrollDown: "Next section",
      scrollFinish: "Finish tour",
      scrollDownAria: "Go to next section",
      scrollFinishAria: "Go to tour finale",
    },
    salon: {
      home: {
        title: "Your starting point",
        subtitle: "This is where your day begins — everything you need in the salon, right here.",
        hint: "Your cockpit. One glance and you know what's happening: visits, clients, formulas.",
        f1: "Client database and formulas",
        f2: "Calendar and wallet",
        f3: "Portfolio and social",
      },
      clients: {
        title: "Your clients",
        subtitle: "Visit history, notes, formulas, and photos — all tied to one person.",
        hint: "Looking for someone? Type a name or number — voice search works too.",
        f1: "Full client history",
        f2: "Preferences and allergies",
        f3: "Upcoming appointments",
      },
      visit: {
        title: "Visit card",
        subtitle: "Save the formula, before/after shots, cost, and notes — all during one visit.",
        hint: "After the visit, send a thank-you email in one tap. A nice touch, zero effort.",
        f1: "Color formula",
        f2: "Before and after photos",
        f3: "Service cost goes to wallet",
      },
      calendar: {
        title: "Calendar",
        subtitle: "Appointments, time blocks, and online bookings — one clear view.",
        hint: "Clients book themselves and you see it instantly. No frantic phone calls.",
        f1: "Day and week view",
        f2: "Time blocks",
        f3: "Team schedule",
      },
      wallet: {
        title: "Wallet",
        subtitle: "Salon revenue, per-client stats, and PDF reports — right at your fingertips.",
        hint: "Costs from visit cards land here automatically. No manual copying.",
        f1: "Revenue per client",
        f2: "Revenue calendar",
        f3: "Downloadable PDF report",
      },
      formulas: {
        title: "Formulas at hand",
        subtitle: "Latest color recipes — see what you mixed last time, instantly.",
        hint: "Pick a client and browse every formula chronologically. No more guessing.",
        f1: "Quick client search",
        f2: "Full formula history",
        f3: "Copy a recipe in one tap",
      },
      timers: {
        title: "Color timers",
        subtitle: "Dye, bleach, toner — several processes at once, each with its own clock.",
        hint: "When time's up, you get a notification — even if the app is in the background.",
        f1: "Multiple timers at once",
        f2: "Dye, bleach, toner",
        f3: "Background alarm",
      },
      portfolio: {
        title: "Portfolio",
        subtitle: "Your best transformations — organized and ready to show off.",
        hint: "Before/after shots and reels sorted by client. Easy to find what you need.",
        f1: "Transformation gallery",
        f2: "Folders per client",
        f3: "Export to social",
      },
      social: {
        title: "Social media",
        subtitle: "Schedule a post or share instantly — straight from your portfolio.",
        hint: "Preview Post and Story before anything goes live. No surprises.",
        f1: "Post scheduling",
        f2: "Quick post from portfolio",
        f3: "Instagram and TikTok",
      },
      retention: {
        title: "Clients to win back",
        subtitle: "People who haven't returned in a while — help them come back.",
        hint: "Send an SMS, email, or book them in — all from one screen.",
        f1: "Clients without a visit",
        f2: "SMS or email contact",
        f3: "Build relationships that last",
      },
      notifications: {
        title: "Notifications",
        subtitle: "Bookings, posts, and alerts — one inbox instead of five places.",
        hint: "Important stuff lands here first: cancellations, publish errors, team activity.",
        f1: "New bookings",
        f2: "Social posts",
        f3: "Team activity",
      },
    },
    client: {
      home: {
        title: "Your portal",
        subtitle: "Book visits, check appointments, and try AI — all in one simple place.",
        hint: "No extra steps. A few taps and you have what you need.",
        f1: "Book appointment",
        f2: "My bookings",
        f3: "AI consultant",
      },
      book: {
        title: "Book appointment",
        subtitle: "Pick a stylist, a service, and a free slot — that's it.",
        hint: "Browse services, experts, and open hours. Book when it suits you.",
        f1: "Salon or stylist choice",
        f2: "Service menu with prices",
        f3: "Online booking 24/7",
      },
      bookings: {
        title: "My bookings",
        subtitle: "All upcoming visits in one place — cancel if plans change.",
        hint: "No more digging through confirmation emails. Your full schedule lives here.",
        f1: "Upcoming visits",
        f2: "Details for each booking",
        f3: "Cancel online",
      },
      "ai-consultant": {
        title: "AI Consultant",
        subtitle: "See how your new color could look — before you sit in the chair.",
        hint: "Selfie, hair length, color palette, AI preview — then book your visit right away.",
        f1: "AI color preview",
        f2: "Matched to your look",
        f3: "Jump straight to booking",
      },
    },
    finale: {
      salon: {
        title: "This is Hairqoo",
        lead: "You've seen the tools that keep a salon running smoothly. Join the waitlist and test Hairqoo with us — before launch.",
        story:
          "A client walks in after two months. You open their card and instantly have: the last formula, photos, notes, full history. No guessing — you know exactly where to start.",
        ctaTitle: "Want to test Hairqoo before the official launch?",
        ctaBody:
          "Join the waitlist. Help us refine a tool built for stylists who work with data — not memory.",
        footer: "Hairqoo — your salon in one app. For stylists, barbers, and beauty teams.",
      },
      client: {
        title: "This is Hairqoo",
        lead: "You've seen how simple booking and color planning can be. Sign up and try the client portal — as one of the first.",
        story:
          "Thinking about a new color? Selfie, palette, AI preview — and you know if it's the right shade. Then book your stylist in one tap. No phone tag, no stress.",
        ctaTitle: "Want to try Hairqoo as a client?",
        ctaBody:
          "Join the waitlist and help us shape an app that makes life easier — from color idea to salon visit.",
        footer: "Hairqoo — book visits, manage appointments, plan your look. Simple, easy, your way.",
      },
      formName: "Name",
      formEmail: "Email",
      formBusinessType: "Business type",
      formSelect: "Choose",
      formFreelancer: "freelancer",
      formBarber: "barber",
      formSalon: "salon",
      formClient: "client",
      formOther: "other",
      formSubmit: "Sign me up",
      formError: "Please complete all fields correctly.",
      formThanks: "Thank you",
      formSaved: "Your submission has been saved.",
      themeDark: "Cyber-Luxury",
      themeLight: "Light Luxury",
      social: "@hairqoo",
      privacy: "Privacy",
    },
    checklist: {
      home: "Home",
      clients: "Clients",
      visit: "Visit",
      calendar: "Calendar",
      wallet: "Wallet",
      formulas: "Formulas",
      timers: "Timers",
      portfolio: "Portfolio",
      social: "Social",
      retention: "Retention",
      notifications: "Notifications",
      book: "Booking",
      bookings: "My visits",
      "ai-consultant": "AI",
    },
  },
  es,
  pt,
  fr,
};

let currentLang = "pl";

export function getLang() {
  return currentLang;
}

export function t(path) {
  const keys = path.split(".");
  for (const locale of [currentLang, "en", "pl"]) {
    let obj = translations[locale];
    if (!obj) continue;
    for (const k of keys) obj = obj?.[k];
    if (typeof obj === "string") return obj;
  }
  return path;
}

export function setLang(lang) {
  currentLang = translations[lang] ? lang : "pl";
  return currentLang;
}

export function applyI18n(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const val = t(key);
    if (typeof val === "string") {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = val;
      } else {
        el.textContent = val;
      }
    }
  });
  root.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    const val = t(key);
    if (typeof val === "string") el.setAttribute("aria-label", val);
  });

  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    const isLight = btn.classList.contains("is-light-active");
    btn.setAttribute("aria-label", isLight ? t("theme.toggleDark") : t("theme.toggleLight"));
    btn.setAttribute("title", btn.getAttribute("aria-label"));
  });

  document.documentElement.lang = currentLang;
  if (!document.body?.classList.contains("hub-page")) {
    document.title = t("meta.title");
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", t("meta.description"));
  }
}

export function applyFinaleI18n(portal, root = document) {
  if (!portal || (portal !== "salon" && portal !== "client")) return;
  const scope = root.getElementById?.("finale") || root.querySelector?.("#finale") || root;
  scope.querySelectorAll("[data-i18n-finale]").forEach((el) => {
    const key = el.getAttribute("data-i18n-finale");
    const val = t(`finale.${portal}.${key}`);
    if (typeof val === "string") el.textContent = val;
  });
}
