import { NextResponse } from "next/server";
import { searchMovies } from "../../../../lib/tmdb";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const page = searchParams.get("page") || "1";

  if (!query || query.trim() === "") {
    return NextResponse.json(
      { error: "Missing search query. Use ?q=movieName" },
      { status: 400 }
    );
  }

  try {
    const data = await searchMovies(query, page);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Search error:", error.message);
    return NextResponse.json(
      { error: "Something went wrong while searching movies." },
      { status: 502 }
    );
  }
}