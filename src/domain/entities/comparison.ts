import type { Fixture } from './fixture'

/** Lado (time) do confronto, já achatado para exibição e prompt. */
export interface TeamSide {
  id: number
  name: string
  logo: string
  form: string
  played: number
  goalsFor: number
  goalsAgainst: number
  over25pct: number
  bttsPct: number
  wins: number
  draws: number
  loses: number
  cornersAvg: number
  cardsAvg: number
}

export interface FixtureComparison {
  fixtureId: number
  date: string
  league: string
  home: TeamSide
  away: TeamSide
  h2h: { summary: string; fixtures: Fixture[] }
}
