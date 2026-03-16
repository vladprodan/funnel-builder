import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import type { ReactNode } from "react";
import type {
  Screen,
  CanvasComponent,
  ComponentType,
  ComponentProps,
  FlowConnection,
  ScreenTemplate,
  FunnelSchema,
  SchemaScreen,
  SchemaComponentNode,
} from "@/types";

interface FunnelState {
  screens: Screen[];
  connections: FlowConnection[];
}

type HistoryEntry = { screens: Screen[]; connections: FlowConnection[] };

interface BuilderContextValue {
  screens: Screen[];
  activeScreenId: string;
  selectedComponentId: string | null;
  selectedComponentIds: Set<string>;
  view: "builder" | "flow" | "json" | "preview";
  connections: FlowConnection[];
  canUndo: boolean;
  canRedo: boolean;
  setView: (v: "builder" | "flow" | "json" | "preview") => void;
  setActiveScreenId: (id: string) => void;
  setSelectedComponentId: (id: string | null) => void;
  toggleComponentSelection: (id: string, multi: boolean) => void;
  addScreen: () => void;
  addScreenFromTemplate: (template: ScreenTemplate) => void;
  deleteScreen: (id: string) => void;
  duplicateScreen: (id: string) => void;
  duplicateComponent: (id?: string) => void;
  renameScreen: (id: string, name: string) => void;
  reorderScreens: (fromIdx: number, toIdx: number) => void;
  addComponent: (type: ComponentType, atIndex?: number) => void;
  removeComponent: (componentId?: string) => void;
  updateComponentProps: (componentId: string, props: Partial<ComponentProps>) => void;
  moveComponent: (fromIndex: number, toIndex: number) => void;
  updateScreenFlowPosition: (id: string, x: number, y: number) => void;
  addConnection: (fromScreenId: string, toScreenId: string, label?: string) => void;
  removeConnection: (id: string) => void;
  updateConnectionLabel: (id: string, label: string) => void;
  updateConnectionCondition: (id: string, condition: string) => void;
  navigateScreen: (direction: "prev" | "next") => void;
  undo: () => void;
  redo: () => void;
  copyComponents: () => void;
  pasteComponents: () => void;
  exportState: () => FunnelState;
  importState: (state: FunnelState) => void;
  funnelId: string;
  funnelName: string;
  projectId?: string | null;
  updateScreenMeta: (id: string, meta: Partial<Pick<Screen, 'screenType' | 'allowBack' | 'funnelValueKey' | 'formType' | 'order' | 'total' | 'settings' | 'analytics'>>) => void;
  updateRoute: (id: string, patch: Partial<Pick<FlowConnection, 'onEvent' | 'conditions' | 'defaultTo' | 'validation' | 'analytics' | 'condition' | 'label'>>) => void;
  exportToFunnelSchema: (funnelId: string, funnelName: string, projectId?: string | null) => FunnelSchema;
  importFromFunnelSchema: (schema: FunnelSchema) => void;
  onBack: () => void;
  activeScreen: Screen | undefined;
  selectedComponent: CanvasComponent | undefined;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

const defaultComponents: CanvasComponent[] = [
  { id: "c1", type: "heading", order: 0, props: { text: "Welcome to Our Program", align: "center", color: "#ffffff", fontSize: 28, fontWeight: "bold" } },
  { id: "c2", type: "paragraph", order: 1, props: { text: "Take a quick quiz to get your personalized plan.", align: "center", color: "#9ca3af", fontSize: 15 } },
  { id: "c3", type: "button", order: 2, props: { text: "Start Now →", bgColor: "#7c3aed", color: "#ffffff", size: "lg" } },
];

const defaultScreens: Screen[] = [
  { id: "s1", name: "Welcome", components: defaultComponents, flowPosition: { x: 60, y: 120 } },
  {
    id: "s2", name: "Quiz Step 1",
    components: [
      { id: "c4", type: "heading", order: 0, props: { text: "How old are you?", align: "center", color: "#ffffff", fontSize: 22, fontWeight: "bold" } },
      { id: "c5", type: "button", order: 1, props: { text: "18–25", bgColor: "#1e1e2e", color: "#e5e7eb", size: "md" } },
    ],
    flowPosition: { x: 380, y: 60 },
  },
  {
    id: "s3", name: "Quiz Step 2",
    components: [
      { id: "c6", type: "progress", order: 0, props: { label: "Progress", value: 50 } },
      { id: "c7", type: "heading", order: 1, props: { text: "What is your goal?", align: "center", color: "#ffffff", fontSize: 22, fontWeight: "bold" } },
    ],
    flowPosition: { x: 380, y: 280 },
  },
  { id: "s4", name: "Results", components: [], flowPosition: { x: 700, y: 160 } },
];

const defaultPropsMap: Record<ComponentType, ComponentProps> = {
  heading:    { text: "Heading",    align: "left", color: "#ffffff", fontSize: 24, fontWeight: "bold" },
  subheading: { text: "Subheading", align: "left", color: "#e5e7eb", fontSize: 18, fontWeight: "600" },
  paragraph:  { text: "Your text here. Click to edit.", align: "left", color: "#9ca3af", fontSize: 14 },
  button:     { text: "Click Me", bgColor: "#7c3aed", color: "#ffffff", size: "md" },
  image:      { src: "", alt: "Image", height: 160 },
  input:      { placeholder: "Enter your email...", label: "Email" },
  checkbox:   { label: "I agree to the terms and conditions" },
  divider:    {},
  spacer:     { height: 24 },
  badge:      { text: "New", bgColor: "#7c3aed", color: "#ffffff" },
  list:       { items: ["Item one", "Item two", "Item three"], color: "#e5e7eb", fontSize: 14 },
  progress:   { value: 60, label: "Progress" },
  section:    { title: "Section", collapsed: false },
};

interface BuilderProviderProps {
  children: ReactNode;
  initialScreens: Screen[];
  initialConnections: FlowConnection[];
  funnelId: string;
  funnelName: string;
  projectId?: string | null;
  onSave: (screens: Screen[], connections: FlowConnection[]) => void;
  onBack: () => void;
}

export function BuilderProvider({ children, initialScreens, initialConnections, funnelId, funnelName, projectId, onSave, onBack }: BuilderProviderProps) {
  const [screens, setScreens] = useState<Screen[]>(initialScreens.length ? initialScreens : defaultScreens);
  const [activeScreenId, setActiveScreenId] = useState(initialScreens[0]?.id ?? "s1");
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [selectedComponentIds, setSelectedComponentIds] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"builder" | "flow" | "json" | "preview">("builder");
  const [connections, setConnections] = useState<FlowConnection[]>(initialConnections);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // ── Undo / Redo ──────────────────────────────────────────────────────────────
  const historyRef = useRef<HistoryEntry[]>([]);
  const futureRef  = useRef<HistoryEntry[]>([]);
  const clipboardRef = useRef<CanvasComponent[]>([]);

  // Ref-based actions always capture fresh state — no stale closure issues
  const snapshotRef = useRef<() => void>(() => {});
  snapshotRef.current = () => {
    historyRef.current = [...historyRef.current.slice(-49), { screens, connections }];
    futureRef.current  = [];
    setCanUndo(true);
    setCanRedo(false);
  };

  const undoActionRef = useRef<() => void>(() => {});
  undoActionRef.current = () => {
    const prev = historyRef.current[historyRef.current.length - 1];
    if (!prev) return;
    historyRef.current = historyRef.current.slice(0, -1);
    futureRef.current  = [{ screens, connections }, ...futureRef.current.slice(0, 49)];
    setScreens(prev.screens);
    setConnections(prev.connections);
    setActiveScreenId((id) => prev.screens.some((s) => s.id === id) ? id : (prev.screens[0]?.id ?? id));
    setSelectedComponentId(null);
    setSelectedComponentIds(new Set());
    setCanUndo(historyRef.current.length > 0);
    setCanRedo(true);
  };

  const redoActionRef = useRef<() => void>(() => {});
  redoActionRef.current = () => {
    const [next, ...rest] = futureRef.current;
    if (!next) return;
    futureRef.current = rest;
    historyRef.current = [...historyRef.current.slice(-49), { screens, connections }];
    setScreens(next.screens);
    setConnections(next.connections);
    setSelectedComponentId(null);
    setSelectedComponentIds(new Set());
    setCanUndo(true);
    setCanRedo(rest.length > 0);
  };

  const undo = useCallback(() => undoActionRef.current(), []);
  const redo = useCallback(() => redoActionRef.current(), []);

  // ── Auto-save ────────────────────────────────────────────────────────────────
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => { onSave(screens, connections); }, 800);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [screens, connections, onSave]);

  const activeScreen = screens.find((s) => s.id === activeScreenId);
  const selectedComponent = activeScreen?.components.find((c) => c.id === selectedComponentId);

  // ── Selection ────────────────────────────────────────────────────────────────
  const toggleComponentSelection = useCallback((id: string, multi: boolean) => {
    if (multi) {
      setSelectedComponentIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
      setSelectedComponentId(id);
    } else {
      setSelectedComponentIds(new Set([id]));
      setSelectedComponentId(id);
    }
  }, []);

  // ── Copy / Paste ─────────────────────────────────────────────────────────────
  const copyComponentsRef = useRef<() => void>(() => {});
  copyComponentsRef.current = () => {
    const ids = selectedComponentIds.size > 0 ? selectedComponentIds : selectedComponentId ? new Set([selectedComponentId]) : new Set<string>();
    const selected = activeScreen?.components.filter((c) => ids.has(c.id)) ?? [];
    if (selected.length > 0) clipboardRef.current = selected;
  };

  const pasteComponentsRef = useRef<() => void>(() => {});
  pasteComponentsRef.current = () => {
    const clipboard = clipboardRef.current;
    if (!clipboard.length) return;
    snapshotRef.current();
    const newComps = clipboard.map((c) => ({ ...c, id: crypto.randomUUID(), props: { ...c.props } }));
    setScreens((prev) => prev.map((s) => {
      if (s.id !== activeScreenId) return s;
      const comps = [...s.components, ...newComps];
      return { ...s, components: comps.map((c, i) => ({ ...c, order: i })) };
    }));
    setSelectedComponentIds(new Set(newComps.map((c) => c.id)));
    setSelectedComponentId(newComps[newComps.length - 1]?.id ?? null);
  };

  const copyComponents  = useCallback(() => copyComponentsRef.current(), []);
  const pasteComponents = useCallback(() => pasteComponentsRef.current(), []);

  // ── Screen mutations ──────────────────────────────────────────────────────────
  const addScreen = useCallback(() => {
    snapshotRef.current();
    const id = crypto.randomUUID();
    const maxX = Math.max(...screens.map((s) => s.flowPosition?.x ?? 0), 0);
    setScreens((prev) => [...prev, { id, name: `Screen ${prev.length + 1}`, components: [], flowPosition: { x: maxX + 320, y: 120 } }]);
    setActiveScreenId(id);
  }, [screens]);

  const deleteScreen = useCallback((id: string) => {
    snapshotRef.current();
    setScreens((prev) => {
      if (prev.length <= 1) return prev;
      const idx  = prev.findIndex((s) => s.id === id);
      const next = prev.filter((s) => s.id !== id);
      setActiveScreenId(next[Math.max(0, idx - 1)]?.id ?? next[0].id);
      return next;
    });
    setConnections((prev) => prev.filter((c) => c.fromScreenId !== id && c.toScreenId !== id));
  }, []);

  const duplicateScreen = useCallback((id: string) => {
    snapshotRef.current();
    setScreens((prev) => {
      const idx      = prev.findIndex((s) => s.id === id);
      const original = prev[idx];
      if (!original) return prev;
      const clone: Screen = {
        id: crypto.randomUUID(),
        name: `${original.name} (copy)`,
        components: original.components.map((c) => ({ ...c, id: crypto.randomUUID(), props: { ...c.props } })),
        flowPosition: original.flowPosition ? { x: original.flowPosition.x + 40, y: (original.flowPosition.y ?? 0) + 40 } : undefined,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      setActiveScreenId(clone.id);
      return next;
    });
  }, []);

  const duplicateComponent = useCallback((componentId?: string) => {
    const id = componentId ?? selectedComponentId;
    if (!id) return;
    snapshotRef.current();
    setScreens((prev) => prev.map((s) => {
      if (s.id !== activeScreenId) return s;
      const idx = s.components.findIndex((c) => c.id === id);
      if (idx === -1) return s;
      const original = s.components[idx];
      const clone: CanvasComponent = { ...original, id: crypto.randomUUID(), props: { ...original.props } };
      const comps = [...s.components];
      comps.splice(idx + 1, 0, clone);
      setSelectedComponentId(clone.id);
      setSelectedComponentIds(new Set([clone.id]));
      return { ...s, components: comps.map((c, i) => ({ ...c, order: i })) };
    }));
  }, [activeScreenId, selectedComponentId]);

  const renameScreen   = useCallback((id: string, name: string) => { setScreens((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s))); }, []);
  const reorderScreens = useCallback((fromIdx: number, toIdx: number) => {
    setScreens((prev) => { const next = [...prev]; const [moved] = next.splice(fromIdx, 1); next.splice(toIdx, 0, moved); return next; });
  }, []);

  // ── Component mutations ───────────────────────────────────────────────────────
  const addComponent = useCallback((type: ComponentType, atIndex?: number) => {
    snapshotRef.current();
    const newComp: CanvasComponent = { id: crypto.randomUUID(), type, order: 0, props: { ...defaultPropsMap[type] } };
    setScreens((prev) => prev.map((s) => {
      if (s.id !== activeScreenId) return s;
      const comps = [...s.components];
      comps.splice(atIndex !== undefined ? atIndex : comps.length, 0, newComp);
      return { ...s, components: comps.map((c, i) => ({ ...c, order: i })) };
    }));
    setSelectedComponentIds(new Set([newComp.id]));
    setSelectedComponentId(newComp.id);
  }, [activeScreenId]);

  const removeComponent = useCallback((componentId?: string) => {
    const idsToRemove = componentId
      ? new Set([componentId])
      : selectedComponentIds.size > 0
      ? selectedComponentIds
      : selectedComponentId ? new Set([selectedComponentId]) : new Set<string>();
    if (!idsToRemove.size) return;
    snapshotRef.current();
    setScreens((prev) => prev.map((s) => {
      if (s.id !== activeScreenId) return s;
      return { ...s, components: s.components.filter((c) => !idsToRemove.has(c.id)) };
    }));
    setSelectedComponentId(null);
    setSelectedComponentIds(new Set());
  }, [activeScreenId, selectedComponentId, selectedComponentIds]);

  const updateComponentProps = useCallback((componentId: string, props: Partial<ComponentProps>) => {
    setScreens((prev) => prev.map((s) => {
      if (s.id !== activeScreenId) return s;
      return { ...s, components: s.components.map((c) => c.id === componentId ? { ...c, props: { ...c.props, ...props } } : c) };
    }));
  }, [activeScreenId]);

  const moveComponent = useCallback((fromIndex: number, toIndex: number) => {
    snapshotRef.current();
    setScreens((prev) => prev.map((s) => {
      if (s.id !== activeScreenId) return s;
      const comps = [...s.components];
      const [moved] = comps.splice(fromIndex, 1);
      comps.splice(toIndex, 0, moved);
      return { ...s, components: comps.map((c, i) => ({ ...c, order: i })) };
    }));
  }, [activeScreenId]);

  const updateScreenFlowPosition = useCallback((id: string, x: number, y: number) => {
    setScreens((prev) => prev.map((s) => (s.id === id ? { ...s, flowPosition: { x, y } } : s)));
  }, []);

  const addConnection = useCallback((fromScreenId: string, toScreenId: string, label?: string) => {
    const exists = connections.some((c) => c.fromScreenId === fromScreenId && c.toScreenId === toScreenId);
    if (exists || fromScreenId === toScreenId) return;
    setConnections((prev) => [...prev, { id: crypto.randomUUID(), fromScreenId, toScreenId, label: label ?? "" }]);
  }, [connections]);

  const removeConnection      = useCallback((id: string) => { setConnections((prev) => prev.filter((c) => c.id !== id)); }, []);
  const updateConnectionLabel = useCallback((id: string, label: string) => { setConnections((prev) => prev.map((c) => (c.id === id ? { ...c, label } : c))); }, []);
  const updateConnectionCondition = useCallback((id: string, condition: string) => { setConnections((prev) => prev.map((c) => (c.id === id ? { ...c, condition } : c))); }, []);

  const addScreenFromTemplate = useCallback((template: ScreenTemplate) => {
    snapshotRef.current();
    const id   = crypto.randomUUID();
    const maxX = Math.max(...screens.map((s) => s.flowPosition?.x ?? 0), 0);
    const newScreen: Screen = {
      id, name: template.name,
      components: template.components.map((c) => ({ ...c, id: crypto.randomUUID() })),
      flowPosition: { x: maxX + 320, y: 120 },
    };
    setScreens((prev) => [...prev, newScreen]);
    setActiveScreenId(id);
    setSelectedComponentId(null);
    setSelectedComponentIds(new Set());
  }, [screens]);

  const navigateScreen = useCallback((direction: "prev" | "next") => {
    setScreens((prev) => {
      const idx  = prev.findIndex((s) => s.id === activeScreenId);
      const next = direction === "next" ? idx + 1 : idx - 1;
      if (next >= 0 && next < prev.length) {
        setActiveScreenId(prev[next].id);
        setSelectedComponentId(null);
        setSelectedComponentIds(new Set());
      }
      return prev;
    });
  }, [activeScreenId]);

  // ── Global keyboard shortcuts ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isEditing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey && !isEditing) {
        if (historyRef.current.length > 0) { e.preventDefault(); undoActionRef.current(); return; }
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey)) && !isEditing) {
        if (futureRef.current.length > 0) { e.preventDefault(); redoActionRef.current(); return; }
      }

      if (isEditing) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedComponentIds.size > 0 || selectedComponentId) { e.preventDefault(); removeComponent(); return; }
      }
      if (e.key === "Escape") { setSelectedComponentId(null); setSelectedComponentIds(new Set()); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === "c") { copyComponentsRef.current(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === "v") { e.preventDefault(); pasteComponentsRef.current(); return; }

      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === "ArrowDown") { e.preventDefault(); navigateScreen("next"); }
        if (e.key === "ArrowUp")   { e.preventDefault(); navigateScreen("prev"); }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "d") { e.preventDefault(); if (selectedComponentId) duplicateComponent(); else duplicateScreen(activeScreenId); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedComponentId, selectedComponentIds, activeScreenId, navigateScreen, duplicateScreen, duplicateComponent, removeComponent]);

  const exportState = useCallback((): FunnelState => ({ screens, connections }), [screens, connections]);

  const importState = useCallback((state: FunnelState) => {
    snapshotRef.current();
    setScreens(state.screens ?? []);
    setConnections(state.connections ?? []);
    setActiveScreenId(state.screens?.[0]?.id ?? "");
    setSelectedComponentId(null);
    setSelectedComponentIds(new Set());
  }, []);

  // ── Screen metadata ──────────────────────────────────────────────────────────
  const updateScreenMeta = useCallback((
    id: string,
    meta: Partial<Pick<Screen, 'screenType' | 'allowBack' | 'funnelValueKey' | 'formType' | 'order' | 'total' | 'settings' | 'analytics'>>
  ) => {
    setScreens((prev) => prev.map((s) => s.id === id ? { ...s, ...meta } : s));
  }, []);

  // ── Route / connection update ─────────────────────────────────────────────────
  const updateRoute = useCallback((
    id: string,
    patch: Partial<Pick<FlowConnection, 'onEvent' | 'conditions' | 'defaultTo' | 'validation' | 'analytics' | 'condition' | 'label'>>
  ) => {
    setConnections((prev) => prev.map((c) => c.id === id ? { ...c, ...patch } : c));
  }, []);

  // ── Funnel schema export ──────────────────────────────────────────────────────
  const exportToFunnelSchema = useCallback((
    funnelId: string,
    funnelName: string,
    projectId?: string | null
  ): FunnelSchema => {
    const now = new Date().toISOString();

    const compToNode = (comp: CanvasComponent): SchemaComponentNode => {
      const base = { id: comp.id, funnelValueKey: comp.funnelValueKey };
      switch (comp.type) {
        case 'heading':    return { ...base, type: 'typography', properties: { variant: 'h1', align: comp.props.align, html: comp.props.text ?? '' } };
        case 'subheading': return { ...base, type: 'typography', properties: { variant: 'h2', align: comp.props.align, html: comp.props.text ?? '' } };
        case 'paragraph':  return { ...base, type: 'typography', properties: { variant: 'body', align: comp.props.align, html: comp.props.text ?? '' } };
        case 'button':     return { ...base, type: 'button', properties: { text: comp.props.text, variant: comp.props.variant ?? 'primary' } };
        case 'image':      return { ...base, type: 'image', properties: { src: comp.props.src, alt: comp.props.alt } };
        case 'input':      return { ...base, type: 'input', properties: { placeholder: comp.props.placeholder, label: comp.props.label } };
        case 'checkbox':   return { ...base, type: 'checkbox', properties: { label: comp.props.label } };
        case 'divider':    return { ...base, type: 'divider', properties: {} };
        case 'spacer':     return { ...base, type: 'spacer', properties: { height: comp.props.height } };
        case 'badge':      return { ...base, type: 'badge', properties: { text: comp.props.text, variant: comp.props.variant } };
        case 'list':       return { ...base, type: 'list', properties: { items: comp.props.items } };
        case 'progress':   return { ...base, type: 'progress', properties: { value: comp.props.value, label: comp.props.label } };
        case 'section':    return { ...base, type: 'box', properties: { title: comp.props.title } };
        default:           return { ...base, type: comp.type, properties: {} };
      }
    };

    const schemaScreens: SchemaScreen[] = screens.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.screenType,
      funnelValueKey: s.funnelValueKey,
      formType: s.formType,
      allow_back: s.allowBack,
      order: s.order,
      total: s.total,
      settings: s.settings ?? { display: true },
      analytics: s.analytics,
      structure: {
        type: 'root',
        id: `${s.id}-root`,
        children: s.components.map(compToNode),
      },
    }));

    const entryPoint = screens[0]?.id ?? '';

    const routes = connections.map((c) => ({
      id: c.id,
      from: c.fromScreenId,
      on_event: c.onEvent ?? 'goto_next',
      to: c.toScreenId,
      ...(c.conditions?.length ? { conditions: c.conditions } : {}),
      ...(c.defaultTo ? { default_to: c.defaultTo } : {}),
      ...(c.validation ? { validation: c.validation } : {}),
      ...(c.analytics ? { analytics: c.analytics } : {}),
    }));

    return {
      id: funnelId,
      project_id: projectId ?? null,
      name: funnelName,
      navigation: { entry_point: entryPoint, routes },
      screens: schemaScreens,
      version: { number: 1, created_at: now, updated_at: now },
    };
  }, [screens, connections]);

  // ── Funnel schema import ──────────────────────────────────────────────────────
  const importFromFunnelSchema = useCallback((schema: FunnelSchema) => {
    snapshotRef.current();

    const nodeToComp = (node: SchemaComponentNode, order: number): CanvasComponent | null => {
      const base = { id: node.id || crypto.randomUUID(), order, funnelValueKey: node.funnelValueKey };
      const p = (node.properties ?? {}) as Record<string, unknown>;
      switch (node.type) {
        case 'typography': {
          const variant = String(p.variant ?? '');
          const isH1 = variant.startsWith('h1');
          const isH2 = variant.startsWith('h2') || variant.startsWith('h3');
          const type: ComponentType = isH1 ? 'heading' : isH2 ? 'subheading' : 'paragraph';
          return { ...base, type, props: { text: String(p.html ?? p.text ?? ''), align: (p.align as ComponentProps['align']) ?? 'left' } };
        }
        case 'button':   return { ...base, type: 'button',   props: { text: String(p.text ?? 'Button'), variant: String(p.variant ?? '') } };
        case 'image':    return { ...base, type: 'image',    props: { src: String(p.src ?? ''), alt: String(p.alt ?? '') } };
        case 'input':    return { ...base, type: 'input',    props: { placeholder: String(p.placeholder ?? ''), label: String(p.label ?? '') } };
        case 'checkbox': return { ...base, type: 'checkbox', props: { label: String(p.label ?? '') } };
        case 'divider':  return { ...base, type: 'divider',  props: {} };
        case 'spacer':   return { ...base, type: 'spacer',   props: { height: Number(p.height ?? 24) } };
        case 'badge':    return { ...base, type: 'badge',    props: { text: String(p.text ?? ''), variant: String(p.variant ?? '') } };
        case 'list':     return { ...base, type: 'list',     props: { items: Array.isArray(p.items) ? (p.items as string[]) : [] } };
        case 'progress': return { ...base, type: 'progress', props: { value: Number(p.value ?? 0), label: String(p.label ?? '') } };
        case 'box':      return { ...base, type: 'section',  props: { title: String(p.title ?? '') } };
        default:         return null;
      }
    };

    const flattenNodes = (nodes: SchemaComponentNode[]): CanvasComponent[] => {
      const result: CanvasComponent[] = [];
      for (const node of nodes) {
        if (node.type === 'root' || node.type === 'box') {
          // Recurse into containers
          if (node.children?.length) result.push(...flattenNodes(node.children));
        } else {
          const comp = nodeToComp(node, result.length);
          if (comp) result.push(comp);
          if (node.children?.length) result.push(...flattenNodes(node.children));
        }
      }
      return result.map((c, i) => ({ ...c, order: i }));
    };

    const importedScreens: Screen[] = schema.screens.map((s) => ({
      id: s.id,
      name: s.name,
      screenType: s.type,
      allowBack: s.allow_back,
      funnelValueKey: s.funnelValueKey,
      formType: s.formType as Screen['formType'],
      order: s.order,
      total: s.total,
      settings: s.settings,
      analytics: s.analytics,
      components: flattenNodes(s.structure?.children ?? []),
      flowPosition: undefined,
    }));

    // Auto-layout flow positions
    importedScreens.forEach((s, i) => {
      s.flowPosition = { x: 60 + i * 320, y: 120 };
    });

    const importedConnections: FlowConnection[] = schema.navigation.routes.map((r) => ({
      id: r.id,
      fromScreenId: r.from,
      toScreenId: r.to,
      onEvent: r.on_event,
      conditions: r.conditions,
      defaultTo: r.default_to,
      validation: r.validation,
      analytics: r.analytics,
    }));

    setScreens(importedScreens);
    setConnections(importedConnections);
    setActiveScreenId(importedScreens[0]?.id ?? '');
    setSelectedComponentId(null);
    setSelectedComponentIds(new Set());
  }, []);

  return (
    <BuilderContext.Provider value={{
      screens, activeScreenId, selectedComponentId, selectedComponentIds, view, connections,
      canUndo, canRedo, setView, setActiveScreenId, setSelectedComponentId, toggleComponentSelection,
      addScreen, addScreenFromTemplate, deleteScreen, duplicateScreen, duplicateComponent, renameScreen, reorderScreens,
      addComponent, removeComponent, updateComponentProps, moveComponent, updateScreenFlowPosition,
      addConnection, removeConnection, updateConnectionLabel, updateConnectionCondition, navigateScreen,
      undo, redo, copyComponents, pasteComponents, exportState, importState,
      funnelId, funnelName, projectId,
      updateScreenMeta, updateRoute, exportToFunnelSchema, importFromFunnelSchema,
      onBack, activeScreen, selectedComponent,
    }}>
      {children}
    </BuilderContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBuilder() {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error("useBuilder must be inside BuilderProvider");
  return ctx;
}
