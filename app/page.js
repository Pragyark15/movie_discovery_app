"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load genre list once on mount
  useEffect(() => {
    async function loadGenres() {
      try {
        const res = await fetch("/api/genres");
        if (!res.ok) return;
        const data = await res.json();
        setGenres(data.genres);
      } catch {
        // Genre list is a nice-to-have; fail silently if it doesn't load.
      }
    }
    loadGenres();
  }, []);

  // Reset to page 1 whenever search/genre/sort changes
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, selectedGenre, sortBy]);

  // Load movies whenever search/genre/sort/page changes
  useEffect(() => {
    async function loadMovies() {
      setLoading(true);
      setError(null);
      try {
        let url;
        if (debouncedQuery.trim()) {
          url = `/api/movies/search?q=${encodeURIComponent(debouncedQuery)}&page=${page}`;
        } else {
          const params = new URLSearchParams({ sort: sortBy, page });
          if (selectedGenre) params.set("genre", selectedGenre);
          url = `/api/movies/discover?${params.toString()}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load movies");
        const data = await res.json();
        setMovies(data.results);
        setTotalPages(Math.min(data.totalPages, 500));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadMovies();
  }, [debouncedQuery, selectedGenre, sortBy, page]);

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-4">Discover Movies</h1>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for a movie..."
        className="w-full max-w-md mb-4 px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          disabled={!!debouncedQuery.trim()}
          className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 disabled:opacity-50"
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          disabled={!!debouncedQuery.trim()}
          className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 disabled:opacity-50"
        >
          <option value="popularity.desc">Most Popular</option>
          <option value="vote_average.desc">Highest Rated</option>
          <option value="release_date.desc">Newest First</option>
          <option value="release_date.asc">Oldest First</option>
        </select>
      </div>

      {loading && (
        <p className="text-neutral-400">Loading movies...</p>
      )}

      {error && (
        <p className="text-red-400">
          Something went wrong: {error}. Please try again later.
        </p>
      )}

      {!loading && !error && movies.length === 0 && (
        <p className="text-neutral-400">No movies found.</p>
      )}

      {!loading && !error && movies.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((movie) => (
              <Link
                key={movie.id}
                href={`/movies/${movie.id}`}
                className="group"
              >
                <div className="aspect-[2/3] bg-neutral-800 rounded-lg overflow-hidden mb-2">
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm text-center p-2">
                      No poster available
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium truncate">{movie.title}</p>
                <p className="text-xs text-neutral-400">
                  {movie.releaseYear} {movie.rating ? `· ⭐ ${movie.rating}` : ""}
                </p>
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-700 transition"
            >
              Previous
            </button>
            <span className="text-sm text-neutral-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-700 transition"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}