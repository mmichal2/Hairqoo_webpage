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
      title: "Hairqoo — Interaktywny przewodnik po aplikacji",
      description:
        "Odkryj Hairqoo — magiczny labirynt prowadzący przez portal fryzjera i klienta. CRM, kalendarz, formuły, AI i więcej.",
    },
    header: { backToGate: "Wróć do startu" },
    gate: {
      headlineBefore: "Prowadź salon ",
      headlineAccent: "od wizyty do follow-upu",
      headlineAfter: ".",
      subtitle:
        "Rezerwacje klientów, notatki i formuły z wizyt, zdjęcia oraz e-mail z podziękowaniem po wizycie — w jednym miejscu.",
      salonTitle: "Portal Fryzjera",
      salonDesc: "Rezerwacje, wizyty i organizacja dnia salonu w jednym miejscu.",
      salonEnter: "Wejdź do labiryntu →",
      clientTitle: "Portal Klienta",
      clientDesc: "Umawiaj wizyty szybko i zarządzaj swoimi terminami.",
      clientEnter: "Wejdź do labiryntu →",
    },
    nav: { next: "Dalej", back: "Wstecz", finish: "Zakończ tour" },
    salon: {
      home: {
        title: "Home Hub",
        subtitle: "Rezerwacje, wizyty i organizacja dnia salonu w jednym miejscu.",
        hint: "Tu startujesz każdy dzień — szybki dostęp do wszystkich narzędzi salonu.",
        f1: "Baza klientów i formuły",
        f2: "Kalendarz i portfel",
        f3: "Portfolio i social media",
      },
      clients: {
        title: "Baza klientów",
        subtitle: "Wizyty, notatki, formuły i zdjęcia w jednym miejscu.",
        hint: "Szukaj po imieniu lub telefonie — także głosem w aplikacji.",
        f1: "Pełna historia klienta",
        f2: "Preferencje i alergie",
        f3: "Nadchodzące wizyty",
      },
      visit: {
        title: "Karta wizyty",
        subtitle: "Zapisuj formułę, before/after, koszt i notatki.",
        hint: "Po wizycie możesz wysłać klientowi e-mail z podziękowaniem.",
        f1: "Receptura koloryzacji",
        f2: "Zdjęcia przed/po",
        f3: "Koszt usługi → Portfel",
      },
      calendar: {
        title: "Kalendarz",
        subtitle: "Wizyty, blokady czasu i rezerwacje klientów.",
        hint: "Klienci rezerwują online — Ty widzisz wszystko w kalendarzu.",
        f1: "Widok dnia i tygodnia",
        f2: "Blokady czasu",
        f3: "Grafik zespołu",
      },
      wallet: {
        title: "Portfel",
        subtitle: "Przychody salonu, klienci i raporty PDF.",
        hint: "Koszty z wizyt trafiają automatycznie do portfela.",
        f1: "Przychody per klient",
        f2: "Kalendarz przychodów",
        f3: "Raport PDF",
      },
      formulas: {
        title: "Szybki dostęp do formuł",
        subtitle: "Formuły koloryzacji od najnowszej wizyty.",
        hint: "Wybierz klienta — zobacz wszystkie receptury chronologicznie.",
        f1: "Wyszukiwanie klienta",
        f2: "Historia formuł",
        f3: "Kopiuj recepturę",
      },
      timers: {
        title: "Timer procesów koloryzacji",
        subtitle: "Farba, rozjaśniacz, toner — wiele timerów naraz.",
        hint: "Powiadomienie gdy czas minie — nawet w tle.",
        f1: "Wiele timerów jednocześnie",
        f2: "Farba / rozjaśniacz / toner",
        f3: "Alarm w tle",
      },
      portfolio: {
        title: "Portfolio",
        subtitle: "Twoje zapisane transformacje w jednym miejscu.",
        hint: "Before/after i rolki — posegregowane po klientach.",
        f1: "Galeria transformacji",
        f2: "Foldery per klient",
        f3: "Eksport do social",
      },
      social: {
        title: "Udostępnianie w Social Media",
        subtitle: "Zaplanuj post albo wyślij od ręki z portfolio.",
        hint: "Podgląd Post i Story przed publikacją.",
        f1: "Planowanie postów",
        f2: "Szybki post",
        f3: "Instagram / TikTok",
      },
      retention: {
        title: "Klienci do odzyskania",
        subtitle: "Osoby bez kolejnej wizyty — zadbaj o powrót.",
        hint: "SMS, e-mail lub umów termin — wszystko z jednego miejsca.",
        f1: "Lista klientów bez wizyty",
        f2: "Kontakt SMS / e-mail",
        f3: "Buduj długotrwałe relacje",
      },
      notifications: {
        title: "Centrum powiadomień",
        subtitle: "Rezerwacje, posty i alerty w jednym inboxie.",
        hint: "Krytyczne i ważne — anulowanie wizyty, błąd publikacji posta.",
        f1: "Rezerwacje",
        f2: "Posty social",
        f3: "Aktywność zespołu",
      },
    },
    client: {
      home: {
        title: "Portal klienta",
        subtitle: "Umawiaj wizyty szybko i zarządzaj swoimi terminami w jednym miejscu.",
        hint: "Prosty interfejs — bez zbędnego skomplikowania.",
        f1: "Umów wizytę",
        f2: "Moje rezerwacje",
        f3: "Konsultant AI",
      },
      book: {
        title: "Umów wizytę",
        subtitle: "Wybierz fryzjera i wolny termin.",
        hint: "Przeglądaj usługi, ekspertów i wolne sloty.",
        f1: "Wybór salonu / fryzjera",
        f2: "Karta usług",
        f3: "Rezerwacja online",
      },
      bookings: {
        title: "Moje rezerwacje",
        subtitle: "Przeglądaj i anuluj nadchodzące wizyty.",
        hint: "Wszystkie terminy w jednym widoku.",
        f1: "Nadchodzące wizyty",
        f2: "Szczegóły rezerwacji",
        f3: "Anulowanie online",
      },
      "ai-consultant": {
        title: "Konsultant AI",
        subtitle: "Sprawdź swój przyszły kolor włosów.",
        hint: "Selfie → długość → paleta kolorów → podgląd AI → umów wizytę.",
        f1: "Podgląd koloru AI",
        f2: "Dopasowanie do typu urody",
        f3: "Bezpośredni CTA do rezerwacji",
      },
    },
    finale: {
      title: "Odkryłeś Hairqoo",
      lead: "Przeszedłeś przez labirynt — teraz dołącz do listy oczekujących i testuj jako jeden z pierwszych.",
      story:
        "Klientka wraca po 8 tygodniach. W Hairqoo widzisz poprzednią recepturę, zdjęcia, notatki i historię usługi. Nie zgadujesz — pracujesz na danych.",
      ctaTitle: "Chcesz testować Hairqoo przed oficjalną premierą?",
      ctaBody: "Dołącz do listy oczekujących i pomóż stworzyć narzędzie, które naprawdę pasuje do pracy stylistów.",
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
      footer: "Nowoczesne narzędzie dla stylistów, barberów i salonów beauty.",
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
      title: "Hairqoo — Interactive app guide",
      description:
        "Discover Hairqoo — a magical labyrinth through the stylist and client portals. CRM, calendar, formulas, AI and more.",
    },
    header: { backToGate: "Back to start" },
    gate: {
      headlineBefore: "Run your salon ",
      headlineAccent: "from visit to follow-up",
      headlineAfter: ".",
      subtitle:
        "Client bookings, visit notes and formulas, photos, and post-visit thank-you emails — all in one place.",
      salonTitle: "Stylist Portal",
      salonDesc: "Bookings, visits, and daily salon organization in one place.",
      salonEnter: "Enter the labyrinth →",
      clientTitle: "Client Portal",
      clientDesc: "Book appointments fast and manage your schedule.",
      clientEnter: "Enter the labyrinth →",
    },
    nav: { next: "Next", back: "Back", finish: "Finish tour" },
    salon: {
      home: {
        title: "Home Hub",
        subtitle: "Bookings, visits, and daily salon organization in one place.",
        hint: "Start every day here — quick access to all salon tools.",
        f1: "Clients and formulas",
        f2: "Calendar and wallet",
        f3: "Portfolio and social",
      },
      clients: {
        title: "Client database",
        subtitle: "Visits, notes, formulas, and photos in one place.",
        hint: "Search by name or phone — voice search in the app too.",
        f1: "Full client history",
        f2: "Preferences and allergies",
        f3: "Upcoming appointments",
      },
      visit: {
        title: "Visit card",
        subtitle: "Save formula, before/after, cost, and notes.",
        hint: "Send a thank-you email to the client after the visit.",
        f1: "Color formula",
        f2: "Before/after photos",
        f3: "Service cost → Wallet",
      },
      calendar: {
        title: "Calendar",
        subtitle: "Appointments, time blocks, and client bookings.",
        hint: "Clients book online — you see everything in the calendar.",
        f1: "Day and week view",
        f2: "Time blocks",
        f3: "Team schedule",
      },
      wallet: {
        title: "Wallet",
        subtitle: "Salon revenue, clients, and PDF reports.",
        hint: "Visit costs flow automatically into the wallet.",
        f1: "Revenue per client",
        f2: "Revenue calendar",
        f3: "PDF report",
      },
      formulas: {
        title: "Quick formula access",
        subtitle: "Color formulas from the latest visit.",
        hint: "Pick a client — see all formulas chronologically.",
        f1: "Client search",
        f2: "Formula history",
        f3: "Copy recipe",
      },
      timers: {
        title: "Color process timers",
        subtitle: "Dye, bleach, toner — multiple timers at once.",
        hint: "Notification when time is up — even in background.",
        f1: "Multiple concurrent timers",
        f2: "Dye / bleach / toner",
        f3: "Background alarm",
      },
      portfolio: {
        title: "Portfolio",
        subtitle: "Your saved transformations in one place.",
        hint: "Before/after and reels — organized by client.",
        f1: "Transformation gallery",
        f2: "Folders per client",
        f3: "Export to social",
      },
      social: {
        title: "Social Media sharing",
        subtitle: "Schedule a post or share instantly from portfolio.",
        hint: "Post and Story preview before publishing.",
        f1: "Post scheduling",
        f2: "Quick post",
        f3: "Instagram / TikTok",
      },
      retention: {
        title: "Clients to recover",
        subtitle: "People without a next visit — bring them back.",
        hint: "SMS, email, or book — all from one place.",
        f1: "Clients without visits",
        f2: "SMS / email contact",
        f3: "Build lasting relationships",
      },
      notifications: {
        title: "Notification center",
        subtitle: "Bookings, posts, and alerts in one inbox.",
        hint: "Critical and important — cancellations, publish errors.",
        f1: "Bookings",
        f2: "Social posts",
        f3: "Team activity",
      },
    },
    client: {
      home: {
        title: "Client portal",
        subtitle: "Book appointments fast and manage your schedule in one place.",
        hint: "Simple interface — no unnecessary complexity.",
        f1: "Book appointment",
        f2: "My bookings",
        f3: "AI consultant",
      },
      book: {
        title: "Book appointment",
        subtitle: "Choose a stylist and available slot.",
        hint: "Browse services, experts, and free slots.",
        f1: "Salon / stylist choice",
        f2: "Service card",
        f3: "Online booking",
      },
      bookings: {
        title: "My bookings",
        subtitle: "View and cancel upcoming appointments.",
        hint: "All appointments in one view.",
        f1: "Upcoming visits",
        f2: "Booking details",
        f3: "Online cancellation",
      },
      "ai-consultant": {
        title: "AI Consultant",
        subtitle: "Preview your future hair color.",
        hint: "Selfie → length → color palette → AI preview → book.",
        f1: "AI color preview",
        f2: "Matched to your look",
        f3: "Direct booking CTA",
      },
    },
    finale: {
      title: "You discovered Hairqoo",
      lead: "You completed the labyrinth — join the waitlist and test as one of the first.",
      story:
        "A client returns after 8 weeks. In Hairqoo you see the previous formula, photos, notes, and service history. You don't guess — you work with data.",
      ctaTitle: "Want to test Hairqoo before the public launch?",
      ctaBody: "Join the waitlist and help build a tool that truly fits stylists' workflow.",
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
      footer: "Modern tool for stylists, barbers, and beauty salons.",
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
};

let currentLang = "pl";

export function getLang() {
  return currentLang;
}

export function t(path) {
  const keys = path.split(".");
  let obj = translations[currentLang];
  for (const k of keys) {
    obj = obj?.[k];
  }
  return obj ?? path;
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
  document.documentElement.lang = currentLang;
  document.title = t("meta.title");
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", t("meta.description"));
}
