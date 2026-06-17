import { NextRequest, NextResponse } from 'next/server'
import { GetLeagueWindowFixturesUseCase } from '@/application/use-cases/get-league-window-fixtures.use-case'
import { FootballApiService } from '@/infrastructure/services/football-api.service'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const league = Number(params.get('league'))
  const from = params.get('from') ?? ''
  const days = Number(params.get('days') ?? 3)

  if (!league || !DATE_RE.test(from)) {
    return NextResponse.json({ error: 'league e from (YYYY-MM-DD) obrigatórios' }, { status: 400 })
  }

  try {
    const fixtures = await new GetLeagueWindowFixturesUseCase(new FootballApiService()).execute(league, from, days)
    return NextResponse.json(fixtures)
  } catch (err) {
    console.error('[league-window]', err)
    return NextResponse.json({ error: 'Erro ao buscar jogos da liga' }, { status: 502 })
  }
}
