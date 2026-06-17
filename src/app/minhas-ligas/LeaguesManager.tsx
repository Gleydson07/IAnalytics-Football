'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { addPreferredLeague, removePreferredLeague, type League } from '@/lib/football'

type Props = {
  leagues: League[]
  initialPreferredIds: number[]
  loadError?: string
}

interface CountryGroup {
  country: string
  leagues: League[]
}

function groupByCountry(leagues: League[]): CountryGroup[] {
  const map = new Map<string, League[]>()
  for (const l of leagues) {
    const arr = map.get(l.country)
    if (arr) arr.push(l)
    else map.set(l.country, [l])
  }
  return Array.from(map.entries())
    .map(([country, ls]) => ({ country, leagues: ls }))
    .sort((a, b) => a.country.localeCompare(b.country))
}

export default function LeaguesManager({ leagues, initialPreferredIds, loadError }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [openCountries, setOpenCountries] = useState<Set<string>>(new Set())
  const [preferredIds, setPreferredIds] = useState<Set<number>>(new Set(initialPreferredIds))
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())

  const q = query.trim().toLowerCase()
  const groups = useMemo(() => {
    const base = q
      ? leagues.filter(l => l.name.toLowerCase().includes(q) || l.country.toLowerCase().includes(q))
      : leagues
    return groupByCountry(base)
  }, [leagues, q])

  const toggleCountry = (country: string) => {
    setOpenCountries(prev => {
      const next = new Set(prev)
      if (next.has(country)) next.delete(country)
      else next.add(country)
      return next
    })
  }

  const toggleLeague = async (league: League, enabled: boolean) => {
    setPendingIds(prev => new Set(prev).add(league.id))
    try {
      if (enabled) {
        await addPreferredLeague({ leagueId: league.id, name: league.name, country: league.country, season: league.season, logo: league.logo })
        setPreferredIds(prev => new Set(prev).add(league.id))
      } else {
        await removePreferredLeague(league.id)
        setPreferredIds(prev => { const n = new Set(prev); n.delete(league.id); return n })
      }
      router.refresh() // atualiza a sidebar persistente no layout
    } catch (err) {
      console.error(err)
    } finally {
      setPendingIds(prev => { const n = new Set(prev); n.delete(league.id); return n })
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px', width: '100%' }}>
      <Link href="/" style={{ fontSize: 13, color: 'var(--text-muted)' }}>← Voltar aos jogos</Link>

      <div style={{ margin: '14px 0 18px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Minhas ligas</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          {preferredIds.size} fixadas · escolha por país as ligas do menu lateral (apenas temporadas atuais)
        </p>
      </div>

      {loadError && (
        <div style={{ border: '1px solid var(--red)', borderRadius: 10, padding: 14, marginBottom: 16, color: 'var(--red)', fontFamily: 'monospace', fontSize: 12 }}>{loadError}</div>
      )}

      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Buscar país ou liga..."
        style={{ width: '100%', background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 14, marginBottom: 12 }}
      />

      {groups.length === 0 && !loadError && (
        <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 13 }}>Nenhuma liga encontrada.</div>
      )}

      {groups.map(group => {
        const open = q !== '' || openCountries.has(group.country)
        const fixed = group.leagues.filter(l => preferredIds.has(l.id)).length
        return (
          <div key={group.country} style={{ marginBottom: 4 }}>
            <button onClick={() => toggleCountry(group.country)} style={countryHeader}>
              <span style={{ width: 16, color: 'var(--text-muted)', fontSize: 15 }}>{open ? '▾' : '▸'}</span>
              <span style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: 600 }}>{group.country}</span>
              {fixed > 0 && <span style={{ fontSize: 11, color: 'var(--green)' }}>{fixed} ✓</span>}
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{group.leagues.length}</span>
            </button>

            {open && group.leagues.map(l => {
              const enabled = preferredIds.has(l.id)
              const pending = pendingIds.has(l.id)
              return (
                <button
                  key={l.id}
                  onClick={() => { if (!pending) toggleLeague(l, !enabled) }}
                  disabled={pending}
                  style={{ ...leagueRow, opacity: pending ? 0.5 : 1, cursor: pending ? 'wait' : 'pointer' }}
                >
                  <BallIcon active={enabled} />
                  {l.logo && <img src={l.logo} alt="" style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }} />}
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: enabled ? 'var(--text)' : 'var(--text-muted)' }}>{l.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', flexShrink: 0 }}>{l.season}</span>
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

const countryHeader: React.CSSProperties = { width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 8px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }
const leagueRow: React.CSSProperties = { width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px 8px 26px', borderRadius: 8, background: 'none', border: 'none', color: 'var(--text)' }

function BallIcon({ active }: { active: boolean }) {
  const color = active ? '#F4C430' : 'var(--text-dim)'
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="9" />
      <polygon points="12,7.2 15,9.4 13.9,13 10.1,13 9,9.4" fill={active ? '#F4C430' : 'none'} />
      <path d="M12 3 V7.2 M4.3 9.6 L9 9.4 M6.9 18.2 L10.1 13 M17.1 18.2 L13.9 13 M19.7 9.6 L15 9.4" />
    </svg>
  )
}
