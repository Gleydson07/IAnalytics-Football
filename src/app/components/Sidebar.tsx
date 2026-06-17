'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { PreferredLeague } from '@/lib/football'

type Props = {
  preferred: PreferredLeague[]
  selectedLeagueId: number | null
  onSelectLeague: (id: number | null) => void
}

export default function Sidebar({ preferred, selectedLeagueId, onSelectLeague }: Props) {
  // Apenas o primeiro país abre por padrão; os demais começam fechados.
  const [openCountries, setOpenCountries] = useState<Set<string>>(() => {
    const groups = groupByCountry(preferred)
    return new Set(groups.length ? [groups[0].country] : [])
  })

  const toggleCountry = (country: string) => {
    setOpenCountries(prev => {
      const next = new Set(prev)
      if (next.has(country)) next.delete(country)
      else next.add(country)
      return next
    })
  }

  return (
    <aside style={{
      width: 248, flexShrink: 0, borderRight: '1px solid var(--border)',
      height: '100vh', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column',
      background: 'var(--surface)',
    }}>
      <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>Football Scout</div>
        <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Beta</div>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        <SidebarItem label="Todos os jogos" active={selectedLeagueId === null} onClick={() => onSelectLeague(null)} />

        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 8px 6px' }}>
          <span style={{ flex: 1, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Minhas ligas
          </span>
          <Link
            href="/minhas-ligas"
            title="Configurar minhas ligas"
            aria-label="Configurar minhas ligas"
            style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1, padding: 2, textDecoration: 'none' }}
          >
            ⚙
          </Link>
        </div>

        {preferred.length === 0
          ? <div style={{ padding: '4px 8px', fontSize: 12, color: 'var(--text-dim)' }}>Nenhuma liga fixada. Configure no ⚙ acima.</div>
          : groupByCountry(preferred).map(group => {
            const open = openCountries.has(group.country)
            return (
              <div key={group.country} style={{ marginBottom: 4 }}>
                <button onClick={() => toggleCountry(group.country)} style={countryHeader}>
                  <span style={{ width: 14, fontSize: 14, color: 'var(--text-muted)' }}>{open ? '▾' : '▸'}</span>
                  <span style={{ flex: 1, textAlign: 'left', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {group.country}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{group.leagues.length}</span>
                </button>
                {open && group.leagues.map(l => (
                  <SidebarItem
                    key={l.leagueId}
                    label={l.name}
                    logo={l.logo}
                    active={selectedLeagueId === l.leagueId}
                    onClick={() => onSelectLeague(l.leagueId)}
                  />
                ))}
              </div>
            )
          })}
      </nav>
    </aside>
  )
}

const countryHeader: React.CSSProperties = {
  width: '100%', display: 'flex', alignItems: 'center', gap: 6,
  padding: '6px 8px', borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer',
}

interface CountryGroup {
  country: string
  leagues: PreferredLeague[]
}

function groupByCountry(leagues: PreferredLeague[]): CountryGroup[] {
  const map = new Map<string, PreferredLeague[]>()
  for (const l of leagues) {
    const arr = map.get(l.country)
    if (arr) arr.push(l)
    else map.set(l.country, [l])
  }
  return Array.from(map.entries())
    .map(([country, ls]) => ({ country, leagues: ls }))
    .sort((a, b) => a.country.localeCompare(b.country))
}

function SidebarItem({ label, logo, active, onClick }: {
  label: string; logo?: string | null; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left',
        padding: '8px 10px', borderRadius: 8, marginBottom: 2, fontSize: 13,
        background: active ? 'var(--surface2)' : 'none',
        border: `1px solid ${active ? 'var(--green)' : 'transparent'}`,
        color: active ? 'var(--text)' : 'var(--text-muted)',
      }}
    >
      {logo && <img src={logo} alt="" style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }} />}
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  )
}
