import type { FootballApiPort } from '@/domain/ports/football-api.port'
import type { Fixture } from '@/domain/entities/fixture'

function addDays(date: string, n: number): string {
  const d = new Date(date + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export class GetLeagueWindowFixturesUseCase {
  constructor(private readonly footballApi: FootballApiPort) {}

  /**
   * Jogos da liga de `from` até `from + days` (inclusive), por dia.
   * Usa consultas por data (únicas no plano Free que veem a temporada atual);
   * cada data é cacheada e reaproveitada por qualquer liga.
   */
  async execute(leagueId: number, from: string, days = 1): Promise<Fixture[]> {
    const dates = Array.from({ length: days + 1 }, (_, i) => addDays(from, i))

    // Tolerante: datas fora do alcance do plano (Free libera ~ontem→amanhã)
    // apenas não contribuem, em vez de derrubar a agenda inteira.
    const perDay = await Promise.allSettled(dates.map(d => this.footballApi.getFixturesByDate(d)))
    const all = perDay.flatMap(r => (r.status === 'fulfilled' ? r.value : []))

    return all
      .filter(f => f.league.id === leagueId)
      .sort((a, b) => a.fixture.date.localeCompare(b.fixture.date))
  }
}
