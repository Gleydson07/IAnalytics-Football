'use client'
import { useEffect, useState } from 'react'
import { useAppShell } from './AppShell'
import DayFixtures from './DayFixtures'
import LeagueAgenda from './LeagueAgenda'
import ComparePanel from './ComparePanel'
import {
  getFixtureComparison, getFixtureAnalysis,
  type Fixture, type FixtureComparison,
} from '@/lib/football'

type Props = {
  initialDate: string
  initialFixtures: Fixture[]
  loadError?: string
}

function dateLabel(date: string): string {
  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
}

export default function Dashboard({ initialDate, initialFixtures, loadError }: Props) {
  const { preferred, selectedLeagueId, windowFixtures, loadingWindow } = useAppShell()
  const selectedLeague = selectedLeagueId !== null ? preferred.find(p => p.leagueId === selectedLeagueId) : null

  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null)
  const [comparison, setComparison] = useState<FixtureComparison | null>(null)
  const [loadingCompare, setLoadingCompare] = useState(false)
  const [compareError, setCompareError] = useState('')
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  // Ao trocar de liga pela sidebar, volta para a lista de jogos.
  useEffect(() => { setSelectedFixture(null) }, [selectedLeagueId])

  const selectFixture = async (f: Fixture) => {
    setSelectedFixture(f); setComparison(null); setAiText(''); setCompareError(''); setLoadingCompare(true)
    try { setComparison(await getFixtureComparison(f)) }
    catch (e) {
      console.error(e)
      setCompareError('Comparação indisponível: o plano Free da API-Football não dá acesso a estatísticas da temporada atual (apenas 2022–2024).')
    }
    finally { setLoadingCompare(false) }
  }

  const analyze = async () => {
    if (!comparison) return
    setAiLoading(true); setAiText('')
    try { setAiText(await getFixtureAnalysis(comparison)) }
    catch (e) { console.error(e); setAiText('Erro ao gerar análise. Verifique a chave da IA.') }
    finally { setAiLoading(false) }
  }

  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: '24px 20px', width: '100%' }}>
      {selectedLeagueId === null ? (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Jogos de hoje</div>
          <div style={{ fontSize: 18, fontWeight: 700, textTransform: 'capitalize', letterSpacing: '-0.02em' }}>{dateLabel(initialDate)}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          {selectedLeague?.logo && <img src={selectedLeague.logo} alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />}
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>{selectedLeague?.name ?? 'Liga'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Hoje e amanhã</div>
          </div>
        </div>
      )}

      {loadError && !initialFixtures.length && selectedLeagueId === null && (
        <div style={{ border: '1px solid var(--red)', borderRadius: 10, padding: 14, marginBottom: 16, color: 'var(--red)', fontFamily: 'monospace', fontSize: 12 }}>{loadError}</div>
      )}

      {selectedFixture ? (
        <div>
          <button onClick={() => setSelectedFixture(null)} style={{ ...navBtn, width: 'auto', padding: '6px 12px', fontSize: 13, marginBottom: 8 }}>← Voltar aos jogos</button>
          {loadingCompare && <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>Comparando times...</div>}
          {compareError && !loadingCompare && (
            <div style={{ border: '1px solid var(--amber)', borderRadius: 10, padding: 14, color: 'var(--amber)', fontSize: 13 }}>{compareError}</div>
          )}
          {comparison && !loadingCompare && <ComparePanel comparison={comparison} aiText={aiText} aiLoading={aiLoading} onAnalyze={analyze} />}
        </div>
      ) : selectedLeagueId !== null ? (
        <LeagueAgenda fixtures={windowFixtures} loading={loadingWindow} onSelectFixture={selectFixture} />
      ) : (
        <DayFixtures fixtures={initialFixtures} preferred={preferred} loading={false} onSelectFixture={selectFixture} />
      )}
    </main>
  )
}

const navBtn: React.CSSProperties = {
  width: 38, height: 34, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 16,
}
