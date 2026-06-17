import type { PreferredLeagueRepository } from '@/domain/ports/preferred-league.repository.port'
import type { PreferredLeague } from '@/domain/entities/preferred-league'

export class AddPreferredLeagueUseCase {
  constructor(private readonly repository: PreferredLeagueRepository) {}

  execute(league: PreferredLeague): Promise<PreferredLeague> {
    if (!league.leagueId || !league.name) {
      throw new Error('Liga inválida: leagueId e name são obrigatórios.')
    }
    return this.repository.add(league)
  }
}
