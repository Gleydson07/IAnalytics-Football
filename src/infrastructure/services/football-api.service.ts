import { FootballApiPort } from '@/domain/ports/football-api.port'
import type { Fixture } from '@/domain/entities/fixture'
import type { League } from '@/domain/entities/league'
import type { TeamStatistics } from '@/domain/entities/team-statistics'
import { cached, CACHE_TTL } from '@/infrastructure/cache/redis-cache'
import { translateCountry } from '@/lib/countries'
import { APP_TIMEZONE } from '@/lib/timezone'

const BASE = process.env.API_FOOTBALL_BASE_URL ?? 'https://v3.football.api-sports.io'
const HOST = new URL(BASE).host

async function externalFetch<T>(
  path: string,
  params: Record<string, string | number> = {},
): Promise<T> {
  const url = new URL(BASE + path)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))

  const res = await fetch(url.toString(), {
    headers: {
      'x-apisports-key': process.env.API_FOOTBALL_KEY ?? '',
      'x-apisports-host': HOST,
    },
    next: { revalidate: 300 },
  })

  if (!res.ok) throw new Error(`Football API HTTP ${res.status} em ${path}`)

  const body = await res.json()

  // A api-football responde 200 mesmo em falha, sinalizando via `errors`.
  const errors = body?.errors
  const hasError = Array.isArray(errors) ? errors.length > 0 : errors && Object.keys(errors).length > 0
  if (hasError) {
    throw new Error(`Football API erro em ${path}: ${JSON.stringify(errors)}`)
  }

  return body as T
}

interface LeagueResponseItem {
  league: { id: number; name: string; type: string; logo: string }
  country: { name: string; flag: string | null }
  seasons: Array<{ year: number; current: boolean }>
}

export class FootballApiService extends FootballApiPort {
  async getH2H(team1Id: number, team2Id: number, count = 10): Promise<Fixture[]> {
    const [a, b] = [team1Id, team2Id].sort((x, y) => x - y)
    return cached(`h2h:${a}:${b}:${count}`, CACHE_TTL.h2h, async () => {
      const data = await externalFetch<{ response: Fixture[] }>('/fixtures/headtohead', {
        h2h: `${a}-${b}`,
        last: count,
      })
      return data.response ?? []
    })
  }

  async getLeagues(current = true): Promise<League[]> {
    return cached(`leagues:${current ? 'current' : 'all'}`, CACHE_TTL.leagues, async () => {
      const data = await externalFetch<{ response: LeagueResponseItem[] }>(
        '/leagues',
        current ? { current: 'true' } : {},
      )
      return (data.response ?? []).map(toLeague)
    })
  }

  async getLeagueFixtures(leagueId: number, season: number): Promise<Fixture[]> {
    return cached(`fixtures:league:${leagueId}:${season}`, CACHE_TTL.leagueFixtures, async () => {
      const data = await externalFetch<{ response: Fixture[] }>('/fixtures', {
        league: leagueId,
        season,
      })
      return data.response ?? []
    })
  }

  async getFixturesByDate(date: string): Promise<Fixture[]> {
    return cached(`fixtures:date:${date}:${APP_TIMEZONE}`, CACHE_TTL.leagueFixtures, async () => {
      const data = await externalFetch<{ response: Fixture[] }>('/fixtures', { date, timezone: APP_TIMEZONE })
      return data.response ?? []
    })
  }

  async getTeamStatistics(teamId: number, leagueId: number, season: number): Promise<TeamStatistics> {
    return cached(`team:stats:${teamId}:${leagueId}:${season}`, CACHE_TTL.teamStatistics, async () => {
      const data = await externalFetch<{ response: TeamStatistics }>('/teams/statistics', {
        team: teamId,
        league: leagueId,
        season,
      })
      return data.response
    })
  }
}

function toLeague(item: LeagueResponseItem): League {
  const season = item.seasons.find(s => s.current)?.year ?? item.seasons.at(-1)?.year ?? 0
  return {
    id: item.league.id,
    name: item.league.name,
    type: item.league.type,
    logo: item.league.logo,
    country: translateCountry(item.country.name),
    flag: item.country.flag,
    season,
  }
}
