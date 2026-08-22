import { jsPDF } from "jspdf"
import "svg2pdf.js"

import { formatDateShort } from "@/lib/format"

interface ExportOptions {
  equipo: string
  fecha: string
  titulo: string
  duracion: string
  objetivo: string
}

export async function exportExerciseToPdf(svg: SVGSVGElement, opts: ExportOptions) {
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 15

  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(18)
  pdf.text(opts.titulo || "Ejercicio", margin, margin)

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(10)
  const metaParts: string[] = []
  if (opts.fecha) metaParts.push(formatDateShort(opts.fecha))
  if (opts.duracion) metaParts.push(`${opts.duracion} min`)
  if (opts.equipo) metaParts.push(opts.equipo)
  if (metaParts.length > 0) {
    pdf.text(metaParts.join("   ·   "), margin, margin + 6)
  }

  const diagramTop = margin + 12
  const footerReserved = opts.objetivo ? 22 : 6
  const diagramWidth = pageWidth - margin * 2
  const diagramHeight = Math.min(
    diagramWidth * 0.64,
    pageHeight - diagramTop - margin - footerReserved
  )
  const diagramWidthFitted = diagramHeight / 0.64
  const diagramX = margin + (diagramWidth - diagramWidthFitted) / 2

  await pdf.svg(svg, {
    x: diagramX,
    y: diagramTop,
    width: diagramWidthFitted,
    height: diagramHeight,
  })

  if (opts.objetivo) {
    const footerY = diagramTop + diagramHeight + 7
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(10)
    pdf.text("Objetivo", margin, footerY)
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(10)
    const lines = pdf.splitTextToSize(opts.objetivo, pageWidth - margin * 2)
    pdf.text(lines, margin, footerY + 5)
  }

  const filename = `${(opts.titulo || "ejercicio").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`
  pdf.save(filename)
}
