# Movie Discovery App

A full-stack movie discovery application built with **Next.js** (React + Node.js backend via API routes), **SQLite** for wishlist persistence, and **TMDb (The Movie Database)** as the external movie data source.

---

## Setup Instructions

1. Clone the repository and install dependencies:
npm install

2. Create a `.env.local` file in the project root with a TMDb API key:
TMDB_API_KEY=e0b4e382f452a163ab8f10d2b1a0d005
A free key can be requested at https://www.themoviedb.org/settings/api (choose the "Developer" option).

3. Run the development server:
npm run dev

4. Open `http://localhost:3000` in your browser.

A SQLite database file (`wishlist.db`) is created automatically on first run — no manual database setup is required.

---

## Architecture Overview

### Why Next.js
Next.js was chosen because it provides both the React frontend and the Node.js backend (via API routes) inside a single project. This satisfies the "React + Node.js" requirement while avoiding the overhead of running and coordinating two separate servers.

### Backend: External API Abstraction Layer
All communication with TMDb is centralized in `lib/tmdb.js`. The frontend and API routes never call TMDb directly — everything goes through this one module. This design was chosen specifically to satisfy Section 3 of the assignment ("the client should communicate with your Node.js backend, rather than directly with the external movie API").

This file is responsible for:

- **Normalization** — TMDb's raw response fields (`poster_path`, `vote_average`, `release_date`, inconsistent `genre_ids` vs `genres`) are reshaped into a single, consistent movie object (`id`, `title`, `overview`, `posterUrl`, `releaseYear`, `rating`, `genreIds`) used everywhere in the app. This means the frontend never needs to know TMDb's raw response shape.
- **Caching** — an in-memory `Map` caches TMDb responses for 5 minutes, keyed by endpoint + parameters. Repeated identical requests (e.g., re-visiting the same search) are served instantly without hitting TMDb again, addressing rate-limit concerns and reducing latency.
- **Timeout handling** — every TMDb request is wrapped in an 8-second timeout using `AbortController`. If TMDb is slow or unresponsive, the request is cancelled rather than hanging indefinitely.
- **Error handling** — failed requests (timeouts, non-2xx responses, network errors) are caught and re-thrown with clear messages, which API routes then convert into safe, generic error responses for the client (no internal details or API keys are ever leaked to the frontend).

### API Routes
- `GET /api/movies/search?q=&page=` — search movies by title
- `GET /api/movies/discover?genre=&sort=&page=` — browse movies by category/sort order
- `GET /api/movies/[id]` — single movie details
- `GET /api/genres` — genre list (for filter UI)
- `GET /api/wishlist` — list saved movies
- `POST /api/wishlist` — add a movie to the wishlist
- `DELETE /api/wishlist/[id]` — remove a movie from the wishlist

### Wishlist Persistence
The wishlist is stored in a local SQLite database (`lib/db.js`, via `better-sqlite3`), not in TMDb. The **full normalized movie snapshot** (title, poster, rating, year) is stored directly in the database, rather than storing only the TMDb ID and re-fetching details every time.

This was a deliberate technical decision:
- **Faster** — no extra API call needed to render the wishlist page.
- **More resilient** — the wishlist still displays correctly even if TMDb is temporarily down.
- **Trade-off accepted** — if TMDb's data for a movie changes later (e.g., a corrected poster), the wishlist would show the stale snapshot until re-added. For a project at this scale, this trade-off was considered acceptable.

The movie's own TMDb ID is reused as the SQLite primary key, which elegantly prevents duplicate wishlist entries (`INSERT OR IGNORE`) without extra application-level checks.

### Frontend Structure
- `app/page.js` — homepage: browsing, search, genre/sort filters, and pagination, all in one view (chosen over separate Browse/Search pages to keep navigation simple and avoid losing context, per Section 2 of the brief).
- `app/movies/[id]/page.js` — movie details page, with add/remove wishlist button.
- `app/wishlist/page.js` — wishlist page.
- `app/layout.js` — shared navigation bar across all pages.

Search input is **debounced** (500ms) using a `useEffect` + `setTimeout` pattern, so rapid typing doesn't trigger a flood of API requests — directly addressing the brief's concern about "the user performs multiple searches... quickly."

### Responsive Design
Tailwind CSS is used throughout. The movie grid scales from 2 columns (mobile) to 5 columns (desktop) using responsive breakpoint classes. Poster images use a fixed `aspect-[2/3]` container with `object-cover`, so posters of inconsistent dimensions from TMDb are always displayed consistently without distorting the layout. Long titles are truncated with an ellipsis to prevent layout breakage.

---

## Assumptions Made
- A single shared wishlist is sufficient for this assignment scope — no user accounts/authentication were implemented, since the brief does not require multi-user support.
- TMDb's "popularity" sort is a reasonable default browsing view when no search or filter is active.
- Genre and sort filters apply only to browsing (TMDb's `/discover` endpoint), not to search results, since TMDb's `/search` endpoint does not support these parameters.

## Known Limitations
- **In-memory caching** resets on server restart and does not share state across multiple server instances — a production deployment would likely use Redis or similar for shared caching.
- **No authentication** — the wishlist is global to whoever uses the app, not scoped to individual users.
- **Wishlist snapshots can go stale** if the underlying TMDb data changes after a movie is added (see trade-off discussion above).
- Pagination is capped at TMDb's own limit of 500 pages regardless of how many total results are reported.

## AI Tools Used
Claude was used throughout development as a step-by-step guide: explaining Next.js App Router concepts, writing and explaining backend abstraction logic (caching, timeout handling, normalization), debugging environment/tooling issues (a `.env.local` file encoding issue, port conflicts, a route/page path conflict), and writing frontend React components with explanations for each piece. All code was reviewed, tested, and understood before being committed — the architectural decisions (data normalization shape, caching strategy, storing full movie snapshots vs. IDs only, single-page browse+search layout) were made deliberately based on trade-offs discussed during development, not auto-generated blindly.

## What I'd Improve With More Time
- Add debounced/skeleton loading placeholders instead of plain "Loading..." text, for a more polished feel.
- Add a proper "no internet / offline" detection state.
- Support sorting/filtering combined with search (would require either a different TMDb endpoint strategy or client-side filtering of search results).
- Add automated tests for the API routes and the TMDb abstraction layer.
- Move from in-memory caching to a persistent cache (e.g., Redis) for multi-instance deployments.