'use client'
import { useState } from 'react'
import type { Fixture, PreferredLeague } from '@/lib/football'
import { translateCountry } from '@/lib/countries'
import FixtureRow from './FixtureRow'

type Props = {
  fixtures: Fixture[]
  preferred: PreferredLeague[]
  loading: boolean
  onSelectFixture: (f: Fixture) => void
}

interface LeagueGroup {
  id: number
  name: string
  logo: string
  country: string
  fixtures: Fixture[]
}

function groupByLeague(fixtures: Fixture[], orderIndex: Map<number, number>): LeagueGroup[] {
  const map = new Map<number, LeagueGroup>()
  for (const f of fixtures) {
    let g = map.get(f.league.id)
    if (!g) {
      g = { id: f.league.id, name: f.league.name, logo: f.league.logo, country: f.league.country ?? '', fixtures: [] }
      map.set(f.league.id, g)
    }
    g.fixtures.push(f)
  }
  const rank = (id: number) => orderIndex.get(id) ?? Number.MAX_SAFE_INTEGER
  return Array.from(map.values())
    .sort((a, b) => rank(a.id) - rank(b.id) || a.country.localeCompare(b.country) || a.name.localeCompare(b.name))
}

export default function DayFixtures({ fixtures, preferred, loading, onSelectFixture }: Props) {
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set())
  const preferredIds = new Set(preferred.map(p => p.leagueId))
  const orderIndex = new Map(preferred.map((p, i) => [p.leagueId, i]))

  const toggle = (id: number) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) {
    return <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '32px 0', textAlign: 'center' }}>Carregando jogos...</div>
  }

  const filtered = fixtures.filter(f => preferredIds.size === 0 || preferredIds.has(f.league.id))

  if (!filtered.length) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
        <div style={{ fontSize: 14 }}>Nenhum jogo nesta data para as ligas selecionadas.</div>
      </div>
    )
  }

  return (
    <div>
      {groupByLeague(filtered, orderIndex).map(group => {
        const open = !collapsed.has(group.id)
        const title = group.country ? `${translateCountry(group.country)} — ${group.name}` : group.name
        return (
          <section key={group.id} style={{ marginBottom: 14 }}>
            <button onClick={() => toggle(group.id)} style={header}>
              <span style={{ width: 16, fontSize: 15, color: 'var(--text-muted)' }}>{open ? '▾' : '▸'}</span>
              {group.logo && <img src={group.logo} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />}
              <span style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: 600 }}>{title}</span>
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{group.fixtures.length}</span>
            </button>
            {open && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginTop: 8 }}>
                {group.fixtures.map(f => <FixtureRow key={f.fixture.id} fixture={f} onClick={() => onSelectFixture(f)} />)}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

const header: React.CSSProperties = {
  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
  padding: '8px 6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)',
}
