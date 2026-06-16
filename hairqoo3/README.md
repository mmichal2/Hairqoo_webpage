# HAIRQOO 3.0 — Global Hair Operating System

Frontend (Next.js App Router + TypeScript, mock-first) dla ekosystemu Hairqoo:
globalna wyszukiwarka + asystent AI + spersonalizowany feed. Język domyślny: **PL**.

## Uruchomienie

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build produkcyjny
npm run lint     # ESLint
```

## Architektura

```
app/                      # App Router: strony + mock API
  page.tsx                # HOMEPAGE = CONTROL CENTER (kolejność sekcji wg specyfikacji)
  (route)/page.tsx        # /discover /events /calendar /map /education ...
  entity/[type]/[id]/     # szczegóły encji
  profile/[id]/           # profil właściciela
  api/{search,feed,ai}/   # mock API (warstwa integracji)
src/
  core/
    entities/             # model Entity (GLOBAL)
    data/                 # mock data + queries (warstwa repo) 
    i18n/                 # słowniki (PL domyślny, EN + fallbacki)
    state/                # Zustand: session / i18n / filters / search / feed / ai / theme
    utils/                # formatowanie
  modules/                # niezależne moduły (search, ai-assistant, feed, events,
                          #   calendar, map, education, educators, products, community,
                          #   career, tv, awards, passport, newsletter, portals)
    <module>/components/  # UI modułu
    <module>/repo.ts      # dostęp do danych (fetch -> /api)
    <module>/index.ts     # publiczny eksport modułu
  ui/                     # design system: prymitywy, karty, badge, filtry, layout
  app-shell/              # powłoka: Providers, Header/Footer hooki, hero, lazy sekcje
```

## Kluczowe zasady

- **Mock-first** — dane z `src/core/data`, serwowane przez `/api/*`; gotowe pod realny backend (wystarczy podmienić repo/route).
- **Entity-driven** — wszystko (event/educator/product/...) to `Entity`; tłumaczenia UI nakładane dynamicznie.
- **Mobile-first** — sticky search, AI jako FAB + drawer, feed jako widok główny, mapa/kalendarz lazy-loaded, dolny tab bar.
- **Spójność z hairqoo.com** — te same tokeny (glass, gradient „strand”, paleta cosmic-luxury) oraz zachowane portale **Twój biznes / Portal Fryzjera** i **Twoje wizyty / Portal Klienta**.

> Istniejąca strona `hairqoo.com` (statyczna, w katalogu nadrzędnym) pozostaje nietknięta.
> Hairqoo 3.0 żyje w tym podfolderze.
