import { useState, useRef } from "react";
import { useApp } from "@/context/AppContext";
import type { FunnelMeta, Project } from "@/types";

// ── helpers ───────────────────────────────────────────────────────────────────
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

const PROJECT_COLORS = [
  "#7c3aed",
  "#2563eb",
  "#0891b2",
  "#059669",
  "#d97706",
  "#dc2626",
  "#db2777",
  "#7c3aed",
];

// ── Mini screen thumbnail ─────────────────────────────────────────────────────
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

// ── Funnel card ───────────────────────────────────────────────────────────────
function FunnelCard({
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
  const [moving, setMoving] = useState(false);

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
        {/* Screen count badge */}
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
        {/* Name */}
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

        {/* Meta row */}
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

function MenuItem({
  icon,
  label,
  onClick,
  danger,
  dim,
  iconColor,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
  dim?: boolean;
  iconColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs transition-colors text-left"
      style={{
        color: danger
          ? "#f87171"
          : dim
          ? "var(--text-faint)"
          : "var(--text-secondary)",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--bg-hover)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span style={{ color: iconColor ?? "inherit", fontSize: 10 }}>
        {icon}
      </span>
      {label}
    </button>
  );
}

// ── New funnel modal ──────────────────────────────────────────────────────────
function NewFunnelModal({
  defaultProjectId,
  projects,
  onCreate,
  onClose,
}: {
  defaultProjectId: string | null;
  projects: Project[];
  onCreate: (name: string, pid: string | null) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("Untitled Funnel");
  const [projectId, setProjectId] = useState<string | null>(defaultProjectId);

  const submit = () => {
    if (name.trim()) {
      onCreate(name.trim(), projectId);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="flex flex-col gap-4 p-6 rounded-2xl w-96"
        style={{
          background: "var(--modal-bg)",
          border: "1px solid var(--border)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p
            className="font-semibold text-base"
            style={{ color: "var(--text-primary)" }}
          >
            New Funnel
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Create a new funnel and start building
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            className="text-[11px] uppercase tracking-wider font-medium"
            style={{ color: "var(--text-faint)" }}
          >
            Name
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="rounded-lg px-3 py-2 text-sm outline-none transition-colors"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--border-active)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "var(--border)")
            }
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            className="text-[11px] uppercase tracking-wider font-medium"
            style={{ color: "var(--text-faint)" }}
          >
            Project
          </label>
          <select
            value={projectId ?? ""}
            onChange={(e) => setProjectId(e.target.value || null)}
            className="rounded-lg px-3 py-2 text-sm outline-none transition-colors"
            style={{
              appearance: "none",
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm transition-colors"
            style={{
              background: "var(--bg-input)",
              color: "var(--text-muted)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--bg-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--bg-input)")
            }
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!name.trim()}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-30"
            style={{ background: "var(--accent)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--accent-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--accent)")
            }
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// ── New / edit project modal ──────────────────────────────────────────────────
function ProjectModal({
  existing,
  onSave,
  onClose,
}: {
  existing?: Project;
  onSave: (name: string, color: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(existing?.name ?? "");
  const [color, setColor] = useState(existing?.color ?? PROJECT_COLORS[0]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="flex flex-col gap-4 p-6 rounded-2xl w-80"
        style={{
          background: "var(--modal-bg)",
          border: "1px solid var(--border)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p
          className="font-semibold text-base"
          style={{ color: "var(--text-primary)" }}
        >
          {existing ? "Edit Project" : "New Project"}
        </p>
        <div className="flex flex-col gap-1.5">
          <label
            className="text-[11px] uppercase tracking-wider"
            style={{ color: "var(--text-faint)" }}
          >
            Name
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && name.trim() && onSave(name.trim(), color)
            }
            className="rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--border-active)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "var(--border)")
            }
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            className="text-[11px] uppercase tracking-wider"
            style={{ color: "var(--text-faint)" }}
          >
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: c,
                  outline: color === c ? `2px solid var(--accent)` : "none",
                  outlineOffset: 2,
                  transition: "transform 0.1s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.15)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm"
            style={{
              background: "var(--bg-input)",
              color: "var(--text-muted)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => name.trim() && onSave(name.trim(), color)}
            disabled={!name.trim()}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-30"
            style={{ background: "var(--accent)" }}
          >
            {existing ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export function Dashboard() {
  const {
    projects,
    funnels,
    theme,
    toggleTheme,
    openFunnel,
    createProject,
    updateProject,
    deleteProject,
    createFunnel,
    renameFunnel,
    moveFunnel,
    duplicateFunnel,
    deleteFunnel,
  } = useApp();

  const [selectedProjectId, setSelectedProjectId] = useState<
    string | "all" | null
  >("all");
  const [search, setSearch] = useState("");
  const [showNewFunnel, setShowNewFunnel] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    type: "funnel" | "project";
    id: string;
    name: string;
  } | null>(null);

  const filteredFunnels = funnels.filter((f) => {
    const matchProject =
      selectedProjectId === "all" || f.projectId === selectedProjectId;
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    return matchProject && matchSearch;
  });

  const handleCreateFunnel = (name: string, projectId: string | null) => {
    const f = createFunnel(name, projectId);
    openFunnel(f.id);
  };

  const getProject = (id: string | null) =>
    projects.find((p) => p.id === id) ?? null;

  return (
    <div
      data-theme={theme}
      className="flex h-screen w-screen overflow-hidden"
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        background: "var(--bg-app)",
        color: "var(--text-primary)",
      }}
    >
      {/* ── Sidebar ── */}
      <div
        className="w-56 flex flex-col shrink-0"
        style={{
          background: "var(--bg-panel)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Logo */}
        <div
          className="h-14 flex items-center gap-2.5 px-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: "var(--accent)" }}
          >
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="1" width="4" height="4" rx="0.5" fill="white" />
              <rect
                x="7"
                y="1"
                width="4"
                height="4"
                rx="0.5"
                fill="white"
                opacity="0.6"
              />
              <rect
                x="1"
                y="7"
                width="4"
                height="4"
                rx="0.5"
                fill="white"
                opacity="0.6"
              />
              <rect
                x="7"
                y="7"
                width="4"
                height="4"
                rx="0.5"
                fill="white"
                opacity="0.3"
              />
            </svg>
          </div>
          <span
            className="font-bold text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            FunnelBuilder
          </span>
        </div>

        {/* Nav */}
        <div className="flex flex-col gap-0.5 px-2 pt-3">
          <SidebarItem
            label="All Funnels"
            count={funnels.length}
            icon="⊞"
            active={selectedProjectId === "all"}
            onClick={() => setSelectedProjectId("all")}
          />
          <SidebarItem
            label="No Project"
            count={funnels.filter((f) => !f.projectId).length}
            icon="○"
            active={selectedProjectId === null}
            onClick={() => setSelectedProjectId(null)}
          />
        </div>

        {/* Projects */}
        <div className="flex items-center justify-between px-3 pt-4 pb-1">
          <span
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-faint)" }}
          >
            Projects
          </span>
          <button
            onClick={() => setShowNewProject(true)}
            className="w-4 h-4 flex items-center justify-center rounded transition-colors"
            style={{ color: "var(--text-faint)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-faint)")
            }
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor">
              <path
                d="M4 0v9M0 4.5h9"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-0.5 px-2 flex-1 overflow-y-auto">
          {projects.length === 0 ? (
            <p
              className="text-[11px] px-2 py-1"
              style={{ color: "var(--text-faint)" }}
            >
              No projects yet
            </p>
          ) : (
            projects.map((p) => (
              <ProjectSidebarItem
                key={p.id}
                project={p}
                count={funnels.filter((f) => f.projectId === p.id).length}
                active={selectedProjectId === p.id}
                onClick={() => setSelectedProjectId(p.id)}
                onEdit={() => setEditingProject(p)}
                onDelete={() =>
                  setConfirmDelete({ type: "project", id: p.id, name: p.name })
                }
              />
            ))
          )}
        </div>

        {/* Theme toggle */}
        <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--bg-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            {theme === "dark" ? (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div
          className="h-14 flex items-center justify-between px-6 shrink-0"
          style={{
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-panel)",
          }}
        >
          <div className="flex items-center gap-3">
            <h1
              className="font-semibold text-base"
              style={{ color: "var(--text-primary)" }}
            >
              {selectedProjectId === "all"
                ? "All Funnels"
                : selectedProjectId === null
                ? "No Project"
                : projects.find((p) => p.id === selectedProjectId)?.name ??
                  "Project"}
            </h1>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "var(--bg-hover)",
                color: "var(--text-muted)",
              }}
            >
              {filteredFunnels.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex items-center">
              <svg
                className="absolute left-2.5"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="var(--text-faint)"
                strokeWidth="1.5"
              >
                <circle cx="5" cy="5" r="4" />
                <path d="M9 9l2 2" strokeLinecap="round" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search funnels…"
                className="pl-7 pr-3 py-1.5 rounded-lg text-xs outline-none transition-colors"
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  width: 180,
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border-active)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border)")
                }
              />
            </div>
            <button
              onClick={() => setShowNewFunnel(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
              style={{ background: "var(--accent)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--accent-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--accent)")
              }
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 11 11"
                fill="currentColor"
              >
                <path
                  d="M5 0v11M0 5.5h11"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              New Funnel
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredFunnels.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-full gap-4"
              style={{ color: "var(--text-faint)" }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
              <div className="text-center">
                <p
                  className="font-medium text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  No funnels here yet
                </p>
                <p className="text-xs mt-1">
                  Create your first funnel to get started
                </p>
              </div>
              <button
                onClick={() => setShowNewFunnel(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: "var(--accent)" }}
              >
                + New Funnel
              </button>
            </div>
          ) : (
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              }}
            >
              {filteredFunnels.map((f) => (
                <FunnelCard
                  key={f.id}
                  funnel={f}
                  project={getProject(f.projectId)}
                  projects={projects}
                  onOpen={() => openFunnel(f.id)}
                  onRename={(name) => renameFunnel(f.id, name)}
                  onMove={(pid) => moveFunnel(f.id, pid)}
                  onDuplicate={() => duplicateFunnel(f.id)}
                  onDelete={() =>
                    setConfirmDelete({ type: "funnel", id: f.id, name: f.name })
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {showNewFunnel && (
        <NewFunnelModal
          defaultProjectId={
            typeof selectedProjectId === "string" && selectedProjectId !== "all"
              ? selectedProjectId
              : null
          }
          projects={projects}
          onCreate={handleCreateFunnel}
          onClose={() => setShowNewFunnel(false)}
        />
      )}
      {showNewProject && (
        <ProjectModal
          onSave={(n, c) => {
            createProject(n, c);
            setShowNewProject(false);
          }}
          onClose={() => setShowNewProject(false)}
        />
      )}
      {editingProject && (
        <ProjectModal
          existing={editingProject}
          onSave={(n, c) => {
            updateProject(editingProject.id, { name: n, color: c });
            setEditingProject(null);
          }}
          onClose={() => setEditingProject(null)}
        />
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="flex flex-col gap-4 p-6 rounded-2xl w-80"
            style={{
              background: "var(--modal-bg)",
              border: "1px solid var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <p
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Delete {confirmDelete.type === "funnel" ? "Funnel" : "Project"}?
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  "{confirmDelete.name}"
                </span>
                {confirmDelete.type === "project"
                  ? " will be deleted. Funnels will be moved to No Project."
                  : " will be permanently deleted."}
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{
                  background: "var(--bg-input)",
                  color: "var(--text-muted)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmDelete.type === "funnel")
                    deleteFunnel(confirmDelete.id);
                  else deleteProject(confirmDelete.id);
                  setConfirmDelete(null);
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: "#dc2626" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Small sidebar items ───────────────────────────────────────────────────────
function SidebarItem({
  label,
  count,
  icon,
  active,
  onClick,
}: {
  label: string;
  count: number;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors text-left"
      style={{
        background: active ? "var(--bg-active)" : "transparent",
        color: active ? "var(--text-primary)" : "var(--text-muted)",
        outline: active ? "1px solid var(--border-active)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "var(--bg-hover)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <span style={{ fontSize: 10, opacity: 0.7 }}>{icon}</span>
      <span className="flex-1 truncate font-medium">{label}</span>
      <span
        className="text-[10px] px-1.5 py-0.5 rounded-full"
        style={{ background: "var(--bg-hover)", color: "var(--text-faint)" }}
      >
        {count}
      </span>
    </button>
  );
}

function ProjectSidebarItem({
  project,
  count,
  active,
  onClick,
  onEdit,
  onDelete,
}: {
  project: Project;
  count: number;
  active: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors text-left"
        style={{
          background: active
            ? "var(--bg-active)"
            : hover
            ? "var(--bg-hover)"
            : "transparent",
          color: active ? "var(--text-primary)" : "var(--text-muted)",
          outline: active ? "1px solid var(--border-active)" : "none",
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: project.color,
            flexShrink: 0,
            display: "inline-block",
          }}
        />
        <span className="flex-1 truncate font-medium">{project.name}</span>
        {!hover && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{
              background: "var(--bg-hover)",
              color: "var(--text-faint)",
            }}
          >
            {count}
          </span>
        )}
        {hover && (
          <div
            className="flex items-center gap-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              onClick={onEdit}
              className="p-0.5 rounded transition-colors cursor-pointer text-[10px]"
              style={{ color: "var(--text-faint)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-faint)")
              }
            >
              ✎
            </span>
            <span
              onClick={onDelete}
              className="p-0.5 rounded transition-colors cursor-pointer text-[10px]"
              style={{ color: "var(--text-faint)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-faint)")
              }
            >
              ✕
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
