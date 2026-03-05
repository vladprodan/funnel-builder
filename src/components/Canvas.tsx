import { useRef, useState, type DragEvent } from "react";
import { useBuilder } from "@/context/BuilderContext";
import { ComponentRenderer } from "@/components/ComponentRenderer";
import type { ComponentType, CanvasComponent } from "@/types";

export function Canvas() {
  const {
    activeScreen,
    selectedComponentId,
    setSelectedComponentId,
    addComponent,
    removeComponent,
    moveComponent,
    theme,
  } = useBuilder();
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const components = activeScreen?.components ?? [];

  const handleCanvasDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleCanvasDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const newType = e.dataTransfer.getData(
      "application/x-new-component"
    ) as ComponentType;
    const fromId = e.dataTransfer.getData("application/x-reorder-id");
    if (newType) {
      addComponent(newType, dragOverIndex ?? components.length);
    } else if (fromId) {
      const fromIdx = components.findIndex((c) => c.id === fromId);
      const toIdx = dragOverIndex ?? components.length;
      if (fromIdx !== toIdx && fromIdx !== toIdx - 1)
        moveComponent(fromIdx, toIdx > fromIdx ? toIdx - 1 : toIdx);
    }
    setDragOverIndex(null);
    setDraggingId(null);
  };

  const isLight = theme === "light";

  return (
    <div
      className="flex-1 overflow-auto flex items-start justify-center relative"
      style={{
        background: "var(--bg-canvas)",
        backgroundImage: `radial-gradient(circle at 1px 1px, var(--dot-color) 1px, transparent 0)`,
        backgroundSize: "24px 24px",
      }}
    >
      <div className="my-8 flex flex-col items-center">
        <div
          className="relative shadow-2xl overflow-hidden"
          style={{
            width: 390,
            minHeight: 680,
            borderRadius: 40,
            background: "var(--phone-bg)",
            border: "1px solid var(--phone-border)",
            boxShadow: `0 0 0 8px var(--phone-ring-1), 0 0 0 9px var(--phone-ring-2), 0 32px 64px ${
              isLight ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.6)"
            }`,
          }}
        >
          {/* Status bar */}
          <div className="h-12 flex items-center justify-between px-8 pt-2">
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              9:41
            </span>
            <div className="flex gap-1.5 items-center">
              {[4, 3, 2].map((h) => (
                <div
                  key={h}
                  style={{
                    width: 3,
                    height: h,
                    background: "var(--text-muted)",
                    borderRadius: 1,
                  }}
                />
              ))}
              <div
                style={{
                  width: 14,
                  height: 7,
                  border: "1px solid var(--text-muted)",
                  borderRadius: 2,
                  padding: "1px",
                  marginLeft: 2,
                }}
              >
                <div
                  style={{
                    width: "80%",
                    height: "100%",
                    background: "var(--text-muted)",
                    borderRadius: 1,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Drop zone */}
          <div
            ref={canvasRef}
            className="flex-1 min-h-[580px] px-5 pb-6 flex flex-col gap-3 relative"
            onDragOver={handleCanvasDragOver}
            onDrop={handleCanvasDrop}
            onClick={() => setSelectedComponentId(null)}
          >
            {components.length === 0 && (
              <div
                className="flex-1 flex flex-col items-center justify-center gap-3 mt-16 pointer-events-none"
                style={{ color: "var(--text-faint)" }}
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <p className="text-sm text-center leading-relaxed">
                  Drag components here
                  <br />
                  from the right panel
                </p>
              </div>
            )}

            {components.map((comp, idx) => (
              <CanvasItem
                key={comp.id}
                component={comp}
                index={idx}
                isSelected={comp.id === selectedComponentId}
                isDragging={comp.id === draggingId}
                showDropIndicator={dragOverIndex === idx}
                onSelect={(e) => {
                  e.stopPropagation();
                  setSelectedComponentId(comp.id);
                }}
                onDelete={() => removeComponent(comp.id)}
                onDragStart={() => setDraggingId(comp.id)}
                onDragEnd={() => {
                  setDraggingId(null);
                  setDragOverIndex(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIndex(idx);
                }}
              />
            ))}

            {dragOverIndex === components.length && <DropIndicator />}
          </div>
        </div>
      </div>
    </div>
  );
}

interface CanvasItemProps {
  component: CanvasComponent;
  index: number;
  isSelected: boolean;
  isDragging: boolean;
  showDropIndicator: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
}

function CanvasItem({
  component,
  isSelected,
  isDragging,
  showDropIndicator,
  onSelect,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
}: CanvasItemProps) {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("application/x-reorder-id", component.id);
    e.dataTransfer.effectAllowed = "move";
    onDragStart();
  };
  return (
    <>
      {showDropIndicator && <DropIndicator />}
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onClick={onSelect}
        className="group relative rounded-lg transition-all"
        style={{
          opacity: isDragging ? 0.35 : 1,
          outline: isSelected
            ? "2px solid var(--accent)"
            : "2px solid transparent",
          outlineOffset: 2,
          cursor: "grab",
        }}
      >
        <div className="px-0 py-1">
          <ComponentRenderer component={component} isSelected={isSelected} />
        </div>
        {isSelected && (
          <div className="absolute -top-2 right-0 flex gap-1">
            <div
              className="flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono text-white"
              style={{ background: "var(--accent)" }}
            >
              {component.type}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="w-5 h-5 rounded flex items-center justify-center text-white"
              style={{ background: "#ef4444" }}
            >
              <svg
                width="8"
                height="8"
                viewBox="0 0 8 8"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M1 1l6 6M7 1L1 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function DropIndicator() {
  return (
    <div className="relative flex items-center py-0.5 pointer-events-none">
      <div
        className="flex-1 h-0.5 rounded-full"
        style={{ background: "var(--accent)" }}
      />
      <div
        className="w-2 h-2 rounded-full -ml-1"
        style={{ background: "var(--accent)" }}
      />
    </div>
  );
}
