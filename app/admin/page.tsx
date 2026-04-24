'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { obtenerSesion, cerrarSesion } from '@/lib/session'
import LogoMutua from '@/components/LogoMutua'
import type { SesionUsuario } from '@/types'

interface ParticipanteAdmin {
  userId: string
  canvasId: string | null
  nombre: string
  identificador: string
  created_at: string
  updated_at: string | null
  tieneDatos: boolean
}

// ─── Modal de confirmación ────────────────────────────────────────────────────
function ModalConfirmacion({
  titulo,
  mensaje,
  textoConfirmar,
  peligroso,
  onConfirmar,
  onCancelar,
}: {
  titulo: string
  mensaje: string
  textoConfirmar: string
  peligroso?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-up">
        <div className={`px-6 py-5 ${peligroso ? 'bg-semantic-error' : 'bg-brand-blue-dark'}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <h2 className="font-display text-white text-lg uppercase">{titulo}</h2>
          </div>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-neutral-700 font-body leading-relaxed">{mensaje}</p>
          {peligroso && (
            <div className="mt-3 bg-semantic-error/10 border border-semantic-error/30 rounded-lg px-4 py-3">
              <p className="text-xs text-semantic-error font-body font-semibold">
                ⚠️ Esta acción es irreversible y no se puede deshacer.
              </p>
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            onClick={onCancelar}
            className="px-4 py-2 text-sm font-body text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className={`px-4 py-2 text-sm font-body text-white rounded-lg transition-colors ${
              peligroso ? 'bg-semantic-error hover:bg-semantic-error/90' : 'bg-brand-blue-dark hover:bg-brand-blue-mid'
            }`}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Página de administración ─────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter()
  const [sesion, setSesion] = useState<SesionUsuario | null>(null)
  const [participantes, setParticipantes] = useState<ParticipanteAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [operando, setOperando] = useState<string | null>(null) // id del canvas siendo operado

  // Estado de modales
  const [modalIndividual, setModalIndividual] = useState<ParticipanteAdmin | null>(null)
  const [modalMasivo, setModalMasivo] = useState(false)

  // Feedback toast
  const [toast, setToast] = useState<{ msg: string; tipo: 'ok' | 'err' } | null>(null)

  useEffect(() => {
    const s = obtenerSesion()
    if (!s) { router.replace('/'); return }
    if (s.rol !== 'superusuario') { router.replace('/canvas'); return }
    setSesion(s)
    cargarParticipantes()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function cargarParticipantes() {
    setLoading(true)

    // Traer todos los usuarios con su canvas (left join vía FK)
    const { data: usuarios, error: errU } = await supabase
      .from('usuarios')
      .select('id, nombre, identificador, created_at')
      .neq('rol', 'superusuario')
      .order('created_at', { ascending: false })

    if (errU || !usuarios) { setLoading(false); return }

    const { data: canvas, error: errC } = await supabase
      .from('canvas')
      .select('id, usuario_id, updated_at, mision, retos_talento')

    const canvasMap = new Map(
      (canvas ?? []).map((c: any) => [c.usuario_id, c])
    )

    const lista: ParticipanteAdmin[] = usuarios.map((u: any) => {
      const c = canvasMap.get(u.id)
      return {
        userId: u.id,
        canvasId: c?.id ?? null,
        nombre: u.nombre,
        identificador: u.identificador,
        created_at: u.created_at,
        updated_at: c?.updated_at ?? null,
        tieneDatos: !!(c?.mision?.trim() || c?.retos_talento?.trim()),
      }
    })

    setParticipantes(lista)
    setLoading(false)
  }

  function mostrarToast(msg: string, tipo: 'ok' | 'err') {
    setToast({ msg, tipo })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Borrado individual ───────────────────────────────────────────────────────
  async function borrarCanvasIndividual(p: ParticipanteAdmin) {
    setOperando(p.userId)
    setModalIndividual(null)

    // Borrar canvas
    if (p.canvasId) {
      const { error: errC } = await supabase
        .from('canvas')
        .delete()
        .eq('id', p.canvasId)
      if (errC) { mostrarToast('Error al eliminar el canvas.', 'err'); setOperando(null); return }
    }

    // Borrar usuario
    const { error: errU } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', p.userId)

    if (errU) {
      mostrarToast('Canvas eliminado pero error al borrar el usuario.', 'err')
    } else {
      mostrarToast(`Canvas de ${p.nombre} eliminado correctamente.`, 'ok')
    }

    setOperando(null)
    cargarParticipantes()
  }

  // ── Borrado masivo ───────────────────────────────────────────────────────────
  async function borrarTodo() {
    setModalMasivo(false)
    setOperando('all')

    // Borrar todos los canvas primero (FK)
    const { error: errC } = await supabase
      .from('canvas')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // elimina todos

    if (errC) { mostrarToast('Error al eliminar los canvas.', 'err'); setOperando(null); return }

    // Borrar todos los usuarios (excepto superusuario)
    const { error: errU } = await supabase
      .from('usuarios')
      .delete()
      .neq('rol', 'superusuario')

    if (errU) {
      mostrarToast('Canvas borrados pero error al borrar usuarios.', 'err')
    } else {
      mostrarToast('Sesión reiniciada: todos los datos han sido eliminados.', 'ok')
    }

    setOperando(null)
    cargarParticipantes()
  }

  function formatDate(iso: string | null) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  if (!sesion) return null

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-body text-white flex items-center gap-2 animate-slide-up ${
          toast.tipo === 'ok' ? 'bg-semantic-success' : 'bg-semantic-error'
        }`}>
          {toast.tipo === 'ok'
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          }
          {toast.msg}
        </div>
      )}

      {/* Modal individual */}
      {modalIndividual && (
        <ModalConfirmacion
          titulo="Eliminar participante"
          mensaje={`Vas a eliminar el canvas y todos los datos de ${modalIndividual.nombre}. El usuario no podrá acceder después de esta acción.`}
          textoConfirmar="Sí, eliminar"
          peligroso
          onConfirmar={() => borrarCanvasIndividual(modalIndividual)}
          onCancelar={() => setModalIndividual(null)}
        />
      )}

      {/* Modal masivo */}
      {modalMasivo && (
        <ModalConfirmacion
          titulo="Borrado masivo de sesión"
          mensaje={`Vas a eliminar TODOS los canvas y usuarios participantes (${participantes.length} registros). Esta acción reinicia la aplicación a su estado inicial.`}
          textoConfirmar="Sí, borrar todo"
          peligroso
          onConfirmar={borrarTodo}
          onCancelar={() => setModalMasivo(false)}
        />
      )}

      <main className="min-h-screen bg-neutral-100 flex flex-col">
        {/* Navbar */}
        <header className="bg-brand-blue-dark border-b border-white/10 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogoMutua variant="light" />
              <span className="text-white/40 text-xs font-body">·</span>
              <span className="text-white/70 text-xs font-body uppercase tracking-wider">Panel de administración</span>
            </div>
            <div className="flex items-center gap-4">

              <button
                onClick={() => { cerrarSesion(); router.push('/') }}
                className="text-white/60 hover:text-semantic-error text-xs font-body transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6 animate-slide-up">

          {/* Cabecera */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-brand-blue-dark text-2xl uppercase">Panel de administración</h1>
              <p className="text-sm text-neutral-500 font-body mt-1">
                Gestión de participantes y contenido de la sesión
              </p>
            </div>
            {/* Botón borrado masivo */}
            <button
              id="btn-borrado-masivo"
              onClick={() => setModalMasivo(true)}
              disabled={participantes.length === 0 || operando === 'all'}
              className="flex items-center gap-2 px-4 py-2.5 bg-semantic-error text-white text-sm font-body rounded-xl hover:bg-semantic-error/90 transition-colors disabled:opacity-40 shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
              Borrar toda la sesión
            </button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Participantes', value: participantes.length, icon: '👥', color: 'bg-brand-blue-dark' },
              { label: 'Con datos', value: participantes.filter(p => p.tieneDatos).length, icon: '✅', color: 'bg-semantic-success' },
              { label: 'Sin completar', value: participantes.filter(p => !p.tieneDatos).length, icon: '⏳', color: 'bg-neutral-400' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="bg-white rounded-xl border border-neutral-200 shadow-sm px-5 py-4">
                <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-base mb-2`}>{icon}</div>
                <p className="font-display text-brand-blue-dark text-2xl">{loading ? '—' : value}</p>
                <p className="text-xs text-neutral-500 font-body mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Tabla de participantes */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="bg-brand-blue-dark/5 border-b border-brand-blue-dark/10 px-6 py-4">
              <h2 className="font-display text-brand-blue-dark text-lg uppercase">Participantes</h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <svg className="animate-spin w-7 h-7 text-brand-blue-mid" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              </div>
            ) : participantes.length === 0 ? (
              <div className="text-center py-16 text-neutral-400 font-body text-sm">
                No hay participantes registrados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="text-left px-6 py-3 text-xs font-body text-neutral-500 uppercase tracking-wider">Participante</th>
                      <th className="text-left px-4 py-3 text-xs font-body text-neutral-500 uppercase tracking-wider hidden md:table-cell">Identificador</th>
                      <th className="text-left px-4 py-3 text-xs font-body text-neutral-500 uppercase tracking-wider hidden lg:table-cell">Registro</th>
                      <th className="text-left px-4 py-3 text-xs font-body text-neutral-500 uppercase tracking-wider hidden lg:table-cell">Últ. edición</th>
                      <th className="text-center px-4 py-3 text-xs font-body text-neutral-500 uppercase tracking-wider">Estado</th>
                      <th className="text-right px-6 py-3 text-xs font-body text-neutral-500 uppercase tracking-wider">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {participantes.map((p) => (
                      <tr key={p.userId} className="hover:bg-neutral-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-blue-dark/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-brand-blue-dark font-display text-xs uppercase">{p.nombre.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-neutral-800 font-body text-sm">{p.nombre}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-neutral-500 hidden md:table-cell">{p.identificador}</td>
                        <td className="px-4 py-4 text-xs text-neutral-400 font-body hidden lg:table-cell">{formatDate(p.created_at)}</td>
                        <td className="px-4 py-4 text-xs text-neutral-400 font-body hidden lg:table-cell">{formatDate(p.updated_at)}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-body ${
                            p.tieneDatos
                              ? 'bg-semantic-success/10 text-semantic-success'
                              : 'bg-neutral-100 text-neutral-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.tieneDatos ? 'bg-semantic-success' : 'bg-neutral-300'}`} />
                            {p.tieneDatos ? 'Con datos' : 'Vacío'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {p.canvasId && (
                              <Link
                                href={`/canvas/ver?id=${p.canvasId}`}
                                className="text-xs text-brand-blue-mid hover:text-brand-blue-dark font-body transition-colors"
                              >
                                Ver →
                              </Link>
                            )}
                            <button
                              onClick={() => setModalIndividual(p)}
                              disabled={operando === p.userId}
                              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-semantic-error border border-semantic-error/30 hover:bg-semantic-error hover:text-white transition-all font-body disabled:opacity-40"
                            >
                              {operando === p.userId ? (
                                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                </svg>
                              ) : (
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                </svg>
                              )}
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Nota sobre el superusuario */}
          <div className="bg-brand-blue-dark/5 border border-brand-blue-dark/10 rounded-xl px-5 py-4">
            <p className="text-xs text-brand-blue-dark font-body">
              <span className="font-semibold">Nota:</span> Las credenciales del súper usuario deben crearse directamente en Supabase con <code className="bg-white px-1 rounded">rol = &apos;superusuario&apos;</code>. Este panel solo es accesible para cuentas con ese rol.
            </p>
          </div>

          <p className="text-center text-xs text-neutral-400 font-body pb-8">
            Dinámica organizativa interna — Mutua Madrileña 2026
          </p>
        </div>
      </main>
    </>
  )
}
