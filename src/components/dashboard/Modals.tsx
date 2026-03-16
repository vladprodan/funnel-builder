import { useState } from "react";
import type { Project } from "@/types";

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

export function NewFunnelModal({
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

export function ProjectModal({
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

export function ConfirmDeleteModal({
  name,
  type,
  onConfirm,
  onClose,
}: {
  name: string;
  type: "funnel" | "project";
  onConfirm: () => void;
  onClose: () => void;
}) {
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
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p
            className="font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Delete {type === "funnel" ? "Funnel" : "Project"}?
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
              "{name}"
            </span>
            {type === "project"
              ? " will be deleted. Funnels will be moved to No Project."
              : " will be permanently deleted."}
          </p>
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
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "#dc2626" }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
