
// Safe number parser with non-negative guarantee
export function safeNumber(val, fallback = 0) {
  if (val === null || val === undefined || val === '') return fallback
  const num = Number(val)
  return isNaN(num) || num < 0 ? fallback : num
}

// Round to 2 decimal places with currency precision
export function roundCurrency(val) {
  return Math.round((Number(val || 0) + Number.EPSILON) * 100) / 100
}

export function validatePageRanges(ranges = []) {
  if (!Array.isArray(ranges) || ranges.length === 0) return { valid: true, sanitized: [] }

  const sanitized = []
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i]
    const fromPage = parseInt(r.fromPage, 10)
    const toPage = parseInt(r.toPage, 10)
    const ratePerPage = safeNumber(r.ratePerPage, 0)

    // Skip completely empty row
    if (!r.fromPage && !r.toPage && !r.ratePerPage) continue

    if (isNaN(fromPage) || fromPage < 1) {
      return { valid: false, error: `Row ${i + 1}: 'fromPage' must be a valid number >= 1` }
    }
    if (isNaN(toPage) || toPage < fromPage) {
      return { valid: false, error: `Row ${i + 1}: 'toPage' (${toPage}) must be >= 'fromPage' (${fromPage})` }
    }
    if (ratePerPage <= 0) {
      return { valid: false, error: `Row ${i + 1}: 'ratePerPage' must be greater than 0` }
    }

    sanitized.push({ fromPage, toPage, ratePerPage: roundCurrency(ratePerPage) })
  }

  // Sort ascending by fromPage
  sanitized.sort((a, b) => a.fromPage - b.fromPage)

  // Check overlaps
  for (let i = 0; i < sanitized.length - 1; i++) {
    const current = sanitized[i]
    const next = sanitized[i + 1]
    if (current.toPage >= next.fromPage) {
      return {
        valid: false,
        error: `Overlapping page ranges detected: [${current.fromPage}-${current.toPage}] overlaps with [${next.fromPage}-${next.toPage}]`
      }
    }
  }

  return { valid: true, sanitized }
}

/**
 * Single source-of-truth pricing calculator
 *
 * @param {Object} params
 * @param {Object} params.shop - Shop document with bwRate, colorRate, pricingSettings
 * @param {number} [params.totalPages=1] - Number of pages in the document / sheets
 * @param {number} [params.copies=1] - Number of copies / sets
 * @param {string} [params.colorType='BLACK_AND_WHITE'] - 'BLACK_AND_WHITE' | 'COLOR'
 * @param {boolean} [params.isDuplex=false] - Whether duplex printing is requested
 * @param {string} [params.paperSize='A4'] - 'A4' | 'A3' | 'A2' | 'A1'
 * @param {number|string} [params.photoCount=0] - 4 | 6 | 8 | 10 | 12 (for PHOTO_SHEET)
 * @param {string} [params.jobType='DOCUMENT'] - 'DOCUMENT' | 'RESUME' | 'PHOTO_SHEET' | 'BIG_SIZE'
 *
 * @returns {Object} { totalAmount, rateApplied, duplexCharge, pricingType, breakdownText }
 */
export function calculatePrice({
  shop = {},
  totalPages = 1,
  copies = 1,
  colorType = 'BLACK_AND_WHITE',
  isDuplex = false,
  paperSize = 'A4',
  photoCount = 0,
  jobType = 'DOCUMENT',
} = {}) {
  const isColor = colorType === 'COLOR'
  const standardBwRate = safeNumber(shop?.bwRate, 5)
  const standardColorRate = safeNumber(shop?.colorRate, 10)
  const fallbackRate = isColor ? standardColorRate : standardBwRate

  const parsedPages = Math.max(1, parseInt(totalPages, 10) || 1)
  const parsedCopies = Math.max(1, parseInt(copies, 10) || 1)
  const cleanPaperSize = String(paperSize || 'A4').trim().toUpperCase()
  const cleanJobType = String(jobType || 'DOCUMENT').trim().toUpperCase()
  const cleanIsDuplex = Boolean(isDuplex)

  const settings = shop?.pricingSettings || {}
  const advanceEnabled = Boolean(settings.advanceFeaturesEnabled)

  // 1. MASTER TOGGLE OFF: Force standard A4 document calculation
  if (!advanceEnabled) {
    const totalAmount = roundCurrency(parsedPages * parsedCopies * fallbackRate)
    return {
      totalAmount,
      rateApplied: fallbackRate,
      duplexCharge: 0,
      pricingType: 'STANDARD_A4',
      breakdownText: `${parsedPages} page(s) × ${parsedCopies} copy(ies) @ ₹${fallbackRate}/page`,
    }
  }

  // 2. CHECK PER-OPTION TOGGLE
  if (cleanJobType === 'RESUME' && settings.resumeEnabled === false) {
    throw new Error('Resume Maker service is currently disabled by this shop.')
  }
  if (cleanJobType === 'PHOTO_SHEET' && settings.photoSheetEnabled === false) {
    throw new Error('4×6 Photo Sheet service is currently disabled by this shop.')
  }
  if (['A3', 'A2', 'A1'].includes(cleanPaperSize) && settings.bigSizeEnabled === false) {
    throw new Error(`${cleanPaperSize} Big Size printing is currently disabled by this shop.`)
  }

  // Duplex extra charge (only if duplexEnabled is true)
  let duplexExtraRate = 0
  if (cleanIsDuplex && settings.duplexEnabled) {
    duplexExtraRate = safeNumber(settings.duplexExtraRate, 0)
  }

  // 3. PRIORITY 1: BIG SIZE PRICING (A3 / A2 / A1)
  if (['A3', 'A2', 'A1'].includes(cleanPaperSize)) {
    const sizeKey = cleanPaperSize.toLowerCase()
    const sizeConfig = settings.bigSizePricing?.[sizeKey] || {}
    const configuredRate = isColor ? safeNumber(sizeConfig.colorRate, 0) : safeNumber(sizeConfig.bwRate, 0)

    // Specific rate if > 0, else fallback to standard A4 rate
    const baseRate = configuredRate > 0 ? configuredRate : fallbackRate
    const effectiveRate = roundCurrency(baseRate + duplexExtraRate)
    const totalAmount = roundCurrency(parsedPages * parsedCopies * effectiveRate)

    return {
      totalAmount,
      rateApplied: baseRate,
      duplexCharge: duplexExtraRate,
      pricingType: configuredRate > 0 ? `BIG_SIZE_${cleanPaperSize}` : `BIG_SIZE_${cleanPaperSize}_FALLBACK`,
      breakdownText: `${cleanPaperSize} ${isColor ? 'Color' : 'B&W'} ${parsedPages} page(s) × ${parsedCopies} copy(ies) @ ₹${effectiveRate}/page${duplexExtraRate > 0 ? ` (includes ₹${duplexExtraRate} duplex)` : ''}`,
    }
  }

  // 4. PRIORITY 2: 4×6 PHOTO SHEET FLAT PRICING
  if (cleanJobType === 'PHOTO_SHEET') {
    const pKey = `p${photoCount}`
    const rateEntry = settings.photoSheetPricing?.rates?.[pKey]
    let sheetRate = 0

    if (rateEntry && typeof rateEntry === 'object') {
      sheetRate = isColor ? safeNumber(rateEntry.colorRate, 0) : safeNumber(rateEntry.bwRate, 0)
      if (sheetRate <= 0) {
        sheetRate = isColor ? safeNumber(rateEntry.bwRate, 0) : safeNumber(rateEntry.colorRate, 0)
      }
    } else {
      sheetRate = safeNumber(rateEntry, 0)
    }

    if (sheetRate <= 0) {
      throw new Error(`Pricing for ${photoCount} photos per sheet is not configured by this shop.`)
    }

    // Flat price per sheet * totalPages (number of sheets) * copies
    const totalAmount = roundCurrency(parsedPages * parsedCopies * sheetRate)

    return {
      totalAmount,
      rateApplied: sheetRate,
      duplexCharge: 0,
      pricingType: 'PHOTO_SHEET_FLAT',
      breakdownText: `Photo Sheet (${photoCount} photos, ${isColor ? 'Color' : 'B&W'}): ${parsedPages} sheet(s) × ${parsedCopies} copy(ies) @ ₹${sheetRate}/sheet`,
    }
  }

  // 5. PRIORITY 3: RESUME MAKER FLAT PRICING
  if (cleanJobType === 'RESUME') {
    const resumeConfig = settings.resumePricing || {}
    const configuredRate = isColor ? safeNumber(resumeConfig.colorRate, 0) : safeNumber(resumeConfig.bwRate, 0)

    const resumeRate = configuredRate > 0 ? configuredRate : fallbackRate
    const totalAmount = roundCurrency(parsedCopies * resumeRate)

    return {
      totalAmount,
      rateApplied: resumeRate,
      duplexCharge: 0,
      pricingType: configuredRate > 0 ? 'RESUME_FLAT' : 'RESUME_FALLBACK',
      breakdownText: `Resume (${isColor ? 'Color' : 'B&W'}): ${parsedCopies} resume(s) @ ₹${resumeRate} flat`,
    }
  }

  // 6. PRIORITY 4: PAGE RANGE PRICING (A4 Document Only)
  const totalKagazCount = parsedPages * parsedCopies
  const rangeConfig = settings.pageRangePricing || {}
  const ranges = isColor ? rangeConfig.colorRanges : rangeConfig.bwRanges

  if (rangeConfig.enabled && Array.isArray(ranges) && ranges.length > 0) {
    const matchedRange = ranges.find((r) => {
      const from = safeNumber(r.fromPage, 0)
      const to = safeNumber(r.toPage, 0)
      return from > 0 && to >= from && totalKagazCount >= from && totalKagazCount <= to && safeNumber(r.ratePerPage, 0) > 0
    })

    if (matchedRange) {
      const matchedRate = safeNumber(matchedRange.ratePerPage, fallbackRate)
      const effectiveRate = roundCurrency(matchedRate + duplexExtraRate)
      const totalAmount = roundCurrency(totalKagazCount * effectiveRate)

      return {
        totalAmount,
        rateApplied: matchedRate,
        duplexCharge: duplexExtraRate,
        pricingType: 'PAGE_RANGE_MATCHED',
        breakdownText: `Range [${matchedRange.fromPage}-${matchedRange.toPage}]: ${totalKagazCount} total sheets @ ₹${effectiveRate}/page${duplexExtraRate > 0 ? ` (includes ₹${duplexExtraRate} duplex)` : ''}`,
      }
    }
  }

  // 7. PRIORITY 5: STANDARD PER-PAGE RATE (FALLBACK)
  const effectiveRate = roundCurrency(fallbackRate + duplexExtraRate)
  const totalAmount = roundCurrency(parsedPages * parsedCopies * effectiveRate)

  return {
    totalAmount,
    rateApplied: fallbackRate,
    duplexCharge: duplexExtraRate,
    pricingType: 'STANDARD_A4_FALLBACK',
    breakdownText: `Standard A4 ${isColor ? 'Color' : 'B&W'}: ${parsedPages} page(s) × ${parsedCopies} copy(ies) @ ₹${effectiveRate}/page${duplexExtraRate > 0 ? ` (includes ₹${duplexExtraRate} duplex)` : ''}`,
  }
}
