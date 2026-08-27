/**
 * Helper to safely load an image with cross-origin handling.
 * NOTE: Never sets crossOrigin for blob: or data: URLs because Chrome/browsers
 * treat them as null/local origins and block/error them under CORS!
 */
export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
      image.setAttribute('crossOrigin', 'anonymous')
    }
    image.src = url
  })

/**
 * Scans an image to detect the exact document boundaries (cutting out table/desk/watermark)
 * and crops to the full document area with zero content cut off.
 *
 * @param {string} imageSrc - Image source URL or Data URL
 * @returns {Promise<{ croppedDataUrl: string, bounds: { x: number, y: number, width: number, height: number }, corners: Array<{x: number, y: number}> }>}
 */
export async function autoScanDocument(imageSrc) {
  const image = await createImage(imageSrc)
  const naturalW = image.naturalWidth || image.width
  const naturalH = image.naturalHeight || image.height

  if (!naturalW || !naturalH) {
    throw new Error('Invalid image dimensions for document scanning')
  }

  // Use offscreen canvas to analyze pixel data
  const canvas = document.createElement('canvas')
  canvas.width = naturalW
  canvas.height = naturalH
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  if (!ctx) {
    throw new Error('Canvas 2D context unavailable')
  }

  ctx.drawImage(image, 0, 0)
  const imgData = ctx.getImageData(0, 0, naturalW, naturalH)
  const data = imgData.data

  // 1. Calculate row luminance profile & vertical gradient
  const rowLuma = new Float32Array(naturalH)
  for (let y = 0; y < naturalH; y++) {
    let sum = 0
    for (let x = 0; x < naturalW; x++) {
      const idx = (y * naturalW + x) * 4
      sum += 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
    }
    rowLuma[y] = sum / naturalW
  }

  // 2. Calculate column luminance profile & horizontal gradient
  const colLuma = new Float32Array(naturalW)
  for (let x = 0; x < naturalW; x++) {
    let sum = 0
    for (let y = 0; y < naturalH; y++) {
      const idx = (y * naturalW + x) * 4
      sum += 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
    }
    colLuma[x] = sum / naturalH
  }

  // 3. Scan for card edges (transitions between background and card)
  const stepY = Math.max(2, Math.round(naturalH * 0.004))
  const stepX = Math.max(2, Math.round(naturalW * 0.004))

  // Top transition (start of card header)
  let topY = 0, maxTopGrad = 0
  for (let y = stepY; y < Math.round(naturalH * 0.35); y++) {
    const grad = Math.abs(rowLuma[y] - rowLuma[y - stepY])
    if (grad > maxTopGrad && grad > 8) {
      maxTopGrad = grad
      topY = y
    }
  }

  // Bottom transition (end of card footer)
  let bottomY = naturalH - 1, maxBottomGrad = 0
  for (let y = naturalH - stepY - 1; y > Math.round(naturalH * 0.65); y--) {
    const grad = Math.abs(rowLuma[y] - rowLuma[y + stepY])
    if (grad > maxBottomGrad && grad > 8) {
      maxBottomGrad = grad
      bottomY = y
    }
  }

  // Left transition
  let leftX = 0, maxLeftGrad = 0
  for (let x = stepX; x < Math.round(naturalW * 0.35); x++) {
    const grad = Math.abs(colLuma[x] - colLuma[x - stepX])
    if (grad > maxLeftGrad && grad > 8) {
      maxLeftGrad = grad
      leftX = x
    }
  }

  // Right transition
  let rightX = naturalW - 1, maxRightGrad = 0
  for (let x = naturalW - stepX - 1; x > Math.round(naturalW * 0.65); x--) {
    const grad = Math.abs(colLuma[x] - colLuma[x + stepX])
    if (grad > maxRightGrad && grad > 8) {
      maxRightGrad = grad
      rightX = x
    }
  }

  // Fallback sanity check: ensure detected area is at least 35% of image
  const detectedW = rightX - leftX
  const detectedH = bottomY - topY
  if (detectedW < naturalW * 0.35 || detectedH < naturalH * 0.25) {
    topY = Math.round(naturalH * 0.03)
    bottomY = Math.round(naturalH * 0.97)
    leftX = Math.round(naturalW * 0.03)
    rightX = Math.round(naturalW * 0.97)
  }

  const cropW = Math.max(10, rightX - leftX)
  const cropH = Math.max(10, bottomY - topY)

  // 4. Crop to exact document boundaries onto output canvas
  const outCanvas = document.createElement('canvas')
  outCanvas.width = cropW
  outCanvas.height = cropH
  const outCtx = outCanvas.getContext('2d')
  outCtx.imageSmoothingEnabled = true
  outCtx.imageSmoothingQuality = 'high'

  outCtx.drawImage(image, leftX, topY, cropW, cropH, 0, 0, cropW, cropH)

  const croppedDataUrl = outCanvas.toDataURL('image/png', 1.0)

  return {
    croppedDataUrl,
    bounds: {
      x: leftX,
      y: topY,
      width: cropW,
      height: cropH,
    },
    corners: [
      { x: (leftX / naturalW) * 100, y: (topY / naturalH) * 100 },
      { x: (rightX / naturalW) * 100, y: (topY / naturalH) * 100 },
      { x: (rightX / naturalW) * 100, y: (bottomY / naturalH) * 100 },
      { x: (leftX / naturalW) * 100, y: (bottomY / naturalH) * 100 },
    ],
    naturalW,
    naturalH,
  }
}

/**
 * Crops an image to the selected pixel area using an HTML5 Canvas.
 *
 * @param {string} imageSrc - The source image URL or object URL
 * @param {{ x: number, y: number, width: number, height: number }} pixelCrop - Pixel crop coordinates from react-easy-crop
 * @returns {Promise<{ dataUrl: string, blob: Blob }>}
 */
export async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get 2d context for image cropping')
  }

  // If pixelCrop is missing or 0, fallback to full image
  const cropX = pixelCrop ? Math.max(0, Math.round(pixelCrop.x)) : 0
  const cropY = pixelCrop ? Math.max(0, Math.round(pixelCrop.y)) : 0
  const cropW = pixelCrop && pixelCrop.width ? Math.round(pixelCrop.width) : (image.naturalWidth || image.width)
  const cropH = pixelCrop && pixelCrop.height ? Math.round(pixelCrop.height) : (image.naturalHeight || image.height)

  canvas.width = cropW
  canvas.height = cropH

  // High-quality image rendering
  ctx.imageSmoothingQuality = 'high'
  ctx.imageSmoothingEnabled = true

  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropW,
    cropH,
    0,
    0,
    cropW,
    cropH
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty after cropping'))
        return
      }
      const dataUrl = canvas.toDataURL('image/png', 1.0)
      resolve({ dataUrl, blob })
    }, 'image/png')
  })
}
