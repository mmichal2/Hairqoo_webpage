const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".animate-on-scroll").forEach((element) => {
  observer.observe(element);
});

const translations = {
  pl: {
    title: "Hairqoo - CRM i kalendarz dla nowoczesnych stylistów",
    description:
      "Hairqoo to nowoczesna aplikacja SaaS dla fryzjerów, barberów i salonów beauty. Zarządzaj klientami, wizytami, recepturami kolorów i zdjęciami przed/po w jednym miejscu.",
    navProduct: "Produkt",
    navForWho: "Dla kogo",
    navContact: "Kontakt",
    navPrivacy: "Prywatność",
    heroEyebrow: "Hairqoo SaaS dla branży beauty",
    heroTitle: "CRM i kalendarz dla nowoczesnych stylistów",
    heroLead:
      "Hairqoo pomaga fryzjerom, barberom i salonom zarządzać klientami, wizytami, recepturami, zdjęciami przed/po i komunikacją po wizycie - w jednym prostym systemie.",
    heroCtaPrimary: "Dołącz do testów zamkniętych",
    heroCtaSecondary: "Zobacz jak działa",
    mockCalendar: "Kalendarz wizyt",
    mockClientCard: "Karta klienta",
    mockVisitHistory: "Historia wizyty",
    problemTitle: "Koniec z chaosem w notatkach, zdjęciach i wiadomościach",
    problem1Title: "Receptury tylko w głowie",
    problem1Body:
      "Formuły koloryzacji zapisane na kartkach lub w pamięci to ryzyko pomyłek i straty czasu.",
    problem2Title: "Zdjęcia porozrzucane w telefonie",
    problem2Body:
      "Trudno szybko znaleźć właściwe before/after, gdy klientka wraca po kilku tygodniach.",
    problem3Title: "Historia wizyt nieczytelna",
    problem3Body:
      "Bez jednego systemu trudno odtworzyć pełny przebieg usług i preferencje klienta.",
    problem4Title: "Brak jednego centrum pracy",
    problem4Body:
      "Kalendarz, klienci i follow-up działają osobno, zamiast wspierać codzienną pracę.",
    solutionTitle: "Hairqoo zbiera całą historię pracy stylisty w jednym miejscu",
    feature1: "Kalendarz wizyt",
    feature2: "Baza klientów",
    feature3: "Historia usług",
    feature4: "Receptury kolorów",
    feature5: "Zdjęcia przed/po",
    feature6: "Wiadomość po wizycie",
    feature7: "Notatki i preferencje klienta",
    feature8: "Widok dla freelancera i małego salonu",
    forWhoTitle: "Dla kogo powstaje Hairqoo",
    forWho1Title: "Dla freelancerów",
    forWho1Body:
      "Szybki dostęp do historii klienta i wizyt, żeby pracować sprawnie bez dodatkowego chaosu.",
    forWho2Title: "Dla barberów",
    forWho2Body:
      "Lepsza organizacja powracających klientów, notatek i terminów w jednym narzędziu.",
    forWho3Title: "Dla salonów beauty",
    forWho3Body:
      "Wspólna baza wiedzy o klientach i usługach, dzięki której zespół działa spójnie każdego dnia.",
    howTitle: "Jak to działa",
    step1: "Dodajesz klienta lub rezerwację",
    step2: "Zapisujesz przebieg wizyty, recepturę i zdjęcia",
    step3: "Masz pełną historię klienta przy kolejnej wizycie",
    roadmapTitle: "Nad czym pracujemy",
    roadmapLead: "Funkcje poniżej są oznaczone jako w planach i rozwijane etapami.",
    proof1: "Historia klienta i receptury w 1 miejscu",
    proof2: "Workflow freelancera i salonu w jednym systemie",
    proof3: "Dołącz do testów zamkniętych i wpłyń na roadmapę",
    roadmap1: "Automatyczne podsumowania wizyt",
    roadmap2: "Lepsze zdjęcia before/after do social mediów",
    roadmap3: "Przypomnienia dla klientów",
    roadmap4: "Panel salonu i zespołu",
    roadmap5: "Analityka wizyt i klientów",
    scenarioTitle: "Scenariusz z codziennej pracy",
    scenarioBody:
      "Klientka wraca po 8 tygodniach. W Hairqoo widzisz poprzednią recepturę, zdjęcia, notatki i historię usługi. Nie zgadujesz - pracujesz na danych.",
    trustTitle: "Zaufanie i prostota",
    trust1: "Dane klientów w jednym miejscu",
    trust2: "Prywatne zdjęcia i historia wizyt",
    trust3: "Prosty system bez zbędnego skomplikowania",
    trust4: "Stworzony z myślą o codziennej pracy stylistów",
    ctaTitle: "Chcesz testować Hairqoo przed oficjalną premierą?",
    ctaBody:
      "Dołącz do listy oczekujących i pomóż stworzyć narzędzie, które naprawdę pasuje do pracy stylistów.",
    formName: "Imię",
    formEmail: "Email",
    formBusinessType: "Typ działalności",
    formSelect: "Wybierz",
    formFreelancer: "freelancer",
    formBarber: "barber",
    formSalon: "salon",
    formOther: "inne",
    formSubmit: "Zapisz mnie",
    footerLead: "Nowoczesne narzędzie dla stylistów, barberów i salonów beauty.",
    formError: "Uzupełnij poprawnie wszystkie pola formularza.",
    formThanks: "Dziękujemy",
    formSaved: "Zgłoszenie zostało zapisane.",
  },
  en: {
    title: "Hairqoo - CRM and calendar for modern stylists",
    description:
      "Hairqoo is a modern SaaS app for hairdressers, barbers, freelancers, and beauty salons. Manage clients, appointments, color formulas, and before/after photos in one place.",
    navProduct: "Product",
    navForWho: "Who it's for",
    navContact: "Contact",
    navPrivacy: "Privacy",
    heroEyebrow: "Hairqoo SaaS for beauty professionals",
    heroTitle: "CRM and calendar for modern stylists",
    heroLead:
      "Hairqoo helps hairdressers, barbers, and salons manage clients, appointments, formulas, before/after photos, and post-visit communication in one simple system.",
    heroCtaPrimary: "Join closed beta access",
    heroCtaSecondary: "See how it works",
    mockCalendar: "Appointment calendar",
    mockClientCard: "Client card",
    mockVisitHistory: "Visit history",
    problemTitle: "No more chaos in notes, photos, and messages",
    problem1Title: "Color formulas only in your head",
    problem1Body:
      "Keeping formulas in notebooks or memory increases mistakes and wastes time.",
    problem2Title: "Photos scattered across your phone",
    problem2Body:
      "It is hard to quickly find the right before/after photos when a client returns weeks later.",
    problem3Title: "Visit history is hard to track",
    problem3Body:
      "Without one system, recreating service history and preferences is difficult.",
    problem4Title: "No single work hub",
    problem4Body:
      "Calendar, client records, and follow-up work separately instead of supporting your daily workflow.",
    solutionTitle: "Hairqoo brings your full service history into one place",
    feature1: "Appointment calendar",
    feature2: "Client database",
    feature3: "Service history",
    feature4: "Color formulas",
    feature5: "Before/after photos",
    feature6: "Post-visit message",
    feature7: "Notes and client preferences",
    feature8: "View for freelancers and small salons",
    forWhoTitle: "Who Hairqoo is for",
    forWho1Title: "For freelancers",
    forWho1Body:
      "Quick access to client history and appointments keeps work fast and organized.",
    forWho2Title: "For barbers",
    forWho2Body:
      "Better organization for returning clients, notes, and bookings in one tool.",
    forWho3Title: "For beauty salons",
    forWho3Body:
      "A shared source of client and service knowledge helps the whole team stay aligned.",
    howTitle: "How it works",
    step1: "Add a client or booking",
    step2: "Save visit details, formula, and photos",
    step3: "Access full client history at the next visit",
    roadmapTitle: "What we are building",
    roadmapLead: "The features below are marked as planned and developed step by step.",
    proof1: "Client history and formulas in one place",
    proof2: "One workflow for freelancers and small salons",
    proof3: "Join closed beta and help shape the roadmap",
    roadmap1: "Automatic visit summaries",
    roadmap2: "Better before/after images for social media",
    roadmap3: "Client reminders",
    roadmap4: "Salon and team panel",
    roadmap5: "Visit and client analytics",
    scenarioTitle: "A real daily scenario",
    scenarioBody:
      "A client comes back after 8 weeks. In Hairqoo, you see the previous formula, photos, notes, and service history. You do not guess - you work with data.",
    trustTitle: "Trust and simplicity",
    trust1: "Client data in one place",
    trust2: "Private photos and visit history",
    trust3: "Simple system without unnecessary complexity",
    trust4: "Built for the real daily work of stylists",
    ctaTitle: "Want to test Hairqoo before the public launch?",
    ctaBody:
      "Join the waitlist and help build a tool that truly fits the workflow of stylists.",
    formName: "Name",
    formEmail: "Email",
    formBusinessType: "Business type",
    formSelect: "Choose",
    formFreelancer: "freelancer",
    formBarber: "barber",
    formSalon: "salon",
    formOther: "other",
    formSubmit: "Sign me up",
    footerLead: "Modern tool for stylists, barbers, and beauty salons.",
    formError: "Please complete all fields correctly.",
    formThanks: "Thank you",
    formSaved: "Your submission has been saved.",
  },
};

let currentLang = "pl";

const setLanguage = (lang) => {
  currentLang = translations[lang] ? lang : "pl";
  const locale = translations[currentLang];

  document.documentElement.lang = currentLang;
  document.title = locale.title;

  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) {
    descriptionMeta.setAttribute("content", locale.description);
  }

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    if (key && locale[key]) {
      element.textContent = locale[key];
    }
  });

  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === currentLang);
  });
};

document.querySelectorAll(".lang-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const nextLang = button.dataset.lang || "pl";
    setLanguage(nextLang);
    window.localStorage.setItem("hairqoo_lang", nextLang);
  });
});

const preferredLang = window.localStorage.getItem("hairqoo_lang");
setLanguage(preferredLang === "en" ? "en" : "pl");

const form = document.querySelector(".signup-form");
const formMessage = document.querySelector(".form-message");

if (form && formMessage) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      formMessage.textContent = translations[currentLang].formError;
      formMessage.style.color = "#a33f3f";
      return;
    }

    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    formMessage.textContent = `${translations[currentLang].formThanks}${name ? `, ${name}` : ""}! ${translations[currentLang].formSaved}`;
    formMessage.style.color = "#3d8152";
    form.reset();
  });
}
