import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registered, setRegistered] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setIsSubmitting(true)
    setError(null)

    const err = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password)

    if (err) {
      setError(err)
    } else if (mode === 'register') {
      setRegistered(true)
    }
    setIsSubmitting(false)
  }

  return (
    <div
      data-theme="dark"
      className="flex h-screen w-screen items-center justify-center"
      style={{
        background: 'var(--bg-app)',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <div
        className="flex flex-col gap-6 p-8 rounded-2xl w-full max-w-sm"
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--accent)' }}
          >
            <svg width="20" height="20" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="1" width="4" height="4" rx="0.5" fill="white" />
              <rect x="7" y="1" width="4" height="4" rx="0.5" fill="white" opacity="0.6" />
              <rect x="1" y="7" width="4" height="4" rx="0.5" fill="white" opacity="0.6" />
              <rect x="7" y="7" width="4" height="4" rx="0.5" fill="white" opacity="0.3" />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              FunnelBuilder
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
            </p>
          </div>
        </div>

        {registered ? (
          <div
            className="text-center text-sm rounded-lg p-4"
            style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}
          >
            Check your email to confirm your account, then sign in.
            <button
              className="block w-full mt-3 text-xs underline"
              style={{ color: 'var(--text-muted)' }}
              onClick={() => { setMode('login'); setRegistered(false) }}
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-faint)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-active)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-faint)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-active)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>

            {error && (
              <p
                className="text-xs rounded-lg px-3 py-2"
                style={{ background: 'rgba(220,38,38,0.1)', color: '#f87171', border: '1px solid rgba(220,38,38,0.2)' }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !email.trim() || !password.trim()}
              className="btn-accent py-2 rounded-lg text-sm font-semibold disabled:opacity-40"
            >
              {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        )}

        {!registered && (
          <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}
              className="font-medium underline"
              style={{ color: 'var(--accent)' }}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
