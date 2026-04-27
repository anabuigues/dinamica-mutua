'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { obtenerSesion, cerrarSesion } from '@/lib/session'
import LogoMutua from '@/components/LogoMutua'
import { descargarPDF } from '@/lib/exportarPdf'
import type { SesionUsuario, TraspasoItem } from '@/types'

// ─── Tipos ──────────────────────────────────────────────────────────────────
interface CanvasConAutor {
  id: string
  mision: string
  retos_talento: string
  retos_procesos: string
  retos_cultura: string
  retos_otros: string
  traspasar: TraspasoItem[]
  recibir: TraspasoItem[]
  updated_at: string
  usuarios: {
    nombre: string
    identificador: string
  }
}

const AREA_NAMES: Record<string, string> = {
  'equipos-asegurador': 'Asegurador y Ecosistema',
  'equipos-patrimonial': 'Patrimonial y Finanzas',
  'equipos-movilidad': 'Movilidad',
  'equipos-sistemas': 'Sistemas corporativos',
  'ciso-global': 'CISO global',
  'plataforma-desarrollo': 'Plataforma de desarrollo',
  'tech-support': 'Tech support',
  'canales': 'Canales',
  'daar-transversales': 'DAAR y otras áreas transversales',
  'arquitectura-solucion': 'Arquitectura de solución',
  'cto': 'CTO (Chief Technology Officer)',
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center justify-between mb-4 border-b border-neutral-200 pb-2">
      <h2 className="font-display text-brand-blue-dark text-lg uppercase">{title}</h2>
      <span className="badge bg-neutral-100 text-neutral-500 text-[10px]">
        {count} {count === 1 ? 'aportación' : 'aportaciones'}
      </span>
    </div>
  )
}

function AportacionCard({ autor, fecha, content }: { autor: string; fecha: string; content: string }) {
  if (!content.trim()) return null
  return (
    <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100 mb-3 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-brand-blue-mid font-body">{autor}</span>
        <span className="text-[10px] text-neutral-400 font-body">
          {new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <p className="text-sm text-neutral-700 font-body leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    </div>
  )
}

function TraspasoAggregated({ title, color, items }: { title: string; color: 'blue' | 'pink'; items: { autor: string; texto: string }[] }) {
  if (items.length === 0) return null
  const headerBg = color === 'pink' ? 'bg-brand-pink' : 'bg-brand-blue-dark'
  
  return (
    <div className="flex flex-col h-full">
      <div className={`${headerBg} rounded-t-lg px-4 py-2`}>
        <h3 className="font-display text-white uppercase text-xs font-bold">{title}</h3>
      </div>
      <div className="flex-1 border border-t-0 border-neutral-200 rounded-b-lg p-3 space-y-2 bg-white">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-0.5 border-b border-neutral-50 last:border-0 pb-2 last:pb-0">
            <p className="text-xs text-neutral-700 font-body">{item.texto}</p>
            <span className="text-[9px] text-neutral-400 font-body italic">— {item.autor}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Componente Principal ─────────────────────────────────────────────────────

function VerAreaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const areaId = searchParams.get('area')
  const [sesion, setSesion] = useState<SesionUsuario | null>(null)
  const [aportaciones, setAportaciones] = useState<CanvasConAutor[]>([])
  const [loading, setLoading] = useState(true)

  const areaNombre = areaId ? AREA_NAMES[areaId] || areaId : 'Área desconocida'

  useEffect(() => {
    const s = obtenerSesion()
    if (!s) { router.replace('/'); return }
    setSesion(s)

    async function cargarAportaciones() {
      if (!areaId) return

      const { data, error } = await supabase
        .from('canvas')
        .select(`
          id, mision, retos_talento, retos_procesos, retos_cultura, retos_otros, traspasar, recibir, updated_at,
          usuarios ( nombre, identificador )
        `)
        .eq('area_id', areaId)
        .order('updated_at', { ascending: false })

      if (!error && data) {
        setAportaciones(data as any)
      }
      setLoading(false)
    }

    cargarAportaciones()
  }, [router, areaId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin w-8 h-8 border-4 border-brand-blue-mid border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!sesion) return null

  // Procesar traspasos
  const allTraspasar: { autor: string; texto: string }[] = []
  const allRecibir: { autor: string; texto: string }[] = []

  aportaciones.forEach(a => {
    if (Array.isArray(a.traspasar)) {
      a.traspasar.forEach(i => {
        if (i.texto.trim()) allTraspasar.push({ autor: a.usuarios.nombre, texto: i.texto })
      })
    }
    if (Array.isArray(a.recibir)) {
      a.recibir.forEach(i => {
        if (i.texto.trim()) allRecibir.push({ autor: a.usuarios.nombre, texto: i.texto })
      })
    }
  })

  return (
    <main className="min-h-screen bg-neutral-100 flex flex-col">
      <header className="bg-white border-b border-neutral-200 shadow-sticky sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/modelo" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <LogoMutua />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/modelo"
              className="text-sm text-brand-blue-mid hover:text-brand-blue-dark font-body transition-colors"
            >
              ← Volver al modelo
            </Link>
            <div className="hidden sm:flex items-center gap-2">
              <p className="text-xs font-semibold text-neutral-800 font-body">{sesion.nombre}</p>
            </div>
            <button
              onClick={() => { cerrarSesion(); router.push('/') }}
              className="text-xs text-neutral-500 hover:text-semantic-error transition-colors font-body"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8 animate-slide-up">
        {/* Cabecera del área */}
        <div className="bg-brand-blue-dark rounded-xl px-6 py-6 shadow-md border-b-4 border-brand-pink flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <p className="text-white/60 text-xs font-body uppercase tracking-widest mb-1">Información agregada</p>
            <h1 className="font-display text-white text-3xl uppercase">{areaNombre}</h1>
            <p className="text-white/80 text-sm font-body mt-2">
              Consulta todas las visiones y aportaciones del equipo para esta área.
            </p>
          </div>
          
          <button
            onClick={() => descargarPDF(areaNombre, aportaciones, allTraspasar, allRecibir)}
            disabled={aportaciones.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            Descargar PDF
          </button>
        </div>

        {aportaciones.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <p className="text-neutral-500 font-body">Aún no hay aportaciones para esta área.</p>
            <Link href={`/canvas/aportar?area=${areaId}`} className="text-brand-blue-mid hover:underline mt-2 inline-block text-sm">
              Sé el primero en aportar →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Columna Izquierda: Misión e Implantación */}
            <div className="space-y-8">
              {/* Misión */}
              <section className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
                <SectionTitle title="Misión" count={aportaciones.filter(a => a.mision.trim()).length} />
                <div className="space-y-1">
                  {aportaciones.map(a => (
                    <AportacionCard key={a.id} autor={a.usuarios.nombre} fecha={a.updated_at} content={a.mision} />
                  ))}
                </div>
              </section>

              {/* Implantación: Talento y Procesos */}
              <section className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
                <SectionTitle title="Implantación: Talento" count={aportaciones.filter(a => a.retos_talento.trim()).length} />
                <div className="space-y-1">
                  {aportaciones.map(a => (
                    <AportacionCard key={a.id} autor={a.usuarios.nombre} fecha={a.updated_at} content={a.retos_talento} />
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
                <SectionTitle title="Implantación: Procesos" count={aportaciones.filter(a => a.retos_procesos.trim()).length} />
                <div className="space-y-1">
                  {aportaciones.map(a => (
                    <AportacionCard key={a.id} autor={a.usuarios.nombre} fecha={a.updated_at} content={a.retos_procesos} />
                  ))}
                </div>
              </section>
            </div>

            {/* Columna Derecha: Cultura, Otros y Traspasos */}
            <div className="space-y-8">
              <section className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
                <SectionTitle title="Implantación: Cultura" count={aportaciones.filter(a => a.retos_cultura.trim()).length} />
                <div className="space-y-1">
                  {aportaciones.map(a => (
                    <AportacionCard key={a.id} autor={a.usuarios.nombre} fecha={a.updated_at} content={a.retos_cultura} />
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
                <SectionTitle title="Implantación: Otros" count={aportaciones.filter(a => a.retos_otros.trim()).length} />
                <div className="space-y-1">
                  {aportaciones.map(a => (
                    <AportacionCard key={a.id} autor={a.usuarios.nombre} fecha={a.updated_at} content={a.retos_otros} />
                  ))}
                </div>
              </section>

              {/* Traspasar / Recibir Agregados */}
              <section className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
                <SectionTitle title="Traspasar / Recibir" count={allTraspasar.length + allRecibir.length} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TraspasoAggregated title="Traspasar" color="blue" items={allTraspasar} />
                  <TraspasoAggregated title="Recibir" color="pink" items={allRecibir} />
                </div>
              </section>
            </div>

          </div>
        )}

        <p className="text-center text-xs text-neutral-400 font-body pb-8">
          Dinámica organizativa interna — Mutua Madrileña 2026
        </p>
      </div>
    </main>
  )
}

export default function VerAreaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin w-8 h-8 border-4 border-brand-blue-mid border-t-transparent rounded-full" />
      </div>
    }>
      <VerAreaContent />
    </Suspense>
  )
}
