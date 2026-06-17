export interface Fixture {
  fixture: { id: number; date: string; status: { short: string } }
  league: { id: number; name: string; logo: string; season: number; round?: string; country?: string }
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null }
    away: { id: number; name: string; logo: string; winner: boolean | null }
  }
  goals: { home: number | null; away: number | null }
  score: { halftime: { home: number | null; away: number | null } }
}
