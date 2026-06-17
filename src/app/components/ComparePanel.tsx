'use client'
import type { FixtureComparison, TeamSide } from '@/lib/football'

type Props = {
  comparison: FixtureComparison
  aiText: string
  aiLoading: boolean
  onAnalyze: () => void
}

const GREEN = 'var(--green)'
const TEXT = 'var(--text)'

export default function ComparePanel({ comparison: c, aiText, aiLoading, onAnalyze }: Props) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
        <TeamHead side={c.home} align="left" tag="Mandante" />
        <span style={{ fontSize: 13, color: 'var(--text-dim)', padding: '0 12px' }}>x</span>
        <TeamHead side={c.away} align="right" tag="Visitante" />
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, fontFamily: 'monospace', fontSize: 14 }}>
          <span>{c.home.form || '—'}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Forma</span>
          <span>{c.away.form || '—'}</span>
        </div>

        <MetricRow label="Jogos" home={c.home.played} away={c.away.played} />
        <MetricRow label="Gols feitos/jogo" home={c.home.goalsFor} away={c.away.goalsFor} digits={2} />
        <MetricRow label="Gols sofridos/jogo" home={c.home.goalsAgainst} away={c.away.goalsAgainst} betterIsHigh={false} digits={2} />
        <MetricRow label="Over 2.5" home={c.home.over25pct} away={c.away.over25pct} suffix="%" />
        <MetricRow label="BTTS" home={c.home.bttsPct} away={c.away.bttsPct} suffix="%" />
        <MetricRow label="Escanteios/jogo*" home={c.home.cornersAvg} away={c.away.cornersAvg} digits={1} />
        <MetricRow label="Cartões/jogo*" home={c.home.cardsAvg} away={c.away.cardsAvg} betterIsHigh={false} digits={1} />

        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
          Confronto direto: {c.h2h.summary}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>
          * Escanteios e cartões são estimativas.
        </div>

        <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16 }}>
          {!aiText && !aiLoading && (
            <button onClick={onAnalyze} style={{ background: GREEN, color: '#000', borderRadius: 8, padding: '10px 20px', fontWeight: 600, fontSize: 14 }}>
              ✦ Gerar análise IA
            </button>
          )}
          {aiLoading && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Gerando análise...</div>}
          {aiText && (
            <>
              <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '16px 18px', fontSize: 14, lineHeight: 1.75, whiteSpace: 'pre-wrap', border: '1px solid var(--border)', color: TEXT }}>
                {aiText}
              </div>
              <button onClick={onAnalyze} style={{ marginTop: 12, background: 'none', color: 'var(--text-muted)', fontSize: 12, border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px' }}>
                Regenerar
              </button>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8 }}>Análise informativa. Aposte com responsabilidade.</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricRow({ label, home, away, betterIsHigh = true, suffix = '', digits = 0 }: {
  label: string; home: number; away: number; betterIsHigh?: boolean; suffix?: string; digits?: number
}) {
  const tie = home === away
  const homeBetter = !tie && (betterIsHigh ? home > away : home < away)
  const awayBetter = !tie && (betterIsHigh ? away > home : away < home)
  const fmt = (n: number) => n.toFixed(digits) + suffix

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ textAlign: 'left', fontFamily: 'monospace', fontWeight: homeBetter ? 700 : 400, color: homeBetter ? GREEN : TEXT }}>{fmt(home)}</span>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 12px', textAlign: 'center' }}>{label}</span>
      <span style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: awayBetter ? 700 : 400, color: awayBetter ? GREEN : TEXT }}>{fmt(away)}</span>
    </div>
  )
}

function TeamHead({ side, align, tag }: { side: TeamSide; align: 'left' | 'right'; tag: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: align === 'left' ? 'flex-start' : 'flex-end' }}>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tag}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: align === 'left' ? 'row' : 'row-reverse' }}>
        {side.logo && <img src={side.logo} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />}
        <span style={{ fontWeight: 700, fontSize: 15 }}>{side.name}</span>
      </div>
    </div>
  )
}
