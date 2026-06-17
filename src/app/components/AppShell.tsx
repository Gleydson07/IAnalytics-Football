'use client'
import { createContext, useContext, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import { getLeagueWindowFixtures, type Fixture, type PreferredLeague } from '@/lib/football'
import { todayInAppTz } from '@/lib/timezone'

interface AppShellState {
  preferred: PreferredLeague[]
  selectedLeagueId: number | null
  windowFixtures: Fixture[]
  loadingWindow: boolean
}

const AppShellContext = createContext<AppShellState>({
  preferred: [], selectedLeagueId: null, windowFixtures: [], loadingWindow: false,
})

export const useAppShell = () => useContext(AppShellContext)

const WINDOW_DAYS = 1 // plano Free só libera ~ontem→amanhã

export default function AppShell({ preferred, children }: { preferred: PreferredLeague[]; children: ReactNode }) {
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null)
  const [windowFixtures, setWindowFixtures] = useState<Fixture[]>([])
  const [loadingWindow, setLoadingWindow] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const selectLeague = async (id: number | null) => {
    setSelectedLeagueId(id)
    if (pathname !== '/') router.push('/')

    if (id === null) {
      setWindowFixtures([])
      return
    }

    setLoadingWindow(true)
    try {
      setWindowFixtures(await getLeagueWindowFixtures(id, todayInAppTz(), WINDOW_DAYS))
    } catch (err) {
      console.error(err)
      setWindowFixtures([])
    } finally {
      setLoadingWindow(false)
    }
  }

  return (
    <AppShellContext.Provider value={{ preferred, selectedLeagueId, windowFixtures, loadingWindow }}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar preferred={preferred} selectedLeagueId={selectedLeagueId} onSelectLeague={selectLeague} />
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      </div>
    </AppShellContext.Provider>
  )
}
