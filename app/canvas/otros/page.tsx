'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { obtenerSesion, cerrarSesion } from '@/lib/session'
import type { SesionUsuario } from '@/types'

interface ParticipanteCanvas {
  id: string
  usuario_id: string
  updated_at: string
  nombre: string
  area: string
  identificador: string
  mision: string
}

export default function OtrosCanvasPage() {
  const router = useRouter()
  const [sesion, setSesion] = useState<SesionUsuario | null>(null)
  const [participantes, setParticipantes] = useState<ParticipanteCanvas[]>([])
  const [filtroArea, setFiltroArea] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = obtenerSesion()
    if (!s) { router.replace('/'); return }
    setSesion(s)
    cargarParticipantes()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function cargarParticipantes() {
    const { data, error } = await supabase
      .from('canvas')
      .select(`
        id,
        usuario_id,
        updated_at,
        mision,
        usuarios (
          nombre,
          area,
          identificador
        )
      `)
      .order('updated_at', { ascending: false })

    if (!error && data) {
      const lista: ParticipanteCanvas[] = (data as any[])
        .filter((c) => c.usuarios)
        .map((c) => ({
          id: c.id,
          usuario_id: c.usuario_id,
          updated_at: c.updated_at,
          mision: c.mision ?? '',
          nombre: c.usuarios.nombre,
          area: c.usuarios.area,
          identificador: c.usuarios.identificador,
        }))
      setParticipantes(lista)
    }
    setLoading(false)
  }

  const areas = Array.from(new Set(participantes.map((p) => p.area))).sort()
  const filtrados = filtroArea
    ? participantes.filter((p) => p.area === filtroArea)
    : participantes

  function formatDate(iso: string) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  }

  if (!sesion) return null

  return (
    <main className="min-h-screen bg-neutral-100 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-pink flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
            <span className="font-display text-brand-blue-dark uppercase text-sm tracking-wider">
              Dinámica Mutua
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/canvas" className="text-sm text-brand-blue-mid hover:text-brand-blue-dark font-body transition-colors">
              ← Mi canvas
            </Link>
            <button
              onClick={() => { cerrarSesion(); router.push('/') }}
              className="text-xs text-neutral-500 hover:text-semantic-error transition-colors font-body"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 animate-slide-up">
        <div className="mb-6">
          <h1 className="font-display text-brand-blue-dark text-2xl uppercase">Canvas del equipo</h1>
          <p className="text-sm text-neutral-500 font-body mt-1">
            Visiones del resto de participantes — solo lectura
          </p>
        </div>

        {/* Filtro por área */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm px-5 py-4 mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs text-neutral-500 font-body uppercase tracking-wider mr-1">Área:</span>
          <button
            onClick={() => setFiltroArea('')}
            className={`px-3 py-1.5 rounded-full text-xs font-body transition-colors ${
              filtroArea === '' ? 'bg-brand-blue-dark text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Todos ({participantes.length})
          </button>
          {areas.map((area) => (
            <button
              key={area}
              onClick={() => setFiltroArea(area === filtroArea ? '' : area)}
              className={`px-3 py-1.5 rounded-full text-xs font-body transition-colors ${
                filtroArea === area ? 'bg-brand-blue-dark text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {area}
            </button>
          ))}
        </div>

        {/* Grid de tarjetas */}
        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="animate-spin w-8 h-8 text-brand-blue-mid" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 font-body text-sm">
            No hay canvas disponibles aún.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtrados.map((p) => {
              const esPropio = p.identificador === sesion?.identificador
              return (
                <Link
                  key={p.id}
                  href={esPropio ? '/canvas' : `/canvas/${p.id}`}
                  className="group block bg-white rounded-xl border border-neutral-200 hover:border-brand-blue-mid hover:shadow-md transition-all overflow-hidden"
                >
                  <div className={`px-4 py-3 ${esPropio ? 'bg-brand-pink' : 'bg-brand-blue-dark'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-display uppercase text-sm leading-tight">{p.nombre}</p>
                        <p className="text-white/70 text-xs font-body">{p.area}</p>
                      </div>
                      {esPropio && (
                        <span className="bg-white/20 text-white text-xs font-body px-2 py-0.5 rounded-full">Tú</span>
                      )}
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs text-neutral-500 font-body line-clamp-3 min-h-[3rem]">
                      {p.mision ? `"${p.mision}"` : 'Sin misión todavía…'}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-neutral-400 font-body">{formatDate(p.updated_at)}</span>
                      <span className="text-xs text-brand-blue-mid group-hover:text-brand-blue-dark font-body transition-colors">
                        {esPropio ? 'Editar →' : 'Ver →'}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
