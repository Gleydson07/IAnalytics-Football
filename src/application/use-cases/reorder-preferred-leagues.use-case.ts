import type { PreferredLeagueRepository } from '@/domain/ports/preferred-league.repository.port'

export class ReorderPreferredLeaguesUseCase {
  constructor(private readonly repository: PreferredLeagueRepository) {}

  execute(leagueIds: number[]): Promise<void> {
    if (!Array.isArray(leagueIds) || leagueIds.some(id => !Number.isInteger(id))) {
      throw new Error('Ordem inválida: esperado um array de leagueIds.')
    }
    return this.repository.reorder(leagueIds)
  }
}
