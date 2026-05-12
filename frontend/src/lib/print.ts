import { TIMING } from './timing'

/**
 * Abre una ventana nueva con el HTML dado, copiando los `<style>` y
 * `<link rel="stylesheet">` del documento actual para que Tailwind y demás
 * estilos en runtime apliquen también en el preview de impresión.
 *
 * Espera a que las hojas de estilo enlazadas terminen de cargar antes de
 * disparar el `print()`, así evitamos imprimir sin estilos.
 */
export function openPrintWindow(bodyHtml: string, title: string): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  printWindow.document.open()
  printWindow.document.write(
    `<!DOCTYPE html><html lang="es"><head><title>${escapeHtml(title)}</title><meta charset="UTF-8"></head><body>${bodyHtml}</body></html>`
  )
  printWindow.document.close()

  const targetHead = printWindow.document.head
  const targetBody = printWindow.document.body

  // Forzar impresión con colores exactos (gradientes, fondos azules, etc.).
  // Sin esto, los browsers omiten background-color en el output del print.
  const colorAdjust = printWindow.document.createElement('style')
  colorAdjust.textContent = `
    @media print {
      html, body, * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
      body { margin: 0 !important; }
    }
  `
  targetHead.appendChild(colorAdjust)

  // Clonar todos los estilos inline (Vite dev) y links (Vite build) del documento actual.
  const sources = document.querySelectorAll<HTMLStyleElement | HTMLLinkElement>(
    'style, link[rel="stylesheet"]'
  )
  const linkPromises: Promise<void>[] = []
  sources.forEach((node) => {
    const clone = node.cloneNode(true) as HTMLElement
    if (clone.tagName === 'LINK') {
      linkPromises.push(
        new Promise<void>((resolve) => {
          clone.addEventListener('load', () => resolve(), { once: true })
          clone.addEventListener('error', () => resolve(), { once: true })
        })
      )
    }
    targetHead.appendChild(clone)
  })

  // Tailwind detecta clases escaneando el HTML. En el window nuevo no hay
  // proceso de build, pero como copiamos las <style>/<link> ya compiladas,
  // las clases que existan en el bundle aplicarán normalmente.
  void targetBody

  const fire = () => {
    try {
      printWindow.focus()
      printWindow.print()
    } finally {
      // Algunos browsers bloquean si cerramos demasiado pronto.
      setTimeout(() => { printWindow.close(); window.focus() }, TIMING.PRINT_DELAY)
    }
  }

  if (linkPromises.length === 0) {
    setTimeout(fire, TIMING.PRINT_OPEN_DELAY)
  } else {
    Promise.all(linkPromises).then(() => setTimeout(fire, TIMING.PRINT_OPEN_DELAY))
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&': return '&amp;'
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '"': return '&quot;'
      default: return '&#39;'
    }
  })
}
