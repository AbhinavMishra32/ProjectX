import { NextResponse } from "next/server";
import { addNote } from "@/lib/vectordb";

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    const embedResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/embed`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content }),
      }
    );

    if (!embedResponse.ok) {
      return NextResponse.json(
        { error: "Failed to generate embedding" },
        { status: 500 }
      );
    }

    const { embedding } = await embedResponse.json();
    const result = addNote(content, embedding);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to store note" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: result.id,
      index: result.index,
      content,
    });
  } catch (error) {
    console.error("Add note error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
