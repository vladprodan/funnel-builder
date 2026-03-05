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
}

export interface Screen {
  id: string
  name: string
  components: CanvasComponent[]
  flowPosition?: { x: number; y: number }
}

export interface FlowConnection {
  id: string
  fromScreenId: string
  toScreenId: string
  label?: string
}

export interface ComponentDefinition {
  type: ComponentType
  label: string
  icon: string
  group: string
  defaultProps: ComponentProps
}
