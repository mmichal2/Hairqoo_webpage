# Hairqoo Webpage — Interaktywny Plakat / Magiczny Labirynt

Interaktywny przewodnik po aplikacji Hairqoo. Strona działa jak samouczek w formie labiryntu z dwoma ścieżkami:

- **Portal Fryzjera** — 11 komnat (Home → Klienci → Wizyta → … → Powiadomienia)
- **Portal Klienta** — 4 komnaty (Home → Rezerwacja → Moje wizyty → Konsultant AI)

Design system **Stitch** (Cyber-Luxury) zsynchronizowany z aplikacją HAIRLAB.

## Uruchomienie lokalne

### Opcja 1: dev-server (zalecane — obsługuje ES modules)

```bash
node _dev-server.cjs
```

Otwórz: `http://localhost:5500`

### Opcja 2: Python

```bash
python -m http.server 5500
```

### Opcja 3: Live Server (VS Code / Cursor)

Uruchom `index.html` przez rozszerzenie Live Server.

## Struktura

```
index.html          — shell, Gate, szablony komnat, Finale
css/
  tokens.css        — design tokens ze Stitch (HAIRLAB)
  base.css          — reset, typografia, przyciski
  gate.css          — ekran wyboru portalu
  chambers.css      — komnaty, phone frame, hints
  labyrinth.css     — header, progress thread, minimap
  mockups.css       — animowane mockupy UI
  finale.css        — CTA, formularz, checklist
js/
  main.js           — bootstrap
  i18n.js           — PL/EN (copy z aplikacji)
  labyrinth.js      — silnik labiryntu, routing, progress
  mockups.js        — interakcje mockupów
  form.js           — waitlist + theme demo
  chambers/         — logika per komnata
assets/images/      — logo i hero z HAIRLAB
```

## Nawigacja

- **Scroll-snap** między komnatami
- **Klawiatura**: `↓` / `Enter` = Dalej, `↑` = Wstecz, `Esc` = powrót do Gate
- **Deep link**: `#/salon/calendar`, `#/client/ai-consultant`
- **Minimap** (desktop): klikalne kropki po prawej
- **Persistencja**: `localStorage` — kontynuacja od ostatniej komnaty

## Deploy

Statyczna strona — gotowa do GitHub Pages. Brak build stepu.
