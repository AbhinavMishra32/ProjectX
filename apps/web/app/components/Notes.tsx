"use client";

import { useState, useEffect } from "react";
import styles from "./notes.module.css";

interface Note {
  id: string;
  content: string;
  timestamp: number;
  embedding?: number[];
  relatedTo?: string;
}

interface NotesProps {
  messages: Array<{ role: string; content: string }>;
  onAddKnowledge?: (text: string) => void;
  onNodeUpdate?: (node: { id: string; content: string; relatedTo?: string }) => void;
}

export function Notes({ messages, onAddKnowledge, onNodeUpdate }: NotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const addNoteWithRAG = async (content: string) => {
    setIsAdding(true);
    try {
      const searchResponse = await fetch("/api/notes/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content }),
      });

      let relatedTo: string | undefined;
      if (searchResponse.ok) {
        const { similar } = await searchResponse.json();
        if (similar && similar.distance < 0.5) {
          relatedTo = similar.id;
        }
      }

      const addResponse = await fetch("/api/notes/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (addResponse.ok) {
        const { id } = await addResponse.json();
        const note: Note = {
          id,
          content,
          timestamp: Date.now(),
          relatedTo,
        };
        setNotes((prev) => [...prev, note]);
        
        if (onNodeUpdate) {
          onNodeUpdate({ id, content, relatedTo });
        }
      }
    } catch (error) {
      console.error("Failed to add note with RAG:", error);
      const fallbackNote: Note = {
        id: Math.random().toString(36).substr(2, 9),
        content,
        timestamp: Date.now(),
      };
      setNotes((prev) => [...prev, fallbackNote]);
      
      if (onNodeUpdate) {
        onNodeUpdate({ id: fallbackNote.id, content });
      }
    } finally {
      setIsAdding(false);
    }
  };

  const extractNotes = async (msgs: Array<{ role: string; content: string }>) => {
    setIsExtracting(true);
    
    const extracted = msgs
      .filter((m) => m.role === "assistant" && m.content.length > 20)
      .slice(-3);

    for (const msg of extracted) {
      await addNoteWithRAG(msg.content);
    }
    
    setIsExtracting(false);
  };

  const handleExtractNotes = async () => {
    await extractNotes(messages);
  };

  useEffect(() => {
    if (onAddKnowledge) {
      const handler = (text: string) => addNoteWithRAG(text);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__addKnowledgeHandler = handler;
    }
  }, [onAddKnowledge]);

  const addManualNote = async () => {
    if (!newNote.trim()) return;
    await addNoteWithRAG(newNote.trim());
    setNewNote("");
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className={styles.notesContainer}>
      <div className={styles.notesHeader}>
        <h2>Knowledge Notes</h2>
        <div className={styles.headerRight}>
          <button 
            onClick={handleExtractNotes} 
            className={styles.extractBtn}
            disabled={isExtracting || messages.length === 0}
          >
            {isExtracting ? "Extracting..." : "Extract Notes"}
          </button>
          <span className={styles.count}>{notes.length}</span>
        </div>
      </div>

      <div className={styles.addNote}>
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addManualNote()}
          placeholder="Add a note..."
          className={styles.noteInput}
        />
        <button onClick={addManualNote} className={styles.addBtn}>
          +
        </button>
      </div>

      <div className={styles.notesList}>
        {(isExtracting || isAdding) && (
          <div className={styles.extracting}>
            {isAdding ? "Adding to knowledge base..." : "Extracting notes..."}
          </div>
        )}
        {notes.length === 0 ? (
          <div className={styles.emptyState}>
            No notes yet. Chat to generate knowledge.
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`${styles.noteCard} ${note.relatedTo ? styles.related : ""}`}
            >
              {note.relatedTo && (
                <div className={styles.relatedBadge}>Related to existing</div>
              )}
              <div className={styles.noteContent}>{note.content}</div>
              <div className={styles.noteFooter}>
                <span className={styles.timestamp}>
                  {new Date(note.timestamp).toLocaleTimeString()}
                </span>
                <button
                  onClick={() => deleteNote(note.id)}
                  className={styles.deleteBtn}
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
