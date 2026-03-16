import { useState } from "react";
import type { FunnelMeta, Project } from "@/types";
import { MenuItem } from "./MenuItem";

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function FunnelThumbnail({ funnel }: { funnel: FunnelMeta }) {
  const screen = funnel.screens[0];
  if (!screen)
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ color: "var(--text-faint)" }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      </div>
    );
  return (
    <div className="w-full h-full flex flex-col gap-1 p-3 overflow-hidden">
      {screen.components.slice(0, 5).map((c, i) => (
        <div
          key={i}
          style={{
            height:
              c.type === "heading"
                ? 7
                : c.type === "button"
                ? 10
                : c.type === "image"
                ? 18
                : 5,
            borderRadius: c.type === "button" ? 5 : 2,
            background:
              c.type === "button"
                ? (c.props.bgColor ?? "#7c3aed") + "cc"
                : c.type === "badge"
                ? (c.props.bgColor ?? "#7c3aed") + "99"
                : "var(--bg-hover)",
            width:
              c.type === "heading"
                ? "80%"
                : c.type === "paragraph"
                ? "100%"
                : c.type === "button"
                ? "65%"
                : c.type === "badge"
                ? "45%"
                : "90%",
            alignSelf: c.props.align === "center" ? "center" : "flex-start",
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}

export function FunnelCard({
  funnel,
  project,
  onOpen,
  onRename,
  onMove,
  onDuplicate,
  onDelete,
  projects,
}: {
  funnel: FunnelMeta;
  project: Project | null;
  onOpen: () => void;
  onRename: (n: string) => void;
  onMove: (pid: string | null) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  projects: Project[];
}) {
  const [menu, setMenu] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(funnel.name);

  const commit = () => {
    onRename(draft.trim() || funnel.name);
    setRenaming(false);
  };

  return (
    <div
      className="group relative flex flex-col rounded-xl overflow-hidden cursor-pointer transition-all"
      style={{
        background: "var(--bg-panel)",
        border: "1px solid var(--border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)")
      }
      onClick={onOpen}
    >
      {/* Thumbnail area */}
      <div
        className="relative overflow-hidden"
        style={{ height: 120, background: "var(--bg-canvas)" }}
      >
        <FunnelThumbnail funnel={funnel} />
        <div
          className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
        >
          <svg
            width="9"
            height="9"
            viewBox="0 0 9 9"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
          >
            <rect x="0.5" y="0.5" width="8" height="8" rx="1" />
          </svg>
          {funnel.screens.length} screens
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-3">
        {renaming ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setRenaming(false);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-sm font-semibold rounded px-1.5 py-0.5 outline-none"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border-active)",
              color: "var(--text-primary)",
            }}
          />
        ) : (
          <p
            className="text-sm font-semibold truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {funnel.name}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {project ? (
            <span
              className="flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 font-medium"
              style={{ background: project.color + "18", color: project.color }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: project.color,
                  display: "inline-block",
                }}
              />
              {project.name}
            </span>
          ) : (
            <span
              className="text-[10px] rounded-full px-2 py-0.5"
              style={{
                background: "var(--bg-hover)",
                color: "var(--text-faint)",
              }}
            >
              No project
            </span>
          )}
          <span
            className="text-[10px] ml-auto"
            style={{ color: "var(--text-faint)" }}
          >
            {relativeDate(funnel.updatedAt)}
          </span>
        </div>
      </div>

      {/* Menu button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMenu((v) => !v);
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all w-6 h-6 rounded flex items-center justify-center"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border)",
          color: "var(--text-muted)",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
          <circle cx="5.5" cy="1.5" r="1" />
          <circle cx="5.5" cy="5.5" r="1" />
          <circle cx="5.5" cy="9.5" r="1" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {menu && (
        <div
          className="absolute top-9 right-2 z-50 rounded-xl shadow-2xl py-1.5 min-w-40"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem
            icon="✎"
            label="Rename"
            onClick={() => {
              setRenaming(true);
              setMenu(false);
            }}
          />
          <MenuItem
            icon="⊞"
            label="Duplicate"
            onClick={() => {
              onDuplicate();
              setMenu(false);
            }}
          />
          <div
            style={{
              height: 1,
              background: "var(--border)",
              margin: "4px 8px",
            }}
          />
          <p
            className="px-3 py-1 text-[10px] uppercase tracking-wider"
            style={{ color: "var(--text-faint)" }}
          >
            Move to project
          </p>
          <MenuItem
            icon="○"
            label="No project"
            onClick={() => {
              onMove(null);
              setMenu(false);
            }}
            dim={!funnel.projectId}
          />
          {projects.map((p) => (
            <MenuItem
              key={p.id}
              icon="●"
              iconColor={p.color}
              label={p.name}
              onClick={() => {
                onMove(p.id);
                setMenu(false);
              }}
              dim={funnel.projectId === p.id}
            />
          ))}
          <div
            style={{
              height: 1,
              background: "var(--border)",
              margin: "4px 8px",
            }}
          />
          <MenuItem
            icon="✕"
            label="Delete"
            onClick={() => {
              onDelete();
              setMenu(false);
            }}
            danger
          />
        </div>
      )}
      {menu && (
        <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
      )}
    </div>
  );
}
