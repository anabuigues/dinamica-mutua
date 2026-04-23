'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { obtenerSesion, cerrarSesion } from '@/lib/session'
import type { SesionUsuario, TraspasoItem } from '@/types'

interface CanvasCompleto {
  id: string
  nombre: string
  area: string
  identificador: string
  updated_at: string
  mision: string
  retos_talento: string
  retos_procesos: string
  retos_cultura: string
  retos_otros: string
  traspasar: TraspasoItem[]
  recibir: TraspasoItem[]
}

// ─── Campo de solo lectura ────────────────────────────────────────────────────
function ReadField({
  label,
  value,
  color = 'blue',
}: {
  label: string
  value: string
  color?: 'blue' | 'mid'
}) {
  const headerBg = color === 'mid' ? 'bg-brand-blue-mid' : 'bg-brand-blue-dark'
  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden">
      <div className={`${headerBg} px-4 py-2.5`}>
        <h3 className="font-display text-white uppercase text-sm">{label}</h3>
      </div>
      <div className="px-4 py-3 min-h-[8rem] bg-white">
        {value ? (
          <p className="text-sm text-neutral-800 font-body whitespace-pre-wrap">{value}</p>
        ) : (
          <p className="text-sm text-neutral-300 font-body italic">Sin contenido</p>
        )}
      </div>
    </div>
  )
}

// ─── Lista de solo lectura ────────────────────────────────────────────────────
function ReadList({
  title,
  color,
  items,
}: {
  title: string
  color: 'blue' | 'pink'
  items: TraspasoItem[]
}) {
  const headerBg = color === 'pink' ? 'bg-brand-pink' : 'bg-brand-blue-dark'
  const filled = items.filter((i) => i.texto.trim())
  return (
    <div className="flex flex-col h-full">
      <div className={`${headerBg} rounded-t-lg px-4 py-3`}>
        <h3 className="font-display text-white uppercase text-sm font-bold">{title}</h3>
      </div>
      <div className="flex-1 border border-t-0 border-neutral-200 rounded-b-lg p-4 bg-white">
        {filled.length === 0 ? (
          <p className="text-sm text-neutral-300 font-body italic">Sin elementos</p>
        ) : (
          <ul className="space-y-2">
            {filled.map((item) => (
              <li key={item.id} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-neutral-400 flex-shrink-0" />
                <span className="text-sm text-neutral-700 font-body">{item.texto}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────
function CanvasAjenoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const canvasId = searchParams.get('id')

  const [sesion, setSesion] = useState<SesionUsuario | null>(null)
  const [canvas, setCanvas] = useState<CanvasCompleto | null>(null)
  const [loading, setLoading] = useState(true)
  const [noEncontrado, setNoEncontrado] = useState(false)

  useEffect(() => {
    const s = obtenerSesion()
    if (!s) { router.replace('/'); return }
    setSesion(s)
    cargarCanvas(s)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function cargarCanvas(s: SesionUsuario) {
    const { data, error } = await supabase
      .from('canvas')
      .select(`
        id,
        updated_at,
        mision,
        retos_talento,
        retos_procesos,
        retos_cultura,
        retos_otros,
        traspasar,
        recibir,
        usuarios (
          nombre,
          area,
          identificador
        )
      `)
      .eq('id', canvasId)
      .single()

    if (error || !data) { setNoEncontrado(true); setLoading(false); return }

    const u = (data as any).usuarios
    // Si es el propio canvas, redirigir a la ruta editable
    if (u?.identificador === s.identificador) {
      router.replace('/canvas')
      return
    }

    setCanvas({
      id: data.id,
      nombre: u?.nombre ?? '—',
      area: u?.area ?? '—',
      identificador: u?.identificador ?? '—',
      updated_at: data.updated_at ?? '',
      mision: (data as any).mision ?? '',
      retos_talento: (data as any).retos_talento ?? '',
      retos_procesos: (data as any).retos_procesos ?? '',
      retos_cultura: (data as any).retos_cultura ?? '',
      retos_otros: (data as any).retos_otros ?? '',
      traspasar: Array.isArray((data as any).traspasar) ? (data as any).traspasar : [],
      recibir: Array.isArray((data as any).recibir) ? (data as any).recibir : [],
    })
    setLoading(false)
  }

  function formatDate(iso: string) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <svg className="animate-spin w-8 h-8 text-brand-blue-mid" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    )
  }

  if (noEncontrado || !canvas) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 gap-4">
        <p className="font-display text-brand-blue-dark text-xl uppercase">Canvas no encontrado</p>
        <Link href="/canvas/otros" className="text-sm text-brand-blue-mid hover:underline font-body">
          ← Volver al equipo
        </Link>
      </div>
    )
  }

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
            {/* Badge solo lectura */}
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-full font-body">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              Solo lectura
            </span>
            <Link href="/canvas/otros" className="text-sm text-brand-blue-mid hover:text-brand-blue-dark font-body transition-colors">
              ← Equipo
            </Link>
            <Link href="/canvas" className="text-sm text-brand-blue-mid hover:text-brand-blue-dark font-body transition-colors">
              Mi canvas
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

      {/* Contenido */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6 animate-slide-up">

        {/* Cabecera del documento */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="bg-brand-blue-dark px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs font-body uppercase tracking-widest mb-1">Nuevo modelo organizativo</p>
              <h1 className="font-display text-white text-xl uppercase">Canvas — {canvas.nombre}</h1>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs font-body uppercase tracking-wider">Última edición</p>
              <p className="text-white/90 text-xs font-body">{formatDate(canvas.updated_at)}</p>
            </div>
          </div>
          <div className="px-6 py-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-500 font-body uppercase tracking-wider mb-1">Nombre</p>
              <p className="text-sm font-semibold text-neutral-800 font-body">{canvas.nombre}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-body uppercase tracking-wider mb-1">Área</p>
              <p className="text-sm font-semibold text-neutral-800 font-body">{canvas.area}</p>
            </div>
          </div>
        </div>

        {/* Misión */}
        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="bg-brand-blue-dark/5 border-b border-brand-blue-dark/10 px-6 py-4">
            <h2 className="font-display text-brand-blue-dark text-lg uppercase">Misión</h2>
            <p className="text-xs text-neutral-500 font-body mt-0.5">
              ¿Cuál es la misión del área? ¿Quién es su cliente o principal socio?
            </p>
          </div>
          <div className="px-6 py-5">
            {canvas.mision ? (
              <p className="text-sm text-neutral-800 font-body whitespace-pre-wrap">{canvas.mision}</p>
            ) : (
              <p className="text-sm text-neutral-300 font-body italic">Sin contenido</p>
            )}
          </div>
        </section>

        {/* Implantación */}
        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="bg-brand-blue-dark/5 border-b border-brand-blue-dark/10 px-6 py-4">
            <h2 className="font-display text-brand-blue-dark text-lg uppercase">Implantación</h2>
            <p className="text-xs text-neutral-500 font-body mt-0.5">
              Retos para implantar el nuevo modelo
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ReadField label="Talento" value={canvas.retos_talento} color="mid" />
            <ReadField label="Procesos" value={canvas.retos_procesos} color="mid" />
            <ReadField label="Cultura" value={canvas.retos_cultura} color="mid" />
            <ReadField label="Otros" value={canvas.retos_otros} color="mid" />
          </div>
        </section>

        {/* Traspasar / Recibir */}
        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="bg-brand-blue-dark/5 border-b border-brand-blue-dark/10 px-6 py-4">
            <h2 className="font-display text-brand-blue-dark text-lg uppercase">Traspasar / Recibir</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ReadList title="Traspasar" color="blue" items={canvas.traspasar} />
            <ReadList title="Recibir" color="pink" items={canvas.recibir} />
          </div>
        </section>

        <p className="text-center text-xs text-neutral-400 font-body pb-8">
          Dinámica organizativa interna — Mutua Madrileña 2026
        </p>
      </div>
    </main>
  )
}

export default function CanvasAjenoPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <svg className="animate-spin w-8 h-8 text-brand-blue-mid" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    }>
      <CanvasAjenoContent />
    </React.Suspense>
  )
}
