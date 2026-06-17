import type { PreferredLeague } from '../entities/preferred-league'

export abstract class PreferredLeagueRepository {
  abstract findAll(): Promise<PreferredLeague[]>
  abstract add(league: PreferredLeague): Promise<PreferredLeague>
  abstract remove(leagueId: number): Promise<void>
  /** Define a ordem das ligas conforme a sequência de leagueIds. */
  abstract reorder(leagueIds: number[]): Promise<void>
}
