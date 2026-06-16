# hairqoo.com — wdrożenie (strona statyczna)

## Gdzie pracujesz (terminal)

```text
PS D:\Projekty_APEK\Hairqoo_webpage>
```

**Zawsze** katalog główny repozytorium. Nie twórz i nie używaj lokalnego folderu `hairqoo3/` na branchu `main` — to pozostałość po Next.js i nie trafia na produkcję.

## Architektura

| Element | Lokalizacja |
|---------|-------------|
| **Produkcja (hairqoo.com)** | Katalog główny repo, branch `main` → GitHub Pages |
| **Prototyp HQ 3.0 (Next.js)** | Branch `prototype` → folder `hairqoo3/` **tylko na tym branchu** |
| **Labirynt tour** | `#labyrinth` w `index.html` — portale na stronie głównej |

## Co jest w produkcji (root `main`)

- `index.html` — homepage + labirynt
- `listing.html`, `entity.html`, `search.html`, `profile.html`, `calendar.html`, `map.html`, `awards.html`, `passport.html`, `newsletter.html`
- `js/control-center.js`, `js/hub-*.js`, `js/pages/*`, `js/data/*`, `js/ai-assistant.js`
- `css/control-center.css`, `assets/images/`

Folder `hairqoo3/` **nie jest** w branchu `main` na GitHub.

## Jak publikować zmiany produkcyjne

```powershell
cd D:\Projekty_APEK\Hairqoo_webpage
git checkout main
git add .
git commit -m "opis zmiany"
git push origin main
```

GitHub Pages publikuje automatycznie z `main` (plik `CNAME` → `hairqoo.com`).

## Podgląd lokalny produkcji

```powershell
cd D:\Projekty_APEK\Hairqoo_webpage
node _dev-server.cjs
```

Otwórz `http://localhost:5500`

## Prototyp Next.js (tylko referencja)

```powershell
cd D:\Projekty_APEK\Hairqoo_webpage
git checkout prototype
cd hairqoo3
npm install
npm run dev
```

Po pracy wróć na produkcję:

```powershell
cd D:\Projekty_APEK\Hairqoo_webpage
git checkout main
```

**Nie wdrażać** `hairqoo3/` na produkcję.

## Struktura homepage (Control Center)

Kolejność sekcji zgodna z prototypem HQ 3.0:

1. Hero + wyszukiwarka  
2. Asystent AI  
3. **Portale** — „Twój biznes” / „Portal Fryzjera”, „Twoje wizyty” / „Portal Klienta” → **labirynt tour**  
4. Discover feed, Trending, Events, Calendar, Map, Education, Educators, Products, Community, Career, TV, Awards, Passport, Newsletter  

Pliki:
- `js/control-center.js` — render sekcji  
- `js/data/` — dane i assety  
- `css/control-center.css` — style sekcji  
- `assets/images/` — grafiki tematyczne  
