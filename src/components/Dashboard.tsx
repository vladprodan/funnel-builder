import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import type { Project } from "@/types";
import { FunnelCard } from "./dashboard/FunnelCard";
import { SidebarItem, ProjectSidebarItem } from "./dashboard/SidebarItem";
import {
  NewFunnelModal,
  ProjectModal,
  ConfirmDeleteModal,
} from "./dashboard/Modals";

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
  const { signOut } = useAuth();

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

  const handleCreateFunnel = async (name: string, projectId: string | null) => {
    const f = await createFunnel(name, projectId);
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
              <rect x="7" y="1" width="4" height="4" rx="0.5" fill="white" opacity="0.6" />
              <rect x="1" y="7" width="4" height="4" rx="0.5" fill="white" opacity="0.6" />
              <rect x="7" y="7" width="4" height="4" rx="0.5" fill="white" opacity="0.3" />
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

        {/* Theme toggle + Sign out */}
        <div className="p-3 flex flex-col gap-1" style={{ borderTop: "1px solid var(--border)" }}>
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
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button
            onClick={() => void signOut()}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--bg-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign out
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
              className="btn-accent flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
                <path d="M5 0v11M0 5.5h11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
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
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
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
      {confirmDelete && (
        <ConfirmDeleteModal
          name={confirmDelete.name}
          type={confirmDelete.type}
          onConfirm={() => {
            if (confirmDelete.type === "funnel")
              deleteFunnel(confirmDelete.id);
            else deleteProject(confirmDelete.id);
            setConfirmDelete(null);
          }}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
