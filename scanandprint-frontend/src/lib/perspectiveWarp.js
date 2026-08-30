export function distance(p1, p2) {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y)
}

export function getUnitSquareToQuadMatrix(p0, p1, p2, p3) {
  const dx1 = p1.x - p2.x
  const dx2 = p3.x - p2.x
  const sx = p0.x - p1.x + p2.x - p3.x

  const dy1 = p1.y - p2.y
  const dy2 = p3.y - p2.y
  const sy = p0.y - p1.y + p2.y - p3.y

  // Affine case
  if (Math.abs(sx) < 1e-6 && Math.abs(sy) < 1e-6) {
    return [
      p1.x - p0.x, p3.x - p0.x, p0.x,
      p1.y - p0.y, p3.y - p0.y, p0.y,
      0,           0,           1,
    ]
  }

  // General projective case
  const denom = dx1 * dy2 - dy1 * dx2
  if (Math.abs(denom) < 1e-7) {
    // Fallback to affine if points are degenerate
    return [
      p1.x - p0.x, p3.x - p0.x, p0.x,
      p1.y - p0.y, p3.y - p0.y, p0.y,
      0,           0,           1,
    ]
  }

  const g = (sx * dy2 - sy * dx2) / denom
  const h = (dx1 * sy - dy1 * sx) / denom

  return [
    p1.x - p0.x + g * p1.x, p3.x - p0.x + h * p3.x, p0.x,
    p1.y - p0.y + g * p1.y, p3.y - p0.y + h * p3.y, p0.y,
    g,                     h,                     1,
  ]
}

export function warpPerspectiveCanvas(sourceCanvas, corners, targetWidth, targetHeight) {
  const [tl, tr, br, bl] = corners

  // Auto calculate target dimensions if not provided
  const topW = distance(tl, tr)
  const bottomW = distance(bl, br)
  const leftH = distance(tl, bl)
  const rightH = distance(tr, br)

  const outW = Math.max(50, Math.round(targetWidth || Math.max(topW, bottomW)))
  const outH = Math.max(50, Math.round(targetHeight || Math.max(leftH, rightH)))

  // 1. FAST-PATH: WebAssembly OpenCV (C++ accelerated ~5ms execution)
  if (typeof window !== 'undefined' && window.cv && window.cv.Mat) {
    try {
      const cv = window.cv
      const srcMat = cv.imread(sourceCanvas)
      const dstMat = new cv.Mat()
      const dsize = new cv.Size(outW, outH)

      const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
        tl.x, tl.y,
        tr.x, tr.y,
        bl.x, bl.y,
        br.x, br.y,
      ])
      const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
        0, 0,
        outW, 0,
        0, outH,
        outW, outH,
      ])

      const M = cv.getPerspectiveTransform(srcTri, dstTri)
      cv.warpPerspective(srcMat, dstMat, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar())

      const dstCanvas = document.createElement('canvas')
      dstCanvas.width = outW
      dstCanvas.height = outH
      cv.imshow(dstCanvas, dstMat)

      srcMat.delete()
      dstMat.delete()
      srcTri.delete()
      dstTri.delete()
      M.delete()

      return dstCanvas
    } catch (e) {
      console.warn('[WarpPerspective] OpenCV WebAssembly fallback:', e.message)
    }
  }

  // 2. FALLBACK: Pure JS bilinear interpolation
  const srcCtx = sourceCanvas.getContext('2d', { willReadFrequently: true })
  const srcW = sourceCanvas.width
  const srcH = sourceCanvas.height
  const srcImgData = srcCtx.getImageData(0, 0, srcW, srcH)
  const srcData = srcImgData.data

  // Create destination canvas & image data
  const dstCanvas = document.createElement('canvas')
  dstCanvas.width = outW
  dstCanvas.height = outH
  const dstCtx = dstCanvas.getContext('2d')
  const dstImgData = dstCtx.createImageData(outW, outH)
  const dstData = dstImgData.data

  // Compute Homography matrix mapping (u_norm, v_norm) -> (srcX, srcY)
  const M = getUnitSquareToQuadMatrix(tl, tr, br, bl)
  const [m00, m01, m02, m10, m11, m12, m20, m21, m22] = M

  // Loop over every pixel in the destination canvas and sample from source
  for (let y = 0; y < outH; y++) {
    const vNorm = y / (outH - 1 || 1)
    const dstRowOffset = y * outW * 4

    for (let x = 0; x < outW; x++) {
      const uNorm = x / (outW - 1 || 1)

      // Projective transform equation
      const X = m00 * uNorm + m01 * vNorm + m02
      const Y = m10 * uNorm + m11 * vNorm + m12
      const Z = m20 * uNorm + m21 * vNorm + m22

      const srcX = X / (Z || 1e-6)
      const srcY = Y / (Z || 1e-6)

      const dstIdx = dstRowOffset + x * 4

      // Bounds check
      if (srcX >= 0 && srcX < srcW - 1 && srcY >= 0 && srcY < srcH - 1) {
        // Fast Bilinear Interpolation
        const x0 = Math.floor(srcX)
        const y0 = Math.floor(srcY)
        const x1 = x0 + 1
        const y1 = y0 + 1

        const fx = srcX - x0
        const fy = srcY - y0
        const fx1 = 1 - fx
        const fy1 = 1 - fy

        const idx00 = (y0 * srcW + x0) * 4
        const idx10 = (y0 * srcW + x1) * 4
        const idx01 = (y1 * srcW + x0) * 4
        const idx11 = (y1 * srcW + x1) * 4

        // Interpolate R, G, B, A
        dstData[dstIdx] =
          fx1 * fy1 * srcData[idx00] +
          fx * fy1 * srcData[idx10] +
          fx1 * fy * srcData[idx01] +
          fx * fy * srcData[idx11]

        dstData[dstIdx + 1] =
          fx1 * fy1 * srcData[idx00 + 1] +
          fx * fy1 * srcData[idx10 + 1] +
          fx1 * fy * srcData[idx01 + 1] +
          fx * fy * srcData[idx11 + 1]

        dstData[dstIdx + 2] =
          fx1 * fy1 * srcData[idx00 + 2] +
          fx * fy1 * srcData[idx10 + 2] +
          fx1 * fy * srcData[idx01 + 2] +
          fx * fy * srcData[idx11 + 2]

        dstData[dstIdx + 3] = 255
      } else {
        // Background white for out of bounds
        dstData[dstIdx] = 255
        dstData[dstIdx + 1] = 255
        dstData[dstIdx + 2] = 255
        dstData[dstIdx + 3] = 255
      }
    }
  }

  dstCtx.putImageData(dstImgData, 0, 0)
  return dstCanvas
}
