'use client'
import type { Fixture } from '@/lib/football'
import FixtureRow from './FixtureRow'

type Props = {
  fixtures: Fixture[]
  loading: boolean
  onSelectFixture: (f: Fixture) => void
}

interface DayGroup {
  date: string
  fixtures: Fixture[]
}

function groupByDay(fixtures: Fixture[]): DayGroup[] {
  const map = new Map<string, Fixture[]>()
  for (const f of fixtures) {
    const day = f.fixture.date.slice(0, 10)
    const arr = map.get(day)
    if (arr) arr.push(f)
    else map.set(day, [f])
  }
  return Array.from(map.entries())
    .map(([date, fx]) => ({ date, fixtures: fx }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function dayLabel(date: string): string {
  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
}

export default function LeagueAgenda({ fixtures, loading, onSelectFixture }: Props) {
  if (loading) {
    return <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '32px 0', textAlign: 'center' }}>Carregando jogos...</div>
  }

  if (!fixtures.length) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
        <div style={{ fontSize: 14 }}>Nenhum jogo nos próximos dias para esta liga.</div>
      </div>
    )
  }

  return (
    <div>
      {groupByDay(fixtures).map(group => (
        <section key={group.date} style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8, textTransform: 'capitalize' }}>
            {dayLabel(group.date)}
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            {group.fixtures.map(f => <FixtureRow key={f.fixture.id} fixture={f} onClick={() => onSelectFixture(f)} />)}
          </div>
        </section>
      ))}
    </div>
  )
}
