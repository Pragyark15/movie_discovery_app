import { NextResponse } from "next/server";
import { discoverMovies } from "../../../../lib/tmdb";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const genreId = searchParams.get("genre") || undefined;
  const sortBy = searchParams.get("sort") || "popularity.desc";
  const page = searchParams.get("page") || "1";

  try {
    const data = await discoverMovies({ genreId, sortBy, page });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Discover error:", error.message);
    return NextResponse.json(
      { error: "Something went wrong while loading movies." },
      { status: 502 }
    );
  }
}