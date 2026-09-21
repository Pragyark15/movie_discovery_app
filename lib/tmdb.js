const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;

const cache = new Map();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

function getFromCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_DURATION_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchFromTMDb(endpoint, params = {}) {
  const cacheKey = endpoint + JSON.stringify(params);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const url = new URL(TMDB_BASE_URL + endpoint);
  url.searchParams.set("api_key", API_KEY);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`TMDb responded with status ${response.status}`);
    }

    const data = await response.json();
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === "AbortError") {
      throw new Error("TMDb request timed out");
    }
    throw new Error(`Failed to fetch from TMDb: ${error.message}`);
  }
}

const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";

function normalizeMovie(raw) {
  return {
    id: raw.id,
    title: raw.title || "Untitled",
    overview: raw.overview || "No description available.",
    posterUrl: raw.poster_path ? POSTER_BASE_URL + raw.poster_path : null,
    releaseYear: raw.release_date ? raw.release_date.slice(0, 4) : "Unknown",
    rating: typeof raw.vote_average === "number" ? Math.round(raw.vote_average * 10) / 10 : null,
    genreIds: raw.genre_ids || raw.genres?.map((g) => g.id) || [],
  };
}

export async function searchMovies(query, page = 1) {
  const data = await fetchFromTMDb("/search/movie", { query, page });
  return {
    results: data.results.map(normalizeMovie),
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
}

export async function discoverMovies({ genreId, sortBy = "popularity.desc", page = 1 } = {}) {
  const params = { sort_by: sortBy, page };
  if (genreId) params.with_genres = genreId;

  const data = await fetchFromTMDb("/discover/movie", params);
  return {
    results: data.results.map(normalizeMovie),
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
}

export async function getMovieDetails(id) {
  const data = await fetchFromTMDb(`/movie/${id}`);
  return normalizeMovie(data);
}

export async function getGenres() {
  const data = await fetchFromTMDb("/genre/movie/list");
  return data.genres; // [{ id, name }, ...]
}