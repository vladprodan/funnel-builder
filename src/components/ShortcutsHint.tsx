import { useState } from 'react'

const SHORTCUTS = [
  { keys: ['↑', '↓'], label: 'Navigate screens' },
  { keys: ['⌘', 'D'], label: 'Duplicate screen' },
  { keys: ['⌘', 'Z'], label: 'Undo' },
  { keys: ['⌘', '⇧', 'Z'], label: 'Redo' },
  { keys: ['⌘', 'C'], label: 'Copy component' },
  { keys: ['⌘', 'V'], label: 'Paste component' },
  { keys: ['⇧', 'Click'], label: 'Multi-select' },
  { keys: ['Del'], label: 'Delete component' },
  { keys: ['Esc'], label: 'Deselect' },
]

export function ShortcutsHint() {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        title="Keyboard shortcuts"
        className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded transition-colors"
        style={{ color: open ? 'var(--text-secondary)' : 'var(--text-muted)', background: open ? 'var(--bg-hover)' : 'none' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={e => (e.currentTarget.style.background = open ? 'var(--bg-hover)' : 'none')}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="0.5" y="2.5" width="3" height="2" rx="0.5"/>
          <rect x="4.5" y="2.5" width="3" height="2" rx="0.5"/>
          <rect x="8.5" y="2.5" width="3" height="2" rx="0.5"/>
          <rect x="0.5" y="6.5" width="3" height="2" rx="0.5"/>
          <rect x="4.5" y="6.5" width="7" height="2" rx="0.5"/>
        </svg>
        <span>Shortcuts</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-8 left-0 z-50 rounded-xl shadow-2xl p-3 w-52"
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] uppercase tracking-widest mb-2 px-1" style={{ color: 'var(--text-faint)' }}>Shortcuts</p>
            <div className="flex flex-col gap-1.5">
              {SHORTCUTS.map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {s.keys.map(k => (
                      <kbd key={k} className="text-[10px] rounded px-1.5 py-0.5 font-mono"
                        style={{ color: 'var(--text-secondary)', background: 'var(--kbd-bg)', border: '1px solid var(--kbd-border)' }}>
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
