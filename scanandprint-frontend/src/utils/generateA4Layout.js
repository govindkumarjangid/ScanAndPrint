import { jsPDF } from 'jspdf'

// Standard dimensions in millimeters (mm)
export const A4_WIDTH_MM = 210
export const A4_HEIGHT_MM = 297

// Standard CR80 Card Dimensions (Aadhaar, PAN, Voter ID, Driving License, etc.)
export const CR80_ASPECT_RATIO = 85.6 / 53.98 // ~1.5857725

// Layout Presets:
// 1. Xerox / Large A4 Half-Page Fit (User Drawn standard for photocopy & submission)
export const XEROX_CARD_WIDTH_MM = 145
export const XEROX_CARD_HEIGHT_MM = Number((XEROX_CARD_WIDTH_MM / CR80_ASPECT_RATIO).toFixed(2)) // ~91.44 mm

// 2. Pocket / Wallet Size (Exact physical CR80 scale)
export const POCKET_CARD_WIDTH_MM = 85.6
export const POCKET_CARD_HEIGHT_MM = 53.98

/**
 * Calculates the exact centering and placement on the A4 page.
 * Default is 'xerox_fit' (Large Top & Bottom Half-Page layout as drawn by user).
 *
 * @param {Object} [params]
 * @param {'xerox_fit'|'pocket_cr80'} [params.layoutMode='xerox_fit']
 * @param {number} [params.pageWidth=A4_WIDTH_MM]
 * @param {number} [params.pageHeight=A4_HEIGHT_MM]
 * @param {number} [params.customCardWidth=null]
 * @returns {Object} Layout metrics and coordinates
 */
export function calculateIdCardLayout({
  layoutMode = 'xerox_fit',
  pageWidth = A4_WIDTH_MM,
  pageHeight = A4_HEIGHT_MM,
  customCardWidth = null,
} = {}) {
  let cardWidth = XEROX_CARD_WIDTH_MM
  let cardHeight = XEROX_CARD_HEIGHT_MM

  if (layoutMode === 'pocket_cr80') {
    cardWidth = POCKET_CARD_WIDTH_MM
    cardHeight = POCKET_CARD_HEIGHT_MM
  } else if (customCardWidth && typeof customCardWidth === 'number') {
    cardWidth = customCardWidth
    cardHeight = Number((cardWidth / CR80_ASPECT_RATIO).toFixed(2))
  }

  // Horizontal centering: equal margins on left and right
  const x = (pageWidth - cardWidth) / 2

  let frontY, backY, gap

  if (layoutMode === 'xerox_fit') {
    // Upper-half and Lower-half balanced placement (Matches user's red drawings)
    const halfPageHeight = pageHeight / 2 // 148.5 mm
    frontY = (halfPageHeight - cardHeight) / 2 // ~28.53 mm from top
    backY = halfPageHeight + (halfPageHeight - cardHeight) / 2 // ~177.03 mm from top
    gap = backY - (frontY + cardHeight) // ~57.06 mm gap
  } else {
    // Pocket CR80 centered block
    gap = 12
    const totalBlockHeight = cardHeight * 2 + gap
    const startY = (pageHeight - totalBlockHeight) / 2
    frontY = startY
    backY = startY + cardHeight + gap
  }

  return {
    x,
    frontY,
    backY,
    cardWidth,
    cardHeight,
    pageWidth,
    pageHeight,
    gap,
    topMargin: frontY,
    bottomMargin: pageHeight - (backY + cardHeight),
    sideMargin: x,
    layoutMode,
  }
}

/**
 * Generates an A4 portrait PDF with front and back ID cards placed according to layoutMode,
 * complete with thin dashed cutting guide borders, and triggers download.
 *
 * @param {Object} options
 * @param {string} options.frontImage - Base64 Data URL or image for front side
 * @param {string} options.backImage - Base64 Data URL or image for back side
 * @param {'xerox_fit'|'pocket_cr80'} [options.layoutMode='xerox_fit']
 * @param {number} [options.customCardWidth=null]
 * @param {string} [options.filename='id-card-print-a4.pdf'] - Download filename
 * @param {boolean} [options.triggerDownload=true] - Whether to trigger automatic download
 * @returns {Promise<{ pdf: jsPDF, blob: Blob, filename: string, layout: Object }>}
 */
export async function generateIdCardA4Pdf({
  frontImage,
  backImage,
  layoutMode = 'xerox_fit',
  customCardWidth = null,
  filename = 'id-card-print-a4.pdf',
  triggerDownload = true,
}) {
  if (!frontImage || !backImage) {
    throw new Error('Both front and back images are required to generate the ID card layout')
  }

  // 1. Create A4 portrait PDF using jsPDF mm-based unit system directly
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // 2. Compute dynamic layout coordinates (default to user's requested large Xerox fit)
  const layout = calculateIdCardLayout({ layoutMode, customCardWidth })

  // 3. Add Front Card Image
  pdf.addImage(
    frontImage,
    'PNG',
    layout.x,
    layout.frontY,
    layout.cardWidth,
    layout.cardHeight,
    undefined,
    'FAST'
  )

  // 4. Add Back Card Image
  pdf.addImage(
    backImage,
    'PNG',
    layout.x,
    layout.backY,
    layout.cardWidth,
    layout.cardHeight,
    undefined,
    'FAST'
  )

  // 5. Add thin dashed cutting guide borders around each card
  pdf.setDrawColor(160, 160, 160) // Clean cutting line color
  pdf.setLineWidth(0.2) // 0.2 mm fine line
  pdf.setLineDashPattern([1.5, 1.5], 0) // Dashed pattern for cutting guide

  // Front card dashed outline
  pdf.rect(layout.x, layout.frontY, layout.cardWidth, layout.cardHeight)

  // Back card dashed outline
  pdf.rect(layout.x, layout.backY, layout.cardWidth, layout.cardHeight)

  // Reset line dash pattern to solid
  pdf.setLineDashPattern([], 0)

  // 6. Trigger automatic download if requested
  if (triggerDownload) {
    pdf.save(filename)
  }

  const blob = pdf.output('blob')

  return {
    pdf,
    blob,
    filename,
    layout,
  }
}
