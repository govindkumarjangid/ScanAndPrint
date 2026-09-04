/**
 * Frontend Pricing Engine Mirror
 * Matches backend pricing.util.js exactly for 100% accurate client-side preview & calculations.
 */

export function safeNumber(val, fallback = 0) {
  if (val === null || val === undefined || val === '') return fallback
  const num = Number(val)
  return isNaN(num) || num < 0 ? fallback : num
}

export function roundCurrency(val) {
  return Math.round((Number(val || 0) + Number.EPSILON) * 100) / 100
}

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

  // Duplex extra charge (only if duplexEnabled is true)
  let duplexExtraRate = 0
  if (cleanIsDuplex && settings.duplexEnabled) {
    duplexExtraRate = safeNumber(settings.duplexExtraRate, 0)
  }

  // 2. PRIORITY 1: BIG SIZE PRICING (A3 / A2 / A1)
  if (['A3', 'A2', 'A1'].includes(cleanPaperSize)) {
    const sizeKey = cleanPaperSize.toLowerCase()
    const sizeConfig = settings.bigSizePricing?.[sizeKey] || {}
    const configuredRate = isColor ? safeNumber(sizeConfig.colorRate, 0) : safeNumber(sizeConfig.bwRate, 0)

    const baseRate = configuredRate > 0 ? configuredRate : fallbackRate
    const effectiveRate = roundCurrency(baseRate + duplexExtraRate)
    const totalAmount = roundCurrency(parsedPages * parsedCopies * effectiveRate)

    return {
      totalAmount,
      rateApplied: baseRate,
      duplexCharge: duplexExtraRate,
      pricingType: configuredRate > 0 ? `BIG_SIZE_${cleanPaperSize}` : `BIG_SIZE_${cleanPaperSize}_FALLBACK`,
      breakdownText: `${cleanPaperSize} ${isColor ? 'Color' : 'B&W'}: ${parsedPages} page(s) × ${parsedCopies} copy(ies) @ ₹${effectiveRate}/page${duplexExtraRate > 0 ? ` (includes ₹${duplexExtraRate} duplex)` : ''}`,
    }
  }

  // 3. PRIORITY 2: 4×6 PHOTO SHEET FLAT PRICING
  if (cleanJobType === 'PHOTO_SHEET') {
    const pKey = `p${photoCount}`
    const sheetRate = safeNumber(settings.photoSheetPricing?.rates?.[pKey], 0)

    if (sheetRate <= 0) {
      return {
        totalAmount: 0,
        rateApplied: 0,
        duplexCharge: 0,
        pricingType: 'PHOTO_SHEET_UNCONFIGURED',
        breakdownText: 'Price not configured for this photo count',
      }
    }

    const totalAmount = roundCurrency(parsedPages * parsedCopies * sheetRate)
    return {
      totalAmount,
      rateApplied: sheetRate,
      duplexCharge: 0,
      pricingType: 'PHOTO_SHEET_FLAT',
      breakdownText: `Photo Sheet (${photoCount} photos): ${parsedPages} sheet(s) × ${parsedCopies} copy(ies) @ ₹${sheetRate}/sheet`,
    }
  }

  // 4. PRIORITY 3: RESUME MAKER FLAT PRICING
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

  // 5. PRIORITY 4: PAGE RANGE PRICING (A4 Document Only)
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

  // 6. PRIORITY 5: STANDARD PER-PAGE RATE (FALLBACK)
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
