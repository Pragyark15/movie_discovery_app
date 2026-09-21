import { NextResponse } from "next/server";
import db from "../../../lib/db";

export async function GET() {
  try {
    const movies = db
      .prepare("SELECT * FROM wishlist ORDER BY addedAt DESC")
      .all();
    return NextResponse.json({ results: movies });
  } catch (error) {
    console.error("Wishlist fetch error:", error.message);
    return NextResponse.json(
      { error: "Could not load wishlist." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const movie = await request.json();

    if (!movie.id || !movie.title) {
      return NextResponse.json(
        { error: "Movie must include at least an id and title." },
        { status: 400 }
      );
    }

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO wishlist (id, title, overview, posterUrl, releaseYear, rating)
      VALUES (@id, @title, @overview, @posterUrl, @releaseYear, @rating)
    `);
    stmt.run({
      id: movie.id,
      title: movie.title,
      overview: movie.overview || null,
      posterUrl: movie.posterUrl || null,
      releaseYear: movie.releaseYear || null,
      rating: movie.rating ?? null,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Wishlist add error:", error.message);
    return NextResponse.json(
      { error: "Could not add movie to wishlist." },
      { status: 500 }
    );
  }
}