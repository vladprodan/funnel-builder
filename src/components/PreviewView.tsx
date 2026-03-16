import { useState } from "react";
import { useBuilder } from "@/context/BuilderContext";
import { useApp } from "@/context/AppContext";
import { ComponentRenderer } from "@/components/ComponentRenderer";
import type { CanvasComponent } from "@/types";

export function PreviewView() {
  const { screens, connections, setView } = useBuilder();
  const { theme } = useApp();
  const [previewScreenIdx, setPreviewScreenIdx] = useState(0);

  const handleButtonClick = (buttonText: string) => {
    const screenId = screens[previewScreenIdx]?.id;
    if (!screenId) return;
    const outgoing = connections.filter((c) => c.fromScreenId === screenId);
    const matched = outgoing.find((c) => c.condition && c.condition === buttonText);
    const target = matched ?? (outgoing.length === 1 && !outgoing[0].condition ? outgoing[0] : null);
    if (!target) return;
    const idx = screens.findIndex((s) => s.id === target.toScreenId);
    if (idx !== -1) setPreviewScreenIdx(idx);
  };

  const screen = screens[previewScreenIdx];
  const isLight = theme === "light";
  const hasPrev = previewScreenIdx > 0;
  const hasNext = previewScreenIdx < screens.length - 1;

  return (
    <div
      className="flex-1 overflow-auto flex flex-col items-center justify-start relative"
      style={{
        background: "var(--bg-canvas)",
        backgroundImage: `radial-gradient(circle at 1px 1px, var(--dot-color) 1px, transparent 0)`,
        backgroundSize: "24px 24px",
      }}
    >
      {/* Top bar */}
      <div
        className="w-full flex items-center justify-between px-6 py-3 shrink-0 sticky top-0 z-10"
        style={{ background: "var(--bg-canvas)" }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-semibold px-2 py-1 rounded-lg"
            style={{ background: "var(--bg-panel)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
          >
            Preview
          </span>
          <span className="text-xs" style={{ color: "var(--text-faint)" }}>
            Screen {previewScreenIdx + 1} / {screens.length}
            {screen ? ` — ${screen.name}` : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Screen navigation */}
          <button
            onClick={() => setPreviewScreenIdx((i) => Math.max(0, i - 1))}
            disabled={!hasPrev}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors disabled:opacity-30"
            style={{ color: "var(--text-muted)", background: "var(--bg-panel)", border: "1px solid var(--border)" }}
            onMouseEnter={(e) => { if (hasPrev) e.currentTarget.style.background = "var(--bg-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-panel)"; }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M7 2L3 6l4 4" />
            </svg>
            Prev
          </button>
          <button
            onClick={() => setPreviewScreenIdx((i) => Math.min(screens.length - 1, i + 1))}
            disabled={!hasNext}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors disabled:opacity-30"
            style={{ color: "var(--text-muted)", background: "var(--bg-panel)", border: "1px solid var(--border)" }}
            onMouseEnter={(e) => { if (hasNext) e.currentTarget.style.background = "var(--bg-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-panel)"; }}
          >
            Next
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M5 2l4 4-4 4" />
            </svg>
          </button>

          <div className="w-px h-4" style={{ background: "var(--border)" }} />

          <button
            onClick={() => setView("builder")}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
            style={{ background: "var(--accent)", color: "white" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M7 1L3 5.5 7 10" />
            </svg>
            Exit Preview
          </button>
        </div>
      </div>

      {/* Screen dots */}
      {screens.length > 1 && (
        <div className="flex items-center gap-1.5 mb-4">
          {screens.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setPreviewScreenIdx(i)}
              title={s.name}
              style={{
                width: i === previewScreenIdx ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i === previewScreenIdx ? "var(--accent)" : "var(--bg-hover)",
                transition: "all 0.2s",
                border: "none",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      )}

      {/* Phone */}
      <div className="mb-8">
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
            <span style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 600 }}>9:41</span>
            <div className="flex gap-1.5 items-center">
              {[4, 3, 2].map((h) => (
                <div key={h} style={{ width: 3, height: h, background: "var(--text-muted)", borderRadius: 1 }} />
              ))}
              <div style={{ width: 14, height: 7, border: "1px solid var(--text-muted)", borderRadius: 2, padding: "1px", marginLeft: 2 }}>
                <div style={{ width: "80%", height: "100%", background: "var(--text-muted)", borderRadius: 1 }} />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 pb-8 flex flex-col gap-3 min-h-[580px]">
            {!screen || screen.components.length === 0 ? (
              <div
                className="flex-1 flex flex-col items-center justify-center gap-2 mt-16"
                style={{ color: "var(--text-faint)" }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                <p className="text-xs">Empty screen</p>
              </div>
            ) : (
              screen.components.map((comp: CanvasComponent) => (
                <div
                  key={comp.id}
                  className="py-1"
                  onClick={comp.type === "button" ? () => handleButtonClick(comp.props.text ?? "") : undefined}
                  style={comp.type === "button" ? { cursor: "pointer" } : undefined}
                >
                  <ComponentRenderer component={comp} isSelected={false} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
