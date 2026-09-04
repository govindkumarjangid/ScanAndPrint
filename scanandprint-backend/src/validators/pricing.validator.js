import { validatePageRanges, safeNumber, roundCurrency } from '../utils/pricing.util.js'

/**
 * Validates and sanitizes the owner pricing settings before saving to the database
 * Throws an Error with a user-friendly message if any validation fails.
 */
export function sanitizeAndValidatePricingSettings(input = {}) {
  const sanitized = {
    advanceFeaturesEnabled: Boolean(input.advanceFeaturesEnabled),
    documentPrintEnabled: input.documentPrintEnabled !== undefined ? Boolean(input.documentPrintEnabled) : true,
    resumeEnabled: Boolean(input.resumeEnabled),
    photoSheetEnabled: Boolean(input.photoSheetEnabled),
    bigSizeEnabled: Boolean(input.bigSizeEnabled),
    miniPrintEnabled: Boolean(input.miniPrintEnabled),
    duplexEnabled: Boolean(input.duplexEnabled),
    duplexExtraRate: roundCurrency(safeNumber(input.duplexExtraRate, 0)),

    pageRangePricing: {
      enabled: Boolean(input.pageRangePricing?.enabled),
      bwRanges: [],
      colorRanges: [],
    },

    bigSizePricing: {
      a3: {
        bwRate: roundCurrency(safeNumber(input.bigSizePricing?.a3?.bwRate, 0)),
        colorRate: roundCurrency(safeNumber(input.bigSizePricing?.a3?.colorRate, 0)),
      },
      a2: {
        bwRate: roundCurrency(safeNumber(input.bigSizePricing?.a2?.bwRate, 0)),
        colorRate: roundCurrency(safeNumber(input.bigSizePricing?.a2?.colorRate, 0)),
      },
      a1: {
        bwRate: roundCurrency(safeNumber(input.bigSizePricing?.a1?.bwRate, 0)),
        colorRate: roundCurrency(safeNumber(input.bigSizePricing?.a1?.colorRate, 0)),
      },
    },

    photoSheetPricing: {
      rates: {
        p4: roundCurrency(safeNumber(input.photoSheetPricing?.rates?.p4, 0)),
        p6: roundCurrency(safeNumber(input.photoSheetPricing?.rates?.p6, 0)),
        p8: roundCurrency(safeNumber(input.photoSheetPricing?.rates?.p8, 0)),
        p10: roundCurrency(safeNumber(input.photoSheetPricing?.rates?.p10, 0)),
        p12: roundCurrency(safeNumber(input.photoSheetPricing?.rates?.p12, 0)),
      },
    },

    resumePricing: {
      bwRate: roundCurrency(safeNumber(input.resumePricing?.bwRate, 0)),
      colorRate: roundCurrency(safeNumber(input.resumePricing?.colorRate, 0)),
    },
  }

  // Validate Page Ranges if range pricing is enabled
  if (sanitized.pageRangePricing.enabled) {
    const bwVal = validatePageRanges(input.pageRangePricing?.bwRanges || [])
    if (!bwVal.valid) {
      throw new Error(`Invalid Black & White Page Range: ${bwVal.error}`)
    }
    sanitized.pageRangePricing.bwRanges = bwVal.sanitized

    const colorVal = validatePageRanges(input.pageRangePricing?.colorRanges || [])
    if (!colorVal.valid) {
      throw new Error(`Invalid Color Page Range: ${colorVal.error}`)
    }
    sanitized.pageRangePricing.colorRanges = colorVal.sanitized
  } else {
    // Even if disabled, sanitize ranges if provided
    const bwVal = validatePageRanges(input.pageRangePricing?.bwRanges || [])
    sanitized.pageRangePricing.bwRanges = bwVal.valid ? bwVal.sanitized : []

    const colorVal = validatePageRanges(input.pageRangePricing?.colorRanges || [])
    sanitized.pageRangePricing.colorRanges = colorVal.valid ? colorVal.sanitized : []
  }

  return sanitized
}
