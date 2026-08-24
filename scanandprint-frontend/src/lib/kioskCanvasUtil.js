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

  // White paper background
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, A4_W, A4_H)

  for (const item of items) {
    if (!item.url) continue
    try {
      let renderable = null

      if (item.corners && item.corners.length === 4) {
        // Render 4-point perspective cropped image
        renderable = await renderPerspectiveCropCanvas({
          imageSrc: item.url,
          corners: item.corners,
          rotation: item.rotation || 0,
          filters: {
            brightness: item.brightness ?? globalFilters.brightness ?? 100,
            contrast: item.contrast ?? globalFilters.contrast ?? 100,
            saturation: 100,
            isGrayscale: false,
            isSepia: false,
            isXerox: false,
          },
        })
      } else {
        renderable = await createImage(item.url)
      }

      const pixelX = (item.x / 100) * A4_W
      const pixelY = (item.y / 100) * A4_H
      const pixelW = (item.width / 100) * A4_W
      const pixelH = (item.height / 100) * A4_H

      ctx.save()
      const centerX = pixelX + pixelW / 2
      const centerY = pixelY + pixelH / 2

      ctx.translate(centerX, centerY)
      if (item.rotation && !item.corners) {
        ctx.rotate(getRadianAngle(item.rotation))
      }

      // Apply brightness/contrast filter if not already applied in perspective warp
      if (!item.corners && (globalFilters.brightness !== 100 || globalFilters.contrast !== 100)) {
        ctx.filter = `brightness(${globalFilters.brightness}%) contrast(${globalFilters.contrast}%)`
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
 */
export function getPassportGridDimensions(total) {
  let cols = 4
  if (total <= 2) cols = 2
  else if (total <= 6) cols = 3
  else if (total <= 24) cols = 4
  else if (total === 30 || total === 40) cols = 5
  else if (total <= 35) cols = 5
  else cols = 6

  const rows = Math.ceil(total / cols)
  return { cols, rows }
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
 * Render Passport Photo Grid Canvas
 * Full page edge-to-edge layout without side spacing & zero image collapse
 */
export async function renderPassportGridCanvas({
  imageSrc,
  copiesCount = 20,
  showCutLines = true,
  noGap = true,
  rotation = 0,
  filters = { brightness: 100, contrast: 100 },
}) {
  const canvas = document.createElement('canvas')
  const A4_W = 2480
  const A4_H = 3508
  canvas.width = A4_W
  canvas.height = A4_H
  const ctx = canvas.getContext('2d')

  // White paper background
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, A4_W, A4_H)

  const img = await createImage(imageSrc)
  const total = Math.max(1, copiesCount)
  const { cols, rows } = getPassportGridDimensions(total)

  // Full-page edge-to-edge cell sizing (Zero side gaps)
  const photoW = A4_W / cols
  const photoH = A4_H / rows

  for (let i = 0; i < total; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)

    const x = col * photoW
    const y = row * photoH

    ctx.save()

    // Apply brightness and contrast filters
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

    // Apply rotation if needed
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

    // Draw hairline cutting guideline on every cell
    if (showCutLines || noGap) {
      ctx.strokeStyle = '#D1D5DB'
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, photoW, photoH)
    }
  }

  return canvas
}

/**
 * Convert HTML5 Canvas directly to high-res PDF File
 */
export async function canvasToPdfFile(canvas, fileName = 'print_document.pdf') {
  const pngDataUrl = canvas.toDataURL('image/png', 1.0)
  const pngBytes = await fetch(pngDataUrl).then((r) => r.arrayBuffer())

  const pdfDoc = await PDFDocument.create()
  // Standard A4 in PDF points: 595.28 x 841.89
  const a4Width = 595.28
  const a4Height = 841.89

  const page = pdfDoc.addPage([a4Width, a4Height])
  const embeddedImg = await pdfDoc.embedPng(pngBytes)

  const drawWidth = a4Width
  const drawHeight = a4Height

  page.drawImage(embeddedImg, {
    x: 0,
    y: 0,
    width: drawWidth,
    height: drawHeight,
  })

  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const baseName = fileName.replace(/\.[^/.]+$/, '')

  return new File([blob], `${baseName}.pdf`, {
    type: 'application/pdf',
    lastModified: Date.now(),
  })
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
