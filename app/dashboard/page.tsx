'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { obtenerSesion, cerrarSesion } from '@/lib/session'
import { exportarDashboardPDF, exportarDashboardExcel } from '@/lib/exportar'
import type { SesionUsuario, TraspasoItem } from '@/types'

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface CanvasRow {
  id: string
  nombre: string
  updated_at: string
  mision: string
  retos_talento: string
  retos_procesos: string
  retos_cultura: string
  retos_otros: string
  traspasar: TraspasoItem[]
  recibir: TraspasoItem[]
}

// ─── Componentes ─────────────────────────────────────────────────────────────

/** Barra de progreso de participación */
function ParticipacionBar({ total, completados }: { total: number; completados: number }) {
  const pct = total === 0 ? 0 : Math.round((completados / total) * 100)
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-neutral-500 font-body">Participación</span>
        <span className="text-xs font-semibold text-brand-blue-dark font-body">{pct}%</span>
      </div>
      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-blue-mid rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-neutral-400 font-body mt-1">{completados} de {total} participantes han completado su canvas</p>
    </div>
  )
}

/** Bloque de retos agregados por categoría */
function RetosCategoria({
  title,
  color,
  items,
}: {
  title: string
  color: 'blue' | 'mid' | 'light' | 'pink'
  items: { texto: string; autor: string }[]
}) {
  const colorMap = {
    blue: 'bg-brand-blue-dark',
    mid: 'bg-brand-blue-mid',
    light: 'bg-brand-blue-light',
    pink: 'bg-brand-pink',
  }
  const headerBg = colorMap[color]

  if (items.length === 0) {
    return (
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        <div className={`${headerBg} px-4 py-2.5 flex items-center justify-between`}>
          <h3 className="font-display text-white uppercase text-sm">{title}</h3>
          <span className="text-white/60 text-xs font-body">0 entradas</span>
        </div>
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-neutral-300 font-body italic">Sin respuestas todavía</p>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden">
      <div className={`${headerBg} px-4 py-2.5 flex items-center justify-between`}>
        <h3 className="font-display text-white uppercase text-sm">{title}</h3>
        <span className="text-white/60 text-xs font-body">{items.length} {items.length === 1 ? 'entrada' : 'entradas'}</span>
      </div>
      <div className="divide-y divide-neutral-100">
        {items.map((item, i) => (
          <div key={i} className="px-4 py-3 group hover:bg-neutral-50 transition-colors">
            <p className="text-sm text-neutral-800 font-body whitespace-pre-wrap">{item.texto}</p>
            <p className="text-xs text-neutral-400 font-body mt-1">
              {item.autor}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Tarjeta de misión por participante */
function MisionCard({ nombre, mision }: { nombre: string; mision: string }) {
  if (!mision.trim()) return null
  return (
    <div className="bg-white border border-neutral-200 rounded-lg px-4 py-3 hover:border-brand-blue-mid/40 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-brand-blue-dark/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-brand-blue-dark font-display text-xs uppercase">{nombre.charAt(0)}</span>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-neutral-800 font-body">{nombre}</span>
          </div>
          <p className="text-sm text-neutral-600 font-body leading-relaxed">"{mision}"</p>
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const [sesion, setSesion] = useState<SesionUsuario | null>(null)
  const [datos, setDatos] = useState<CanvasRow[]>([])
  const [loading, setLoading] = useState(true)
  const [exportingPDF, setExportingPDF] = useState(false)
  const [exportingXLS, setExportingXLS] = useState(false)
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date())

  useEffect(() => {
    const s = obtenerSesion()
    if (!s) { router.replace('/'); return }
    setSesion(s)
    cargarDatos()

    // Realtime: escucha cambios en la tabla canvas
    const channel = supabase
      .channel('dashboard-canvas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'canvas' }, () => {
        cargarDatos()
        setUltimaActualizacion(new Date())
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function cargarDatos() {
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
          nombre
        )
      `)
      .order('updated_at', { ascending: false })

    if (!error && data) {
      const rows: CanvasRow[] = (data as any[])
        .filter((c) => c.usuarios)
        .map((c) => ({
          id: c.id,
          nombre: c.usuarios.nombre,
          updated_at: c.updated_at,
          mision: c.mision ?? '',
          retos_talento: c.retos_talento ?? '',
          retos_procesos: c.retos_procesos ?? '',
          retos_cultura: c.retos_cultura ?? '',
          retos_otros: c.retos_otros ?? '',
          traspasar: Array.isArray(c.traspasar) ? c.traspasar : [],
          recibir: Array.isArray(c.recibir) ? c.recibir : [],
        }))
      setDatos(rows)
    }
    setLoading(false)
  }

  // ── Filtrado ───────────────────────────────────────────────────────────────
  const filtrados = datos

  // ── Agregación de retos ────────────────────────────────────────────────────
  function agregarRetos(campo: keyof CanvasRow) {
    return filtrados
      .filter((d) => typeof d[campo] === 'string' && (d[campo] as string).trim())
      .map((d) => ({ texto: d[campo] as string, autor: d.nombre }))
  }

  const retosTalento = agregarRetos('retos_talento')
  const retosProcesos = agregarRetos('retos_procesos')
  const retosCultura = agregarRetos('retos_cultura')
  const retosOtros = agregarRetos('retos_otros')
  const misiones = filtrados.filter((d) => d.mision.trim())
  const completados = filtrados.filter((d) =>
    d.mision.trim() || d.retos_talento.trim() || d.retos_procesos.trim()
  ).length

  async function handleExportPDF() {
    setExportingPDF(true)
    await exportarDashboardPDF(filtrados)
    setExportingPDF(false)
  }

  async function handleExportExcel() {
    setExportingXLS(true)
    await exportarDashboardExcel(filtrados)
    setExportingXLS(false)
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
            {/* Indicador tiempo real */}
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-semantic-success font-body">
              <span className="w-1.5 h-1.5 rounded-full bg-semantic-success animate-pulse" />
              En directo
            </span>
            {/* Botones exportar */}

            <Link href="/canvas" className="text-sm text-brand-blue-mid hover:text-brand-blue-dark font-body transition-colors">
              Mi canvas
            </Link>
            <Link href="/canvas/otros" className="text-sm text-brand-blue-mid hover:text-brand-blue-dark font-body transition-colors">
              Equipo
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

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6 animate-slide-up">

        {/* Cabecera del dashboard */}
        <div className="bg-brand-blue-dark rounded-xl px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-white/60 text-xs font-body uppercase tracking-widest mb-1">Visión agregada</p>
            <h1 className="font-display text-white text-2xl uppercase">Dashboard</h1>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-white/60 text-xs font-body mb-1">Última actualización</p>
            <p className="text-white text-xs font-body">
              {ultimaActualizacion.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>

        {/* KPIs + participación */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Participantes', value: datos.length, icon: '👥' },
            { label: 'Misiones', value: datos.filter(d => d.mision.trim()).length, icon: '🎯' },
            { label: 'Retos totales', value: retosTalento.length + retosProcesos.length + retosCultura.length + retosOtros.length, icon: '⚡' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white rounded-xl border border-neutral-200 shadow-sm px-5 py-4">
              <div className="text-2xl mb-1">{icon}</div>
              <p className="font-display text-brand-blue-dark text-2xl">{loading ? '—' : value}</p>
              <p className="text-xs text-neutral-500 font-body mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Progreso + filtro */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm px-6 py-5 space-y-4">
          <ParticipacionBar total={datos.length} completados={completados} />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="animate-spin w-8 h-8 text-brand-blue-mid" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        ) : (
          <>
            {/* Sección Misiones */}
            {misiones.length > 0 && (
              <section className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="bg-brand-blue-dark/5 border-b border-brand-blue-dark/10 px-6 py-4">
                  <h2 className="font-display text-brand-blue-dark text-lg uppercase">Misiones</h2>
                  <p className="text-xs text-neutral-500 font-body mt-0.5">
                    ¿Cuál es la misión de cada área?
                  </p>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {misiones.map((d) => (
                    <MisionCard key={d.id} nombre={d.nombre} mision={d.mision} />
                  ))}
                </div>
              </section>
            )}

            {/* Sección Retos de Implantación */}
            <section className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="bg-brand-blue-dark/5 border-b border-brand-blue-dark/10 px-6 py-4">
                <h2 className="font-display text-brand-blue-dark text-lg uppercase">Retos de Implantación</h2>
                <p className="text-xs text-neutral-500 font-body mt-0.5">
                  Consolidado de retos por categoría
                </p>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RetosCategoria title="Talento" color="mid" items={retosTalento} />
                <RetosCategoria title="Procesos" color="mid" items={retosProcesos} />
                <RetosCategoria title="Cultura" color="light" items={retosCultura} />
                <RetosCategoria title="Otros" color="light" items={retosOtros} />
              </div>
            </section>

            {/* Sección Traspasar / Recibir agregado */}
            <section className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="bg-brand-blue-dark/5 border-b border-brand-blue-dark/10 px-6 py-4">
                <h2 className="font-display text-brand-blue-dark text-lg uppercase">Traspasar / Recibir</h2>
                <p className="text-xs text-neutral-500 font-body mt-0.5">
                  Elementos identificados por el equipo
                </p>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Traspasar */}
                <div>
                  <div className="bg-brand-blue-dark rounded-t-lg px-4 py-2.5">
                    <h3 className="font-display text-white uppercase text-sm">Traspasar</h3>
                  </div>
                  <div className="border border-t-0 border-neutral-200 rounded-b-lg divide-y divide-neutral-100 bg-white">
                    {filtrados.flatMap((d) =>
                      d.traspasar
                        .filter((t) => t.texto.trim())
                        .map((t, i) => (
                          <div key={`${d.id}-t-${i}`} className="px-4 py-2.5 hover:bg-neutral-50 transition-colors">
                            <p className="text-sm text-neutral-800 font-body">{t.texto}</p>
                            <p className="text-xs text-neutral-400 font-body">{d.nombre}</p>
                          </div>
                        ))
                    ).length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm text-neutral-300 font-body italic">Sin entradas todavía</p>
                      </div>
                    ) : filtrados.flatMap((d) =>
                      d.traspasar
                        .filter((t) => t.texto.trim())
                        .map((t, i) => (
                          <div key={`${d.id}-t-${i}`} className="px-4 py-2.5 hover:bg-neutral-50 transition-colors">
                            <p className="text-sm text-neutral-800 font-body">{t.texto}</p>
                            <p className="text-xs text-neutral-400 font-body">{d.nombre}</p>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Recibir */}
                <div>
                  <div className="bg-brand-pink rounded-t-lg px-4 py-2.5">
                    <h3 className="font-display text-white uppercase text-sm">Recibir</h3>
                  </div>
                  <div className="border border-t-0 border-neutral-200 rounded-b-lg divide-y divide-neutral-100 bg-white">
                    {filtrados.flatMap((d) =>
                      d.recibir
                        .filter((r) => r.texto.trim())
                        .map((r, i) => (
                          <div key={`${d.id}-r-${i}`} className="px-4 py-2.5 hover:bg-neutral-50 transition-colors">
                            <p className="text-sm text-neutral-800 font-body">{r.texto}</p>
                            <p className="text-xs text-neutral-400 font-body">{d.nombre}</p>
                          </div>
                        ))
                    ).length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm text-neutral-300 font-body italic">Sin entradas todavía</p>
                      </div>
                    ) : filtrados.flatMap((d) =>
                      d.recibir
                        .filter((r) => r.texto.trim())
                        .map((r, i) => (
                          <div key={`${d.id}-r-${i}`} className="px-4 py-2.5 hover:bg-neutral-50 transition-colors">
                            <p className="text-xs text-neutral-400 font-body">{d.nombre}</p>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        <p className="text-center text-xs text-neutral-400 font-body pb-8">
          Dinámica organizativa interna — Mutua Madrileña 2026
        </p>
      </div>
    </main>
  )
}
