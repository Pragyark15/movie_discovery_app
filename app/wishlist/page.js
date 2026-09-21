"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function WishlistPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    loadWishlist();
  }, []);

  async function loadWishlist() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wishlist");
      if (!res.ok) throw new Error("Failed to load wishlist");
      const data = await res.json();
      setMovies(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(id) {
    setRemovingId(id);
    try {
      const res = await fetch(`/api/wishlist/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMovies((prev) => prev.filter((m) => String(m.id) !== String(id)));
      }
    } catch {
      // Silently fail; movie stays in the list so the user can retry
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>

      {loading && <p className="text-neutral-400">Loading wishlist...</p>}

      {error && (
        <p className="text-red-400">
          Something went wrong: {error}. Please try again later.
        </p>
      )}

      {!loading && !error && movies.length === 0 && (
        <p className="text-neutral-400">
          Your wishlist is empty.{" "}
          <Link href="/" className="text-amber-400 hover:underline">
            Browse movies
          </Link>{" "}
          to add some.
        </p>
      )}

      {!loading && !error && movies.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((movie) => (
            <div key={movie.id}>
              <Link href={`/movies/${movie.id}`} className="group">
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
              <button
                onClick={() => handleRemove(movie.id)}
                disabled={removingId === movie.id}
                className="mt-2 w-full text-xs px-2 py-1 rounded bg-red-900 border border-red-700 hover:bg-red-800 transition disabled:opacity-50"
              >
                {removingId === movie.id ? "Removing..." : "Remove"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}