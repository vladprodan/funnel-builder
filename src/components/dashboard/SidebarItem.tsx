import { useState } from "react";
import type { Project } from "@/types";

export function SidebarItem({
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

export function ProjectSidebarItem({
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
