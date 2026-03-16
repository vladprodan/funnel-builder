import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { BuilderProvider, useBuilder } from "@/context/BuilderContext";
import { ScreensPanel } from "@/components/ScreensPanel";
import { Canvas } from "@/components/Canvas";
import { ComponentsPanel } from "@/components/ComponentsPanel";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { FlowView } from "@/components/FlowView";
import { JsonEditor } from "@/components/JsonEditor";
import { PreviewView } from "@/components/PreviewView";
import { ShortcutsHint } from "@/components/ShortcutsHint";
import type { FunnelMeta } from "@/types";
import * as storage from "@/storage";

const VIEWS = [
  {
    id: "builder" as const,
    label: "Builder",
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="1" y="1" width="4" height="10" rx="1" />
        <rect x="7" y="1" width="4" height="6" rx="1" />
        <rect x="7" y="9" width="4" height="2" rx="0.5" />
      </svg>
    ),
  },
  {
    id: "flow" as const,
    label: "Flow",
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="0.5" y="2" width="4" height="5" rx="1" />
        <rect x="7.5" y="5" width="4" height="5" rx="1" />
        <path d="M4.5 4.5h1.5a1 1 0 0 1 1 1v1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "json" as const,
    label: "JSON",
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <path d="M3 2C2 2 1.5 2.5 1.5 3.5v1C1.5 5.5 1 6 .5 6c.5 0 1 .5 1 1.5v1C1.5 9.5 2 10 3 10" />
        <path d="M9 2c1 0 1.5.5 1.5 1.5v1c0 1 .5 1.5 1 1.5-.5 0-1 .5-1 1.5v1C10.5 9.5 10 10 9 10" />
      </svg>
    ),
  },
  {
    id: "preview" as const,
    label: "Preview",
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <path d="M1 6s2-4 5-4 5 4 5 4-2 4-5 4-5-4-5-4z" />
        <circle cx="6" cy="6" r="1.5" />
      </svg>
    ),
  },
];

function Topbar({ funnelName }: { funnelName: string }) {
  const { view, setView, onBack, undo, redo, canUndo, canRedo } = useBuilder();
  const { theme, toggleTheme } = useApp();
  const { signOut } = useAuth();
  return (
    <div
      className="h-11 flex items-center px-4 gap-3 shrink-0"
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-panel)",
      }}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="btn-ghost flex items-center gap-1.5 text-xs rounded px-2 py-1"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 13 13"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M8 2L3 6.5 8 11" />
        </svg>
        Dashboard
      </button>

      <div className="w-px h-4 mx-1" style={{ background: "var(--border)" }} />

      {/* Funnel name */}
      <span
        className="text-sm font-semibold truncate max-w-48"
        style={{ color: "var(--text-primary)" }}
      >
        {funnelName}
      </span>

      {/* Auto-save indicator */}
      <div className="flex items-center gap-1.5">
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#4ade80",
            boxShadow: "0 0 5px #4ade80",
          }}
        />
        <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>
          Auto-saved
        </span>
      </div>

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (⌘Z)"
          className="btn-ghost w-7 h-7 flex items-center justify-center rounded"
          style={{ opacity: canUndo ? 1 : 0.35 }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 5h6a3 3 0 0 1 0 6H5" />
            <path d="M2 5l2.5-2.5M2 5l2.5 2.5" />
          </svg>
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (⌘⇧Z)"
          className="btn-ghost w-7 h-7 flex items-center justify-center rounded"
          style={{ opacity: canRedo ? 1 : 0.35 }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5H5a3 3 0 0 0 0 6h3" />
            <path d="M11 5l-2.5-2.5M11 5l-2.5 2.5" />
          </svg>
        </button>
      </div>

      <div className="w-px h-4 mx-1" style={{ background: "var(--border)" }} />

      {/* View tabs */}
      <div
        className="flex items-center gap-0.5 rounded-lg p-0.5"
        style={{ background: "var(--bg-input)" }}
      >
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all"
            style={{
              background:
                view === v.id
                  ? theme === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "white"
                  : "transparent",
              color:
                view === v.id ? "var(--text-primary)" : "var(--text-muted)",
              boxShadow:
                view === v.id && theme === "light"
                  ? "0 1px 3px rgba(0,0,0,0.1)"
                  : "none",
            }}
          >
            {v.icon}
            {v.label}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <ShortcutsHint />
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn-ghost flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium"
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
          {theme === "dark" ? "Light" : "Dark"}
        </button>
        <div
          className="w-px h-4 mx-1"
          style={{ background: "var(--border)" }}
        />
        <button
          onClick={() => void signOut()}
          className="btn-ghost flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
        </button>
        <button className="btn-accent text-xs px-3 py-1.5 rounded font-medium">
          Publish
        </button>
      </div>
    </div>
  );
}

function BuilderLayout({ funnelName }: { funnelName: string }) {
  const { view } = useBuilder();
  const { theme } = useApp();
  const isBuilder = view === "builder";
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
      {isBuilder && <ScreensPanel />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar funnelName={funnelName} />
        {view === "builder" && <Canvas />}
        {view === "flow" && <FlowView />}
        {view === "json" && <JsonEditor />}
        {view === "preview" && <PreviewView />}
      </div>
      {isBuilder && (
        <div
          className="flex flex-col w-64"
          style={{
            borderLeft: "1px solid var(--border)",
            background: "var(--bg-panel)",
          }}
        >
          <ComponentsPanel />
          <PropertiesPanel />
        </div>
      )}
    </div>
  );
}

interface Props {
  funnel: FunnelMeta;
}

export function BuilderView({ funnel }: Props) {
  const { goToDashboard } = useApp();

  const handleSave = (
    screens: Parameters<typeof storage.updateFunnel>[1],
    connections: Parameters<typeof storage.updateFunnel>[2]
  ) => {
    void storage.updateFunnel(funnel.id, screens, connections);
  };

  return (
    <BuilderProvider
      initialScreens={funnel.screens}
      initialConnections={funnel.connections}
      funnelId={funnel.id}
      funnelName={funnel.name}
      projectId={funnel.projectId}
      onSave={handleSave}
      onBack={goToDashboard}
    >
      <BuilderLayout funnelName={funnel.name} />
    </BuilderProvider>
  );
}
