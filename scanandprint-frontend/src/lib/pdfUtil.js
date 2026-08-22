export async function getExactPageCount(file) {
  if (!file) return 1

  if (file.type && file.type.startsWith('image/')) {
    return 1
  }

  if ((file.type && file.type.includes('pdf')) || (file.name && file.name.toLowerCase().endsWith('.pdf'))) {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const { PDFDocument } = await import('pdf-lib')
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
      const count = pdfDoc.getPageCount()
      return Math.max(1, count)
    } catch (err) {
      console.warn('PDF parsing fallback:', err.message)
      return 1
    }
  }

  return 1
}

export function parsePageRange(rangeStr, totalDocPages) {
  if (!rangeStr || !rangeStr.trim() || rangeStr.trim().toLowerCase() === 'all') {
    return {
      count: totalDocPages,
      valid: true,
      selectedPages: Array.from({ length: totalDocPages }, (_, i) => i + 1),
    }
  }

  const cleaned = rangeStr.replace(/\s+/g, '')
  const parts = cleaned.split(',')
  const pageSet = new Set()

  for (const part of parts) {
    if (!part) continue

    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-')
      const start = parseInt(startStr, 10)
      const end = parseInt(endStr, 10)

      if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
        return { count: 0, valid: false, error: `Invalid range "${part}"`, selectedPages: [] }
      }
      if (end > totalDocPages) {
        return {
          count: 0,
          valid: false,
          error: `Page ${end} exceeds document limit (${totalDocPages})`,
          selectedPages: [],
        }
      }

      for (let p = start; p <= end; p++) {
        pageSet.add(p)
      }
    } else {
      const single = parseInt(part, 10)
      if (isNaN(single) || single < 1) {
        return { count: 0, valid: false, error: `Invalid page number "${part}"`, selectedPages: [] }
      }
      if (single > totalDocPages) {
        return {
          count: 0,
          valid: false,
          error: `Page ${single} exceeds document limit (${totalDocPages})`,
          selectedPages: [],
        }
      }
      pageSet.add(single)
    }
  }

  const selectedPages = Array.from(pageSet).sort((a, b) => a - b)
  return {
    count: Math.max(1, selectedPages.length),
    valid: selectedPages.length > 0,
    selectedPages,
  }
}