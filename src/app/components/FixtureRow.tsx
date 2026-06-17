'use client'
import type { Fixture } from '@/lib/football'

const FINISHED = new Set(['FT', 'AET', 'PEN'])
const LIVE = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE'])

export default function FixtureRow({ fixture: f, onClick }: { fixture: Fixture; onClick: () => void }) {
  const status = f.fixture.status.short
  const finished = FINISHED.has(status)
  const live = LIVE.has(status)
  const time = new Date(f.fixture.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
        padding: '11px 14px', borderBottom: '1px solid var(--border)', background: 'none', color: 'var(--text)', fontSize: 13,
      }}
    >
      <span style={{ minWidth: 56, fontSize: 12, color: live ? 'var(--green)' : 'var(--text-muted)', fontWeight: live ? 600 : 400 }}>
        {live ? '● AO VIVO' : finished ? 'Fim' : time}
      </span>
      <TeamCell logo={f.teams.home.logo} name={f.teams.home.name} bold={f.teams.home.winner === true} />
      <span style={{ minWidth: 46, textAlign: 'center', fontFamily: 'monospace', fontWeight: 600 }}>
        {finished || live ? `${f.goals.home ?? 0} – ${f.goals.away ?? 0}` : 'x'}
      </span>
      <TeamCell logo={f.teams.away.logo} name={f.teams.away.name} bold={f.teams.away.winner === true} align="right" />
    </button>
  )
}

function TeamCell({ logo, name, bold, align = 'left' }: { logo: string; name: string; bold: boolean; align?: 'left' | 'right' }) {
  const logoEl = logo ? <img src={logo} alt="" style={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }} /> : null
  const nameEl = (
    <span style={{ flex: 1, minWidth: 0, fontWeight: bold ? 700 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: align }}>
      {name}
    </span>
  )
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
      {align === 'right' ? <>{nameEl}{logoEl}</> : <>{logoEl}{nameEl}</>}
    </div>
  )
}
