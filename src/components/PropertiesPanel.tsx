import { useBuilder } from '@/context/BuilderContext'

export function PropertiesPanel() {
  const { selectedComponent } = useBuilder()
  return selectedComponent ? <ComponentProperties /> : <ScreenProperties />
}

function ScreenProperties() {
  const { activeScreen, screens, connections, addConnection, removeConnection, updateConnectionLabel, updateScreenMeta } = useBuilder()
  if (!activeScreen) return null

  const outgoing = connections.filter(c => c.fromScreenId === activeScreen.id)
  const otherScreens = screens.filter(s => s.id !== activeScreen.id)
  const alreadyConnected = new Set(outgoing.map(c => c.toScreenId))

  const addTransition = () => {
    const target = otherScreens.find(s => !alreadyConnected.has(s.id))
    if (target) addConnection(activeScreen.id, target.id, '')
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      <div className="h-9 flex items-center justify-between px-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>Screen</span>
        <span className="text-[10px] font-mono truncate max-w-24" style={{ color: 'var(--text-faint)' }}>{activeScreen.name}</span>
      </div>

      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Transitions</span>
          <button onClick={addTransition}
            disabled={otherScreens.length === 0 || otherScreens.every(s => alreadyConnected.has(s.id))}
            className="flex items-center gap-1 text-[10px] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            style={{ color: 'var(--accent)' }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M4.5 0v10M0 5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Add
          </button>
        </div>

        {outgoing.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-5 text-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="1.5">
              <path d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
            <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-faint)' }}>
              No transitions yet.<br/>Click + Add or draw in Flow.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {outgoing.map(conn => {
              const target = screens.find(s => s.id === conn.toScreenId)
              if (!target) return null
              return (
                <TransitionRow key={conn.id} connId={conn.id} label={conn.label ?? ''} targetId={conn.toScreenId}
                  otherScreens={otherScreens}
                  onChangeTarget={toId => { removeConnection(conn.id); addConnection(activeScreen.id, toId, conn.label ?? '') }}
                  onChangeLabel={label => updateConnectionLabel(conn.id, label)}
                  onDelete={() => removeConnection(conn.id)}
                />
              )
            })}
          </div>
        )}

        {(() => {
          const incoming = connections.filter(c => c.toScreenId === activeScreen.id)
          if (incoming.length === 0) return null
          return (
            <div className="mt-1 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-faint)' }}>Incoming</p>
              {incoming.map(conn => {
                const from = screens.find(s => s.id === conn.fromScreenId)
                return (
                  <div key={conn.id} className="flex items-center gap-1.5 py-1">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="var(--text-faint)" strokeWidth="1.2">
                      <path d="M1 5h8M6 2l3 3-3 3"/>
                    </svg>
                    <span className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{from?.name ?? '?'}</span>
                    {conn.label && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded truncate" style={{ color: 'var(--accent)', background: 'var(--accent-soft)' }}>{conn.label}</span>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })()}
      </div>

      {/* Screen Metadata */}
      <div className="px-3 pb-3 flex flex-col gap-2" style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Metadata</span>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px]" style={{ color: 'var(--text-faint)' }}>Screen Type</label>
          <select
            value={activeScreen.screenType ?? ''}
            onChange={e => updateScreenMeta(activeScreen.id, { screenType: e.target.value as typeof activeScreen.screenType || undefined })}
            className="rounded px-1.5 py-1 text-[11px] outline-none"
            style={{ appearance: 'none', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            <option value="">— none —</option>
            <option value="info">info</option>
            <option value="select">select</option>
            <option value="input">input</option>
            <option value="loader">loader</option>
            <option value="result">result</option>
            <option value="form">form</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-[10px]" style={{ color: 'var(--text-faint)' }}>Allow Back</label>
          <button
            onClick={() => updateScreenMeta(activeScreen.id, { allowBack: !activeScreen.allowBack })}
            className="w-8 h-4 rounded-full transition-colors relative"
            style={{ background: activeScreen.allowBack ? 'var(--accent)' : 'var(--bg-hover)' }}
          >
            <div className="absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all" style={{ left: activeScreen.allowBack ? 18 : 2 }} />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px]" style={{ color: 'var(--text-faint)' }}>Funnel Value Key</label>
          <input type="text" value={activeScreen.funnelValueKey ?? ''} placeholder="e.g. age"
            onChange={e => updateScreenMeta(activeScreen.id, { funnelValueKey: e.target.value || undefined })}
            className="rounded px-2 py-1 text-[11px] outline-none"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-active)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px]" style={{ color: 'var(--text-faint)' }}>Form Type</label>
          <select
            value={activeScreen.formType ?? ''}
            onChange={e => updateScreenMeta(activeScreen.id, { formType: e.target.value as typeof activeScreen.formType || undefined })}
            className="rounded px-1.5 py-1 text-[11px] outline-none"
            style={{ appearance: 'none', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            <option value="">— none —</option>
            <option value="single-select">single-select</option>
            <option value="multi-select">multi-select</option>
            <option value="input">input</option>
            <option value="none">none</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px]" style={{ color: 'var(--text-faint)' }}>Analytics Event</label>
          <input type="text" value={activeScreen.analytics?.event_name ?? ''} placeholder="e.g. view_welcome"
            onChange={e => updateScreenMeta(activeScreen.id, { analytics: e.target.value ? { event_name: e.target.value } : undefined })}
            className="rounded px-2 py-1 text-[11px] outline-none"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-active)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </div>

        <div className="flex gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[10px]" style={{ color: 'var(--text-faint)' }}>Order</label>
            <input type="number" min={1} value={activeScreen.order ?? ''} placeholder="—"
              onChange={e => updateScreenMeta(activeScreen.id, { order: e.target.value ? Number(e.target.value) : undefined })}
              className="rounded px-2 py-1 text-[11px] outline-none w-full"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-active)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[10px]" style={{ color: 'var(--text-faint)' }}>Total</label>
            <input type="number" min={1} value={activeScreen.total ?? ''} placeholder="—"
              onChange={e => updateScreenMeta(activeScreen.id, { total: e.target.value ? Number(e.target.value) : undefined })}
              className="rounded px-2 py-1 text-[11px] outline-none w-full"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-active)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface TransitionRowProps {
  connId: string; label: string; targetId: string
  otherScreens: { id: string; name: string }[]
  onChangeTarget: (id: string) => void; onChangeLabel: (l: string) => void; onDelete: () => void
}
function TransitionRow({ label, targetId, otherScreens, onChangeTarget, onChangeLabel, onDelete }: TransitionRowProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg p-2" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-1.5">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="var(--accent)" strokeWidth="1.2">
          <path d="M1 5h8M6 2l3 3-3 3"/>
        </svg>
        <select value={targetId} onChange={e => onChangeTarget(e.target.value)}
          className="flex-1 rounded px-1.5 py-1 text-[11px] outline-none cursor-pointer transition-colors"
          style={{ appearance: 'none', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          {otherScreens.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button onClick={onDelete}
          className="w-5 h-5 flex items-center justify-center rounded transition-colors"
          style={{ color: 'var(--text-faint)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-faint)'; e.currentTarget.style.background = 'transparent' }}>
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M1 1l6 6M7 1L1 7"/>
          </svg>
        </button>
      </div>
      <input type="text" value={label} placeholder="Condition / label (optional)"
        onChange={e => onChangeLabel(e.target.value)}
        className="w-full rounded px-2 py-1 text-[11px] outline-none transition-colors"
        style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-active)')}
        onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
      />
    </div>
  )
}

function ComponentProperties() {
  const { selectedComponent, updateComponentProps } = useBuilder()
  if (!selectedComponent) return null
  const { type, props } = selectedComponent
  const update = (partial: Record<string, unknown>) => updateComponentProps(selectedComponent.id, partial)

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="h-9 flex items-center justify-between px-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>Properties</span>
        <span className="text-[10px] px-2 py-0.5 rounded font-mono" style={{ color: 'var(--accent)', background: 'var(--accent-soft)' }}>{type}</span>
      </div>

      <div className="p-3 flex flex-col gap-3">
        {['heading', 'subheading', 'paragraph', 'button', 'badge'].includes(type) && (
          <Field label="Text">
            <textarea rows={type === 'paragraph' ? 3 : 1} value={props.text || ''} onChange={e => update({ text: e.target.value })}
              className="w-full rounded-md px-2.5 py-1.5 text-xs resize-none outline-none transition-colors"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-active)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </Field>
        )}
        {['input', 'checkbox'].includes(type) && (
          <Field label="Label"><TInput value={props.label || ''} onChange={v => update({ label: v })} /></Field>
        )}
        {type === 'input' && (
          <Field label="Placeholder"><TInput value={props.placeholder || ''} onChange={v => update({ placeholder: v })} /></Field>
        )}
        {['heading', 'subheading', 'paragraph'].includes(type) && (
          <Field label="Align">
            <div className="flex gap-1">
              {(['left', 'center', 'right'] as const).map(a => (
                <button key={a} onClick={() => update({ align: a })}
                  className="flex-1 py-1 text-[10px] rounded transition-colors capitalize"
                  style={{ background: props.align === a ? 'var(--accent)' : 'var(--bg-input)', color: props.align === a ? 'white' : 'var(--text-muted)' }}>
                  {a}
                </button>
              ))}
            </div>
          </Field>
        )}
        {['heading', 'subheading', 'paragraph', 'list'].includes(type) && (
          <Field label={`Font Size: ${props.fontSize || 14}px`}>
            <input type="range" min={10} max={48} step={1} value={props.fontSize || 14}
              onChange={e => update({ fontSize: Number(e.target.value) })}
              className="w-full" style={{ accentColor: 'var(--accent)' }} />
          </Field>
        )}
        {['heading', 'subheading', 'paragraph', 'badge', 'button', 'list'].includes(type) && (
          <Field label="Text Color"><ColorPicker value={props.color || '#ffffff'} onChange={v => update({ color: v })} /></Field>
        )}
        {['button', 'badge'].includes(type) && (
          <Field label="Background"><ColorPicker value={props.bgColor || '#7c3aed'} onChange={v => update({ bgColor: v })} /></Field>
        )}
        {type === 'button' && (
          <Field label="Size">
            <div className="flex gap-1">
              {(['sm', 'md', 'lg'] as const).map(s => (
                <button key={s} onClick={() => update({ size: s })}
                  className="flex-1 py-1 text-[10px] rounded uppercase font-medium transition-colors"
                  style={{ background: props.size === s ? 'var(--accent)' : 'var(--bg-input)', color: props.size === s ? 'white' : 'var(--text-muted)' }}>
                  {s}
                </button>
              ))}
            </div>
          </Field>
        )}
        {type === 'spacer' && (
          <Field label={`Height: ${props.height || 24}px`}>
            <input type="range" min={4} max={120} step={4} value={props.height || 24}
              onChange={e => update({ height: Number(e.target.value) })}
              className="w-full" style={{ accentColor: 'var(--accent)' }} />
          </Field>
        )}
        {type === 'image' && (
          <>
            <Field label={`Height: ${props.height || 160}px`}>
              <input type="range" min={60} max={400} step={10} value={props.height || 160}
                onChange={e => update({ height: Number(e.target.value) })}
                className="w-full" style={{ accentColor: 'var(--accent)' }} />
            </Field>
            <Field label="Image URL"><TInput value={props.src || ''} onChange={v => update({ src: v })} placeholder="https://..." /></Field>
          </>
        )}
        {type === 'progress' && (
          <>
            <Field label="Label"><TInput value={props.label || 'Progress'} onChange={v => update({ label: v })} /></Field>
            <Field label={`Value: ${props.value || 0}%`}>
              <input type="range" min={0} max={100} step={1} value={props.value || 0}
                onChange={e => update({ value: Number(e.target.value) })}
                className="w-full" style={{ accentColor: 'var(--accent)' }} />
            </Field>
          </>
        )}
        {type === 'list' && (
          <Field label="Items (one per line)">
            <textarea rows={4} value={(props.items || []).join('\n')}
              onChange={e => update({ items: e.target.value.split('\n').filter(Boolean) })}
              className="w-full rounded-md px-2.5 py-1.5 text-xs resize-none outline-none transition-colors"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-active)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </Field>
        )}
        {type === 'section' && (
          <Field label="Section Label">
            <TInput value={props.title || ''} onChange={v => update({ title: v })} placeholder="e.g. Answer Options" />
          </Field>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>{label}</label>
      {children}
    </div>
  )
}

function TInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
      className="w-full rounded-md px-2.5 py-1.5 text-xs outline-none transition-colors"
      style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
      onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-active)')}
      onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    />
  )
}

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const presets = ['#ffffff', '#111118', '#e5e7eb', '#9ca3af', '#6b7280', '#7c3aed', '#a855f7', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" style={{ padding: 0 }} />
        <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{value}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {presets.map(c => (
          <button key={c} onClick={() => onChange(c)}
            style={{ backgroundColor: c, width: 20, height: 20, borderRadius: 4, border: value === c ? '2px solid var(--accent)' : '1.5px solid var(--border)', transition: 'transform 0.1s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ))}
      </div>
    </div>
  )
}
