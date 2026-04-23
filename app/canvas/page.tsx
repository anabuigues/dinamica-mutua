'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { obtenerSesion, cerrarSesion } from '@/lib/session'
import type { SesionUsuario, TraspasoItem } from '@/types'

// ─── Tipos locales ────────────────────────────────────────────────────────────
interface CanvasData {
  mision: string
  retos_talento: string
  retos_procesos: string
  retos_cultura: string
  retos_otros: string
  traspasar: TraspasoItem[]
  recibir: TraspasoItem[]
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function newItem(): TraspasoItem {
  return { id: crypto.randomUUID(), texto: '' }
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

/** Textarea con label al estilo del design system */
function CanvasTextarea({
  id,
  label,
  sublabel,
  value,
  onChange,
  placeholder,
  rows = 5,
  color = 'blue',
}: {
  id: string
  label: string
  sublabel?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  color?: 'blue' | 'pink'
}) {
  const borderColor = color === 'pink' ? 'border-brand-pink/40' : 'border-brand-blue-mid/40'
  const labelColor = color === 'pink' ? 'text-brand-pink' : 'text-brand-blue-dark'

  return (
    <div className="flex flex-col h-full">
      <div className="mb-2">
        <h3 className={`font-display uppercase text-sm font-bold ${labelColor}`}>{label}</h3>
        {sublabel && <p className="text-xs text-neutral-500 font-body mt-0.5">{sublabel}</p>}
      </div>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full flex-1 border ${borderColor} rounded-lg px-3 py-2.5 text-sm text-neutral-800 placeholder-neutral-300 resize-none focus:outline-none focus:border-brand-blue-mid focus:ring-2 focus:ring-brand-blue-mid/20 transition-all font-body bg-white`}
      />
    </div>
  )
}

/** Fila editable de la tabla Traspasar/Recibir */
function TraspasoRow({
  item,
  onChange,
  onRemove,
  placeholder,
}: {
  item: TraspasoItem
  onChange: (id: string, texto: string) => void
  onRemove: (id: string) => void
  placeholder?: string
}) {
  return (
    <div className="flex items-center gap-2 group">
      <input
        type="text"
        value={item.texto}
        onChange={(e) => onChange(item.id, e.target.value)}
        placeholder={placeholder}
        className="flex-1 border border-neutral-200 rounded-md px-3 py-2 text-sm text-neutral-800 placeholder-neutral-300 focus:outline-none focus:border-brand-blue-mid focus:ring-2 focus:ring-brand-blue-mid/20 transition-all font-body bg-white"
      />
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-300 hover:text-semantic-error"
        aria-label="Eliminar"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  )
}

/** Columna Traspasar o Recibir */
function TraspasoColumn({
  title,
  color,
  items,
  onAdd,
  onChange,
  onRemove,
  placeholder,
}: {
  title: string
  color: 'blue' | 'pink'
  items: TraspasoItem[]
  onAdd: () => void
  onChange: (id: string, texto: string) => void
  onRemove: (id: string) => void
  placeholder?: string
}) {
  const headerBg = color === 'pink' ? 'bg-brand-pink' : 'bg-brand-blue-dark'
  return (
    <div className="flex flex-col h-full">
      <div className={`${headerBg} rounded-t-lg px-4 py-3`}>
        <h3 className="font-display text-white uppercase text-sm font-bold">{title}</h3>
      </div>
      <div className="flex-1 border border-t-0 border-neutral-200 rounded-b-lg p-4 space-y-2 bg-white">
        {items.map((item) => (
          <TraspasoRow
            key={item.id}
            item={item}
            onChange={onChange}
            onRemove={onRemove}
            placeholder={placeholder}
          />
        ))}
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 text-xs text-brand-blue-mid hover:text-brand-blue-dark transition-colors mt-2 font-body"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Añadir elemento
        </button>
      </div>
    </div>
  )
}

/** Indicador de estado de guardado */
function SaveIndicator({ status }: { status: SaveStatus }) {
  const configs = {
    idle: { text: '', icon: null, cls: '' },
    saving: {
      text: 'Guardando…',
      icon: <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>,
      cls: 'text-neutral-500',
    },
    saved: {
      text: 'Guardado',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>,
      cls: 'text-semantic-success',
    },
    error: {
      text: 'Error al guardar',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>,
      cls: 'text-semantic-error',
    },
  }
  const c = configs[status]
  if (!c.text) return null
  return (
    <span className={`flex items-center gap-1.5 text-xs font-body ${c.cls}`}>
      {c.icon}
      {c.text}
    </span>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function CanvasPage() {
  const router = useRouter()
  const [sesion, setSesion] = useState<SesionUsuario | null>(null)
  const [canvasId, setCanvasId] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [canvas, setCanvas] = useState<CanvasData>({
    mision: '',
    retos_talento: '',
    retos_procesos: '',
    retos_cultura: '',
    retos_otros: '',
    traspasar: [newItem()],
    recibir: [newItem()],
  })
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [loading, setLoading] = useState(true)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstLoad = useRef(true)

  // ── Cargar sesión y canvas ──────────────────────────────────────────────────
  useEffect(() => {
    const s = obtenerSesion()
    if (!s) { router.replace('/'); return }
    setSesion(s)

    async function cargarCanvas() {
      const { data, error } = await supabase
        .from('canvas')
        .select('*')
        .eq('usuario_id', (await supabase
          .from('usuarios')
          .select('id')
          .eq('identificador', s!.identificador)
          .single()
        ).data?.id)
        .single()

      if (!error && data) {
        setCanvasId(data.id)
        setUpdatedAt(data.updated_at ?? null)
        setCanvas({
          mision: data.mision ?? '',
          retos_talento: data.retos_talento ?? '',
          retos_procesos: data.retos_procesos ?? '',
          retos_cultura: data.retos_cultura ?? '',
          retos_otros: data.retos_otros ?? '',
          traspasar: Array.isArray(data.traspasar) && data.traspasar.length > 0
            ? data.traspasar
            : [newItem()],
          recibir: Array.isArray(data.recibir) && data.recibir.length > 0
            ? data.recibir
            : [newItem()],
        })
      }
      setLoading(false)
    }

    cargarCanvas()
  }, [router])

  // ── Guardado automático con debounce ───────────────────────────────────────
  const guardarCanvas = useCallback(async (data: CanvasData, cId: string) => {
    setSaveStatus('saving')
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('canvas')
      .update({
        mision: data.mision,
        retos_talento: data.retos_talento,
        retos_procesos: data.retos_procesos,
        retos_cultura: data.retos_cultura,
        retos_otros: data.retos_otros,
        traspasar: data.traspasar,
        recibir: data.recibir,
        updated_at: now,
      })
      .eq('id', cId)

    if (!error) setUpdatedAt(now)
    setSaveStatus(error ? 'error' : 'saved')
    if (!error) setTimeout(() => setSaveStatus('idle'), 3000)
  }, [])

  useEffect(() => {
    if (isFirstLoad.current) { isFirstLoad.current = false; return }
    if (!canvasId) return

    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => guardarCanvas(canvas, canvasId), 1200)

    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [canvas, canvasId, guardarCanvas])

  // ── Helpers de estado ──────────────────────────────────────────────────────
  function updateField(field: keyof CanvasData, value: string) {
    setCanvas((prev) => ({ ...prev, [field]: value }))
  }

  function addTraspaso(col: 'traspasar' | 'recibir') {
    setCanvas((prev) => ({ ...prev, [col]: [...prev[col], newItem()] }))
  }

  function updateTraspaso(col: 'traspasar' | 'recibir', id: string, texto: string) {
    setCanvas((prev) => ({
      ...prev,
      [col]: prev[col].map((item) => item.id === id ? { ...item, texto } : item),
    }))
  }

  function removeTraspaso(col: 'traspasar' | 'recibir', id: string) {
    setCanvas((prev) => ({
      ...prev,
      [col]: prev[col].filter((item) => item.id !== id).length > 0
        ? prev[col].filter((item) => item.id !== id)
        : [newItem()],
    }))
  }

  // ── Loading / sin sesión ───────────────────────────────────────────────────
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

  if (!sesion) return null

  return (
    <main className="min-h-screen bg-neutral-100 flex flex-col">
      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-neutral-200 shadow-sticky sticky top-0 z-10">
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
            <SaveIndicator status={saveStatus} />
            <Link
              href="/canvas/otros"
              className="hidden sm:block text-sm text-brand-blue-mid hover:text-brand-blue-dark font-body transition-colors"
            >
              Ver equipo
            </Link>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-brand-blue-dark/10 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#003087">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-800 font-body leading-none">{sesion.nombre}</p>
                <p className="text-xs text-neutral-500 font-body">{sesion.area}</p>
              </div>
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

      {/* ── Contenido del canvas ──────────────────────────────────────────── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6 animate-slide-up">

        {/* Cabecera del documento */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="bg-brand-blue-dark px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs font-body uppercase tracking-widest mb-1">Nuevo modelo organizativo</p>
              <h1 className="font-display text-white text-xl uppercase">Mi Canvas</h1>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs font-body uppercase tracking-wider">Última edición</p>
              <p className="text-white/90 text-xs font-body">
                {updatedAt
                  ? new Date(updatedAt).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                  : '—'}
              </p>
            </div>
          </div>
          <div className="px-6 py-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-500 font-body uppercase tracking-wider mb-1">Nombre</p>
              <p className="text-sm font-semibold text-neutral-800 font-body">{sesion.nombre}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-body uppercase tracking-wider mb-1">Área</p>
              <p className="text-sm font-semibold text-neutral-800 font-body">{sesion.area}</p>
            </div>
          </div>
        </div>

        {/* Sección 1 — Misión */}
        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="bg-brand-blue-dark/5 border-b border-brand-blue-dark/10 px-6 py-4">
            <h2 className="font-display text-brand-blue-dark text-lg uppercase">Misión</h2>
            <p className="text-xs text-neutral-500 font-body mt-0.5">
              ¿Cuál es la misión de tu área? ¿Quién es su cliente o principal socio?
            </p>
          </div>
          <div className="px-6 py-5">
            <CanvasTextarea
              id="mision"
              label=""
              value={canvas.mision}
              onChange={(v) => updateField('mision', v)}
              placeholder="Escribe aquí la misión de tu área…"
              rows={6}
            />
          </div>
        </section>

        {/* Sección 2 — Implantación (cuadrícula 2×2) */}
        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="bg-brand-blue-dark/5 border-b border-brand-blue-dark/10 px-6 py-4">
            <h2 className="font-display text-brand-blue-dark text-lg uppercase">Implantación</h2>
            <p className="text-xs text-neutral-500 font-body mt-0.5">
              ¿Qué retos ves para implantar el nuevo modelo?
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Talento */}
            <div className="border border-brand-blue-mid/20 rounded-lg overflow-hidden">
              <div className="bg-brand-blue-mid px-4 py-2.5">
                <h3 className="font-display text-white uppercase text-sm">Talento</h3>
              </div>
              <div className="p-4">
                <textarea
                  id="retos-talento"
                  value={canvas.retos_talento}
                  onChange={(e) => updateField('retos_talento', e.target.value)}
                  placeholder="Retos en materia de talento…"
                  rows={5}
                  className="w-full border-0 text-sm text-neutral-800 placeholder-neutral-300 resize-none focus:outline-none font-body"
                />
              </div>
            </div>

            {/* Procesos */}
            <div className="border border-brand-blue-mid/20 rounded-lg overflow-hidden">
              <div className="bg-brand-blue-mid px-4 py-2.5">
                <h3 className="font-display text-white uppercase text-sm">Procesos</h3>
              </div>
              <div className="p-4">
                <textarea
                  id="retos-procesos"
                  value={canvas.retos_procesos}
                  onChange={(e) => updateField('retos_procesos', e.target.value)}
                  placeholder="Retos en procesos y metodologías…"
                  rows={5}
                  className="w-full border-0 text-sm text-neutral-800 placeholder-neutral-300 resize-none focus:outline-none font-body"
                />
              </div>
            </div>

            {/* Cultura */}
            <div className="border border-brand-blue-mid/20 rounded-lg overflow-hidden">
              <div className="bg-brand-blue-light px-4 py-2.5">
                <h3 className="font-display text-white uppercase text-sm">Cultura</h3>
              </div>
              <div className="p-4">
                <textarea
                  id="retos-cultura"
                  value={canvas.retos_cultura}
                  onChange={(e) => updateField('retos_cultura', e.target.value)}
                  placeholder="Retos culturales y de cambio…"
                  rows={5}
                  className="w-full border-0 text-sm text-neutral-800 placeholder-neutral-300 resize-none focus:outline-none font-body"
                />
              </div>
            </div>

            {/* Otros */}
            <div className="border border-brand-blue-mid/20 rounded-lg overflow-hidden">
              <div className="bg-brand-blue-light px-4 py-2.5">
                <h3 className="font-display text-white uppercase text-sm">Otros</h3>
              </div>
              <div className="p-4">
                <textarea
                  id="retos-otros"
                  value={canvas.retos_otros}
                  onChange={(e) => updateField('retos_otros', e.target.value)}
                  placeholder="Otros retos relevantes…"
                  rows={5}
                  className="w-full border-0 text-sm text-neutral-800 placeholder-neutral-300 resize-none focus:outline-none font-body"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Sección 3 — Traspasar / Recibir */}
        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="bg-brand-blue-dark/5 border-b border-brand-blue-dark/10 px-6 py-4">
            <h2 className="font-display text-brand-blue-dark text-lg uppercase">Traspasar / Recibir</h2>
            <p className="text-xs text-neutral-500 font-body mt-0.5">
              ¿Qué debes traspasar o recibir de otras áreas?
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TraspasoColumn
              title="Traspasar"
              color="blue"
              items={canvas.traspasar}
              onAdd={() => addTraspaso('traspasar')}
              onChange={(id, texto) => updateTraspaso('traspasar', id, texto)}
              onRemove={(id) => removeTraspaso('traspasar', id)}
              placeholder="Algo que debo traspasar a otra área…"
            />
            <TraspasoColumn
              title="Recibir"
              color="pink"
              items={canvas.recibir}
              onAdd={() => addTraspaso('recibir')}
              onChange={(id, texto) => updateTraspaso('recibir', id, texto)}
              onRemove={(id) => removeTraspaso('recibir', id)}
              placeholder="Algo que debo recibir de otra área…"
            />
          </div>
        </section>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-400 font-body pb-8">
          Dinámica organizativa interna — Mutua Madrileña 2026
        </p>
      </div>
    </main>
  )
}
