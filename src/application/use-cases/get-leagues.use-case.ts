import type { FootballApiPort } from '@/domain/ports/football-api.port'
import type { League } from '@/domain/entities/league'

export class GetLeaguesUseCase {
  constructor(private readonly footballApi: FootballApiPort) {}

  async execute(): Promise<League[]> {
    const leagues = await this.footballApi.getLeagues(true)

    // api-football marca como "current" a última temporada disponível, que para
    // competições extintas pode ser bem antiga (ex.: 2014). Mantemos só as atuais.
    // Temporadas são rotuladas pelo ano de início (Europa 2025/26 → 2025), então o
    // piso é o ano anterior ao corrente.
    const minSeason = new Date().getFullYear() - 1

    return leagues
      .filter(l => l.season >= minSeason)
      .sort((a, b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name))
  }
}
