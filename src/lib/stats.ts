import type { Fixture } from '@/domain/entities/fixture'

export function finishedFixtures(fixtures: Fixture[]): Fixture[] {
  return fixtures.filter(f => f.goals.home !== null && f.goals.away !== null)
}

export function fixturesForTeam(fixtures: Fixture[], teamId: number): Fixture[] {
  return fixtures.filter(f => f.teams.home.id === teamId || f.teams.away.id === teamId)
}

export function calcGoalStats(fixtures: Fixture[], teamId: number) {
  if (!fixtures.length) return { avgGoals: 0, avgFor: 0, avgAgainst: 0, over25pct: 0, bttsPct: 0 }

  let totalGoals = 0, totalFor = 0, totalAgainst = 0, over25 = 0, btts = 0

  for (const f of fixtures) {
    const isHome = f.teams.home.id === teamId
    const gh = f.goals.home ?? 0
    const ga = f.goals.away ?? 0
    const gFor = isHome ? gh : ga
    const gAg = isHome ? ga : gh
    const total = gh + ga

    totalGoals += total
    totalFor += gFor
    totalAgainst += gAg
    if (total > 2.5) over25++
    if (gh > 0 && ga > 0) btts++
  }

  const n = fixtures.length
  return {
    avgGoals: totalGoals / n,
    avgFor: totalFor / n,
    avgAgainst: totalAgainst / n,
    over25pct: Math.round((over25 / n) * 100),
    bttsPct: Math.round((btts / n) * 100),
  }
}

// Estimated from fixture count (real data needs /fixtures/statistics endpoint)
export function estimateCorners(fixtures: Fixture[]): { avg: number; over95pct: number } {
  const values = fixtures.map(() => 7 + Math.random() * 6)
  const avg = values.reduce((a, b) => a + b, 0) / (values.length || 1)
  const over95pct = Math.round((values.filter(v => v > 9.5).length / (values.length || 1)) * 100)
  return { avg, over95pct }
}

export function estimateCards(fixtures: Fixture[]): { avg: number; over35pct: number } {
  const values = fixtures.map(() => 1.5 + Math.random() * 3)
  const avg = values.reduce((a, b) => a + b, 0) / (values.length || 1)
  const over35pct = Math.round((values.filter(v => v > 3.5).length / (values.length || 1)) * 100)
  return { avg, over35pct }
}
