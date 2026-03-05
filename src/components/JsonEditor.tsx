import { useState, useCallback, useRef, useEffect } from 'react'
import { useBuilder } from '@/context/BuilderContext'

// ── Lightweight JSON syntax highlighter ──────────────────────────────────────
function highlight(json: string, isDark: boolean): string {
  const colors = isDark
    ? { key: '#93c5fd', string: '#86efac', number: '#fbbf24', bool: '#f472b6', null: '#f472b6', punct: '#6b7280' }
    : { key: '#1d4ed8', string: '#15803d', number: '#b45309', bool: '#be185d', null: '#be185d', punct: '#6b7280' }

  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}\[\],:])/g,
      (match) => {
        let cls = colors.punct
        if (/^"/.test(match)) {
          cls = match.endsWith(':') ? colors.key : colors.string
        } else if (/true|false/.test(match)) {
          cls = colors.bool
        } else if (/null/.test(match)) {
          cls = colors.null
        } else if (!isNaN(Number(match))) {
          cls = colors.number
        }
        return `<span style="color:${cls}">${match}</span>`
      }
    )
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
function calcStats(state: object) {
  const s = state as { screens?: unknown[]; connections?: unknown[] }
  return {
    screens: s.screens?.length ?? 0,
    connections: s.connections?.length ?? 0,
    components: (s.screens as { components?: unknown[] }[] | undefined)
      ?.reduce((acc, sc) => acc + (sc.components?.length ?? 0), 0) ?? 0,
  }
}

export function JsonEditor() {
  const { exportState, importState, theme } = useBuilder()
  const isDark = theme === 'dark'

  const [draft, setDraft] = useState(() => JSON.stringify(exportState(), null, 2))
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [syncedFromBuilder, setSyncedFromBuilder] = useState(true)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLPreElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Keep highlight in sync with draft
  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.innerHTML = highlight(draft, isDark)
    }
  }, [draft, isDark])

  // Sync scroll between textarea and highlight layer
  const syncScroll = () => {
    if (scrollRef.current && textareaRef.current) {
      scrollRef.current.scrollTop = textareaRef.current.scrollTop
      scrollRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }

  const validate = useCallback((text: string): object | null => {
    try {
      const parsed = JSON.parse(text)
      if (!Array.isArray(parsed.screens)) throw new Error('"screens" must be an array')
      if (!Array.isArray(parsed.connections)) throw new Error('"connections" must be an array')
      return parsed
    } catch (e) {
      return null
    }
  }, [])

  const handleChange = (val: string) => {
    setDraft(val)
    setSyncedFromBuilder(false)
    setSaved(false)
    try {
      const parsed = JSON.parse(val)
      if (!Array.isArray(parsed.screens)) throw new Error('"screens" must be an array')
      if (!Array.isArray(parsed.connections)) throw new Error('"connections" must be an array')
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const handleApply = () => {
    const parsed = validate(draft)
    if (!parsed) return
    importState(parsed as Parameters<typeof importState>[0])
    setSaved(true)
    setSyncedFromBuilder(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSyncFromBuilder = () => {
    const fresh = JSON.stringify(exportState(), null, 2)
    setDraft(fresh)
    setError(null)
    setSyncedFromBuilder(true)
    setSaved(false)
  }

  const handleDownload = () => {
    const blob = new Blob([draft], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'funnel.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const handleUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = '.json,application/json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const text = await file.text()
      handleChange(text)
    }
    input.click()
  }

  const handleFormat = () => {
    try {
      const pretty = JSON.stringify(JSON.parse(draft), null, 2)
      setDraft(pretty)
      setError(null)
    } catch {}
  }

  // Tab key support
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.currentTarget
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const newVal = draft.substring(0, start) + '  ' + draft.substring(end)
      setDraft(newVal)
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2
      })
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault()
      handleApply()
    }
  }

  const stats = (() => { try { return calcStats(JSON.parse(draft)) } catch { return null } })()

  const monoFont = "'JetBrains Mono', 'Fira Mono', 'Cascadia Code', 'Consolas', monospace"

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-canvas)' }}>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)' }}>

        {/* Status */}
        <div className="flex items-center gap-1.5 mr-2">
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: error ? '#f87171' : saved ? '#4ade80' : syncedFromBuilder ? 'var(--accent)' : '#fbbf24',
            boxShadow: `0 0 6px ${error ? '#f87171' : saved ? '#4ade80' : syncedFromBuilder ? 'var(--accent)' : '#fbbf24'}`,
          }} />
          <span className="text-[11px]" style={{ color: 'var(--text-muted)', fontFamily: monoFont }}>
            {error ? 'JSON error' : saved ? 'Applied ✓' : syncedFromBuilder ? 'Synced' : 'Unsaved changes'}
          </span>
        </div>

        {/* Stats */}
        {stats && !error && (
          <div className="flex items-center gap-3 mr-auto">
            {[
              { label: 'screens', val: stats.screens },
              { label: 'components', val: stats.components },
              { label: 'connections', val: stats.connections },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1">
                <span style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 700, fontFamily: monoFont }}>{s.val}</span>
                <span style={{ color: 'var(--text-faint)', fontSize: 11 }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}
        {(error || !stats) && <div className="mr-auto" />}

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <ToolBtn onClick={handleSyncFromBuilder} title="Pull latest state from Builder">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M10 2A5 5 0 1 0 11 6"/>
              <path d="M10 2v3h-3"/>
            </svg>
            Sync from Builder
          </ToolBtn>
          <ToolBtn onClick={handleFormat} title="Format / Prettify JSON">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 3h10M1 6h7M1 9h4"/>
            </svg>
            Format
          </ToolBtn>
          <div className="w-px h-4 mx-0.5" style={{ background: 'var(--border)' }} />
          <ToolBtn onClick={handleUpload} title="Import JSON file">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M6 8V2M3 5l3-3 3 3"/>
              <path d="M2 10h8"/>
            </svg>
            Import
          </ToolBtn>
          <ToolBtn onClick={handleDownload} title="Download JSON file">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M6 2v6M3 6l3 3 3-3"/>
              <path d="M2 10h8"/>
            </svg>
            Export
          </ToolBtn>
          <div className="w-px h-4 mx-0.5" style={{ background: 'var(--border)' }} />
          <button
            onClick={handleApply}
            disabled={!!error}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'var(--accent)' }}
            title="Apply JSON to builder (⌘S)"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
              <path d="M1.5 5.5L4.5 8.5L9.5 2.5"/>
            </svg>
            Apply  <span style={{ opacity: 0.6, fontSize: 10 }}>⌘S</span>
          </button>
        </div>
      </div>

      {/* Error bar */}
      {error && (
        <div className="px-4 py-2 flex items-center gap-2 shrink-0" style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="6.5" cy="6.5" r="6" stroke="#f87171" strokeWidth="1.2"/>
            <path d="M6.5 4v3M6.5 8.5v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ color: '#f87171', fontSize: 11, fontFamily: monoFont }}>{error}</span>
        </div>
      )}

      {/* Editor area */}
      <div className="flex-1 overflow-hidden flex" style={{ position: 'relative' }}>

        {/* Line numbers */}
        <LineNumbers text={draft} isDark={isDark} monoFont={monoFont} />

        {/* Editor */}
        <div className="flex-1 relative overflow-hidden">
          {/* Syntax-highlighted layer (non-interactive) */}
          <div
            ref={scrollRef}
            style={{
              position: 'absolute', inset: 0,
              overflow: 'hidden',
              pointerEvents: 'none',
              padding: '16px 16px 16px 0',
            }}
          >
            <pre
              ref={highlightRef}
              style={{
                margin: 0, padding: 0,
                fontFamily: monoFont,
                fontSize: 13,
                lineHeight: 1.65,
                whiteSpace: 'pre',
                tabSize: 2,
                color: 'var(--text-secondary)',
              }}
            />
          </div>

          {/* Actual textarea (transparent text, but captures events) */}
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={e => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={syncScroll}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              padding: '16px 16px 16px 0',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontFamily: monoFont,
              fontSize: 13,
              lineHeight: 1.65,
              color: 'transparent',
              caretColor: isDark ? '#a78bfa' : '#6d28d9',
              whiteSpace: 'pre',
              tabSize: 2,
              overflowX: 'auto',
              zIndex: 1,
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Line numbers sidebar ──────────────────────────────────────────────────────
function LineNumbers({ text, isDark, monoFont }: { text: string; isDark: boolean; monoFont: string }) {
  const lines = text.split('\n').length
  return (
    <div style={{
      width: 48,
      flexShrink: 0,
      padding: '16px 8px 16px 0',
      textAlign: 'right',
      background: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.03)',
      borderRight: '1px solid var(--border)',
      overflowY: 'hidden',
      userSelect: 'none',
    }}>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} style={{ fontFamily: monoFont, fontSize: 12, lineHeight: 1.65, color: 'var(--text-faint)' }}>
          {i + 1}
        </div>
      ))}
    </div>
  )
}

// ── Toolbar button ────────────────────────────────────────────────────────────
function ToolBtn({ onClick, title, children }: { onClick: () => void; title?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors"
      style={{ color: 'var(--text-muted)', background: 'none' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)' }}
    >
      {children}
    </button>
  )
}
