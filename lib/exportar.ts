import type { TraspasoItem } from '@/types'

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface CanvasExport {
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

const BRAND_BLUE = [0, 48, 135] as [number, number, number]
const BRAND_PINK = [197, 30, 83] as [number, number, number]
const WHITE = [255, 255, 255] as [number, number, number]
const LIGHT_GRAY = [245, 246, 250] as [number, number, number]
const TEXT_DARK = [30, 40, 60] as [number, number, number]
const TEXT_MID = [100, 110, 130] as [number, number, number]

function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function formatTime(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

// ─── PDF canvas individual ────────────────────────────────────────────────────
export async function exportarCanvasPDF(canvas: CanvasExport) {
  const { default: jsPDF } = await import('jspdf')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = 210
  const margin = 14
  const contentW = pageW - margin * 2
  let y = 0

  // ── Cabecera ───────────────────────────────────────────────────────────────
  doc.setFillColor(...BRAND_BLUE)
  doc.rect(0, 0, pageW, 36, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...WHITE)
  doc.text('NUEVO MODELO ORGANIZATIVO', margin, 12)

  doc.setFontSize(18)
  doc.text('MI CANVAS', margin, 22)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`${canvas.nombre}`, margin, 29)
  doc.text(formatDate(canvas.updated_at), pageW - margin, 29, { align: 'right' })

  y = 44

  // ── Misión ─────────────────────────────────────────────────────────────────
  doc.setFillColor(...LIGHT_GRAY)
  doc.rect(margin, y, contentW, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...BRAND_BLUE)
  doc.text('MISIÓN', margin + 3, y + 5)
  y += 9

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...TEXT_DARK)
  const misionLines = doc.splitTextToSize(canvas.mision || '(Sin contenido)', contentW - 4)
  doc.text(misionLines, margin + 2, y)
  y += misionLines.length * 4.5 + 8

  // ── Implantación ───────────────────────────────────────────────────────────
  doc.setFillColor(...LIGHT_GRAY)
  doc.rect(margin, y, contentW, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...BRAND_BLUE)
  doc.text('IMPLANTACIÓN — RETOS', margin + 3, y + 5)
  y += 10

  const retos = [
    { label: 'TALENTO', value: canvas.retos_talento },
    { label: 'PROCESOS', value: canvas.retos_procesos },
    { label: 'CULTURA', value: canvas.retos_cultura },
    { label: 'OTROS', value: canvas.retos_otros },
  ]

  const colW = contentW / 2 - 2
  const startY = y

  retos.forEach(({ label, value }, idx) => {
    const col = idx % 2
    const xPos = margin + col * (colW + 4)

    // Header celda
    doc.setFillColor(...BRAND_BLUE)
    doc.rect(xPos, y, colW, 6, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...WHITE)
    doc.text(label, xPos + 2, y + 4.2)

    // Contenido celda
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...TEXT_DARK)
    const lines = doc.splitTextToSize(value || '(Sin contenido)', colW - 4)
    doc.text(lines, xPos + 2, y + 10)

    if (col === 1) {
      // Calcula la altura máxima de la fila actual
      const prevLines = doc.splitTextToSize(retos[idx - 1].value || '(Sin contenido)', colW - 4)
      const maxLines = Math.max(lines.length, prevLines.length)
      y += maxLines * 4.2 + 14
    }
  })

  y += 8

  // ── Traspasar / Recibir ────────────────────────────────────────────────────
  // Comprueba si hay espacio suficiente
  if (y + 40 > 285) { doc.addPage(); y = 14 }

  doc.setFillColor(...LIGHT_GRAY)
  doc.rect(margin, y, contentW, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...BRAND_BLUE)
  doc.text('TRASPASAR / RECIBIR', margin + 3, y + 5)
  y += 10

  const traspasarItems = canvas.traspasar.filter((t) => t.texto.trim())
  const recibirItems = canvas.recibir.filter((r) => r.texto.trim())

  const drawList = (items: TraspasoItem[], xPos: number, title: string, color: [number, number, number]) => {
    doc.setFillColor(...color)
    doc.rect(xPos, y, colW, 6, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...WHITE)
    doc.text(title, xPos + 2, y + 4.2)

    let itemY = y + 9
    if (items.length === 0) {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8)
      doc.setTextColor(...TEXT_MID)
      doc.text('(Sin elementos)', xPos + 2, itemY)
    } else {
      items.forEach((item) => {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8.5)
        doc.setTextColor(...TEXT_DARK)
        doc.text(`• ${item.texto}`, xPos + 2, itemY)
        itemY += 5
      })
    }
  }

  drawList(traspasarItems, margin, 'TRASPASAR', BRAND_BLUE)
  drawList(recibirItems, margin + colW + 4, 'RECIBIR', BRAND_PINK)

  // ── Footer ─────────────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFillColor(...BRAND_BLUE)
    doc.rect(0, 292, pageW, 5, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...WHITE)
    doc.text('Dinámica organizativa interna — Mutua Madrileña 2026', margin, 295.5)
    doc.text(`${i}/${pageCount}`, pageW - margin, 295.5, { align: 'right' })
  }

  doc.save(`canvas_${canvas.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`)
}

// ─── PDF dashboard agregado ──────────────────────────────────────────────────
export async function exportarDashboardPDF(
  canvases: CanvasExport[],
  filtroArea?: string,
) {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageW = 297
  const margin = 12
  const contentW = pageW - margin * 2
  const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  const titulo = filtroArea ? `Dashboard — ${filtroArea}` : 'Dashboard — Visión Agregada'

  // ── Cabecera ───────────────────────────────────────────────────────────────
  doc.setFillColor(...BRAND_BLUE)
  doc.rect(0, 0, pageW, 28, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...WHITE)
  doc.text('NUEVO MODELO ORGANIZATIVO — MUTUA MADRILEÑA', margin, 10)
  doc.setFontSize(16)
  doc.text(titulo.toUpperCase(), margin, 20)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(fecha, pageW - margin, 20, { align: 'right' })

  // ── Tabla 1: Misiones ──────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...BRAND_BLUE)
  doc.text('MISIONES', margin, 36)

  autoTable(doc, {
    startY: 39,
    margin: { left: margin, right: margin },
    head: [['Nombre', 'Misión', 'Fecha']],
    body: canvases
      .filter((c) => c.mision.trim())
      .map((c) => [c.nombre, c.mision, formatDate(c.updated_at)]),
    headStyles: { fillColor: BRAND_BLUE, textColor: WHITE, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: TEXT_DARK },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: { 2: { cellWidth: contentW * 0.5 } },
  })

  // ── Tabla 2: Retos por categoría ───────────────────────────────────────────
  const lastY1 = (doc as any).lastAutoTable.finalY + 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...BRAND_BLUE)
  doc.text('RETOS DE IMPLANTACIÓN', margin, lastY1)

  const retosRows: string[][] = []
  canvases.forEach((c) => {
    if (c.retos_talento.trim()) retosRows.push([c.nombre, 'Talento', c.retos_talento])
    if (c.retos_procesos.trim()) retosRows.push([c.nombre, 'Procesos', c.retos_procesos])
    if (c.retos_cultura.trim()) retosRows.push([c.nombre, 'Cultura', c.retos_cultura])
    if (c.retos_otros.trim()) retosRows.push([c.nombre, 'Otros', c.retos_otros])
  })

  autoTable(doc, {
    startY: lastY1 + 3,
    margin: { left: margin, right: margin },
    head: [['Nombre', 'Categoría', 'Reto']],
    body: retosRows,
    headStyles: { fillColor: BRAND_BLUE, textColor: WHITE, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: TEXT_DARK },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: { 3: { cellWidth: contentW * 0.5 } },
  })

  // ── Nueva página: Traspasar / Recibir ─────────────────────────────────────
  doc.addPage()

  doc.setFillColor(...BRAND_BLUE)
  doc.rect(0, 0, pageW, 18, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...WHITE)
  doc.text('TRASPASAR / RECIBIR', margin, 12)

  const trRows: string[][] = []
  const recRows: string[][] = []
  canvases.forEach((c) => {
    c.traspasar.filter((t) => t.texto.trim()).forEach((t) =>
      trRows.push([c.nombre, t.texto])
    )
    c.recibir.filter((r) => r.texto.trim()).forEach((r) =>
      recRows.push([c.nombre, r.texto])
    )
  })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...BRAND_BLUE)
  doc.text('TRASPASAR', margin, 26)

  autoTable(doc, {
    startY: 29,
    margin: { left: margin, right: margin },
    head: [['Nombre', 'Elemento a traspasar']],
    body: trRows.length ? trRows : [['—', 'Sin entradas']],
    headStyles: { fillColor: BRAND_BLUE, textColor: WHITE, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: TEXT_DARK },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: { 2: { cellWidth: contentW * 0.55 } },
  })

  const lastY2 = (doc as any).lastAutoTable.finalY + 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...BRAND_PINK)
  doc.text('RECIBIR', margin, lastY2)

  autoTable(doc, {
    startY: lastY2 + 3,
    margin: { left: margin, right: margin },
    head: [['Nombre', 'Elemento a recibir']],
    body: recRows.length ? recRows : [['—', 'Sin entradas']],
    headStyles: { fillColor: BRAND_PINK, textColor: WHITE, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: TEXT_DARK },
    alternateRowStyles: { fillColor: [255, 240, 248] as [number, number, number] },
    columnStyles: { 2: { cellWidth: contentW * 0.55 } },
  })

  // ── Footers ────────────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFillColor(...BRAND_BLUE)
    doc.rect(0, 207, pageW, 3, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...TEXT_MID)
    doc.text('Dinámica organizativa interna — Mutua Madrileña 2026', margin, 208)
    doc.text(`${i}/${pageCount}`, pageW - margin, 208, { align: 'right' })
  }

  doc.save(`dashboard_dinamica-mutua_${new Date().toISOString().slice(0, 10)}.pdf`)
}

// ─── Excel dashboard agregado ─────────────────────────────────────────────────
export async function exportarDashboardExcel(
  canvases: CanvasExport[],
  filtroArea?: string,
) {
  const XLSX = await import('xlsx')

  const wb = XLSX.utils.book_new()
  const fechaExport = new Date().toLocaleDateString('es-ES')

  // ── Hoja 1: Resumen ────────────────────────────────────────────────────────
  const resumenData = canvases.map((c) => ({
    'Nombre': c.nombre,
    'Misión': c.mision,
    'Retos — Talento': c.retos_talento,
    'Retos — Procesos': c.retos_procesos,
    'Retos — Cultura': c.retos_cultura,
    'Retos — Otros': c.retos_otros,
    'Traspasar': c.traspasar.filter((t) => t.texto.trim()).map((t) => t.texto).join(' | '),
    'Recibir': c.recibir.filter((r) => r.texto.trim()).map((r) => r.texto).join(' | '),
    'Última edición': formatDate(c.updated_at),
    'Exportado': fechaExport,
  }))

  const wsResumen = XLSX.utils.json_to_sheet(resumenData)
  wsResumen['!cols'] = [
    { wch: 22 }, { wch: 45 }, { wch: 35 }, { wch: 35 },
    { wch: 35 }, { wch: 35 }, { wch: 40 }, { wch: 40 }, { wch: 16 }, { wch: 14 },
  ]
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen')

  // ── Hoja 2: Retos detallados ───────────────────────────────────────────────
  const retosData: Record<string, string>[] = []
  canvases.forEach((c) => {
    const categorias: [string, string][] = [
      ['Talento', c.retos_talento],
      ['Procesos', c.retos_procesos],
      ['Cultura', c.retos_cultura],
      ['Otros', c.retos_otros],
    ]
    categorias.forEach(([cat, val]) => {
      if (val.trim()) {
        retosData.push({ 'Nombre': c.nombre, 'Categoría': cat, 'Reto': val })
      }
    })
  })

  const wsRetos = XLSX.utils.json_to_sheet(retosData)
  wsRetos['!cols'] = [{ wch: 22 }, { wch: 12 }, { wch: 60 }]
  XLSX.utils.book_append_sheet(wb, wsRetos, 'Retos')

  // ── Hoja 3: Traspasar / Recibir ────────────────────────────────────────────
  const trData: Record<string, string>[] = []
  canvases.forEach((c) => {
    c.traspasar.filter((t) => t.texto.trim()).forEach((t) =>
      trData.push({ 'Tipo': 'Traspasar', 'Nombre': c.nombre, 'Elemento': t.texto })
    )
    c.recibir.filter((r) => r.texto.trim()).forEach((r) =>
      trData.push({ 'Tipo': 'Recibir', 'Nombre': c.nombre, 'Elemento': r.texto })
    )
  })

  const wsTr = XLSX.utils.json_to_sheet(trData)
  wsTr['!cols'] = [{ wch: 12 }, { wch: 22 }, { wch: 55 }]
  XLSX.utils.book_append_sheet(wb, wsTr, 'Traspasar-Recibir')

  const nombreArchivo = `dashboard_dinamica-mutua${filtroArea ? `_${filtroArea}` : ''}_${new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, nombreArchivo)
}
