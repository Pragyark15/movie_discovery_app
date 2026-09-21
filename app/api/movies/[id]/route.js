import { NextResponse } from "next/server";
import { getMovieDetails } from "../../../../lib/tmdb";

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const movie = await getMovieDetails(id);
    return NextResponse.json(movie);
  } catch (error) {
    console.error("Movie details error:", error.message);
    return NextResponse.json(
      { error: "Movie not found or something went wrong." },
      { status: 404 }
    );
  }
}