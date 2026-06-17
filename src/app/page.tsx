import Dashboard from './components/Dashboard'
import { GetDayFixturesUseCase } from '@/application/use-cases/get-day-fixtures.use-case'
import { FootballApiService } from '@/infrastructure/services/football-api.service'
import { todayInAppTz } from '@/lib/timezone'
import type { Fixture } from '@/domain/entities/fixture'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const today = todayInAppTz()

  let fixtures: Fixture[] = []
  let loadError = ''

  try {
    fixtures = await new GetDayFixturesUseCase(new FootballApiService()).execute(today)
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Erro ao carregar jogos do dia'
    console.error('[page] erro ao carregar jogos do dia', err)
  }

  return <Dashboard initialDate={today} initialFixtures={fixtures} loadError={loadError} />
}
