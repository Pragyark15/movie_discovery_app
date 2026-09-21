import { NextResponse } from "next/server";
import { getGenres } from "../../../lib/tmdb";

export async function GET() {
  try {
    const genres = await getGenres();
    return NextResponse.json({ genres });
  } catch (error) {
    console.error("Genres error:", error.message);
    return NextResponse.json(
      { error: "Something went wrong while loading genres." },
      { status: 502 }
    );
  }
}