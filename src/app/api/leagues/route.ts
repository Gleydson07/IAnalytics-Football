import { NextResponse } from 'next/server'
import { GetLeaguesUseCase } from '@/application/use-cases/get-leagues.use-case'
import { FootballApiService } from '@/infrastructure/services/football-api.service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const useCase = new GetLeaguesUseCase(new FootballApiService())
    const leagues = await useCase.execute()
    return NextResponse.json(leagues)
  } catch (err) {
    console.error('[leagues]', err)
    return NextResponse.json({ error: 'Erro ao buscar ligas' }, { status: 502 })
  }
}
