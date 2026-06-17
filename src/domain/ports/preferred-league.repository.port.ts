import type { PreferredLeague } from '../entities/preferred-league'

export abstract class PreferredLeagueRepository {
  abstract findAll(): Promise<PreferredLeague[]>
  abstract add(league: PreferredLeague): Promise<PreferredLeague>
  abstract remove(leagueId: number): Promise<void>
}
