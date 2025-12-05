import { NextResponse } from "next/server";
import { searchSimilar } from "@/lib/vectordb";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid text" }, { status: 400 });
    }

    const embedResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/embed`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      }
    );

    if (!embedResponse.ok) {
      return NextResponse.json(
        { error: "Failed to generate embedding" },
        { status: 500 }
      );
    }

    const { embedding } = await embedResponse.json();
    const result = searchSimilar(embedding);

    if (!result) {
      return NextResponse.json({
        similar: null,
        message: "No similar notes found",
      });
    }

    return NextResponse.json({
      similar: {
        id: result.note.id,
        content: result.note.content,
        distance: result.distance,
        index: result.index,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
