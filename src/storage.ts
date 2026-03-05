import type { Project, FunnelMeta, Screen, FlowConnection } from "@/types";

const PROJECTS_KEY = "fb:projects";
const FUNNELS_KEY = "fb:funnels";

// ── helpers ───────────────────────────────────────────────────────────────────
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}
function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function now() {
  return new Date().toISOString();
}

// ── default seed data ─────────────────────────────────────────────────────────
const defaultProject: Project = {
  id: "p1",
  name: "My First Project",
  color: "#7c3aed",
  createdAt: new Date(Date.now() - 86400_000 * 3).toISOString(),
};

const defaultFunnel: FunnelMeta = {
  id: "f1",
  name: "Welcome Funnel",
  projectId: "p1",
  screens: [
    {
      id: "s1",
      name: "Welcome",
      components: [
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
      ],
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
      name: "Results",
      components: [
        {
          id: "c6",
          type: "badge",
          order: 0,
          props: {
            text: "Your Plan is Ready",
            bgColor: "#059669",
            color: "#ffffff",
          },
        },
        {
          id: "c7",
          type: "heading",
          order: 1,
          props: {
            text: "Here's Your Plan",
            align: "center",
            color: "#ffffff",
            fontSize: 24,
          },
        },
        {
          id: "c8",
          type: "button",
          order: 2,
          props: {
            text: "Start My Journey",
            bgColor: "#7c3aed",
            color: "#ffffff",
            size: "lg",
          },
        },
      ],
      flowPosition: { x: 380, y: 220 },
    },
  ],
  connections: [
    { id: "cn1", fromScreenId: "s1", toScreenId: "s2", label: "Start" },
    { id: "cn2", fromScreenId: "s2", toScreenId: "s3", label: "Next" },
  ],
  createdAt: new Date(Date.now() - 86400_000 * 3).toISOString(),
  updatedAt: new Date(Date.now() - 3600_000).toISOString(),
};

// ── Projects ──────────────────────────────────────────────────────────────────
export function getProjects(): Project[] {
  const stored = load<Project[]>(PROJECTS_KEY, []);
  if (stored.length === 0) {
    save(PROJECTS_KEY, [defaultProject]);
    return [defaultProject];
  }
  return stored;
}

export function saveProjects(projects: Project[]) {
  save(PROJECTS_KEY, projects);
}

export function createProject(name: string, color: string): Project {
  const p: Project = { id: uid(), name, color, createdAt: now() };
  const all = getProjects();
  saveProjects([...all, p]);
  return p;
}

export function updateProject(
  id: string,
  patch: Partial<Pick<Project, "name" | "color">>
) {
  const all = getProjects().map((p) => (p.id === id ? { ...p, ...patch } : p));
  saveProjects(all);
}

export function deleteProject(id: string) {
  saveProjects(getProjects().filter((p) => p.id !== id));
  // Move funnels to uncategorized
  const funnels = getFunnels().map((f) =>
    f.projectId === id ? { ...f, projectId: null } : f
  );
  saveFunnels(funnels);
}

// ── Funnels ───────────────────────────────────────────────────────────────────
export function getFunnels(): FunnelMeta[] {
  const stored = load<FunnelMeta[]>(FUNNELS_KEY, []);
  if (stored.length === 0) {
    save(FUNNELS_KEY, [defaultFunnel]);
    return [defaultFunnel];
  }
  return stored;
}

export function saveFunnels(funnels: FunnelMeta[]) {
  save(FUNNELS_KEY, funnels);
}

export function createFunnel(
  name: string,
  projectId: string | null
): FunnelMeta {
  const f: FunnelMeta = {
    id: uid(),
    name,
    projectId,
    screens: [],
    connections: [],
    createdAt: now(),
    updatedAt: now(),
  };
  const all = getFunnels();
  saveFunnels([...all, f]);
  return f;
}

export function updateFunnel(
  id: string,
  screens: Screen[],
  connections: FlowConnection[]
) {
  const all = getFunnels().map((f) =>
    f.id === id ? { ...f, screens, connections, updatedAt: now() } : f
  );
  saveFunnels(all);
}

export function renameFunnel(id: string, name: string) {
  const all = getFunnels().map((f) =>
    f.id === id ? { ...f, name, updatedAt: now() } : f
  );
  saveFunnels(all);
}

export function moveFunnel(id: string, projectId: string | null) {
  const all = getFunnels().map((f) =>
    f.id === id ? { ...f, projectId, updatedAt: now() } : f
  );
  saveFunnels(all);
}

export function duplicateFunnel(id: string): FunnelMeta {
  const original = getFunnels().find((f) => f.id === id);
  if (!original) throw new Error("Funnel not found");
  const copy: FunnelMeta = {
    ...original,
    id: uid(),
    name: `${original.name} (copy)`,
    createdAt: now(),
    updatedAt: now(),
  };
  saveFunnels([...getFunnels(), copy]);
  return copy;
}

export function deleteFunnel(id: string) {
  saveFunnels(getFunnels().filter((f) => f.id !== id));
}
