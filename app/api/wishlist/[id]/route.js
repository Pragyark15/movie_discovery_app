import { NextResponse } from "next/server";
import db from "../../../../lib/db";

export async function DELETE(request, { params }) {
  const { id } = await params;

  try {
    const stmt = db.prepare("DELETE FROM wishlist WHERE id = ?");
    const result = stmt.run(id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Movie not found in wishlist." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wishlist delete error:", error.message);
    return NextResponse.json(
      { error: "Could not remove movie from wishlist." },
      { status: 500 }
    );
  }
}