import type { FootballApiPort } from '@/domain/ports/football-api.port'
import type { Fixture } from '@/domain/entities/fixture'
import type { TeamStatistics } from '@/domain/entities/team-statistics'
import type { FixtureComparison, TeamSide } from '@/domain/entities/comparison'
import {
  calcGoalStats, estimateCorners, estimateCards,
  finishedFixtures, fixturesForTeam,
} from '@/lib/stats'

interface CompareInput {
  fixtureId: number
  date: string
  league: string
  leagueId: number
  season: number
  homeId: number
  awayId: number
}

export class CompareFixtureUseCase {
  constructor(private readonly footballApi: FootballApiPort) {}

  async execute(input: CompareInput): Promise<FixtureComparison> {
    const { homeId, awayId, leagueId, season } = input

    const [homeStats, awayStats, h2h, leagueFixtures] = await Promise.all([
      this.footballApi.getTeamStatistics(homeId, leagueId, season),
      this.footballApi.getTeamStatistics(awayId, leagueId, season),
      this.footballApi.getH2H(homeId, awayId),
      this.footballApi.getLeagueFixtures(leagueId, season),
    ])

    const finished = finishedFixtures(leagueFixtures)

    return {
      fixtureId: input.fixtureId,
      date: input.date,
      league: input.league,
      home: toSide(homeStats, finished, homeId),
      away: toSide(awayStats, finished, awayId),
      h2h: { summary: h2hSummary(h2h, homeId), fixtures: h2h.slice(0, 10) },
    }
  }
}

function toSide(stats: TeamStatistics, leagueFinished: Fixture[], teamId: number): TeamSide {
  const teamFixtures = fixturesForTeam(leagueFinished, teamId)
  const goals = calcGoalStats(teamFixtures, teamId)
  const corners = estimateCorners(teamFixtures)
  const cards = estimateCards(teamFixtures)

  return {
    id: stats.team.id,
    name: stats.team.name,
    logo: stats.team.logo,
    form: stats.form ?? '',
    played: stats.fixtures.played.total,
    goalsFor: Number(stats.goals.for.average.total) || goals.avgFor,
    goalsAgainst: Number(stats.goals.against.average.total) || goals.avgAgainst,
    over25pct: goals.over25pct,
    bttsPct: goals.bttsPct,
    wins: stats.fixtures.wins.total,
    draws: stats.fixtures.draws.total,
    loses: stats.fixtures.loses.total,
    cornersAvg: corners.avg,
    cardsAvg: cards.avg,
  }
}

function h2hSummary(fixtures: Fixture[], homeId: number): string {
  let wins = 0, draws = 0, losses = 0

  for (const f of fixtures) {
    const isHome = f.teams.home.id === homeId
    const hw = f.teams.home.winner
    const aw = f.teams.away.winner
    if (hw === null && aw === null) draws++
    else if ((isHome && hw) || (!isHome && aw)) wins++
    else losses++
  }

  return `${wins}V ${draws}E ${losses}D em ${fixtures.length} confrontos`
}
