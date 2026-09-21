"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function loadMovies() {
      setLoading(true);
      setError(null);
      try {
        const url = debouncedQuery.trim()
          ? `/api/movies/search?q=${encodeURIComponent(debouncedQuery)}`
          : "/api/movies/discover";

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load movies");
        const data = await res.json();
        setMovies(data.results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadMovies();
  }, [debouncedQuery]);

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-4">Discover Movies</h1>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for a movie..."
        className="w-full max-w-md mb-6 px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
      />

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
      )}
    </div>
  );
}