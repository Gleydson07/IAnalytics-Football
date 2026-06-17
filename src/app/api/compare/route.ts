import { NextRequest, NextResponse } from 'next/server'
import { CompareFixtureUseCase } from '@/application/use-cases/compare-fixture.use-case'
import { FootballApiService } from '@/infrastructure/services/football-api.service'

export async function POST(req: NextRequest) {
  try {
    const input = await req.json()
    if (!input.homeId || !input.awayId || !input.leagueId || !input.season) {
      return NextResponse.json({ error: 'homeId, awayId, leagueId e season obrigatórios' }, { status: 400 })
    }

    const useCase = new CompareFixtureUseCase(new FootballApiService())
    const comparison = await useCase.execute(input)
    return NextResponse.json(comparison)
  } catch (err) {
    console.error('[compare]', err)
    return NextResponse.json({ error: 'Erro ao comparar times' }, { status: 502 })
  }
}
