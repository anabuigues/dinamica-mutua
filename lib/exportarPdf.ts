import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { TraspasoItem } from '@/types'

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

export function descargarPDF(
  areaNombre: string, 
  aportaciones: CanvasConAutor[], 
  allTraspasar: { autor: string; texto: string }[], 
  allRecibir: { autor: string; texto: string }[]
) {
  const doc = new jsPDF()
  
  // Título Principal
  doc.setFontSize(20)
  doc.setTextColor(0, 48, 135) // brand-blue-dark
  doc.text(`Dinámica Offsite 27 de Abril`, 14, 22)
  
  doc.setFontSize(16)
  doc.setTextColor(100, 100, 100)
  doc.text(`Área: ${areaNombre}`, 14, 30)

  let startY = 40

  const agregarSeccion = (titulo: string, data: { autor: string, fecha: string, texto: string }[]) => {
    if (data.length === 0) return

    autoTable(doc, {
      startY,
      head: [[titulo, 'Autor', 'Fecha']],
      body: data.map(item => [item.texto, item.autor, item.fecha]),
      theme: 'grid',
      headStyles: { fillColor: [0, 48, 135], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 110 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 }
      },
      styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' },
      margin: { left: 14, right: 14 }
    })
    
    startY = (doc as any).lastAutoTable.finalY + 10
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  // Mapear los datos de cada sección ignorando los vacíos
  const mapData = (field: keyof CanvasConAutor) => {
    return aportaciones
      .filter(a => typeof a[field] === 'string' && (a[field] as string).trim() !== '')
      .map(a => ({
        autor: a.usuarios.nombre,
        fecha: formatFecha(a.updated_at),
        texto: a[field] as string
      }))
  }

  agregarSeccion('Misión', mapData('mision'))
  agregarSeccion('Implantación: Talento', mapData('retos_talento'))
  agregarSeccion('Implantación: Procesos', mapData('retos_procesos'))
  agregarSeccion('Implantación: Cultura', mapData('retos_cultura'))
  agregarSeccion('Implantación: Otros', mapData('retos_otros'))

  // Traspasos (Tienen formato diferente, no tienen fecha individual explícita)
  const agregarTraspasos = (titulo: string, color: [number, number, number], items: { autor: string; texto: string }[]) => {
    if (items.length === 0) return

    autoTable(doc, {
      startY,
      head: [[titulo, 'Autor']],
      body: items.map(item => [item.texto, item.autor]),
      theme: 'grid',
      headStyles: { fillColor: color, textColor: 255 },
      columnStyles: {
        0: { cellWidth: 140 },
        1: { cellWidth: 40 }
      },
      styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' },
      margin: { left: 14, right: 14 }
    })
    
    startY = (doc as any).lastAutoTable.finalY + 10
  }

  // Si nos acercamos al final de la página, hacer salto
  if (startY > 250) {
    doc.addPage()
    startY = 20
  }

  agregarTraspasos('Traspasar', [0, 48, 135], allTraspasar)
  agregarTraspasos('Recibir', [220, 53, 69], allRecibir) // pink

  // Guardar el PDF
  doc.save(`canvas_${areaNombre.replace(/\s+/g, '_').toLowerCase()}.pdf`)
}
