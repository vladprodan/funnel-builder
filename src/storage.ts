import { supabase } from '@/lib/supabase'
import type { Project, FunnelMeta, Screen, FlowConnection } from '@/types'

// ── helpers ───────────────────────────────────────────────────────────────────
function rowToProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    name: row.name as string,
    color: row.color as string,
    createdAt: row.created_at as string,
  }
}

function rowToFunnel(row: Record<string, unknown>): FunnelMeta {
  return {
    id: row.id as string,
    name: row.name as string,
    projectId: (row.project_id as string | null) ?? null,
    screens: (row.screens as Screen[]) ?? [],
    connections: (row.connections as FlowConnection[]) ?? [],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

// ── Projects ──────────────────────────────────────────────────────────────────
export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(rowToProject)
}

export async function createProject(name: string, color: string): Promise<Project> {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('projects')
    .insert({ name, color, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return rowToProject(data)
}

export async function updateProject(
  id: string,
  patch: Partial<Pick<Project, 'name' | 'color'>>
): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({ name: patch.name, color: patch.color })
    .eq('id', id)
  if (error) throw error
}

export async function deleteProject(id: string): Promise<void> {
  // Move funnels to uncategorized
  const { error: moveErr } = await supabase
    .from('funnels')
    .update({ project_id: null })
    .eq('project_id', id)
  if (moveErr) throw moveErr
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

// ── Funnels ───────────────────────────────────────────────────────────────────
export async function getFunnels(): Promise<FunnelMeta[]> {
  const { data, error } = await supabase
    .from('funnels')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(rowToFunnel)
}

export async function createFunnel(
  name: string,
  projectId: string | null
): Promise<FunnelMeta> {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('funnels')
    .insert({
      name,
      project_id: projectId,
      user_id: userId,
      screens: [],
      connections: [],
    })
    .select()
    .single()
  if (error) throw error
  return rowToFunnel(data)
}

export async function updateFunnel(
  id: string,
  screens: Screen[],
  connections: FlowConnection[]
): Promise<void> {
  const { error } = await supabase
    .from('funnels')
    .update({ screens, connections, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function renameFunnel(id: string, name: string): Promise<void> {
  const { error } = await supabase
    .from('funnels')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function moveFunnel(id: string, projectId: string | null): Promise<void> {
  const { error } = await supabase
    .from('funnels')
    .update({ project_id: projectId, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function duplicateFunnel(id: string): Promise<FunnelMeta> {
  const userId = await getUserId()
  const all = await getFunnels()
  const original = all.find(f => f.id === id)
  if (!original) throw new Error('Funnel not found')
  const { data, error } = await supabase
    .from('funnels')
    .insert({
      name: `${original.name} (copy)`,
      project_id: original.projectId,
      user_id: userId,
      screens: original.screens,
      connections: original.connections,
    })
    .select()
    .single()
  if (error) throw error
  return rowToFunnel(data)
}

export async function deleteFunnel(id: string): Promise<void> {
  const { error } = await supabase.from('funnels').delete().eq('id', id)
  if (error) throw error
}
