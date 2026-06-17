import { NextRequest, NextResponse } from 'next/server'
import { AnalyzeFixtureUseCase } from '@/application/use-cases/analyze-fixture.use-case'
import { getAIAdapter } from '@/infrastructure/ai/ai-adapter.factory'

export async function POST(req: NextRequest) {
  try {
    const comparison = await req.json()
    if (!comparison?.home?.name || !comparison?.away?.name) {
      return NextResponse.json({ error: 'comparison inválido' }, { status: 400 })
    }

    const useCase = new AnalyzeFixtureUseCase(getAIAdapter())
    const analysis = await useCase.execute(comparison)
    return NextResponse.json({ analysis })
  } catch (err) {
    console.error('[fixture-analysis]', err)
    return NextResponse.json({ error: 'Erro ao gerar análise' }, { status: 500 })
  }
}
