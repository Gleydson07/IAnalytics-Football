export type { Team } from '@/domain/entities/team'
export type { Fixture } from '@/domain/entities/fixture'
export type { League } from '@/domain/entities/league'
export type { PreferredLeague } from '@/domain/entities/preferred-league'
export type { FixtureComparison, TeamSide } from '@/domain/entities/comparison'

import type { Fixture } from '@/domain/entities/fixture'
import type { League } from '@/domain/entities/league'
import type { PreferredLeague } from '@/domain/entities/preferred-league'
import type { FixtureComparison } from '@/domain/entities/comparison'

export async function getLeagues(): Promise<League[]> {
  const res = await fetch('/api/leagues')
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export async function getLeagueWindowFixtures(leagueId: number, from: string, days = 1): Promise<Fixture[]> {
  const res = await fetch(`/api/league-window?league=${leagueId}&from=${from}&days=${days}`)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export async function getPreferredLeagues(): Promise<PreferredLeague[]> {
  const res = await fetch('/api/preferences')
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export async function addPreferredLeague(league: PreferredLeague): Promise<PreferredLeague> {
  const res = await fetch('/api/preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(league),
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export async function removePreferredLeague(leagueId: number): Promise<void> {
  const res = await fetch(`/api/preferences?leagueId=${leagueId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`API error ${res.status}`)
}

export async function reorderPreferredLeagues(leagueIds: number[]): Promise<void> {
  const res = await fetch('/api/preferences', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order: leagueIds }),
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
}

export async function getFixtureComparison(fixture: Fixture): Promise<FixtureComparison> {
  const res = await fetch('/api/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fixtureId: fixture.fixture.id,
      date: fixture.fixture.date,
      league: fixture.league.name,
      leagueId: fixture.league.id,
      season: fixture.league.season,
      homeId: fixture.teams.home.id,
      awayId: fixture.teams.away.id,
    }),
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export async function getFixtureAnalysis(comparison: FixtureComparison): Promise<string> {
  const res = await fetch('/api/fixture-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comparison),
  })
  if (!res.ok) throw new Error('Erro na análise IA')
  const data = await res.json()
  return data.analysis
}
