/* eslint-disable @typescript-eslint/no-explicit-any */
let notes: Array<{ id: string; content: string; embedding?: number[] }> = [];

const EMBEDDING_DIM = 1536;

function l2Distance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export function addNote(content: string, embedding: number[]) {
  const id = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  notes.push({ id, content, embedding });
  return { id, index: notes.length - 1 };
}

export function searchSimilar(queryEmbedding: number[]) {
  if (notes.length === 0) return null;

  let minDistance = Infinity;
  let minIndex = -1;

  notes.forEach((note, index) => {
    if (note.embedding) {
      const distance = l2Distance(queryEmbedding, note.embedding);
      if (distance < minDistance) {
        minDistance = distance;
        minIndex = index;
      }
    }
  });

  if (minIndex >= 0) {
    return {
      note: notes[minIndex],
      distance: minDistance,
      index: minIndex,
    };
  }

  return null;
}

export function getAllNotes() {
  return notes;
}

export function clearNotes() {
  notes = [];
}
