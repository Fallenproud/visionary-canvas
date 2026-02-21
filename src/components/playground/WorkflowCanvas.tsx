import { useState, useRef, useCallback, useEffect } from "react";
import type { Workflow, WorkflowNode } from "@/types/workflow";

const NODE_W = 160;
const NODE_H = 52;
const NODE_COLORS: Record<WorkflowNode["type"], { bg: string; border: string; text: string }> = {
  start: { bg: "hsl(142 71% 25%)", border: "hsl(142 71% 35%)", text: "hsl(142 71% 90%)" },
  process: { bg: "hsl(217 91% 30%)", border: "hsl(217 91% 45%)", text: "hsl(217 91% 90%)" },
  decision: { bg: "hsl(45 93% 30%)", border: "hsl(45 93% 47%)", text: "hsl(45 93% 90%)" },
  end: { bg: "hsl(0 72% 30%)", border: "hsl(0 72% 45%)", text: "hsl(0 72% 90%)" },
};

interface WorkflowCanvasProps {
  workflow: Workflow | null;
}

export const WorkflowCanvas = ({ workflow }: WorkflowCanvasProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState({ x: -50, y: -30, w: 800, h: 500 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState<string | null>(null);

  // Fit viewbox to content
  useEffect(() => {
    if (!workflow || workflow.nodes.length === 0) return;
    const xs = workflow.nodes.map((n) => n.x);
    const ys = workflow.nodes.map((n) => n.y);
    const minX = Math.min(...xs) - 80;
    const minY = Math.min(...ys) - 60;
    const maxX = Math.max(...xs) + NODE_W + 80;
    const maxY = Math.max(...ys) + NODE_H + 60;
    setViewBox({ x: minX, y: minY, w: maxX - minX, h: maxY - minY });
  }, [workflow]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging || !svgRef.current) return;
      const svg = svgRef.current;
      const scale = viewBox.w / svg.clientWidth;
      const dx = (e.clientX - dragStart.x) * scale;
      const dy = (e.clientY - dragStart.y) * scale;
      setViewBox((v) => ({ ...v, x: v.x - dx, y: v.y - dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [dragging, dragStart, viewBox.w]
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    setViewBox((v) => {
      const newW = v.w * factor;
      const newH = v.h * factor;
      const dx = (v.w - newW) / 2;
      const dy = (v.h - newH) / 2;
      return { x: v.x + dx, y: v.y + dy, w: newW, h: newH };
    });
  }, []);

  if (!workflow) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        Select a workflow to preview
      </div>
    );
  }

  const nodeMap = new Map(workflow.nodes.map((n) => [n.id, n]));

  return (
    <svg
      ref={svgRef}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
      onWheel={handleWheel}
    >
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="hsl(var(--muted-foreground))" opacity="0.5" />
        </marker>
      </defs>

      {/* Edges */}
      {workflow.edges.map((edge, i) => {
        const from = nodeMap.get(edge.from);
        const to = nodeMap.get(edge.to);
        if (!from || !to) return null;
        const x1 = from.x + NODE_W / 2;
        const y1 = from.y + NODE_H;
        const x2 = to.x + NODE_W / 2;
        const y2 = to.y;
        const midY = (y1 + y2) / 2;
        return (
          <g key={`edge-${i}`}>
            <path
              d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="1.5"
              markerEnd="url(#arrowhead)"
              opacity="0.6"
            />
            {edge.label && (
              <text
                x={(x1 + x2) / 2}
                y={midY - 6}
                textAnchor="middle"
                fill="hsl(var(--muted-foreground))"
                fontSize="10"
                opacity="0.7"
              >
                {edge.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {workflow.nodes.map((node) => {
        const colors = NODE_COLORS[node.type];
        const isHovered = hovered === node.id;
        return (
          <g
            key={node.id}
            onMouseEnter={() => setHovered(node.id)}
            onMouseLeave={() => setHovered(null)}
            style={{ transition: "transform 0.15s ease" }}
          >
            <rect
              x={node.x}
              y={node.y}
              width={NODE_W}
              height={NODE_H}
              rx={10}
              fill={colors.bg}
              stroke={colors.border}
              strokeWidth={isHovered ? 2.5 : 1.5}
              opacity={isHovered ? 1 : 0.9}
            />
            <text
              x={node.x + NODE_W / 2}
              y={node.y + NODE_H / 2 + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={colors.text}
              fontSize="12"
              fontWeight="600"
              fontFamily="system-ui, sans-serif"
            >
              {node.label}
            </text>
            {/* Tooltip on hover */}
            {isHovered && node.description && (
              <g>
                <rect
                  x={node.x + NODE_W + 8}
                  y={node.y}
                  width={Math.max(node.description.length * 6.5, 120)}
                  height={28}
                  rx={6}
                  fill="hsl(var(--popover))"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                <text
                  x={node.x + NODE_W + 16}
                  y={node.y + 18}
                  fill="hsl(var(--popover-foreground))"
                  fontSize="11"
                  fontFamily="system-ui, sans-serif"
                >
                  {node.description}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};
