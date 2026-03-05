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
} from "@/types";

interface FunnelState {
  screens: Screen[];
  connections: FlowConnection[];
}

interface BuilderContextValue {
  screens: Screen[];
  activeScreenId: string;
  selectedComponentId: string | null;
  view: "builder" | "flow" | "json";
  theme: "dark" | "light";
  connections: FlowConnection[];
  setView: (v: "builder" | "flow" | "json") => void;
  setTheme: (t: "dark" | "light") => void;
  toggleTheme: () => void;
  setActiveScreenId: (id: string) => void;
  setSelectedComponentId: (id: string | null) => void;
  addScreen: () => void;
  addScreenFromTemplate: (template: ScreenTemplate) => void;
  deleteScreen: (id: string) => void;
  duplicateScreen: (id: string) => void;
  renameScreen: (id: string, name: string) => void;
  reorderScreens: (fromIdx: number, toIdx: number) => void;
  addComponent: (type: ComponentType, atIndex?: number) => void;
  removeComponent: (componentId: string) => void;
  updateComponentProps: (
    componentId: string,
    props: Partial<ComponentProps>
  ) => void;
  moveComponent: (fromIndex: number, toIndex: number) => void;
  updateScreenFlowPosition: (id: string, x: number, y: number) => void;
  addConnection: (
    fromScreenId: string,
    toScreenId: string,
    label?: string
  ) => void;
  removeConnection: (id: string) => void;
  updateConnectionLabel: (id: string, label: string) => void;
  navigateScreen: (direction: "prev" | "next") => void;
  exportState: () => FunnelState;
  importState: (state: FunnelState) => void;
  onBack: () => void;
  activeScreen: Screen | undefined;
  selectedComponent: CanvasComponent | undefined;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

const defaultComponents: CanvasComponent[] = [
  {
    id: "c1",
    type: "heading",
    order: 0,
    props: {
      text: "Welcome to Our Program",
      align: "center",
      color: "#ffffff",
      fontSize: 28,
      fontWeight: "bold",
    },
  },
  {
    id: "c2",
    type: "paragraph",
    order: 1,
    props: {
      text: "Take a quick quiz to get your personalized plan.",
      align: "center",
      color: "#9ca3af",
      fontSize: 15,
    },
  },
  {
    id: "c3",
    type: "button",
    order: 2,
    props: {
      text: "Start Now →",
      bgColor: "#7c3aed",
      color: "#ffffff",
      size: "lg",
    },
  },
];

const defaultScreens: Screen[] = [
  {
    id: "s1",
    name: "Welcome",
    components: defaultComponents,
    flowPosition: { x: 60, y: 120 },
  },
  {
    id: "s2",
    name: "Quiz Step 1",
    components: [
      {
        id: "c4",
        type: "heading",
        order: 0,
        props: {
          text: "How old are you?",
          align: "center",
          color: "#ffffff",
          fontSize: 22,
          fontWeight: "bold",
        },
      },
      {
        id: "c5",
        type: "button",
        order: 1,
        props: {
          text: "18–25",
          bgColor: "#1e1e2e",
          color: "#e5e7eb",
          size: "md",
        },
      },
    ],
    flowPosition: { x: 380, y: 60 },
  },
  {
    id: "s3",
    name: "Quiz Step 2",
    components: [
      {
        id: "c6",
        type: "progress",
        order: 0,
        props: { label: "Progress", value: 50 },
      },
      {
        id: "c7",
        type: "heading",
        order: 1,
        props: {
          text: "What is your goal?",
          align: "center",
          color: "#ffffff",
          fontSize: 22,
          fontWeight: "bold",
        },
      },
    ],
    flowPosition: { x: 380, y: 280 },
  },
  {
    id: "s4",
    name: "Results",
    components: [],
    flowPosition: { x: 700, y: 160 },
  },
];

const defaultConnections: FlowConnection[] = [
  { id: "conn1", fromScreenId: "s1", toScreenId: "s2", label: "Start" },
  { id: "conn2", fromScreenId: "s1", toScreenId: "s3", label: "Skip quiz" },
  { id: "conn3", fromScreenId: "s2", toScreenId: "s3", label: "Next" },
  { id: "conn4", fromScreenId: "s3", toScreenId: "s4", label: "See results" },
];

const defaultPropsMap: Record<ComponentType, ComponentProps> = {
  heading: {
    text: "Heading",
    align: "left",
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
  subheading: {
    text: "Subheading",
    align: "left",
    color: "#e5e7eb",
    fontSize: 18,
    fontWeight: "600",
  },
  paragraph: {
    text: "Your text here. Click to edit.",
    align: "left",
    color: "#9ca3af",
    fontSize: 14,
  },
  button: {
    text: "Click Me",
    bgColor: "#7c3aed",
    color: "#ffffff",
    size: "md",
  },
  image: { src: "", alt: "Image", height: 160 },
  input: { placeholder: "Enter your email...", label: "Email" },
  checkbox: { label: "I agree to the terms and conditions" },
  divider: {},
  spacer: { height: 24 },
  badge: { text: "New", bgColor: "#7c3aed", color: "#ffffff" },
  list: {
    items: ["Item one", "Item two", "Item three"],
    color: "#e5e7eb",
    fontSize: 14,
  },
  progress: { value: 60, label: "Progress" },
  section: { title: "Section", collapsed: false },
};

let idCounter = 100;

interface BuilderProviderProps {
  children: ReactNode;
  funnelId: string;
  initialScreens: Screen[];
  initialConnections: FlowConnection[];
  theme: "dark" | "light";
  onSave: (screens: Screen[], connections: FlowConnection[]) => void;
  onBack: () => void;
}

export function BuilderProvider({
  children,
  funnelId,
  initialScreens,
  initialConnections,
  theme: themeProp,
  onSave,
  onBack,
}: BuilderProviderProps) {
  const [screens, setScreens] = useState<Screen[]>(
    initialScreens.length ? initialScreens : defaultScreens
  );
  const [activeScreenId, setActiveScreenId] = useState(
    initialScreens[0]?.id ?? "s1"
  );
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    null
  );
  const [view, setView] = useState<"builder" | "flow" | "json">("builder");
  const [theme, setTheme] = useState<"dark" | "light">(themeProp);
  const [connections, setConnections] =
    useState<FlowConnection[]>(initialConnections);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  );

  // Auto-save whenever screens or connections change
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onSave(screens, connections);
    }, 800);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [screens, connections]);

  // const toggleTheme = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), [])

  const activeScreen = screens.find((s) => s.id === activeScreenId);
  const selectedComponent = activeScreen?.components.find(
    (c) => c.id === selectedComponentId
  );

  const addScreen = useCallback(() => {
    const id = `s${++idCounter}`;
    const maxX = Math.max(...screens.map((s) => s.flowPosition?.x ?? 0), 0);
    setScreens((prev) => [
      ...prev,
      {
        id,
        name: `Screen ${prev.length + 1}`,
        components: [],
        flowPosition: { x: maxX + 320, y: 120 },
      },
    ]);
    setActiveScreenId(id);
  }, [screens]);

  const deleteScreen = useCallback((id: string) => {
    setScreens((prev) => {
      if (prev.length <= 1) return prev;
      const idx = prev.findIndex((s) => s.id === id);
      const next = prev.filter((s) => s.id !== id);
      setActiveScreenId(next[Math.max(0, idx - 1)]?.id ?? next[0].id);
      return next;
    });
    setConnections((prev) =>
      prev.filter((c) => c.fromScreenId !== id && c.toScreenId !== id)
    );
  }, []);

  const duplicateScreen = useCallback((id: string) => {
    setScreens((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      const original = prev[idx];
      if (!original) return prev;
      const clone: Screen = {
        id: `s${++idCounter}`,
        name: `${original.name} (copy)`,
        components: original.components.map((c) => ({
          ...c,
          id: `c${++idCounter}`,
          props: { ...c.props },
        })),
        flowPosition: original.flowPosition
          ? {
              x: original.flowPosition.x + 40,
              y: (original.flowPosition.y ?? 0) + 40,
            }
          : undefined,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      setActiveScreenId(clone.id);
      return next;
    });
  }, []);

  const renameScreen = useCallback((id: string, name: string) => {
    setScreens((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  }, []);

  const reorderScreens = useCallback((fromIdx: number, toIdx: number) => {
    setScreens((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  }, []);

  const addComponent = useCallback(
    (type: ComponentType, atIndex?: number) => {
      const newComp: CanvasComponent = {
        id: `c${++idCounter}`,
        type,
        order: 0,
        props: { ...defaultPropsMap[type] },
      };
      setScreens((prev) =>
        prev.map((s) => {
          if (s.id !== activeScreenId) return s;
          const comps = [...s.components];
          const insertAt = atIndex !== undefined ? atIndex : comps.length;
          comps.splice(insertAt, 0, newComp);
          return {
            ...s,
            components: comps.map((c, i) => ({ ...c, order: i })),
          };
        })
      );
      setSelectedComponentId(newComp.id);
    },
    [activeScreenId]
  );

  const removeComponent = useCallback(
    (componentId: string) => {
      setScreens((prev) =>
        prev.map((s) => {
          if (s.id !== activeScreenId) return s;
          return {
            ...s,
            components: s.components.filter((c) => c.id !== componentId),
          };
        })
      );
      setSelectedComponentId(null);
    },
    [activeScreenId]
  );

  const updateComponentProps = useCallback(
    (componentId: string, props: Partial<ComponentProps>) => {
      setScreens((prev) =>
        prev.map((s) => {
          if (s.id !== activeScreenId) return s;
          return {
            ...s,
            components: s.components.map((c) =>
              c.id === componentId
                ? { ...c, props: { ...c.props, ...props } }
                : c
            ),
          };
        })
      );
    },
    [activeScreenId]
  );

  const moveComponent = useCallback(
    (fromIndex: number, toIndex: number) => {
      setScreens((prev) =>
        prev.map((s) => {
          if (s.id !== activeScreenId) return s;
          const comps = [...s.components];
          const [moved] = comps.splice(fromIndex, 1);
          comps.splice(toIndex, 0, moved);
          return {
            ...s,
            components: comps.map((c, i) => ({ ...c, order: i })),
          };
        })
      );
    },
    [activeScreenId]
  );

  const updateScreenFlowPosition = useCallback(
    (id: string, x: number, y: number) => {
      setScreens((prev) =>
        prev.map((s) => (s.id === id ? { ...s, flowPosition: { x, y } } : s))
      );
    },
    []
  );

  const addConnection = useCallback(
    (fromScreenId: string, toScreenId: string, label?: string) => {
      const exists = connections.some(
        (c) => c.fromScreenId === fromScreenId && c.toScreenId === toScreenId
      );
      if (exists || fromScreenId === toScreenId) return;
      setConnections((prev) => [
        ...prev,
        {
          id: `conn${++idCounter}`,
          fromScreenId,
          toScreenId,
          label: label ?? "",
        },
      ]);
    },
    [connections]
  );

  const removeConnection = useCallback((id: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateConnectionLabel = useCallback((id: string, label: string) => {
    setConnections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, label } : c))
    );
  }, []);

  const addScreenFromTemplate = useCallback(
    (template: ScreenTemplate) => {
      const id = `s${++idCounter}`;
      const maxX = Math.max(...screens.map((s) => s.flowPosition?.x ?? 0), 0);
      const newScreen: Screen = {
        id,
        name: template.name,
        components: template.components.map((c) => ({
          ...c,
          id: `c${++idCounter}`,
        })),
        flowPosition: { x: maxX + 320, y: 120 },
      };
      setScreens((prev) => [...prev, newScreen]);
      setActiveScreenId(id);
      setSelectedComponentId(null);
    },
    [screens]
  );

  const navigateScreen = useCallback(
    (direction: "prev" | "next") => {
      setScreens((prev) => {
        const idx = prev.findIndex((s) => s.id === activeScreenId);
        const next = direction === "next" ? idx + 1 : idx - 1;
        if (next >= 0 && next < prev.length) {
          setActiveScreenId(prev[next].id);
          setSelectedComponentId(null);
        }
        return prev;
      });
    },
    [activeScreenId]
  );

  // ── Global keyboard shortcuts ──────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isEditing =
        tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if (!isEditing) {
        // Delete / Backspace → remove selected component
        if (
          (e.key === "Delete" || e.key === "Backspace") &&
          selectedComponentId
        ) {
          e.preventDefault();
          setScreens((prev) =>
            prev.map((s) => {
              if (s.id !== activeScreenId) return s;
              return {
                ...s,
                components: s.components.filter(
                  (c) => c.id !== selectedComponentId
                ),
              };
            })
          );
          setSelectedComponentId(null);
          return;
        }

        // Escape → deselect
        if (e.key === "Escape") {
          setSelectedComponentId(null);
          return;
        }

        // ArrowUp / ArrowDown → navigate screens (no modifier)
        if (!e.metaKey && !e.ctrlKey && !e.altKey) {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            navigateScreen("next");
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            navigateScreen("prev");
          }
        }

        // Cmd/Ctrl+D → duplicate active screen
        if ((e.metaKey || e.ctrlKey) && e.key === "d") {
          e.preventDefault();
          setScreens((prev) => {
            const idx = prev.findIndex((s) => s.id === activeScreenId);
            const original = prev[idx];
            if (!original) return prev;
            const clone: Screen = {
              id: `s${++idCounter}`,
              name: `${original.name} (copy)`,
              components: original.components.map((c) => ({
                ...c,
                id: `c${++idCounter}`,
                props: { ...c.props },
              })),
              flowPosition: original.flowPosition
                ? {
                    x: original.flowPosition.x + 40,
                    y: (original.flowPosition.y ?? 0) + 40,
                  }
                : undefined,
            };
            const next = [...prev];
            next.splice(idx + 1, 0, clone);
            setActiveScreenId(clone.id);
            return next;
          });
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedComponentId, activeScreenId, navigateScreen]);

  const exportState = useCallback(
    (): FunnelState => ({
      screens,
      connections,
    }),
    [screens, connections]
  );

  const importState = useCallback((state: FunnelState) => {
    setScreens(state.screens ?? []);
    setConnections(state.connections ?? []);
    setActiveScreenId(state.screens?.[0]?.id ?? "");
    setSelectedComponentId(null);
  }, []);

  return (
    <BuilderContext.Provider
      value={{
        screens,
        activeScreenId,
        selectedComponentId,
        view,
        theme,
        connections,
        setView,
        setTheme,
        toggleTheme,
        setActiveScreenId,
        setSelectedComponentId,
        addScreen,
        addScreenFromTemplate,
        deleteScreen,
        duplicateScreen,
        renameScreen,
        reorderScreens,
        addComponent,
        removeComponent,
        updateComponentProps,
        moveComponent,
        updateScreenFlowPosition,
        addConnection,
        removeConnection,
        updateConnectionLabel,
        navigateScreen,
        exportState,
        importState,
        onBack,
        activeScreen,
        selectedComponent,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error("useBuilder must be inside BuilderProvider");
  return ctx;
}
