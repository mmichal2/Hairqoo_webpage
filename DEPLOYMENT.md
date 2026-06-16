# hairqoo.com — wdrożenie (strona statyczna)

## Architektura

| Element | Lokalizacja |
|---------|-------------|
| **Produkcja** | Katalog główny repo → GitHub Pages → `https://hairqoo.com` |
| **Prototyp HAIRQOO 3.0** | Branch `prototype` → folder `hairqoo3/` (Next.js, tylko referencja) |
| **Labirynt tour** | `#labyrinth` w `index.html` — uruchamiany z portali na stronie głównej |

## Jak publikować zmiany

```bash
git add .
git commit -m "opis zmiany"
git push origin main
```

GitHub Pages publikuje automatycznie z `main` (plik `CNAME` → `hairqoo.com`).

## Struktura homepage (Control Center)

Kolejność sekcji zgodna z prototypem `hairqoo3`:

1. Hero + wyszukiwarka  
2. Asystent AI  
3. **Portale** — „Twój biznes” / „Portal Fryzjera”, „Twoje wizyty” / „Portal Klienta” → **labirynt tour**  
4. Discover feed, Trending, Events, Calendar, Map, Education, Educators, Products, Community, Career, TV, Awards, Passport, Newsletter  

Pliki:
- `js/control-center.js` — render sekcji  
- `js/data/` — dane i assety (1:1 z prototypu)  
- `css/control-center.css` — style sekcji  
- `assets/images/` — grafiki tematyczne  

## Podgląd lokalny

```bash
node _dev-server.cjs
```

Otwórz `http://localhost:5500`

## Branch prototype

Pełna aplikacja Next.js (referencja wizualna i treści):

```bash
git checkout prototype
cd hairqoo3
npm install
npm run dev
```

Nie wdrażać `hairqoo3` na produkcję — produkcja to root statyczny.
