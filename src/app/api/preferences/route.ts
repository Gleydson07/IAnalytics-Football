import { NextRequest, NextResponse } from 'next/server'
import { GetPreferredLeaguesUseCase } from '@/application/use-cases/get-preferred-leagues.use-case'
import { AddPreferredLeagueUseCase } from '@/application/use-cases/add-preferred-league.use-case'
import { RemovePreferredLeagueUseCase } from '@/application/use-cases/remove-preferred-league.use-case'
import { PrismaPreferredLeagueRepository } from '@/infrastructure/database/prisma/preferred-league.repository'

export const dynamic = 'force-dynamic'

const repository = new PrismaPreferredLeagueRepository()

export async function GET() {
  try {
    const leagues = await new GetPreferredLeaguesUseCase(repository).execute()
    return NextResponse.json(leagues)
  } catch (err) {
    console.error('[preferences:GET]', err)
    return NextResponse.json({ error: 'Erro ao listar ligas preferidas' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const league = await new AddPreferredLeagueUseCase(repository).execute(body)
    return NextResponse.json(league, { status: 201 })
  } catch (err) {
    console.error('[preferences:POST]', err)
    return NextResponse.json({ error: 'Erro ao adicionar liga' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  const leagueId = Number(req.nextUrl.searchParams.get('leagueId'))
  if (!leagueId) {
    return NextResponse.json({ error: 'leagueId obrigatório' }, { status: 400 })
  }

  try {
    await new RemovePreferredLeagueUseCase(repository).execute(leagueId)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('[preferences:DELETE]', err)
    return NextResponse.json({ error: 'Erro ao remover liga' }, { status: 500 })
  }
}
