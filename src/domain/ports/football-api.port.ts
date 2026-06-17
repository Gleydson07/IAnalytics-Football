import type { Fixture } from '../entities/fixture'
import type { League } from '../entities/league'
import type { TeamStatistics } from '../entities/team-statistics'

export abstract class FootballApiPort {
  abstract getH2H(team1Id: number, team2Id: number, count?: number): Promise<Fixture[]>

  /** Catálogo de ligas (filtra por temporada atual quando `current`). */
  abstract getLeagues(current?: boolean): Promise<League[]>
  /** Calendário completo de uma liga/temporada (passados + futuros). */
  abstract getLeagueFixtures(leagueId: number, season: number): Promise<Fixture[]>
  /** Todos os jogos de um dia (todas as ligas cobertas). `date` em YYYY-MM-DD. */
  abstract getFixturesByDate(date: string): Promise<Fixture[]>
  /** Estatísticas agregadas do time numa liga/temporada. */
  abstract getTeamStatistics(teamId: number, leagueId: number, season: number): Promise<TeamStatistics>
}
