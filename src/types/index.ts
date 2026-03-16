export interface Project {
  id: string
  name: string
  color: string
  createdAt: string
}

export interface FunnelMeta {
  id: string
  name: string
  projectId: string | null
  screens: Screen[]
  connections: FlowConnection[]
  createdAt: string
  updatedAt: string
}

export type ComponentType =
  | 'heading'
  | 'subheading'
  | 'paragraph'
  | 'button'
  | 'image'
  | 'input'
  | 'checkbox'
  | 'divider'
  | 'spacer'
  | 'badge'
  | 'list'
  | 'progress'
  | 'section'

export interface ComponentProps {
  text?: string
  placeholder?: string
  variant?: string
  size?: string
  align?: 'left' | 'center' | 'right'
  color?: string
  bgColor?: string
  fontSize?: number
  fontWeight?: string
  height?: number
  items?: string[]
  label?: string
  value?: number
  src?: string
  alt?: string
  title?: string          // for section
  collapsed?: boolean     // for section
}

export interface ScreenTemplate {
  id: string
  name: string
  description: string
  icon: string
  components: Omit<CanvasComponent, 'id'>[]
}

export interface CanvasComponent {
  id: string
  type: ComponentType
  props: ComponentProps
  order: number
  // Production schema fields
  funnelValueKey?: string
  isForm?: boolean
  analytics?: { event_name: string }
}

// ─── Route / Navigation ───────────────────────────────────────────────────────

export interface RouteCondition {
  field: string
  operator: 'equals' | 'contains' | 'not_equals' | 'not_contains' | 'gte' | 'lte' | 'gt' | 'lt'
  value: string
}

export interface RouteValidation {
  required_fields: string[]
}

export interface FlowConnection {
  id: string
  fromScreenId: string
  toScreenId: string
  label?: string
  // Production schema route fields
  onEvent?: string          // e.g. "goto_next" (default if empty)
  conditions?: RouteCondition[]
  defaultTo?: string        // fallback screen id when conditions fail
  validation?: RouteValidation
  analytics?: { event_name: string }
  // Legacy simple condition (button text match for Preview)
  condition?: string
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export type ScreenType = 'info' | 'select' | 'input' | 'loader' | 'result' | 'form'

export interface ScreenSettings {
  display?: boolean
  [key: string]: unknown
}

export interface Screen {
  id: string
  name: string
  components: CanvasComponent[]
  flowPosition?: { x: number; y: number }
  // Production schema metadata
  screenType?: ScreenType
  allowBack?: boolean
  funnelValueKey?: string
  formType?: 'single-select' | 'multi-select' | 'input' | 'none'
  order?: number
  total?: number
  settings?: ScreenSettings
  analytics?: { event_name: string }
}

// ─── Production Export Schema ─────────────────────────────────────────────────

export interface SchemaComponentNode {
  type: string
  id: string
  funnelValueKey?: string
  properties?: Record<string, unknown>
  children?: SchemaComponentNode[]
}

export interface SchemaScreen {
  id: string
  name: string
  type?: ScreenType
  funnelValueKey?: string
  formType?: string
  allow_back?: boolean
  order?: number
  total?: number
  settings?: ScreenSettings
  analytics?: { event_name: string }
  structure: {
    type: 'root'
    id: string
    properties?: Record<string, unknown>
    children: SchemaComponentNode[]
  }
}

export interface SchemaRoute {
  id: string
  from: string
  on_event: string
  to: string
  conditions?: RouteCondition[]
  default_to?: string
  validation?: RouteValidation
  analytics?: { event_name: string }
}

export interface FunnelSchema {
  $schema?: string
  id: string
  directory?: string
  project_id?: string | null
  name: string
  description?: string
  settings?: {
    status?: 'draft' | 'published'
    visibility?: 'public' | 'private'
    slug?: string
  }
  version?: {
    number: number
    created_at: string
    updated_at: string
    created_by?: string
    updated_by?: string
  }
  navigation: {
    entry_point: string
    routes: SchemaRoute[]
  }
  screens: SchemaScreen[]
}

// ─── Component Library ────────────────────────────────────────────────────────

export interface ComponentDefinition {
  type: ComponentType
  label: string
  icon: string
  group: string
  defaultProps: ComponentProps
}
