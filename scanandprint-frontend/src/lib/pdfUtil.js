import { PDFDocument, degrees } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

// Configure PDF.js worker locally from Vite bundle or public folder (no broken CDN URLs!)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker || '/pdf.worker.min.mjs'
}

/**
 * Get exact page count of a PDF or Image file
 */
export async function getExactPageCount(file) {
  if (!file) return 1

  if (file.type && file.type.startsWith('image/')) {
    return 1
  }

  if ((file.type && file.type.includes('pdf')) || (file.name && file.name.toLowerCase().endsWith('.pdf'))) {
    try {
      const arrayBuffer = await file.arrayBuffer()
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

/**
 * Render all pages of a PDF into high-res image thumbnails for the visual page grid
 */
export async function renderPdfPagesToThumbnails(file, onProgress) {
  if (!file) return []

  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker || '/pdf.worker.min.mjs'
  }

  let arrayBuffer
  if (file instanceof ArrayBuffer) {
    arrayBuffer = file
  } else if (file instanceof Uint8Array) {
    arrayBuffer = file.buffer
  } else if (file.arrayBuffer) {
    arrayBuffer = await file.arrayBuffer()
  } else {
    throw new Error('Unsupported file format for PDF thumbnails')
  }

  const data = new Uint8Array(arrayBuffer)
  const loadingTask = pdfjsLib.getDocument({
    data,
    useSystemFonts: true,
  })
  const pdf = await loadingTask.promise
  const numPages = pdf.numPages
  const pages = []

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum)
      // Scale 1.2 provides crisp, high-res previews
      const viewport = page.getViewport({ scale: 1.2 })

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = viewport.width
      canvas.height = viewport.height

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      }

      await page.render(renderContext).promise
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)

      pages.push({
        id: `page_${pageNum}_${Date.now()}`,
        pageIndex: pageNum - 1,
        pageNumber: pageNum,
        dataUrl,
        width: viewport.width,
        height: viewport.height,
        rotation: 0, // 0, 90, 180, 270
        isLandscape: viewport.width > viewport.height,
        selected: true,
      })

      if (onProgress) {
        onProgress(pageNum, numPages)
      }
    } catch (err) {
      console.warn(`Failed to render page ${pageNum}:`, err)
    }
  }

  return pages
}

/**
 * Parse comma-separated page ranges (e.g. "1, 3-5, 8")
 */
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

/**
 * Generate a new edited PDF file with selected pages, rotations, deleted pages, appended files,
 * and optional 2-in-1 Book Side-by-Side layout mode!
 */
export async function exportEditedPdf({ originalFile, pages = [], additionalFiles = [], layoutMode = 'standard' }) {
  const outPdfDoc = await PDFDocument.create()

  const selectedPages = pages.filter((p) => p.selected !== false)
  if (!selectedPages.length && !additionalFiles.length) {
    throw new Error('Please select at least one page to print')
  }

  // Cache loaded PDF documents to avoid re-parsing the same file multiple times
  const pdfDocMap = new Map()
  async function getLoadedPdfDoc(file) {
    if (!file) return null
    if (pdfDocMap.has(file)) return pdfDocMap.get(file)
    const bytes = await file.arrayBuffer()
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
    pdfDocMap.set(file, doc)
    return doc
  }

  // Helper to embed an image into outPdfDoc
  async function getEmbeddedImg(file) {
    const imgBytes = await file.arrayBuffer()
    const isPng = file.type === 'image/png' || file.name?.toLowerCase().endsWith('.png')
    if (isPng) {
      try {
        return await outPdfDoc.embedPng(imgBytes)
      } catch {
        return await outPdfDoc.embedJpg(imgBytes)
      }
    }
    try {
      return await outPdfDoc.embedJpg(imgBytes)
    } catch {
      return await outPdfDoc.embedPng(imgBytes)
    }
  }

  if (layoutMode === '2in1_book') {
    // 2-in-1 Booklet / Side-by-side on Landscape A4
    const sheetW = 841.89
    const sheetH = 595.28
    const halfW = sheetW / 2

    const renderHalf = async (pageObj, targetSheet, offsetX) => {
      if (!pageObj) return
      if (pageObj.sourceType === 'image' && pageObj.sourceFile) {
        const embeddedImg = await getEmbeddedImg(pageObj.sourceFile)
        const scale = Math.min((halfW - 24) / embeddedImg.width, (sheetH - 24) / embeddedImg.height)
        const drawW = embeddedImg.width * scale
        const drawH = embeddedImg.height * scale
        const drawX = offsetX + (halfW - drawW) / 2
        const drawY = (sheetH - drawH) / 2
        targetSheet.drawImage(embeddedImg, {
          x: drawX,
          y: drawY,
          width: drawW,
          height: drawH,
        })
      } else {
        const srcFile = pageObj.sourceFile || originalFile
        const srcPdf = await getLoadedPdfDoc(srcFile)
        const pageIdx = typeof pageObj.sourcePageIndex === 'number' ? pageObj.sourcePageIndex : pageObj.pageIndex
        const [embedded] = await outPdfDoc.embedPdf(srcPdf, [pageIdx])
        const scale = Math.min((halfW - 24) / embedded.width, (sheetH - 24) / embedded.height)
        const drawW = embedded.width * scale
        const drawH = embedded.height * scale
        const drawX = offsetX + (halfW - drawW) / 2
        const drawY = (sheetH - drawH) / 2
        targetSheet.drawPage(embedded, {
          x: drawX,
          y: drawY,
          width: drawW,
          height: drawH,
        })
      }
    }

    for (let i = 0; i < selectedPages.length; i += 2) {
      const newSheet = outPdfDoc.addPage([sheetW, sheetH])
      await renderHalf(selectedPages[i], newSheet, 0)
      if (selectedPages[i + 1]) {
        await renderHalf(selectedPages[i + 1], newSheet, halfW)
      }
    }
  } else {
    // Standard 1-to-1 Page export
    const pageW = 595.28
    const pageH = 841.89

    for (const p of selectedPages) {
      if (p.sourceType === 'image' && p.sourceFile) {
        const embeddedImg = await getEmbeddedImg(p.sourceFile)
        const a4Page = outPdfDoc.addPage([pageW, pageH])
        const imgW = embeddedImg.width
        const imgH = embeddedImg.height

        const isRotatedLandscape = p.rotation === 90 || p.rotation === 270
        const targetW = isRotatedLandscape ? pageH : pageW
        const targetH = isRotatedLandscape ? pageW : pageH
        const scale = Math.min((targetW - 36) / imgW, (targetH - 36) / imgH)
        const drawW = imgW * scale
        const drawH = imgH * scale

        if (!p.rotation || p.rotation === 0) {
          a4Page.drawImage(embeddedImg, {
            x: (pageW - drawW) / 2,
            y: (pageH - drawH) / 2,
            width: drawW,
            height: drawH,
          })
        } else if (p.rotation === 90) {
          a4Page.drawImage(embeddedImg, {
            x: (pageW + drawH) / 2,
            y: (pageH - drawW) / 2,
            width: drawW,
            height: drawH,
            rotate: degrees(90),
          })
        } else if (p.rotation === 180) {
          a4Page.drawImage(embeddedImg, {
            x: (pageW + drawW) / 2,
            y: (pageH + drawH) / 2,
            width: drawW,
            height: drawH,
            rotate: degrees(180),
          })
        } else if (p.rotation === 270) {
          a4Page.drawImage(embeddedImg, {
            x: (pageW - drawH) / 2,
            y: (pageH + drawW) / 2,
            width: drawW,
            height: drawH,
            rotate: degrees(270),
          })
        }
      } else {
        // Standard PDF Page
        const srcFile = p.sourceFile || originalFile
        const srcPdf = await getLoadedPdfDoc(srcFile)
        const pageIdx = typeof p.sourcePageIndex === 'number' ? p.sourcePageIndex : p.pageIndex
        const [copiedPage] = await outPdfDoc.copyPages(srcPdf, [pageIdx])
        if (p.rotation) {
          const currentAngle = copiedPage.getRotation().angle
          copiedPage.setRotation(degrees((currentAngle + p.rotation) % 360))
        }
        outPdfDoc.addPage(copiedPage)
      }
    }
  }

  // 2. Append additional files if user merged any directly
  for (const extraFile of additionalFiles) {
    if (extraFile.type === 'application/pdf' || extraFile.name?.toLowerCase().endsWith('.pdf')) {
      const extraPdfDoc = await getLoadedPdfDoc(extraFile)
      const copiedExtraPages = await outPdfDoc.copyPages(extraPdfDoc, extraPdfDoc.getPageIndices())
      copiedExtraPages.forEach((page) => outPdfDoc.addPage(page))
    } else if (extraFile.type?.startsWith('image/')) {
      const embeddedImg = await getEmbeddedImg(extraFile)
      const a4Page = outPdfDoc.addPage([595.28, 841.89])
      const { width: imgW, height: imgH } = embeddedImg
      const pageW = 595.28
      const pageH = 841.89
      const scale = Math.min((pageW - 36) / imgW, (pageH - 36) / imgH)
      const drawW = imgW * scale
      const drawH = imgH * scale
      a4Page.drawImage(embeddedImg, {
        x: (pageW - drawW) / 2,
        y: (pageH - drawH) / 2,
        width: drawW,
        height: drawH,
      })
    }
  }

  const pdfBytes = await outPdfDoc.save()
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const baseName = originalFile.name ? originalFile.name.replace(/\.[^/.]+$/, '') : 'document'

  return new File([blob], `${baseName}_edited.pdf`, {
    type: 'application/pdf',
    lastModified: Date.now(),
  })
}

/**
 * Combines up to 5 files (images, photos, or PDFs) into a single print-ready unified PDF.
 * Each image is scaled to fit an A4 page proportionally with balanced margins.
 *
 * @param {File[]} files - Array of 1 to 5 files
 * @returns {Promise<File>}
 */
export async function combineFilesToPdf(files) {
  if (!files || files.length === 0) {
    throw new Error('No files provided to combine')
  }

  // If single PDF, return directly
  if (files.length === 1 && ((files[0].type && files[0].type.includes('pdf')) || files[0].name?.toLowerCase().endsWith('.pdf'))) {
    return files[0]
  }

  const outPdfDoc = await PDFDocument.create()
  const a4Width = 595.28
  const a4Height = 841.89

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const isPdf = (file.type && file.type.includes('pdf')) || file.name?.toLowerCase().endsWith('.pdf')

    if (isPdf) {
      try {
        const bytes = await file.arrayBuffer()
        const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true })
        const copiedPages = await outPdfDoc.copyPages(srcDoc, srcDoc.getPageIndices())
        copiedPages.forEach((p) => outPdfDoc.addPage(p))
      } catch (err) {
        console.warn('Error appending PDF in combineFilesToPdf:', err)
      }
    } else {
      // Image file (JPG, PNG, WEBP, etc.)
      try {
        let imgBytes
        let isPng = file.type === 'image/png' || file.name?.toLowerCase().endsWith('.png')
        let isJpg = file.type === 'image/jpeg' || file.name?.toLowerCase().endsWith('.jpg') || file.name?.toLowerCase().endsWith('.jpeg')

        if (isPng || isJpg) {
          imgBytes = await file.arrayBuffer()
        } else {
          // Rasterize WEBP or other browser image formats to PNG via canvas
          imgBytes = await new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file)
            const img = new Image()
            img.onload = () => {
              URL.revokeObjectURL(url)
              const canvas = document.createElement('canvas')
              canvas.width = img.naturalWidth || 1200
              canvas.height = img.naturalHeight || 1600
              const ctx = canvas.getContext('2d')
              ctx.drawImage(img, 0, 0)
              canvas.toBlob(async (blob) => {
                if (!blob) return reject(new Error('Canvas rasterization failed'))
                resolve(await blob.arrayBuffer())
              }, 'image/png')
            }
            img.onerror = () => {
              URL.revokeObjectURL(url)
              reject(new Error('Failed to load image'))
            }
            img.src = url
          })
          isPng = true
        }

        let embeddedImg = null
        if (isPng) {
          try {
            embeddedImg = await outPdfDoc.embedPng(imgBytes)
          } catch {
            embeddedImg = await outPdfDoc.embedJpg(imgBytes)
          }
        } else {
          try {
            embeddedImg = await outPdfDoc.embedJpg(imgBytes)
          } catch {
            embeddedImg = await outPdfDoc.embedPng(imgBytes)
          }
        }

        if (embeddedImg) {
          const page = outPdfDoc.addPage([a4Width, a4Height])
          const imgWidth = embeddedImg.width
          const imgHeight = embeddedImg.height

          // Printable area with margins
          const maxW = a4Width - 48
          const maxH = a4Height - 48
          const scale = Math.min(maxW / imgWidth, maxH / imgHeight, 1)

          const renderW = imgWidth * scale
          const renderH = imgHeight * scale
          const posX = (a4Width - renderW) / 2
          const posY = (a4Height - renderH) / 2

          page.drawImage(embeddedImg, {
            x: posX,
            y: posY,
            width: renderW,
            height: renderH,
          })
        }
      } catch (imgErr) {
        console.warn('Error processing image in combineFilesToPdf:', imgErr)
      }
    }
  }

  if (outPdfDoc.getPageCount() === 0) {
    throw new Error('Could not process the selected files into a printable document')
  }

  const pdfBytes = await outPdfDoc.save()
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const combinedName = files.length === 1
    ? `${files[0].name.replace(/\.[^/.]+$/, '')}.pdf`
    : `combined_${files.length}_items.pdf`

  return new File([blob], combinedName, {
    type: 'application/pdf',
    lastModified: Date.now(),
  })
}