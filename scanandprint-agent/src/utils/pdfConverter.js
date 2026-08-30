import { PDFDocument } from 'pdf-lib'

/**
 * Ensures that any input buffer (PDF, PNG, or JPG/JPEG) is converted to a valid printable PDF Buffer.
 * If the buffer is already a PDF, it is returned untouched.
 * If it is an image (PNG or JPG/JPEG), it is scaled proportionally and embedded into a crisp A4 PDF page.
 *
 * Other formats (WEBP, HEIC/HEIF, TIFF, BMP, GIF, etc.) are NOT supported and will throw -
 * see the error thrown at the end of this function.
 *
 * @param {Buffer} buffer - File buffer
 * @param {string} originalFileName - Original filename for format hints
 * @returns {Promise<Buffer>}
 * @throws {Error} if the buffer is neither a valid PDF nor a PNG/JPG image
 */
export async function ensurePdfBuffer(buffer, originalFileName = '') {
  if (!buffer || buffer.length === 0) return buffer

  // Check if buffer is already a valid PDF (%PDF header)
  if (buffer.length > 4 && buffer.toString('utf8', 0, 4) === '%PDF') {
    return buffer
  }

  try {
    const pdfDoc = await PDFDocument.create()
    let embeddedImage = null

    const isPng =
      (buffer.length > 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) ||
      originalFileName.toLowerCase().endsWith('.png')

    const isJpg =
      (buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) ||
      originalFileName.toLowerCase().endsWith('.jpg') ||
      originalFileName.toLowerCase().endsWith('.jpeg')

    if (isPng) {
      try {
        embeddedImage = await pdfDoc.embedPng(buffer)
      } catch (e1) {
        try {
          embeddedImage = await pdfDoc.embedJpg(buffer)
        } catch (e2) {}
      }
    } else if (isJpg) {
      try {
        embeddedImage = await pdfDoc.embedJpg(buffer)
      } catch (e1) {
        try {
          embeddedImage = await pdfDoc.embedPng(buffer)
        } catch (e2) {}
      }
    } else {
      try {
        embeddedImage = await pdfDoc.embedPng(buffer)
      } catch (e1) {
        try {
          embeddedImage = await pdfDoc.embedJpg(buffer)
        } catch (e2) {}
      }
    }

    if (embeddedImage) {
      const { width: imgWidth, height: imgHeight } = embeddedImage

      const a4Width = 595.28
      const a4Height = 841.89
      const margin = 20

      const maxW = a4Width - margin * 2
      const maxH = a4Height - margin * 2

      const scale = Math.min(maxW / imgWidth, maxH / imgHeight, 1)
      const drawWidth = imgWidth * scale
      const drawHeight = imgHeight * scale

      const xPos = (a4Width - drawWidth) / 2
      const yPos = (a4Height - drawHeight) / 2

      const page = pdfDoc.addPage([a4Width, a4Height])
      page.drawImage(embeddedImage, {
        x: xPos,
        y: yPos,
        width: drawWidth,
        height: drawHeight,
      })

      const pdfBytes = await pdfDoc.save()
      console.log(`[Agent PDFConverter] ✅ Converted image (${originalFileName}) to standard A4 PDF (${pdfBytes.length} bytes)`)
      return Buffer.from(pdfBytes)
    }
  } catch (err) {
    console.error('[Agent PDFConverter] Conversion failed:', err.message)
  }

  // If we reach here, the file was not already a PDF and could not be embedded
  // as an image either (e.g. WEBP, HEIC/HEIF from iPhones, TIFF, BMP, or a
  // corrupted upload). Returning the raw buffer here would silently hand a
  // non-PDF file to the printer, which either fails with a confusing spooler
  // error or prints nothing at all. Fail loudly instead so the caller can
  // surface a clear, actionable error and mark the job as FAILED.
  throw new Error(
    `Unsupported or unreadable file format for "${originalFileName || 'upload'}". ` +
    'Only PDF, PNG, and JPG/JPEG are currently supported by the print agent.'
  )
}
