import type { SesionUsuario } from '@/types'

const SESSION_KEY = 'dm_session'

export function guardarSesion(usuario: SesionUsuario): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_KEY, JSON.stringify(usuario))
}

export function obtenerSesion(): SesionUsuario | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(SESSION_KEY)
  if (!data) return null
  try {
    return JSON.parse(data) as SesionUsuario
  } catch {
    return null
  }
}

export function cerrarSesion(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
}

export function tieneSesionActiva(): boolean {
  return obtenerSesion() !== null
}
