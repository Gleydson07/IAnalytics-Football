'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { reorderPreferredLeagues, type PreferredLeague } from '@/lib/football'

type Props = {
  leagues: PreferredLeague[]
  onClose: () => void
}

export default function ReorderModal({ leagues, onClose }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(leagues)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const moveTo = (index: number) => {
    if (dragIndex === null || dragIndex === index) return
    setItems(prev => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(index, 0, moved)
      return next
    })
    setDragIndex(index)
  }

  const save = async () => {
    setSaving(true)
    try {
      await reorderPreferredLeagues(items.map(l => l.leagueId))
      router.refresh()
      onClose()
    } catch (err) {
      console.error(err)
      setSaving(false)
    }
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={panel}>
        <div style={header}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Reordenar ligas</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Arraste para mudar a ordem do menu</div>
          </div>
          <button onClick={onClose} style={closeBtn}>Cancelar</button>
        </div>

        <div style={{ overflowY: 'auto', padding: '10px 12px' }}>
          {items.length === 0 && <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 13 }}>Nenhuma liga fixada para ordenar.</div>}
          {items.map((l, i) => (
            <div
              key={l.leagueId}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={e => { e.preventDefault(); moveTo(i) }}
              onDragEnd={() => setDragIndex(null)}
              style={{ ...row, opacity: dragIndex === i ? 0.4 : 1, borderColor: dragIndex === i ? 'var(--green)' : 'var(--border)' }}
            >
              <span style={{ fontSize: 16, color: 'var(--text-dim)', cursor: 'grab' }}>⠿</span>
              {l.logo && <img src={l.logo} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />}
              <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</span>
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{l.country}</span>
            </div>
          ))}
        </div>

        <div style={footer}>
          <button onClick={save} disabled={saving || items.length < 2} style={saveBtn}>
            {saving ? 'Salvando...' : 'Salvar ordem'}
          </button>
        </div>
      </div>
    </div>
  )
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 16px', zIndex: 50 }
const panel: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, width: '100%', maxWidth: 460, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }
const header: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--border)' }
const footer: React.CSSProperties = { padding: '12px 20px', borderTop: '1px solid var(--border)' }
const closeBtn: React.CSSProperties = { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '6px 12px', fontSize: 13 }
const saveBtn: React.CSSProperties = { width: '100%', background: 'var(--green)', color: '#000', borderRadius: 8, padding: '10px', fontWeight: 600, fontSize: 14 }
const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginBottom: 6, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', cursor: 'grab' }
