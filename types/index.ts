export interface Usuario {
  id: string
  nombre: string
  identificador: string
  password_hash: string
  rol: 'participante' | 'superusuario'
  created_at: string
}

export interface Canvas {
  id: string
  usuario_id: string
  mision: string | null
  retos_talento: string | null
  retos_procesos: string | null
  retos_cultura: string | null
  retos_otros: string | null
  traspasar: TraspasoItem[]
  recibir: TraspasoItem[]
  updated_at: string
}

export interface TraspasoItem {
  id: string
  texto: string
}

export interface SesionUsuario {
  id: string
  nombre: string
  identificador: string
  rol: 'participante' | 'superusuario'
}
