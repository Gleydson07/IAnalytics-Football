import type { PreferredLeagueRepository } from '@/domain/ports/preferred-league.repository.port'

export class RemovePreferredLeagueUseCase {
  constructor(private readonly repository: PreferredLeagueRepository) {}

  execute(leagueId: number): Promise<void> {
    return this.repository.remove(leagueId)
  }
}
