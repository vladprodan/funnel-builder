import { useRef, useState, useCallback, type MouseEvent } from "react";
import { useBuilder } from "@/context/BuilderContext";
import type { Screen } from "@/types";

const CARD_W = 200;
const CARD_H = 160;
const PORT_R = 6;

type Vec2 = { x: number; y: number };

function getPortOut(pos: Vec2): Vec2 {
  return { x: pos.x + CARD_W, y: pos.y + CARD_H / 2 };
}
function getPortIn(pos: Vec2): Vec2 {
  return { x: pos.x, y: pos.y + CARD_H / 2 };
}

function bezier(from: Vec2, to: Vec2): string {
  const dx = Math.abs(to.x - from.x) * 0.55;
  return `M ${from.x} ${from.y} C ${from.x + dx} ${from.y}, ${to.x - dx} ${
    to.y
  }, ${to.x} ${to.y}`;
}

export function FlowView() {
  const {
    screens,
    connections,
    updateScreenFlowPosition,
    addConnection,
    removeConnection,
    updateConnectionLabel,
    setActiveScreenId,
    setView,
  } = useBuilder();

  // Pan + zoom
  const [pan, setPan] = useState<Vec2>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const isPanning = useRef(false);
  const lastMouse = useRef<Vec2>({ x: 0, y: 0 });

  // Dragging a card
  const draggingCard = useRef<{
    id: string;
    startPos: Vec2;
    startMouse: Vec2;
  } | null>(null);

  // Drawing a new connection
  const [drawing, setDrawing] = useState<{
    fromId: string;
    mouse: Vec2;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Label editing
  const [editingConn, setEditingConn] = useState<string | null>(null);
  const [labelDraft, setLabelDraft] = useState("");

  // Hover conn
  const [hoveredConn, setHoveredConn] = useState<string | null>(null);

  // Convert screen-space mouse to canvas space
  const toCanvas = useCallback(
    (mx: number, my: number): Vec2 => {
      const rect = containerRef.current!.getBoundingClientRect();
      return {
        x: (mx - rect.left - pan.x) / zoom,
        y: (my - rect.top - pan.y) / zoom,
      };
    },
    [pan, zoom]
  );

  // ── Pan ──────────────────────────────────────────────────────────
  const onCanvasMouseDown = useCallback((e: MouseEvent) => {
    if (e.button !== 0) return;
    // only pan on canvas bg
    if ((e.target as HTMLElement).closest("[data-card]")) return;
    isPanning.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isPanning.current) {
        setPan((p) => ({
          x: p.x + e.clientX - lastMouse.current.x,
          y: p.y + e.clientY - lastMouse.current.y,
        }));
        lastMouse.current = { x: e.clientX, y: e.clientY };
      }
      if (draggingCard.current) {
        const { id, startPos, startMouse } = draggingCard.current;
        const dx = (e.clientX - startMouse.x) / zoom;
        const dy = (e.clientY - startMouse.y) / zoom;
        updateScreenFlowPosition(id, startPos.x + dx, startPos.y + dy);
      }
      if (drawing) {
        const cv = toCanvas(e.clientX, e.clientY);
        setDrawing((d) => (d ? { ...d, mouse: cv } : null));
      }
    },
    [drawing, toCanvas, zoom, updateScreenFlowPosition]
  );

  const onMouseUp = useCallback(
    (e: MouseEvent) => {
      isPanning.current = false;
      draggingCard.current = null;

      if (drawing) {
        // check if we dropped on a card port-in area
        const cv = toCanvas(e.clientX, e.clientY);
        const target = screens.find((s) => {
          const pos = s.flowPosition ?? { x: 0, y: 0 };
          const port = getPortIn(pos);
          return Math.abs(cv.x - port.x) < 20 && Math.abs(cv.y - port.y) < 20;
        });
        if (target && target.id !== drawing.fromId) {
          addConnection(drawing.fromId, target.id, "");
        }
        setDrawing(null);
      }
    },
    [drawing, toCanvas, screens, addConnection]
  );

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.3, Math.min(2, z - e.deltaY * 0.001)));
  }, []);

  // ── Card drag ────────────────────────────────────────────────────
  const startCardDrag = useCallback((e: MouseEvent, screen: Screen) => {
    e.stopPropagation();
    draggingCard.current = {
      id: screen.id,
      startPos: screen.flowPosition ?? { x: 0, y: 0 },
      startMouse: { x: e.clientX, y: e.clientY },
    };
  }, []);

  // ── Start drawing connection ──────────────────────────────────────
  const startDrawing = useCallback(
    (e: MouseEvent, screenId: string) => {
      e.stopPropagation();
      const cv = toCanvas(e.clientX, e.clientY);
      setDrawing({ fromId: screenId, mouse: cv });
    },
    [toCanvas]
  );

  // ── Render connection path midpoint for label ────────────────────
  function connMidpoint(from: Screen, to: Screen): Vec2 {
    const a = getPortOut(from.flowPosition ?? { x: 0, y: 0 });
    const b = getPortIn(to.flowPosition ?? { x: 0, y: 0 });
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  const screenMap = new Map(screens.map((s) => [s.id, s]));

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden relative select-none"
      style={{
        background: "var(--bg-canvas)",
        backgroundImage:
          "radial-gradient(circle at 1px 1px, var(--dot-color) 1px, transparent 0)",
        backgroundSize: "28px 28px",
      }}
      onMouseDown={onCanvasMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
    >
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <div
          className="rounded-lg px-3 py-1.5 flex items-center gap-2"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border)",
          }}
        >
          <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>
            Drag cards to reposition · Drag{" "}
            <span className="text-violet-400">→</span> to connect · Click edge
            to label/delete
          </span>
        </div>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="rounded-lg px-2.5 py-1.5 text-xs transition-colors"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
        >
          Reset view
        </button>
        <div
          className="rounded-lg px-2.5 py-1.5 text-xs font-mono"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border)",
            color: "var(--text-faint)",
          }}
        >
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* SVG layer for connections */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <defs>
          <marker
            id="arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0 0 L6 3 L0 6 Z" fill="#7c3aed" opacity="0.8" />
          </marker>
          <marker
            id="arrow-hover"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0 0 L6 3 L0 6 Z" fill="#a78bfa" />
          </marker>
          <marker
            id="arrow-drawing"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0 0 L6 3 L0 6 Z" fill="#60a5fa" opacity="0.7" />
          </marker>
        </defs>

        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          {/* Existing connections */}
          {connections.map((conn) => {
            const from = screenMap.get(conn.fromScreenId);
            const to = screenMap.get(conn.toScreenId);
            if (!from || !to) return null;
            const a = getPortOut(from.flowPosition ?? { x: 0, y: 0 });
            const b = getPortIn(to.flowPosition ?? { x: 0, y: 0 });
            const isHovered = hoveredConn === conn.id;
            return (
              <g
                key={conn.id}
                style={{ pointerEvents: "all", cursor: "pointer" }}
                onMouseEnter={() => setHoveredConn(conn.id)}
                onMouseLeave={() => setHoveredConn(null)}
                onClick={() => {
                  setEditingConn(conn.id);
                  setLabelDraft(conn.label ?? "");
                }}
              >
                {/* Fat invisible hit area */}
                <path
                  d={bezier(a, b)}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={16}
                />
                {/* Visible path */}
                <path
                  d={bezier(a, b)}
                  fill="none"
                  stroke={isHovered ? "#a78bfa" : "#7c3aed"}
                  strokeWidth={isHovered ? 2 : 1.5}
                  strokeOpacity={isHovered ? 1 : 0.7}
                  markerEnd={isHovered ? "url(#arrow-hover)" : "url(#arrow)"}
                  style={{ transition: "stroke 0.15s, stroke-width 0.15s" }}
                />
              </g>
            );
          })}

          {/* In-progress drawing */}
          {drawing &&
            (() => {
              const from = screenMap.get(drawing.fromId);
              if (!from) return null;
              const a = getPortOut(from.flowPosition ?? { x: 0, y: 0 });
              return (
                <path
                  d={bezier(a, drawing.mouse)}
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                  strokeOpacity={0.7}
                  markerEnd="url(#arrow-drawing)"
                />
              );
            })()}

          {/* Screen cards */}
          {screens.map((screen) => {
            const pos = screen.flowPosition ?? { x: 0, y: 0 };
            const portOut = getPortOut(pos);
            const portIn = getPortIn(pos);
            return (
              <g key={screen.id}>
                {/* Input port glow ring when drawing */}
                {drawing && drawing.fromId !== screen.id && (
                  <circle
                    cx={portIn.x}
                    cy={portIn.y}
                    r={PORT_R + 4}
                    fill="#60a5fa"
                    opacity={0.15}
                  />
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* HTML Cards layer */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          zIndex: 2,
        }}
      >
        {screens.map((screen) => {
          const pos = screen.flowPosition ?? { x: 0, y: 0 };
          return (
            <FlowCard
              key={screen.id}
              screen={screen}
              pos={pos}
              isDrawingFrom={drawing?.fromId === screen.id}
              isDrawingTarget={!!drawing && drawing.fromId !== screen.id}
              onMouseDown={(e) => startCardDrag(e, screen)}
              onPortMouseDown={(e) => startDrawing(e, screen.id)}
              onPortIn_MouseUp={(e) => {
                if (drawing && drawing.fromId !== screen.id) {
                  e.stopPropagation();
                  addConnection(drawing.fromId, screen.id, "");
                  setDrawing(null);
                }
              }}
              onDoubleClick={() => {
                setActiveScreenId(screen.id);
                setView("builder");
              }}
            />
          );
        })}
      </div>

      {/* Connection label popups */}
      {connections.map((conn) => {
        const from = screenMap.get(conn.fromScreenId);
        const to = screenMap.get(conn.toScreenId);
        if (!from || !to) return null;
        const mid = connMidpoint(from, to);
        const cx = mid.x * zoom + pan.x;
        const cy = mid.y * zoom + pan.y;
        const isEditing = editingConn === conn.id;

        return (
          <div
            key={conn.id}
            className="absolute z-10 pointer-events-auto"
            style={{ left: cx, top: cy, transform: "translate(-50%, -50%)" }}
            onMouseEnter={() => setHoveredConn(conn.id)}
            onMouseLeave={() => setHoveredConn(null)}
          >
            {isEditing ? (
              <div
                className="flex items-center gap-1 rounded-lg shadow-xl px-1 py-1"
                style={{
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border-active)",
                }}
              >
                <input
                  autoFocus
                  className="bg-transparent text-white text-[11px] outline-none w-28 px-1"
                  value={labelDraft}
                  onChange={(e) => setLabelDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateConnectionLabel(conn.id, labelDraft);
                      setEditingConn(null);
                    }
                    if (e.key === "Escape") setEditingConn(null);
                  }}
                  onBlur={() => {
                    updateConnectionLabel(conn.id, labelDraft);
                    setEditingConn(null);
                  }}
                  placeholder="label..."
                />
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    removeConnection(conn.id);
                    setEditingConn(null);
                  }}
                  className="text-red-400 hover:text-red-300 px-0.5"
                  title="Delete connection"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <path d="M1 1l8 8M9 1L1 9" />
                  </svg>
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  setEditingConn(conn.id);
                  setLabelDraft(conn.label ?? "");
                }}
                className={`cursor-pointer transition-all ${
                  hoveredConn === conn.id
                    ? "opacity-100"
                    : conn.label
                    ? "opacity-100"
                    : "opacity-0 hover:opacity-100"
                }`}
              >
                <span
                  className="text-[10px] rounded-md px-2 py-0.5 font-medium whitespace-nowrap shadow"
                  style={{
                    background: "var(--bg-panel)",
                    border: "1px solid var(--border-active)",
                    color: "var(--accent)",
                  }}
                >
                  {conn.label || "+ label"}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface FlowCardProps {
  screen: Screen;
  pos: { x: number; y: number };
  isDrawingFrom: boolean;
  isDrawingTarget: boolean;
  onMouseDown: (e: MouseEvent) => void;
  onPortMouseDown: (e: MouseEvent) => void;
  onPortIn_MouseUp: (e: MouseEvent) => void;
  onDoubleClick: () => void;
}

function FlowCard({
  screen,
  pos,
  isDrawingFrom,
  isDrawingTarget,
  onMouseDown,
  onPortMouseDown,
  onPortIn_MouseUp,
  onDoubleClick,
}: FlowCardProps) {
  const compColors: Record<string, string> = {
    heading: "#7c3aed",
    subheading: "#6d28d9",
    button: "#2563eb",
    input: "#0891b2",
    image: "#15803d",
    paragraph: "#374151",
    badge: "#b45309",
    divider: "#374151",
    spacer: "#1f2937",
    checkbox: "#0891b2",
    list: "#374151",
    progress: "#7c3aed",
  };

  return (
    <div
      data-card="1"
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width: CARD_W,
        height: CARD_H,
        cursor: "grab",
        userSelect: "none",
      }}
    >
      {/* Input port */}
      <div
        style={{
          position: "absolute",
          left: -PORT_R,
          top: CARD_H / 2 - PORT_R,
          width: PORT_R * 2,
          height: PORT_R * 2,
          borderRadius: "50%",
          background: isDrawingTarget ? "#60a5fa" : "var(--border)",
          border: `2px solid ${isDrawingTarget ? "#93c5fd" : "var(--border)"}`,
          zIndex: 10,
          cursor: "crosshair",
          transition: "background 0.15s, transform 0.15s",
          transform: isDrawingTarget ? "scale(1.5)" : "scale(1)",
        }}
        onMouseUp={onPortIn_MouseUp}
      />

      {/* Card body */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 12,
          background: isDrawingFrom ? "var(--bg-active)" : "var(--bg-panel-2)",
          border: `1.5px solid ${isDrawingFrom ? "#60a5fa" : "var(--border)"}`,
          boxShadow: isDrawingFrom
            ? "0 0 0 2px rgba(96,165,250,0.2)"
            : "0 4px 20px rgba(0,0,0,0.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "8px 12px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              color: "var(--text-primary)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            {screen.name}
          </span>
          <span style={{ color: "var(--text-faint)", fontSize: 10 }}>
            {screen.components.length} blocks
          </span>
        </div>

        {/* Component preview */}
        <div
          style={{
            flex: 1,
            padding: "8px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            overflow: "hidden",
          }}
        >
          {screen.components.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-faint)",
                fontSize: 11,
              }}
            >
              Empty screen
            </div>
          ) : (
            screen.components.slice(0, 5).map((comp, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 5 }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 2,
                    flexShrink: 0,
                    backgroundColor: compColors[comp.type] ?? "#374151",
                  }}
                />
                <div
                  style={{
                    height:
                      comp.type === "heading"
                        ? 7
                        : comp.type === "button"
                        ? 10
                        : 5,
                    flex: 1,
                    borderRadius: 2,
                    backgroundColor:
                      comp.type === "button"
                        ? (comp.props.bgColor ?? "#2563eb") + "60"
                        : "var(--bg-hover)",
                    maxWidth:
                      comp.type === "heading"
                        ? "80%"
                        : comp.type === "paragraph"
                        ? "100%"
                        : "60%",
                  }}
                />
              </div>
            ))
          )}
          {screen.components.length > 5 && (
            <div
              style={{
                color: "var(--text-faint)",
                fontSize: 9,
                paddingLeft: 11,
              }}
            >
              +{screen.components.length - 5} more
            </div>
          )}
        </div>

        {/* Double-click hint */}
        <div
          style={{
            padding: "4px 12px",
            borderTop: "1px solid var(--border)",
            textAlign: "center",
          }}
        >
          <span style={{ color: "var(--text-faint)", fontSize: 9 }}>
            double-click to edit
          </span>
        </div>
      </div>

      {/* Output port — right middle */}
      <div
        onMouseDown={onPortMouseDown}
        title="Drag to connect"
        style={{
          position: "absolute",
          right: -PORT_R,
          top: CARD_H / 2 - PORT_R,
          width: PORT_R * 2,
          height: PORT_R * 2,
          borderRadius: "50%",
          background: isDrawingFrom ? "#60a5fa" : "#7c3aed",
          border: "2px solid var(--border)",
          zIndex: 10,
          cursor: "crosshair",
        }}
      />
    </div>
  );
}
