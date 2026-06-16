# Wdrożenie hairqoo.com (HAIRQOO 3.0)

## Dlaczego `localhost:3000` ≠ `hairqoo.com`

- **`hairqoo.com`** było hostowane jako **statyczna strona** (GitHub Pages) z pliku `index.html` w katalogu głównym repo — interaktywny labirynt / tour.
- **`hairqoo3/`** to **aplikacja Next.js** (Control Center, sekcje, i18n, voice, assety). `npm run dev` na porcie 3000 to tylko podgląd lokalny.
- Ostatni push na `main` aktualizował wyłącznie starą stronę statyczną (hero), **nie** wdrażał `hairqoo3`.

## Jedna strona = jedna aplikacja

Docelowo **`https://hairqoo.com/`** serwuje aplikację z folderu **`hairqoo3/`**:

| URL | Co to jest |
|-----|------------|
| `/` | Nowy Control Center (hairqoo3) |
| `/discover`, `/events`, `/tv`, … | Sekcje hairqoo3 |
| `/tour/` | Zachowany stary labirynt (Portal Fryzjera / Klienta) |
| `/privacy.html`, `/terms.html` | Strony prawne |

Sekcja portali na homepage linkuje do:
- `/tour/#/salon/home` — Portal Fryzjera
- `/tour/#/client/home` — Portal Klienta

## Wymagany hosting: Vercel (zalecane)

GitHub Pages **nie obsługuje** Next.js z routingiem i API. Aplikacja hairqoo3 potrzebuje hostingu z Node/Next (Vercel jest najprostszy).

### Kroki (jednorazowo)

1. Załóż projekt na [vercel.com](https://vercel.com) i połącz repo `mmichal2/Hairqoo_webpage`.
2. W ustawieniach projektu ustaw **Root Directory**: `hairqoo3`
3. Framework: **Next.js** (wykryje automatycznie).
4. Deploy — dostaniesz URL typu `hairqoo3-xxx.vercel.app`.
5. W Vercel → **Domains** → dodaj `hairqoo.com` i `www.hairqoo.com`.
6. W panelu DNS domeny (tam gdzie kupiłeś `hairqoo.com`):
   - usuń / wyłącz rekordy **GitHub Pages** (stare A/CNAME na `mmichal2.github.io`)
   - dodaj rekordy podane przez Vercel (zwykle CNAME `hairqoo.com` → `cname.vercel-dns.com`)
7. Poczekaj na propagację DNS (5–60 min) i sprawdź `https://hairqoo.com/`.

### Po każdej zmianie w kodzie

```bash
git add .
git commit -m "opis zmiany"
git push origin main
```

Vercel zbuduje i opublikuje automatycznie (jeśli włączony auto-deploy z `main`).

## Podgląd lokalny (dev)

```bash
cd hairqoo3
npm install
npm run dev
```

Otwórz `http://localhost:3000` — to tylko development, nie produkcja.

## Stara strona statyczna w root repo

Pliki `index.html`, `css/`, `js/` w katalogu głównym pozostają jako archiwum / źródło touru. Po migracji DNS na Vercel **nie są już serwowane** z root — tour jest w `hairqoo3/public/tour/`.
