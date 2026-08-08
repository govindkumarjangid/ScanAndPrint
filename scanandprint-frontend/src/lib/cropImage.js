/**
 * Helper function to create an HTMLImageElement from an image URL
 */
export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

/**
 * Returns degrees converted to radians
 */
export function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180
}

/**
 * Rotates an image and returns the bounding box size of the rotated image
 */
export function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation)

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

/**
 * Takes an image URL, cropped pixel coordinates, rotation, flips, and filters,
 * renders it onto an HTML5 Canvas, and returns the output File / Blob.
 */
export default async function getCroppedImg(
  imageSrc,
  pixelCrop,
  rotation = 0,
  flipH = false,
  flipV = false,
  filters = { brightness: 100, contrast: 100, isGrayscale: false, isSepia: false, saturation: 100 },
  fileName = 'cropped_image.png'
) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  const rotRad = getRadianAngle(rotation)

  // Calculate bounding box size of rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  )

  // Set canvas width & height to match bounding box
  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  // Construct CSS filter string
  const filterParts = []
  if (filters.brightness !== 100) filterParts.push(`brightness(${filters.brightness}%)`)
  if (filters.contrast !== 100) filterParts.push(`contrast(${filters.contrast}%)`)
  if (filters.isGrayscale) filterParts.push('grayscale(100%)')
  if (filters.isSepia) filterParts.push('sepia(100%)')
  if (filters.saturation !== 100) filterParts.push(`saturate(${filters.saturation}%)`)

  ctx.filter = filterParts.length > 0 ? filterParts.join(' ') : 'none'

  // Translate canvas context to center for rotation & flip scaling
  ctx.save()
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)

  // Draw the transformed image onto full bounding canvas
  ctx.drawImage(image, 0, 0)
  ctx.restore()

  // Create final crop canvas
  const cropCanvas = document.createElement('canvas')
  const cropCtx = cropCanvas.getContext('2d')

  if (!cropCtx) {
    return null
  }

  cropCanvas.width = pixelCrop.width
  cropCanvas.height = pixelCrop.height

  // Draw cropped slice from original transformed bounding canvas
  cropCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  // Convert canvas to File Blob
  return new Promise((resolve, reject) => {
    cropCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'))
          return
        }
        const file = new File([blob], fileName, {
          type: 'image/png',
          lastModified: Date.now(),
        })
        resolve(file)
      },
      'image/png',
      0.95
    )
  })
}
