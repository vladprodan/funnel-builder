import { type DragEvent, useState } from "react";
import type { ComponentDefinition, ComponentType } from "@/types";

const COMPONENT_DEFS: ComponentDefinition[] = [
  {
    type: "heading",
    label: "Heading",
    icon: "H1",
    group: "Typography",
    defaultProps: {},
  },
  {
    type: "subheading",
    label: "Subheading",
    icon: "H2",
    group: "Typography",
    defaultProps: {},
  },
  {
    type: "paragraph",
    label: "Paragraph",
    icon: "¶",
    group: "Typography",
    defaultProps: {},
  },
  {
    type: "badge",
    label: "Badge",
    icon: "◉",
    group: "Typography",
    defaultProps: {},
  },
  {
    type: "button",
    label: "Button",
    icon: "▶",
    group: "Interactive",
    defaultProps: {},
  },
  {
    type: "input",
    label: "Input",
    icon: "▭",
    group: "Interactive",
    defaultProps: {},
  },
  {
    type: "checkbox",
    label: "Checkbox",
    icon: "☑",
    group: "Interactive",
    defaultProps: {},
  },
  {
    type: "image",
    label: "Image",
    icon: "⬜",
    group: "Media",
    defaultProps: {},
  },
  {
    type: "list",
    label: "List",
    icon: "≡",
    group: "Content",
    defaultProps: {},
  },
  {
    type: "progress",
    label: "Progress",
    icon: "▬",
    group: "Content",
    defaultProps: {},
  },
  {
    type: "section",
    label: "Section",
    icon: "§",
    group: "Layout",
    defaultProps: {},
  },
  {
    type: "divider",
    label: "Divider",
    icon: "—",
    group: "Layout",
    defaultProps: {},
  },
  {
    type: "spacer",
    label: "Spacer",
    icon: "↕",
    group: "Layout",
    defaultProps: {},
  },
];

const GROUPS = ["Typography", "Interactive", "Media", "Content", "Layout"];

export function ComponentsPanel() {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(GROUPS));

  const toggleGroup = (group: string) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(group) ? next.delete(group) : next.add(group);
      return next;
    });

  const handleDragStart = (
    e: DragEvent<HTMLDivElement>,
    type: ComponentType
  ) => {
    e.dataTransfer.setData("application/x-new-component", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      className="flex flex-col overflow-y-auto"
      style={{ maxHeight: "55%", borderBottom: "1px solid var(--border)" }}
    >
      <div
        className="h-9 flex items-center px-3 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--text-faint)" }}
        >
          Components
        </span>
      </div>
      <div className="flex flex-col py-1 overflow-y-auto">
        {GROUPS.map((group) => {
          const defs = COMPONENT_DEFS.filter((d) => d.group === group);
          const isOpen = openGroups.has(group);
          return (
            <div key={group}>
              <button
                onClick={() => toggleGroup(group)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--bg-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 8 8"
                  fill="currentColor"
                  style={{
                    transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.15s",
                  }}
                >
                  <path d="M2 1l4 3-4 3V1z" />
                </svg>
                <span className="text-[11px] font-medium tracking-wide">
                  {group}
                </span>
              </button>
              {isOpen && (
                <div className="grid grid-cols-2 gap-1 px-2 pb-2">
                  {defs.map((def) => (
                    <div
                      key={def.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, def.type)}
                      className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg cursor-grab select-none transition-all"
                      style={{
                        border: "1px solid transparent",
                        color: "var(--text-muted)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--bg-hover)";
                        e.currentTarget.style.borderColor = "var(--border)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = "transparent";
                      }}
                      title={`Drag to add ${def.label}`}
                    >
                      <span
                        className="text-base"
                        style={{ fontFamily: "monospace", lineHeight: 1 }}
                      >
                        {def.icon}
                      </span>
                      <span className="text-[10px] text-center leading-tight">
                        {def.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
