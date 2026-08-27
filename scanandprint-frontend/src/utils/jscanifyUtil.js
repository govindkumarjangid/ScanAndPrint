import jscanify from 'jscanify/client'

let openCvPromise = null
let scannerInstance = null

/**
 * Asynchronously loads opencv.js if not already loaded.
 * Ensures wasm/opencv initializes properly before resolving.
 */
export function loadOpenCv() {
  if (openCvPromise) return openCvPromise

  openCvPromise = new Promise((resolve, reject) => {
    // 1. Check if cv already fully initialized
    if (typeof window !== 'undefined' && window.cv && window.cv.Mat) {
      if (!scannerInstance) scannerInstance = new jscanify()
      resolve({ cv: window.cv, scanner: scannerInstance })
      return
    }

    if (typeof document === 'undefined') {
      reject(new Error('DOM not available for OpenCV loading'))
      return
    }

    // 2. Check if script tag already exists
    let script = document.getElementById('opencv-script')
    if (!script) {
      script = document.createElement('script')
      script.id = 'opencv-script'
      script.src = '/opencv.js'
      script.async = true
      document.body.appendChild(script)
    }

    const checkReady = () => {
      if (window.cv && window.cv.Mat) {
        if (!scannerInstance) scannerInstance = new jscanify()
        resolve({ cv: window.cv, scanner: scannerInstance })
        return true
      }
      return false
    }

    if (checkReady()) return

    // Set hook on opencv runtime
    window.cv = window.cv || {}
    const prevInit = window.cv['onRuntimeInitialized']
    window.cv['onRuntimeInitialized'] = () => {
      if (prevInit) prevInit()
      if (!scannerInstance) scannerInstance = new jscanify()
      resolve({ cv: window.cv, scanner: scannerInstance })
    }

    script.onerror = (err) => {
      openCvPromise = null
      reject(new Error('Failed to load opencv.js from /opencv.js'))
    }

    // Polling check in case onRuntimeInitialized already fired before hook
    const interval = setInterval(() => {
      if (checkReady()) {
        clearInterval(interval)
      }
    }, 150)

    setTimeout(() => {
      clearInterval(interval)
      if (!checkReady()) {
        openCvPromise = null
        reject(new Error('OpenCV loading timed out (30s)'))
      }
    }, 30000)
  })

  return openCvPromise
}

/**
 * Helper to safely load an HTMLImageElement
 */
export const createImageElement = (url) =>
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
 * Sorts 4 points into standard topological order:
 * [Top-Left, Top-Right, Bottom-Right, Bottom-Left]
 */
export function sortQuadrilateralCorners(pts) {
  const sorted = [...pts].sort((a, b) => a.y - b.y)
  const top = sorted.slice(0, 2).sort((a, b) => a.x - b.x)
  const btm = sorted.slice(2, 4).sort((a, b) => b.x - a.x)
  return [top[0], top[1], btm[0], btm[1]]
}

/**
 * Measures the physical contrast across the 4 borders of a candidate quadrilateral.
 * Real documents have high luminance gradient transitions between the inside paper and the outside surface (table, cloth, etc.),
 * while camera frame borders or background wood grains have low or zero contrast.
 */
function computeBoundaryContrast(gray, origW, origH, pts) {
  let totalDiff = 0
  let sampleCount = 0
  const [tl, tr, br, bl] = pts

  function sampleEdge(p1, p2) {
    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y)
    if (dist < 15) return
    const nx = -(p2.y - p1.y) / dist
    const ny = (p2.x - p1.x) / dist

    // Sample across 15 positions along the edge
    for (let t = 0.12; t <= 0.88; t += 0.05) {
      const cx = p1.x + t * (p2.x - p1.x)
      const cy = p1.y + t * (p2.y - p1.y)

      const inX = Math.round(cx - nx * 9)
      const inY = Math.round(cy - ny * 9)
      const outX = Math.round(cx + nx * 9)
      const outY = Math.round(cy + ny * 9)

      if (
        inX >= 0 &&
        inX < origW &&
        inY >= 0 &&
        inY < origH &&
        outX >= 0 &&
        outX < origW &&
        outY >= 0 &&
        outY < origH
      ) {
        const inVal = gray.ucharPtr(inY, inX)[0]
        const outVal = gray.ucharPtr(outY, outX)[0]
        totalDiff += Math.abs(inVal - outVal)
        sampleCount++
      }
    }
  }

  sampleEdge(tl, tr)
  sampleEdge(tr, br)
  sampleEdge(br, bl)
  sampleEdge(bl, tl)

  return sampleCount > 0 ? totalDiff / sampleCount : 0
}

/**
 * Dynamic Document & ID Card Boundary Detector using OpenCV
 * Dynamically detects ANY document regardless of how much space/background is around it.
 * Works for any document size (from 3% of frame up to 98% of frame).
 *
 * @param {HTMLImageElement} imgElement - Source image element
 * @returns {Promise<{ rawPoints: Array<{x: number, y: number}>, cornersPct: Array<{x: number, y: number}>, naturalW: number, naturalH: number }>}
 */
export async function detectCardCorners(imgElement) {
  const { cv, scanner } = await loadOpenCv()
  const naturalW = imgElement.naturalWidth || imgElement.width
  const naturalH = imgElement.naturalHeight || imgElement.height
  const imgArea = naturalW * naturalH

  let bestDetectedCorners = null

  try {
    // 1. Read full-res image for boundary contrast verification
    const fullMat = cv.imread(imgElement)
    const fullGray = new cv.Mat()
    cv.cvtColor(fullMat, fullGray, cv.COLOR_RGBA2GRAY)

    // 2. Downscale for fast & noise-resilient edge detection (standard scanner approach)
    const maxDim = 800
    const scale = maxDim / Math.max(naturalW, naturalH)
    const downW = Math.round(naturalW * scale)
    const downH = Math.round(naturalH * scale)

    const downMat = new cv.Mat()
    const dsize = new cv.Size(downW, downH)
    cv.resize(fullMat, downMat, dsize, 0, 0, cv.INTER_AREA)

    const downGray = new cv.Mat()
    cv.cvtColor(downMat, downGray, cv.COLOR_RGBA2GRAY)

    const blurred = new cv.Mat()
    cv.GaussianBlur(downGray, blurred, new cv.Size(5, 5), 0)

    const candidates = []

    // Evaluates a binary edge or threshold matrix
    const evaluateBinary = (binMat) => {
      const contours = new cv.MatVector()
      const hier = new cv.Mat()
      cv.findContours(binMat, contours, hier, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)

      for (let i = 0; i < contours.size(); i++) {
        const c = contours.get(i)
        const area = cv.contourArea(c)
        // Accept documents of ANY size (even small cards taking only 2% of frame!)
        if (area < downW * downH * 0.015) continue

        const r = cv.minAreaRect(c)
        const w = Math.max(r.size.width, r.size.height) / scale
        const h = Math.min(r.size.width, r.size.height) / scale
        if (w < 80 || h < 40) continue

        const aspect = w / h
        // Dynamic aspect ratio: handles cards (~1.58), papers (~1.41), and passports (~1.25)
        if (aspect < 1.05 || aspect > 2.6) continue

        const vertices = cv.RotatedRect.points(r)
        const pts = sortQuadrilateralCorners([
          { x: vertices[0].x / scale, y: vertices[0].y / scale },
          { x: vertices[1].x / scale, y: vertices[1].y / scale },
          { x: vertices[2].x / scale, y: vertices[2].y / scale },
          { x: vertices[3].x / scale, y: vertices[3].y / scale },
        ])

        // Filter out false contours that just follow the outer camera frame
        let borderTouches = 0
        for (const p of pts) {
          if (p.x <= 15 || p.y <= 15 || p.x >= naturalW - 15 || p.y >= naturalH - 15) {
            borderTouches++
          }
        }
        const cardArea = w * h
        const areaFrac = cardArea / imgArea
        if (borderTouches >= 2 && areaFrac < 0.88) {
          continue // Skip background lines that touch image frame
        }

        // Measure physical boundary contrast (real card vs table)
        const contrast = computeBoundaryContrast(fullGray, naturalW, naturalH, pts)
        if (contrast < 15) continue

        // Aspect fit bonus for standard card ratio (~1.586)
        const aspectFit = 1 - Math.min(1, Math.abs(aspect - 1.5858) / 1.5858)
        const score = contrast * (1 + aspectFit * 0.6)

        candidates.push({ pts, w, h, aspect, contrast, score })
      }

      contours.delete()
      hier.delete()
    }

    // Pass 1: Multi-threshold Canny edge detection
    for (const [c1, c2] of [[50, 150], [75, 185], [35, 110]]) {
      const edges = new cv.Mat()
      cv.Canny(blurred, edges, c1, c2)
      const k = cv.Mat.ones(5, 5, cv.CV_8U)
      const dilated = new cv.Mat()
      cv.dilate(edges, dilated, k)
      evaluateBinary(dilated)
      edges.delete()
      k.delete()
      dilated.delete()
    }

    // Pass 2: Otsu binary thresholding (handles strong background contrast)
    const otsu = new cv.Mat()
    cv.threshold(blurred, otsu, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)
    const kClose = cv.Mat.ones(7, 7, cv.CV_8U)
    const closed = new cv.Mat()
    cv.morphologyEx(otsu, closed, cv.MORPH_CLOSE, kClose)
    evaluateBinary(closed)
    otsu.delete()
    kClose.delete()
    closed.delete()

    // Pass 3: Morphological gradient (detects document edge transitions)
    const grad = new cv.Mat()
    const gKernel = cv.Mat.ones(5, 5, cv.CV_8U)
    cv.morphologyEx(downGray, grad, cv.MORPH_GRADIENT, gKernel)
    const threshGrad = new cv.Mat()
    cv.threshold(grad, threshGrad, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)
    evaluateBinary(threshGrad)
    grad.delete()
    gKernel.delete()
    threshGrad.delete()

    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score)
      bestDetectedCorners = candidates[0].pts
    }

    // Fallback to jscanify findPaperContour if candidates list empty
    if (!bestDetectedCorners && scanner) {
      const contour = scanner.findPaperContour(fullMat)
      if (contour) {
        const pts = scanner.getCornerPoints(contour)
        if (pts.topLeftCorner && pts.topRightCorner && pts.bottomRightCorner && pts.bottomLeftCorner) {
          bestDetectedCorners = sortQuadrilateralCorners([
            pts.topLeftCorner,
            pts.topRightCorner,
            pts.bottomRightCorner,
            pts.bottomLeftCorner,
          ])
        }
        contour.delete()
      }
    }

    // Memory cleanups
    fullMat.delete()
    fullGray.delete()
    downMat.delete()
    downGray.delete()
    blurred.delete()
  } catch (err) {
    console.warn('Dynamic document detection error:', err)
  }

  // Fallback if no document found: safe ~4% margin inset
  if (!bestDetectedCorners || bestDetectedCorners.length !== 4) {
    bestDetectedCorners = [
      { x: Math.round(naturalW * 0.04), y: Math.round(naturalH * 0.04) },
      { x: Math.round(naturalW * 0.96), y: Math.round(naturalH * 0.04) },
      { x: Math.round(naturalW * 0.96), y: Math.round(naturalH * 0.96) },
      { x: Math.round(naturalW * 0.04), y: Math.round(naturalH * 0.96) },
    ]
  }

  // Convert to percentage array [TL, TR, BR, BL] clamped to 0-100%
  const cornersPct = bestDetectedCorners.map((pt) => ({
    x: Math.max(0, Math.min(100, Math.round(((pt.x / naturalW) * 100) * 10) / 10)),
    y: Math.max(0, Math.min(100, Math.round(((pt.y / naturalH) * 100) * 10) / 10)),
  }))

  return {
    rawPoints: bestDetectedCorners,
    cornersPct,
    naturalW,
    naturalH,
  }
}

/**
 * Extracts and perspective-corrects the document to exact CR80 aspect ratio using OpenCV.
 * Unskews and straightens the card, cropping out 100% of the surrounding table/desk.
 *
 * @param {HTMLImageElement} imgElement - Source image element
 * @param {Array<{x: number, y: number}>} cornersPct - [TL, TR, BR, BL] in percentages (0-100)
 * @param {number} [targetWidth=1200] - Result width in pixels
 * @param {number} [aspectRatio=85.6/53.98] - Card aspect ratio (CR80 standard)
 * @returns {Promise<{ canvas: HTMLCanvasElement, dataUrl: string, width: number, height: number }>}
 */
export async function extractCardPerspective(
  imgElement,
  cornersPct,
  targetWidth = 1200,
  aspectRatio = 85.6 / 53.98
) {
  const { cv } = await loadOpenCv()
  const naturalW = imgElement.naturalWidth || imgElement.width
  const naturalH = imgElement.naturalHeight || imgElement.height

  const targetHeight = Math.round(targetWidth / aspectRatio)

  // Map percentage corners to raw pixel coordinates on imgElement
  // Order: 0: TL, 1: TR, 2: BR, 3: BL
  const tl = { x: (cornersPct[0].x / 100) * naturalW, y: (cornersPct[0].y / 100) * naturalH }
  const tr = { x: (cornersPct[1].x / 100) * naturalW, y: (cornersPct[1].y / 100) * naturalH }
  const br = { x: (cornersPct[2].x / 100) * naturalW, y: (cornersPct[2].y / 100) * naturalH }
  const bl = { x: (cornersPct[3].x / 100) * naturalW, y: (cornersPct[3].y / 100) * naturalH }

  const mat = cv.imread(imgElement)
  const warped = new cv.Mat()
  const dsize = new cv.Size(targetWidth, targetHeight)

  // In OpenCV getPerspectiveTransform:
  // srcTri maps: TL, TR, BL, BR
  const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
    tl.x, tl.y,
    tr.x, tr.y,
    bl.x, bl.y,
    br.x, br.y,
  ])

  const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
    0, 0,
    targetWidth, 0,
    0, targetHeight,
    targetWidth, targetHeight,
  ])

  const M = cv.getPerspectiveTransform(srcTri, dstTri)
  cv.warpPerspective(
    mat,
    warped,
    M,
    dsize,
    cv.INTER_LINEAR,
    cv.BORDER_CONSTANT,
    new cv.Scalar(255, 255, 255, 255)
  )

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  cv.imshow(canvas, warped)

  // Clean up OpenCV memory
  mat.delete()
  warped.delete()
  srcTri.delete()
  dstTri.delete()
  M.delete()

  const dataUrl = canvas.toDataURL('image/png', 1.0)
  return { canvas, dataUrl, width: targetWidth, height: targetHeight }
}
