import { useApp, AppProvider } from '@/context/AppContext'
import { Dashboard } from '@/components/Dashboard'
import { BuilderView } from '@/components/BuilderView'

function AppRouter() {
  const { page, activeFunnelId, funnels, theme } = useApp()

  if (page === 'dashboard' || !activeFunnelId) {
    return <Dashboard />
  }

  const funnel = funnels.find(f => f.id === activeFunnelId)
  if (!funnel) return <Dashboard />

  return <BuilderView key={activeFunnelId} funnel={funnel} theme={theme} />
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  )
}
