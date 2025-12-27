"use client";

import { useState } from "react";
import { Chat } from "./components/Chat";
import { Notes } from "./components/Notes";
import { KnowledgeGraph } from "./components/KnowledgeGraph";
import styles from "./page.module.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface GraphNode {
  id: string;
  content: string;
  relatedTo?: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [triggerExtract, setTriggerExtract] = useState(0);
  const [manualKnowledge, setManualKnowledge] = useState<string[]>([]);
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);

  const handleExtractNotes = (msgs: Message[]) => {
    setMessages(msgs);
    setTriggerExtract((prev) => prev + 1);
  };

  const handleAddKnowledge = (text: string) => {
    setManualKnowledge((prev) => [...prev, text]);
    setTriggerExtract((prev) => prev + 1);
  };

  const handleNodeUpdate = (node: GraphNode) => {
    setGraphNodes((prev) => {
      const exists = prev.find((n) => n.id === node.id);
      if (exists) return prev;
      return [...prev, node];
    });
  };

  const allMessages = [
    ...messages,
    ...manualKnowledge.map((k) => ({
      role: "user" as const,
      content: k,
    })),
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Knowledge Assistant</h1>
        <p className={styles.subtitle}>Chat, extract, and visualize your knowledge</p>
      </header>

      <main className={styles.main}>
        <div className={styles.leftPanel}>
          <Chat onExtractNotes={handleExtractNotes} onAddKnowledge={handleAddKnowledge} />
        </div>
        <div className={styles.rightPanel}>
          <div className={styles.notesSection}>
            <Notes
              key={triggerExtract}
              messages={allMessages}
              onAddKnowledge={handleAddKnowledge}
              onNodeUpdate={handleNodeUpdate}
            />
          </div>
          <div className={styles.graphSection}>
            <KnowledgeGraph nodes={graphNodes} />
          </div>
        </div>
      </main>
    </div>
  );
}

