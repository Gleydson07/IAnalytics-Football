/**
 * Subconjunto relevante de `/teams/statistics` (api-football v3).
 * Mantém apenas o que a análise de mercados consome.
 */
export interface TeamStatistics {
  team: { id: number; name: string; logo: string }
  league: { id: number; name: string; season: number }
  form: string
  fixtures: {
    played: { home: number; away: number; total: number }
    wins: { home: number; away: number; total: number }
    draws: { home: number; away: number; total: number }
    loses: { home: number; away: number; total: number }
  }
  goals: {
    for: { total: { home: number; away: number; total: number }; average: { home: string; away: string; total: string } }
    against: { total: { home: number; away: number; total: number }; average: { home: string; away: string; total: string } }
  }
  clean_sheet: { home: number; away: number; total: number }
  failed_to_score: { home: number; away: number; total: number }
}
