/**
 * Genera un identificador único de 8 caracteres con formato XXXX-XXXX
 * Ejemplo: A3K9-PZ2M
 */
export function generarIdentificador(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sin O, 0, I, 1 para evitar confusión
  let resultado = ''
  for (let i = 0; i < 8; i++) {
    if (i === 4) resultado += '-'
    resultado += chars[Math.floor(Math.random() * chars.length)]
  }
  return resultado
}

/**
 * Genera una contraseña legible con formato palabra-número-palabra
 * Ejemplo: cielo-84-mapa
 */
export function generarPassword(): string {
  const palabras = [
    'alba', 'arco', 'brisa', 'campo', 'cielo', 'costa', 'cima', 'duna',
    'faro', 'flor', 'fuego', 'lago', 'loma', 'luna', 'mapa', 'mar',
    'monte', 'nieve', 'niebla', 'nube', 'orilla', 'pico', 'pinar', 'playa',
    'pradera', 'risco', 'roca', 'ruta', 'selva', 'sierra', 'sol', 'valle',
    'vela', 'viento', 'bosque', 'cumbre', 'llano', 'manantial', 'peña', 'rio',
  ]
  const p1 = palabras[Math.floor(Math.random() * palabras.length)]
  const num = Math.floor(Math.random() * 90) + 10 // 10-99
  const p2 = palabras[Math.floor(Math.random() * palabras.length)]
  return `${p1}-${num}-${p2}`
}
