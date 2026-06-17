import LeaguesManager from './LeaguesManager'
import { GetLeaguesUseCase } from '@/application/use-cases/get-leagues.use-case'
import { GetPreferredLeaguesUseCase } from '@/application/use-cases/get-preferred-leagues.use-case'
import { FootballApiService } from '@/infrastructure/services/football-api.service'
import { PrismaPreferredLeagueRepository } from '@/infrastructure/database/prisma/preferred-league.repository'
import type { League } from '@/domain/entities/league'
import type { PreferredLeague } from '@/domain/entities/preferred-league'

export const dynamic = 'force-dynamic'

export default async function MinhasLigasPage() {
  let leagues: League[] = []
  let preferred: PreferredLeague[] = []
  let loadError = ''

  try {
    leagues = await new GetLeaguesUseCase(new FootballApiService()).execute()
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Erro ao carregar ligas'
    console.error('[minhas-ligas] erro ao carregar ligas', err)
  }

  try {
    preferred = await new GetPreferredLeaguesUseCase(new PrismaPreferredLeagueRepository()).execute()
  } catch (err) {
    console.error('[minhas-ligas] erro ao carregar preferidas', err)
  }

  return <LeaguesManager leagues={leagues} initialPreferredIds={preferred.map(p => p.leagueId)} loadError={loadError} />
}
