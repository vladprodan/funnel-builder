# Funnel Builder — Project Context for Claude

## What this is
A visual funnel/landing page builder. Users create multi-screen funnels with drag-drop components, connect screens in a flow graph, and manage projects on a dashboard.

## Tech Stack
- React 19 + TypeScript 5 (strict mode) + Vite 7
- Tailwind CSS 3 + CSS variables for theming (`src/theme.css`)
- shadcn/ui in `src/components/ui/` (52 components — don't modify these)
- React Hook Form + Zod (forms), Lucide (icons), Sonner (toasts)
- Storage: localStorage via `src/storage.ts` (keys: `fb:projects`, `fb:funnels`)

## Architecture

### State Management (two contexts)
- `AppContext` (`src/context/AppContext.tsx`) — global: projects, funnels, theme, page routing
- `BuilderContext` (`src/context/BuilderContext.tsx`) — builder: screens, components, connections, view mode
- Theme lives **only** in AppContext. BuilderView/Topbar read theme via `useApp()`.

### Routing
No React Router. `App.tsx` switches between `<Dashboard>` and `<BuilderView>` based on `page` state in AppContext.

### Key Files
```
src/
├── App.tsx                          # Router: dashboard ↔ builder
├── storage.ts                       # localStorage CRUD (uses crypto.randomUUID() for IDs)
├── types/index.ts                   # All shared types
├── context/
│   ├── AppContext.tsx               # Global state
│   └── BuilderContext.tsx           # Builder state + keyboard shortcuts
├── components/
│   ├── Dashboard.tsx                # Main dashboard (imports from dashboard/)
│   ├── dashboard/
│   │   ├── FunnelCard.tsx           # Funnel grid card with dropdown menu
│   │   ├── MenuItem.tsx             # Reusable dropdown menu item
│   │   ├── SidebarItem.tsx          # SidebarItem + ProjectSidebarItem
│   │   └── Modals.tsx               # NewFunnelModal, ProjectModal, ConfirmDeleteModal
│   ├── BuilderView.tsx              # Builder wrapper + Topbar + BuilderLayout
│   ├── Canvas.tsx                   # Phone preview with drag-drop
│   ├── ComponentRenderer.tsx        # Renders 13 component types
│   ├── ComponentsPanel.tsx          # Left sidebar: component library
│   ├── ScreensPanel.tsx             # Left sidebar: screen list
│   ├── PropertiesPanel.tsx          # Right sidebar: component/screen properties
│   ├── FlowView.tsx                 # SVG flow graph editor (pan, zoom, connect)
│   ├── JsonEditor.tsx               # JSON export/import editor
│   └── TemplateModal.tsx            # Screen template picker
└── index.css                        # Tailwind + utility classes (hover-bg, btn-ghost, btn-accent)
```

## ID Generation
Always use `crypto.randomUUID()`. Never use counters or `Math.random()`.

## Theming
CSS variables defined in `src/theme.css`, toggled via `data-theme="dark"|"light"` on root div.
Key variables: `--bg-app`, `--bg-panel`, `--bg-hover`, `--bg-active`, `--bg-input`, `--bg-canvas`,
`--border`, `--border-active`, `--text-primary`, `--text-secondary`, `--text-muted`, `--text-faint`,
`--accent`, `--accent-hover`, `--modal-bg`.

## Reusable CSS Utilities (src/index.css)
- `.hover-bg` — background: var(--bg-hover) on hover
- `.btn-ghost` — muted text, transparent bg, hover-bg on hover
- `.btn-accent` — var(--accent) bg, white text, accent-hover on hover
Use these instead of inline `onMouseEnter`/`onMouseLeave` handlers where possible.

## Component Types (13 total)
`heading | subheading | paragraph | button | image | input | checkbox | divider | spacer | badge | list | progress | section`

## Auto-save
BuilderContext debounces saves by 800ms. Skips initial mount via `isFirstRender` ref.
Calls `onSave(screens, connections)` → `storage.updateFunnel(id, screens, connections)`.

## Known Remaining Patterns to Clean Up
- Many inline `onMouseEnter`/`onMouseLeave` still exist in Canvas, ScreensPanel, PropertiesPanel, FlowView
- No undo/redo system yet (history stack is the next big feature)
- No preview mode yet
- AppContext callbacks reload full array from localStorage on every mutation (acceptable for current scale)

## Build & Run
```bash
npm run dev      # Vite dev server
npm run build    # Production build
npx tsc --noEmit # Type check (should be 0 errors)
```

## Completed Refactoring (March 2026)
- crypto.randomUUID() for all IDs
- Theme unified in AppContext only
- Auto-save skips initial mount
- Dashboard.tsx split into dashboard/ subfolder
- ESLint errors fixed (unused vars, portOut, catch(e), ternary statements)
- CSS utility classes for hover/button patterns
