import { PDFDocument } from 'pdf-lib'
import { warpPerspectiveCanvas } from './perspectiveWarp'

/**
 * Creates an HTMLImageElement from a URL
 */
export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', (err) => reject(err))
    img.setAttribute('crossOrigin', 'anonymous')
    img.src = url
  })

export function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180
}

export function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation)
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

/**
 * Render freeform cropped image with transforms and filters
 */
export async function renderCroppedImageCanvas({
  imageSrc,
  cropBox, // { x: percent, y: percent, w: percent, h: percent }
  rotation = 0,
  flipH = false,
  flipV = false,
  filters = { brightness: 100, contrast: 100, isGrayscale: false, isSepia: false, isXerox: false, saturation: 100 },
}) {
  const image = await createImage(imageSrc)
  const rotRad = getRadianAngle(rotation)

  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation)

  // Intermediate transformed canvas
  const transCanvas = document.createElement('canvas')
  const transCtx = transCanvas.getContext('2d')
  transCanvas.width = bBoxWidth
  transCanvas.height = bBoxHeight

  // Apply CSS filters
  const filterParts = []
  if (filters.brightness !== 100) filterParts.push(`brightness(${filters.brightness}%)`)
  if (filters.contrast !== 100) filterParts.push(`contrast(${filters.contrast}%)`)
  if (filters.isGrayscale || filters.isXerox) filterParts.push('grayscale(100%)')
  if (filters.isSepia) filterParts.push('sepia(100%)')
  if (filters.saturation !== 100) filterParts.push(`saturate(${filters.saturation}%)`)

  transCtx.filter = filterParts.length > 0 ? filterParts.join(' ') : 'none'

  transCtx.save()
  transCtx.translate(bBoxWidth / 2, bBoxHeight / 2)
  transCtx.rotate(rotRad)
  transCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
  transCtx.translate(-image.width / 2, -image.height / 2)
  transCtx.drawImage(image, 0, 0)
  transCtx.restore()

  // Calculate pixel crop coordinates
  const pixelCropX = (cropBox.x / 100) * bBoxWidth
  const pixelCropY = (cropBox.y / 100) * bBoxHeight
  const pixelCropW = (cropBox.w / 100) * bBoxWidth
  const pixelCropH = (cropBox.h / 100) * bBoxHeight

  const cropCanvas = document.createElement('canvas')
  const cropCtx = cropCanvas.getContext('2d')
  cropCanvas.width = Math.max(10, Math.round(pixelCropW))
  cropCanvas.height = Math.max(10, Math.round(pixelCropH))

  cropCtx.drawImage(
    transCanvas,
    pixelCropX,
    pixelCropY,
    pixelCropW,
    pixelCropH,
    0,
    0,
    cropCanvas.width,
    cropCanvas.height
  )

  // High-contrast clean text threshold for Xerox Doc mode
  if (filters.isXerox) {
    const imgData = cropCtx.getImageData(0, 0, cropCanvas.width, cropCanvas.height)
    const data = imgData.data
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
      const v = avg > 140 ? 255 : avg < 100 ? 0 : avg
      data[i] = v
      data[i + 1] = v
      data[i + 2] = v
    }
    cropCtx.putImageData(imgData, 0, 0)
  }

  return cropCanvas
}

/**
 * 4-Point Perspective Warp Document Cropper (CamScanner / OKEN Scanner style)
 * Unskews and deskews phone camera pictures of tilted papers/cards
 */
export async function renderPerspectiveCropCanvas({
  imageSrc,
  corners, // [ { x: percent, y: percent }, { x, y }, { x, y }, { x, y } ] (TL, TR, BR, BL)
  rotation = 0,
  flipH = false,
  flipV = false,
  filters = { brightness: 100, contrast: 100, isGrayscale: false, isSepia: false, isXerox: false, saturation: 100 },
}) {
  const image = await createImage(imageSrc)
  const rotRad = getRadianAngle(rotation)
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation)

  const transCanvas = document.createElement('canvas')
  const transCtx = transCanvas.getContext('2d')
  transCanvas.width = bBoxWidth
  transCanvas.height = bBoxHeight

  // CSS Filters
  const filterParts = []
  if (filters.brightness !== 100) filterParts.push(`brightness(${filters.brightness}%)`)
  if (filters.contrast !== 100) filterParts.push(`contrast(${filters.contrast}%)`)
  if (filters.isGrayscale || filters.isXerox) filterParts.push('grayscale(100%)')
  if (filters.isSepia) filterParts.push('sepia(100%)')
  if (filters.saturation !== 100) filterParts.push(`saturate(${filters.saturation}%)`)

  transCtx.filter = filterParts.length > 0 ? filterParts.join(' ') : 'none'
  transCtx.save()
  transCtx.translate(bBoxWidth / 2, bBoxHeight / 2)
  transCtx.rotate(rotRad)
  transCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
  transCtx.translate(-image.width / 2, -image.height / 2)
  transCtx.drawImage(image, 0, 0)
  transCtx.restore()

  // Convert corner percentages to pixel coordinates on transCanvas
  const pixelCorners = corners.map((c) => ({
    x: (c.x / 100) * bBoxWidth,
    y: (c.y / 100) * bBoxHeight,
  }))

  const warpedCanvas = warpPerspectiveCanvas(transCanvas, pixelCorners)

  // Xerox clean document thresholding
  if (filters.isXerox) {
    const warpCtx = warpedCanvas.getContext('2d')
    const imgData = warpCtx.getImageData(0, 0, warpedCanvas.width, warpedCanvas.height)
    const data = imgData.data
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
      const v = avg > 140 ? 255 : avg < 100 ? 0 : avg
      data[i] = v
      data[i + 1] = v
      data[i + 2] = v
    }
    warpCtx.putImageData(imgData, 0, 0)
  }

  return warpedCanvas
}

/**
 * Render High-Resolution A4 Multi-Image Canvas
 * Supports UNLIMITED images with custom x, y, width, height, rotation, and borders
 */
export async function renderA4MultiImageCanvas({
  items = [],
  showCutLine = false,
  showBorder = true,
  isXerox = false,
  globalFilters = { brightness: 100, contrast: 100 },
}) {
  const canvas = document.createElement('canvas')
  // Standard A4 at 300 DPI (2480 x 3508 px)
  const A4_W = 2480
  const A4_H = 3508
  canvas.width = A4_W
  canvas.height = A4_H
  const ctx = canvas.getContext('2d')

  // Crisp white paper background
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, A4_W, A4_H)

  for (const item of items) {
    if (!item.url) continue
    try {
      // In the studio, item.url holds the exact cropped/warped image.
      // We load it directly to ensure 100% WYSIWYG match with the preview without double-cropping.
      const renderable = await createImage(item.url)

      const pixelX = (item.x / 100) * A4_W
      const pixelY = (item.y / 100) * A4_H
      const pixelW = (item.width / 100) * A4_W
      const pixelH = (item.height / 100) * A4_H

      ctx.save()
      const centerX = pixelX + pixelW / 2
      const centerY = pixelY + pixelH / 2

      ctx.translate(centerX, centerY)
      if (item.rotation) {
        ctx.rotate(getRadianAngle(item.rotation))
      }

      // Apply brightness/contrast filters
      const filterParts = []
      const effectiveBrightness = item.brightness ?? globalFilters.brightness ?? 100
      const effectiveContrast = item.contrast ?? globalFilters.contrast ?? 100
      if (effectiveBrightness !== 100) filterParts.push(`brightness(${effectiveBrightness}%)`)
      if (effectiveContrast !== 100) filterParts.push(`contrast(${effectiveContrast}%)`)
      if (filterParts.length > 0) {
        ctx.filter = filterParts.join(' ')
      }

      ctx.drawImage(renderable, -pixelW / 2, -pixelH / 2, pixelW, pixelH)

      if (showBorder && item.showBorder !== false) {
        ctx.strokeStyle = '#D1D5DB'
        ctx.lineWidth = 4
        ctx.strokeRect(-pixelW / 2, -pixelH / 2, pixelW, pixelH)
      }

      ctx.restore()
    } catch (e) {
      console.warn('Failed to render item on canvas:', e)
    }
  }

  // Draw Center Fold / Cut Guideline if enabled
  if (showCutLine) {
    ctx.strokeStyle = '#9CA3AF'
    ctx.lineWidth = 3
    ctx.setLineDash([20, 15])
    ctx.beginPath()
    ctx.moveTo(100, A4_H / 2)
    ctx.lineTo(A4_W - 100, A4_H / 2)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = '#6B7280'
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('✂ - - - - - - - - - - - - - - - - - Fold / Cut Line - - - - - - - - - - - - - - - - - ✂', A4_W / 2, A4_H / 2 - 15)
  }

  // High-Contrast Xerox Document Mode
  if (isXerox) {
    const imgData = ctx.getImageData(0, 0, A4_W, A4_H)
    const data = imgData.data
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
      const v = avg > 140 ? 255 : avg < 100 ? 0 : avg
      data[i] = v
      data[i + 1] = v
      data[i + 2] = v
    }
    ctx.putImageData(imgData, 0, 0)
  }

  return canvas
}

/**
 * Calculate Grid Columns & Rows for Passport / Photo Tiling
 * Standard Indian Passport photo size: 35mm x 45mm
 * On A4 (210mm x 297mm): Exactly 5 columns x 6 rows = 30 copies per page
 */
export function getPassportGridDimensions() {
  return { cols: 5, rows: 6, maxPerPage: 30 }
}

/**
 * Draw image with aspect ratio preservation (object-fit: cover) to prevent collapse / stretching
 */
export function drawImageCover(ctx, img, x, y, w, h) {
  const imgW = img.naturalWidth || img.width
  const imgH = img.naturalHeight || img.height
  if (!imgW || !imgH || !w || !h) return

  const imgAspect = imgW / imgH
  const targetAspect = w / h

  let sX = 0
  let sY = 0
  let sW = imgW
  let sH = imgH

  if (imgAspect > targetAspect) {
    // Source image is wider than target cell -> center crop sides
    sW = imgH * targetAspect
    sX = (imgW - sW) / 2
  } else {
    // Source image is taller than target cell -> center crop top/bottom
    sH = imgW / targetAspect
    sY = (imgH - sH) / 2
  }

  ctx.drawImage(img, sX, sY, sW, sH, x, y, w, h)
}

/**
 * Render Multi-Page Passport Photo Grid Canvases (35mm x 45mm Fixed Size)
 * - True standard passport size: 35mm width x 45mm height (413px x 531px @ 300 DPI)
 * - Fills row-by-row strictly from top-left
 * - Cutting guideline borders (#D1D5DB) and scissor gaps between photos
 * - If copies > 30, overflows cleanly to Page 2 (multi-page)
 */
export async function renderPassportGridPages({
  imageSrc,
  copiesCount = 16,
  showCutLines = true,
  rotation = 0,
  filters = { brightness: 100, contrast: 100 },
}) {
  const total = Math.max(1, copiesCount)
  const MAX_PER_PAGE = 30
  const totalPages = Math.ceil(total / MAX_PER_PAGE)
  const img = await createImage(imageSrc)

  const A4_W = 2480
  const A4_H = 3508
  // Standard 35mm x 45mm at 300 DPI
  const photoW = 413 // 35mm
  const photoH = 531 // 45mm
  const marginLeft = 118 // 10mm
  const gapX = 44 // 3.75mm
  const marginTop = 112 // 9.5mm
  const gapY = 31 // 2.6mm

  const canvases = []

  for (let p = 0; p < totalPages; p++) {
    const canvas = document.createElement('canvas')
    canvas.width = A4_W
    canvas.height = A4_H
    const ctx = canvas.getContext('2d')

    // Clean white paper
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, A4_W, A4_H)

    const startIdx = p * MAX_PER_PAGE
    const countThisPage = Math.min(MAX_PER_PAGE, total - startIdx)

    for (let i = 0; i < countThisPage; i++) {
      const col = i % 5
      const row = Math.floor(i / 5)

      const x = marginLeft + col * (photoW + gapX)
      const y = marginTop + row * (photoH + gapY)

      ctx.save()

      // Apply brightness/contrast filters
      const filterParts = []
      if (filters?.brightness && filters.brightness !== 100) {
        filterParts.push(`brightness(${filters.brightness}%)`)
      }
      if (filters?.contrast && filters.contrast !== 100) {
        filterParts.push(`contrast(${filters.contrast}%)`)
      }
      if (filterParts.length > 0) {
        ctx.filter = filterParts.join(' ')
      }

      if (rotation) {
        const centerX = x + photoW / 2
        const centerY = y + photoH / 2
        ctx.translate(centerX, centerY)
        ctx.rotate(getRadianAngle(rotation))
        drawImageCover(ctx, img, -photoW / 2, -photoH / 2, photoW, photoH)
      } else {
        drawImageCover(ctx, img, x, y, photoW, photoH)
      }

      ctx.restore()

      // Hairline cutting guideline around each photo
      if (showCutLines) {
        ctx.strokeStyle = '#D1D5DB'
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, photoW, photoH)
      }
    }

    canvases.push(canvas)
  }

  return canvases
}

/**
 * Render single-page Passport Photo Grid Canvas (returns Page 1)
 */
export async function renderPassportGridCanvas(options) {
  const pages = await renderPassportGridPages(options)
  return pages[0]
}

/**
 * Convert an array of HTML5 Canvases directly to a Multi-Page high-res PDF File
 */
export async function canvasesToPdfFile(canvases, fileName = 'print_document.pdf') {
  const canvasList = Array.isArray(canvases) ? canvases : [canvases]
  const pdfDoc = await PDFDocument.create()
  // Standard A4 in PDF points: 595.28 x 841.89
  const a4Width = 595.28
  const a4Height = 841.89

  for (const cvs of canvasList) {
    const pngDataUrl = cvs.toDataURL('image/png', 1.0)
    const pngBytes = await fetch(pngDataUrl).then((r) => r.arrayBuffer())
    const page = pdfDoc.addPage([a4Width, a4Height])
    const embeddedImg = await pdfDoc.embedPng(pngBytes)

    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: a4Width,
      height: a4Height,
    })
  }

  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const baseName = fileName.replace(/\.[^/.]+$/, '')

  return new File([blob], `${baseName}.pdf`, {
    type: 'application/pdf',
    lastModified: Date.now(),
  })
}

/**
 * Convert HTML5 Canvas directly to high-res PDF File (single page alias)
 */
export async function canvasToPdfFile(canvas, fileName = 'print_document.pdf') {
  return canvasesToPdfFile([canvas], fileName)
}

/**
 * Convert HTML5 Canvas to Image File (PNG / JPG)
 */
export function canvasToImageFile(canvas, fileName = 'cropped_image.png', format = 'image/png') {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        const ext = format === 'image/jpeg' ? '.jpg' : '.png'
        const baseName = fileName.replace(/\.[^/.]+$/, '')
        const file = new File([blob], `${baseName}${ext}`, {
          type: format,
          lastModified: Date.now(),
        })
        resolve(file)
      },
      format,
      0.95
    )
  })
}
