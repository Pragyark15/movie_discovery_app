"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

export default function MovieDetails({ params }) {
  const { id } = use(params);

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);

  // Load movie details
  useEffect(() => {
    async function loadMovie() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/movies/${id}`);
        if (!res.ok) throw new Error("Movie not found");
        const data = await res.json();
        setMovie(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadMovie();
  }, [id]);

  // Check if this movie is already in the wishlist
  useEffect(() => {
    async function checkWishlist() {
      try {
        const res = await fetch("/api/wishlist");
        if (!res.ok) return;
        const data = await res.json();
        setInWishlist(data.results.some((m) => String(m.id) === String(id)));
      } catch {
        // Non-critical; wishlist button will just default to "Add"
      }
    }
    checkWishlist();
  }, [id]);

  async function handleAddToWishlist() {
    if (!movie) return;
    setWishlistBusy(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(movie),
      });
      if (res.ok) setInWishlist(true);
    } catch {
      // Silently fail; button stays in "Add" state so the user can retry
    } finally {
      setWishlistBusy(false);
    }
  }

  async function handleRemoveFromWishlist() {
    setWishlistBusy(true);
    try {
      const res = await fetch(`/api/wishlist/${id}`, { method: "DELETE" });
      if (res.ok) setInWishlist(false);
    } catch {
      // Silently fail; button stays in "Remove" state so the user can retry
    } finally {
      setWishlistBusy(false);
    }
  }

  if (loading) {
    return <p className="p-8 text-neutral-400">Loading movie...</p>;
  }

  if (error || !movie) {
    return (
      <div className="p-8">
        <p className="text-red-400 mb-4">
          {error || "Movie not found."}
        </p>
        <Link href="/" className="text-amber-400 hover:underline">
          ← Back to browsing
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <Link href="/" className="text-amber-400 hover:underline text-sm">
        ← Back to browsing
      </Link>

      <div className="flex flex-col sm:flex-row gap-6 mt-4">
        <div className="w-full sm:w-64 shrink-0 aspect-[2/3] bg-neutral-800 rounded-lg overflow-hidden">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm text-center p-2">
              No poster available
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
          <p className="text-neutral-400 mb-4">
            {movie.releaseYear} {movie.rating ? `· ⭐ ${movie.rating}` : ""}
          </p>
          <p className="text-neutral-200 leading-relaxed mb-6">
            {movie.overview}
          </p>

          {inWishlist ? (
            <button
              onClick={handleRemoveFromWishlist}
              disabled={wishlistBusy}
              className="px-5 py-2 rounded-lg bg-red-900 border border-red-700 hover:bg-red-800 transition disabled:opacity-50"
            >
              {wishlistBusy ? "Removing..." : "− Remove from Wishlist"}
            </button>
          ) : (
            <button
              onClick={handleAddToWishlist}
              disabled={wishlistBusy}
              className="px-5 py-2 rounded-lg bg-amber-500 text-neutral-950 font-medium hover:bg-amber-400 transition disabled:opacity-50"
            >
              {wishlistBusy ? "Adding..." : "+ Add to Wishlist"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}