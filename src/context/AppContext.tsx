import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import type { Project, FunnelMeta } from "@/types";
import * as storage from "@/storage";

type Page = "dashboard" | "builder";

interface AppContextValue {
  page: Page;
  activeFunnelId: string | null;
  projects: Project[];
  funnels: FunnelMeta[];
  theme: "dark" | "light";
  toggleTheme: () => void;
  openFunnel: (id: string) => void;
  goToDashboard: () => void;
  // Projects
  createProject: (name: string, color: string) => Project;
  updateProject: (
    id: string,
    patch: Partial<Pick<Project, "name" | "color">>
  ) => void;
  deleteProject: (id: string) => void;
  // Funnels
  createFunnel: (name: string, projectId: string | null) => FunnelMeta;
  renameFunnel: (id: string, name: string) => void;
  moveFunnel: (id: string, projectId: string | null) => void;
  duplicateFunnel: (id: string) => void;
  deleteFunnel: (id: string) => void;
  refreshFunnels: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>("dashboard");
  const [activeFunnelId, setActiveFunnelId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>(() =>
    storage.getProjects()
  );
  const [funnels, setFunnels] = useState<FunnelMeta[]>(() =>
    storage.getFunnels()
  );
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  );

  const refreshFunnels = useCallback(
    () => setFunnels(storage.getFunnels()),
    []
  );

  const openFunnel = useCallback((id: string) => {
    setActiveFunnelId(id);
    setPage("builder");
  }, []);

  const goToDashboard = useCallback(() => {
    setPage("dashboard");
    refreshFunnels();
  }, [refreshFunnels]);

  const createProject = useCallback((name: string, color: string) => {
    const p = storage.createProject(name, color);
    setProjects(storage.getProjects());
    return p;
  }, []);

  const updateProject = useCallback(
    (id: string, patch: Partial<Pick<Project, "name" | "color">>) => {
      storage.updateProject(id, patch);
      setProjects(storage.getProjects());
    },
    []
  );

  const deleteProject = useCallback((id: string) => {
    storage.deleteProject(id);
    setProjects(storage.getProjects());
    setFunnels(storage.getFunnels());
  }, []);

  const createFunnel = useCallback((name: string, projectId: string | null) => {
    const f = storage.createFunnel(name, projectId);
    setFunnels(storage.getFunnels());
    return f;
  }, []);

  const renameFunnel = useCallback((id: string, name: string) => {
    storage.renameFunnel(id, name);
    setFunnels(storage.getFunnels());
  }, []);

  const moveFunnel = useCallback((id: string, projectId: string | null) => {
    storage.moveFunnel(id, projectId);
    setFunnels(storage.getFunnels());
  }, []);

  const duplicateFunnel = useCallback((id: string) => {
    storage.duplicateFunnel(id);
    setFunnels(storage.getFunnels());
  }, []);

  const deleteFunnel = useCallback((id: string) => {
    storage.deleteFunnel(id);
    setFunnels(storage.getFunnels());
  }, []);

  return (
    <AppContext.Provider
      value={{
        page,
        activeFunnelId,
        projects,
        funnels,
        theme,
        toggleTheme,
        openFunnel,
        goToDashboard,
        createProject,
        updateProject,
        deleteProject,
        createFunnel,
        renameFunnel,
        moveFunnel,
        duplicateFunnel,
        deleteFunnel,
        refreshFunnels,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
