import { useState, useRef, type DragEvent } from "react";
import { useBuilder } from "@/context/BuilderContext";
import type { Screen } from "@/types";
import { TemplateModal } from "@/components/TemplateModal";

export function ScreensPanel() {
  const {
    screens,
    activeScreenId,
    setActiveScreenId,
    deleteScreen,
    duplicateScreen,
    renameScreen,
    reorderScreens,
  } = useBuilder();
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const handleDragStart = (e: DragEvent, idx: number) => {
    e.dataTransfer.setData("screen-idx", String(idx));
    setDraggingIdx(idx);
  };
  const handleDragOver = (e: DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };
  const handleDrop = (e: DragEvent, toIdx: number) => {
    e.preventDefault();
    const fromIdx = Number(e.dataTransfer.getData("screen-idx"));
    if (fromIdx !== toIdx) reorderScreens(fromIdx, toIdx);
    setDragOverIdx(null);
    setDraggingIdx(null);
  };
  const handleDragEnd = () => {
    setDragOverIdx(null);
    setDraggingIdx(null);
  };

  return (
    <>
      {showTemplates && (
        <TemplateModal onClose={() => setShowTemplates(false)} />
      )}
      <div
        className="w-52 flex flex-col shrink-0"
        style={{
          borderRight: "1px solid var(--border)",
          background: "var(--bg-panel)",
        }}
      >
        <div
          className="h-11 flex items-center justify-between px-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-faint)" }}
          >
            Screens
          </span>
          <button
            onClick={() => setShowTemplates(true)}
            className="w-5 h-5 rounded flex items-center justify-center transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--bg-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            title="Add screen"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path
                d="M4.5 0v10M0 5h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2 flex flex-col px-2 gap-0.5">
          {screens.map((screen, idx) => (
            <div
              key={screen.id}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              style={{
                opacity: draggingIdx === idx ? 0.4 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {dragOverIdx === idx && draggingIdx !== idx && (
                <div
                  className="h-0.5 rounded-full mx-1 mb-1"
                  style={{ background: "var(--accent)" }}
                />
              )}
              <ScreenItem
                screen={screen}
                index={idx}
                isActive={screen.id === activeScreenId}
                onSelect={() => setActiveScreenId(screen.id)}
                onDelete={() => deleteScreen(screen.id)}
                onDuplicate={() => duplicateScreen(screen.id)}
                onRename={(name) => renameScreen(screen.id, name)}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

interface ScreenItemProps {
  screen: Screen;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRename: (n: string) => void;
}

function ScreenItem({
  screen,
  index,
  isActive,
  onSelect,
  onDelete,
  onDuplicate,
  onRename,
}: ScreenItemProps) {
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState(screen.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(screen.name);
    setEditing(true);
    setMenuOpen(false);
    setTimeout(() => inputRef.current?.select(), 10);
  };
  const commitEdit = () => {
    onRename(draft.trim() || screen.name);
    setEditing(false);
  };

  return (
    <div
      className="group relative flex flex-col rounded-md cursor-pointer transition-all"
      style={{
        background: isActive ? "var(--bg-active)" : "transparent",
        outline: isActive
          ? "1px solid var(--border-active)"
          : "1px solid transparent",
      }}
      onClick={onSelect}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = "var(--bg-hover)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = "transparent";
      }}
    >
      {/* Thumbnail */}
      <div
        className="mx-2 mt-2 rounded h-20 flex items-center justify-center"
        style={{
          border: `1px solid ${
            isActive ? "var(--border-active)" : "var(--border)"
          }`,
          background: "var(--bg-panel-2)",
        }}
      >
        <div className="flex flex-col gap-1 items-center opacity-40 scale-75">
          {screen.components.slice(0, 3).map((c, i) => (
            <div
              key={i}
              className="rounded"
              style={{
                background:
                  c.type === "button" ? "var(--accent)" : "var(--text-muted)",
                width: c.type === "heading" ? 64 : 48,
                height: c.type === "heading" ? 8 : c.type === "button" ? 12 : 6,
                opacity: c.type === "button" ? 0.6 : 0.4,
              }}
            />
          ))}
          {screen.components.length === 0 && (
            <span className="text-[8px]" style={{ color: "var(--text-faint)" }}>
              Empty
            </span>
          )}
        </div>
      </div>

      {/* Name row */}
      <div className="flex items-center gap-1 px-2 py-1.5">
        <span
          className="text-[10px] w-4 shrink-0"
          style={{ color: "var(--text-faint)" }}
        >
          {index + 1}
        </span>
        {editing ? (
          <input
            ref={inputRef}
            className="flex-1 text-xs rounded px-1 py-0.5 outline-none"
            style={{
              background: "var(--bg-input)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-active)",
            }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit();
              if (e.key === "Escape") setEditing(false);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className="flex-1 text-xs truncate"
            style={{ color: "var(--text-secondary)" }}
          >
            {screen.name}
          </span>
        )}
        <button
          className="opacity-0 group-hover:opacity-100 transition-all"
          style={{ color: "var(--text-faint)" }}
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="6" cy="2" r="1" />
            <circle cx="6" cy="6" r="1" />
            <circle cx="6" cy="10" r="1" />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div
          className="absolute right-1 top-10 z-50 rounded-lg shadow-xl py-1 w-32"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {[
            { label: "Rename", action: startEdit },
            {
              label: "Duplicate",
              action: () => {
                onDuplicate();
                setMenuOpen(false);
              },
            },
            {
              label: "Delete",
              action: () => {
                onDelete();
                setMenuOpen(false);
              },
              danger: true,
            },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full text-left px-3 py-1.5 text-xs transition-colors"
              style={{
                color: item.danger ? "#f87171" : "var(--text-secondary)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
