import type { AIProviderPort } from '@/domain/ports/ai-provider.port'
import type { FixtureComparison, TeamSide } from '@/domain/entities/comparison'

export class AnalyzeFixtureUseCase {
  constructor(private readonly aiProvider: AIProviderPort) {}

  async execute(comparison: FixtureComparison): Promise<string> {
    return this.aiProvider.generate(buildPrompt(comparison))
  }
}

function teamBlock(side: TeamSide): string {
  return `${side.name} (forma: ${side.form || 'n/d'})
  - Jogos: ${side.played} | V ${side.wins} E ${side.draws} D ${side.loses}
  - Gols marcados/jogo: ${side.goalsFor.toFixed(2)} | sofridos/jogo: ${side.goalsAgainst.toFixed(2)}
  - Over 2.5: ${side.over25pct}% | BTTS: ${side.bttsPct}%
  - Escanteios/jogo (est.): ${side.cornersAvg.toFixed(1)} | Cartões/jogo (est.): ${side.cardsAvg.toFixed(1)}`
}

function buildPrompt(c: FixtureComparison): string {
  return `Você é um analista especialista em apostas esportivas. Analise o confronto e dê recomendações objetivas.

JOGO: ${c.home.name} (mandante) x ${c.away.name} (visitante) — ${c.league}
CONFRONTO DIRETO: ${c.h2h.summary} (do ponto de vista do mandante)

MANDANTE — ${teamBlock(c.home)}

VISITANTE — ${teamBlock(c.away)}

Responda em português. Para cada mercado abaixo, dê:
1. Recomendação clara (ex: → APOSTAR em Over 2.5)
2. Confiança: ★☆☆☆☆ a ★★★★★
3. Justificativa em 1 linha comparando os dois times

Mercados a analisar: Resultado (1X2), Over/Under 2.5 gols, BTTS, Escanteios Over 9.5, Cartões Over 3.5

Finalize com:
──────────────
PICK PRINCIPAL: [mercado mais confiante]
JUSTIFICATIVA: [1 frase objetiva]

Seja direto. Máximo 320 palavras.`
}
