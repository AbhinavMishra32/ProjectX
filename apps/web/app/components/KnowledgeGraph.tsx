"use client";

import { useEffect, useRef } from "react";
import styles from "./graph.module.css";

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

interface GraphLink {
  source: string;
  target: string;
  type: "semantic" | "sequential";
}

interface GraphProps {
  nodes: Array<{ id: string; content: string; relatedTo?: string }>;
}

export function KnowledgeGraph({ nodes }: GraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const linksRef = useRef<GraphLink[]>([]);
  const animationRef = useRef<number | undefined>();

  useEffect(() => {
    if (nodes.length === 0) {
      nodesRef.current = [];
      linksRef.current = [];
      return;
    }

    const newNodes = nodes.map((node, idx) => {
      const existing = nodesRef.current.find((n) => n.id === node.id);
      if (existing) return existing;

      const angle = (idx * 2 * Math.PI) / nodes.length;
      const radius = 150;
      return {
        id: node.id,
        label: node.content.slice(0, 30),
        x: 300 + Math.cos(angle) * radius,
        y: 300 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
      };
    });

    nodesRef.current = newNodes;

    const newLinks: GraphLink[] = [];
    
    for (const node of nodes) {
      if (node.relatedTo) {
        newLinks.push({
          source: node.relatedTo,
          target: node.id,
          type: "semantic",
        });
      }
    }
    
    for (let i = 0; i < newNodes.length - 1; i++) {
      const hasSemanticLink = newLinks.some(
        (link) =>
          (link.source === newNodes[i]?.id && link.target === newNodes[i + 1]?.id) ||
          (link.source === newNodes[i + 1]?.id && link.target === newNodes[i]?.id)
      );
      
      if (!hasSemanticLink && newNodes[i] && newNodes[i + 1]) {
        newLinks.push({
          source: newNodes[i].id,
          target: newNodes[i + 1].id,
          type: "sequential",
        });
      }
    }
    
    linksRef.current = newLinks;
  }, [nodes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const simulate = () => {
      const nodes = nodesRef.current;
      const links = linksRef.current;

      if (nodes.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      for (const node of nodes) {
        let fx = 0;
        let fy = 0;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const dx = centerX - node.x;
        const dy = centerY - node.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > 0) {
          fx += (dx / d) * 0.1;
          fy += (dy / d) * 0.1;
        }

        for (const other of nodes) {
          if (other === node) continue;
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 500 / (dist * dist);
          fx -= (dx / dist) * force;
          fy -= (dy / dist) * force;
        }

        for (const link of links) {
          const other =
            link.source === node.id
              ? nodes.find((n) => n.id === link.target)
              : link.target === node.id
                ? nodes.find((n) => n.id === link.source)
                : null;

          if (other) {
            const dx = other.x - node.x;
            const dy = other.y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = (dist - 100) * 0.01;
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          }
        }

        node.vx = (node.vx || 0) * 0.9 + fx;
        node.vy = (node.vy || 0) * 0.9 + fy;
        node.x += node.vx;
        node.y += node.vy;

        node.x = Math.max(40, Math.min(canvas.width - 40, node.x));
        node.y = Math.max(40, Math.min(canvas.height - 40, node.y));
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;
      const links = linksRef.current;

      for (const link of links) {
        const source = nodes.find((n) => n.id === link.source);
        const target = nodes.find((n) => n.id === link.target);
        if (source && target) {
          if (link.type === "semantic") {
            ctx.strokeStyle = "rgba(16, 185, 129, 0.6)";
            ctx.lineWidth = 2.5;
          } else {
            ctx.strokeStyle = "rgba(0, 112, 243, 0.2)";
            ctx.lineWidth = 1.5;
          }
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        }
      }

      for (const node of nodes) {
        const gradient = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          20
        );
        gradient.addColorStop(0, "rgba(0, 112, 243, 0.8)");
        gradient.addColorStop(1, "rgba(0, 168, 255, 0.4)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(node.label.slice(0, 20) + "...", node.x, node.y + 35);
      }
    };

    const loop = () => {
      simulate();
      render();
      animationRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes]);

  return (
    <div className={styles.graphContainer}>
      <div className={styles.graphHeader}>
        <h2>Knowledge Graph</h2>
        <div className={styles.graphLegend}>
          <span className={styles.nodeCount}>{nodes.length} nodes</span>
          <span className={styles.legendItem}>
            <span className={styles.semanticLine}></span> Semantic
          </span>
          <span className={styles.legendItem}>
            <span className={styles.sequentialLine}></span> Sequential
          </span>
        </div>
      </div>
      <div className={styles.graphCanvas}>
        {nodes.length === 0 ? (
          <div className={styles.emptyState}>
            Add notes to visualize knowledge graph
          </div>
        ) : (
          <canvas ref={canvasRef} width={600} height={600} />
        )}
      </div>
    </div>
  );
}
