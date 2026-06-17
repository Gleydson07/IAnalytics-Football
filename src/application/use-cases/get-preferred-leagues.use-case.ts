import type { PreferredLeagueRepository } from '@/domain/ports/preferred-league.repository.port'
import type { PreferredLeague } from '@/domain/entities/preferred-league'
import { translateCountry } from '@/lib/countries'

export class GetPreferredLeaguesUseCase {
  constructor(private readonly repository: PreferredLeagueRepository) {}

  async execute(): Promise<PreferredLeague[]> {
    // Normaliza o país (registros antigos podem ter sido salvos em inglês).
    const leagues = await this.repository.findAll()
    return leagues.map(l => ({ ...l, country: translateCountry(l.country) }))
  }
}
