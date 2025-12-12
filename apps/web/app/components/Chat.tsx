"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./chat.module.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatProps {
  onExtractNotes: (messages: Message[]) => void;
  onAddKnowledge: (text: string) => void;
}

export function Chat({ onExtractNotes, onAddKnowledge }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selection, setSelection] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          role: "assistant",
          content: data.content,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const assistantMessage: Message = {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const assistantMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtract = () => {
    if (messages.length > 0) {
      onExtractNotes(messages);
    }
  };

  const handleTextSelection = () => {
    const selectedText = window.getSelection()?.toString().trim();
    if (selectedText && selectedText.length > 0) {
      const range = window.getSelection()?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        setSelection({
          text: selectedText,
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        });
      }
    } else {
      setSelection(null);
    }
  };

  const handleAddKnowledge = () => {
    if (selection) {
      onAddKnowledge(selection.text);
      setSelection(null);
      window.getSelection()?.removeAllRanges();
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).__addKnowledgeHandler) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__addKnowledgeHandler(selection.text);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setSelection(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h2>Chat</h2>
        <button
          onClick={handleExtract}
          className={styles.extractBtn}
          disabled={messages.length === 0}
        >
          Extract Notes
        </button>
      </div>

      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            Start a conversation to generate notes
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`${styles.message} ${styles[msg.role]}`}
            >
              <div
                className={styles.messageContent}
                onMouseUp={msg.role === "assistant" ? handleTextSelection : undefined}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {selection && (
        <div
          className={styles.selectionPopup}
          style={{
            left: `${selection.x}px`,
            top: `${selection.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={handleAddKnowledge} className={styles.addKnowledgeBtn}>
            + Add to Knowledge
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className={styles.input}
          disabled={isProcessing}
        />
        <button
          type="submit"
          className={styles.sendBtn}
          disabled={isProcessing || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
