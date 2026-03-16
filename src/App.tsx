import { useApp, AppProvider } from '@/context/AppContext'
import { useAuth, AuthProvider } from '@/context/AuthContext'
import { Dashboard } from '@/components/Dashboard'
import { BuilderView } from '@/components/BuilderView'
import { AuthPage } from '@/components/AuthPage'

function AppRouter() {
  const { page, activeFunnelId, funnels } = useApp()

  if (page === 'dashboard' || !activeFunnelId) {
    return <Dashboard />
  }

  const funnel = funnels.find(f => f.id === activeFunnelId)
  if (!funnel) return <Dashboard />

  return <BuilderView key={activeFunnelId} funnel={funnel} />
}

function AppGate() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div
        data-theme="dark"
        className="flex h-screen w-screen items-center justify-center"
        style={{ background: 'var(--bg-app)' }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: '2px solid var(--border)',
            borderTopColor: 'var(--accent)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!user) return <AuthPage />

  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  )
}
