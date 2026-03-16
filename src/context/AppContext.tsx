import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
import type { ReactNode } from 'react'
import type { Project, FunnelMeta } from '@/types'
import * as storage from '@/storage'

type Page = 'dashboard' | 'builder'

interface AppContextValue {
  page: Page
  activeFunnelId: string | null
  projects: Project[]
  funnels: FunnelMeta[]
  theme: 'dark' | 'light'
  isLoading: boolean
  toggleTheme: () => void
  openFunnel: (id: string) => void
  goToDashboard: () => void
  // Projects
  createProject: (name: string, color: string) => Promise<Project>
  updateProject: (id: string, patch: Partial<Pick<Project, 'name' | 'color'>>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  // Funnels
  createFunnel: (name: string, projectId: string | null) => Promise<FunnelMeta>
  renameFunnel: (id: string, name: string) => Promise<void>
  moveFunnel: (id: string, projectId: string | null) => Promise<void>
  duplicateFunnel: (id: string) => Promise<void>
  deleteFunnel: (id: string) => Promise<void>
  refreshFunnels: () => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>('dashboard')
  const [activeFunnelId, setActiveFunnelId] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [funnels, setFunnels] = useState<FunnelMeta[]>([])
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([storage.getProjects(), storage.getFunnels()])
      .then(([p, f]) => {
        setProjects(p)
        setFunnels(f)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const toggleTheme = useCallback(
    () => setTheme(t => (t === 'dark' ? 'light' : 'dark')),
    []
  )

  const refreshFunnels = useCallback(async () => {
    const f = await storage.getFunnels()
    setFunnels(f)
  }, [])

  const openFunnel = useCallback((id: string) => {
    setActiveFunnelId(id)
    setPage('builder')
  }, [])

  const goToDashboard = useCallback(() => {
    setPage('dashboard')
    void refreshFunnels()
  }, [refreshFunnels])

  const createProject = useCallback(async (name: string, color: string) => {
    const p = await storage.createProject(name, color)
    setProjects(await storage.getProjects())
    return p
  }, [])

  const updateProject = useCallback(
    async (id: string, patch: Partial<Pick<Project, 'name' | 'color'>>) => {
      await storage.updateProject(id, patch)
      setProjects(await storage.getProjects())
    },
    []
  )

  const deleteProject = useCallback(async (id: string) => {
    await storage.deleteProject(id)
    const [p, f] = await Promise.all([storage.getProjects(), storage.getFunnels()])
    setProjects(p)
    setFunnels(f)
  }, [])

  const createFunnel = useCallback(async (name: string, projectId: string | null) => {
    const f = await storage.createFunnel(name, projectId)
    setFunnels(await storage.getFunnels())
    return f
  }, [])

  const renameFunnel = useCallback(async (id: string, name: string) => {
    await storage.renameFunnel(id, name)
    setFunnels(await storage.getFunnels())
  }, [])

  const moveFunnel = useCallback(async (id: string, projectId: string | null) => {
    await storage.moveFunnel(id, projectId)
    setFunnels(await storage.getFunnels())
  }, [])

  const duplicateFunnel = useCallback(async (id: string) => {
    await storage.duplicateFunnel(id)
    setFunnels(await storage.getFunnels())
  }, [])

  const deleteFunnel = useCallback(async (id: string) => {
    await storage.deleteFunnel(id)
    setFunnels(await storage.getFunnels())
  }, [])

  return (
    <AppContext.Provider
      value={{
        page,
        activeFunnelId,
        projects,
        funnels,
        theme,
        isLoading,
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
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
