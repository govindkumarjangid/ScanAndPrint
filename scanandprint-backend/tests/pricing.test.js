import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { calculatePrice, validatePageRanges } from '../src/utils/pricing.util.js'
import { sanitizeAndValidatePricingSettings } from '../src/validators/pricing.validator.js'

describe('Scan&Print Pricing Engine Unit Tests', () => {
  const baseShop = {
    shopCode: 'TEST_SHOP',
    bwRate: 5.0,
    colorRate: 10.0,
    pricingSettings: {
      advanceFeaturesEnabled: true,
      documentPrintEnabled: true,
      resumeEnabled: true,
      photoSheetEnabled: true,
      bigSizeEnabled: true,
      miniPrintEnabled: true,
      duplexEnabled: true,
      duplexExtraRate: 1.5,

      pageRangePricing: {
        enabled: true,
        bwRanges: [
          { fromPage: 5, toPage: 20, ratePerPage: 3.5 },
          { fromPage: 21, toPage: 50, ratePerPage: 2.5 },
        ],
        colorRanges: [
          { fromPage: 10, toPage: 30, ratePerPage: 8.0 },
        ],
      },

      bigSizePricing: {
        a3: { bwRate: 15.0, colorRate: 25.0 },
        a2: { bwRate: 0, colorRate: 0 }, // Unset / 0 to test fallback
        a1: { bwRate: 0, colorRate: 0 },
      },

      photoSheetPricing: {
        rates: {
          p4: 30.0,
          p6: 40.0,
          p8: 50.0,
          p10: 60.0,
          p12: 70.0,
        },
      },

      resumePricing: {
        bwRate: 20.0,
        colorRate: 40.0,
      },
    },
  }

  // 1. Range Match Test
  test('1. Should apply matched range rate when total sheets fall within a defined range', () => {
    const result = calculatePrice({
      shop: baseShop,
      totalPages: 10,
      copies: 1,
      colorType: 'BLACK_AND_WHITE',
      isDuplex: false,
    })

    // 10 sheets falls in [5-20] @ ₹3.50 -> 10 * 3.50 = 35.00
    assert.equal(result.totalAmount, 35.0)
    assert.equal(result.rateApplied, 3.5)
    assert.equal(result.pricingType, 'PAGE_RANGE_MATCHED')
  })

  // 2. Range Miss Fallback Test
  test('2. Should fallback to standard rate when total sheets do not match any range', () => {
    const result = calculatePrice({
      shop: baseShop,
      totalPages: 2, // 2 sheets is below range minimum 5
      copies: 1,
      colorType: 'BLACK_AND_WHITE',
      isDuplex: false,
    })

    // 2 * 5.0 (standard bwRate) = 10.00
    assert.equal(result.totalAmount, 10.0)
    assert.equal(result.rateApplied, 5.0)
    assert.equal(result.pricingType, 'STANDARD_A4_FALLBACK')
  })

  // 3. Copies Affecting Range Match Test
  test('3. Copies must multiply pages into total sheets to qualify for range pricing', () => {
    // 3 pages x 4 copies = 12 total sheets (matches range [5-20] @ ₹3.50)
    const result = calculatePrice({
      shop: baseShop,
      totalPages: 3,
      copies: 4,
      colorType: 'BLACK_AND_WHITE',
      isDuplex: false,
    })

    assert.equal(result.totalAmount, 42.0) // 12 * 3.5 = 42.00
    assert.equal(result.rateApplied, 3.5)
    assert.equal(result.pricingType, 'PAGE_RANGE_MATCHED')
  })

  // 4. Big Size Pricing & Fallback Test
  test('4. Big size uses specific rate when set, and falls back to standard A4 rate when unset / 0', () => {
    // Configured A3 B&W: ₹15/page
    const a3Result = calculatePrice({
      shop: baseShop,
      totalPages: 2,
      copies: 1,
      paperSize: 'A3',
      colorType: 'BLACK_AND_WHITE',
    })
    assert.equal(a3Result.totalAmount, 30.0) // 2 * 15.0
    assert.equal(a3Result.pricingType, 'BIG_SIZE_A3')

    // Unconfigured A2 B&W: fallback to standard A4 B&W (₹5.0)
    const a2Result = calculatePrice({
      shop: baseShop,
      totalPages: 2,
      copies: 1,
      paperSize: 'A2',
      colorType: 'BLACK_AND_WHITE',
    })
    assert.equal(a2Result.totalAmount, 10.0) // 2 * 5.0
    assert.equal(a2Result.pricingType, 'BIG_SIZE_A2_FALLBACK')
  })

  // 5. 4x6 Photo Sheet Flat Pricing Test
  test('5. Photo sheet charges flat per sheet multiplied by copies and ignores page count', () => {
    const result = calculatePrice({
      shop: baseShop,
      jobType: 'PHOTO_SHEET',
      photoCount: 6,
      totalPages: 2, // 2 sheets
      copies: 3,     // 3 sets
    })

    // 2 sheets * 3 sets * ₹40 flat = ₹240
    assert.equal(result.totalAmount, 240.0)
    assert.equal(result.rateApplied, 40.0)
    assert.equal(result.pricingType, 'PHOTO_SHEET_FLAT')
  })

  // 6. Resume Maker Flat Pricing Test
  test('6. Resume charges flat per resume multiplied by copies and ignores page count', () => {
    const result = calculatePrice({
      shop: baseShop,
      jobType: 'RESUME',
      totalPages: 4, // Page count must not affect resume price
      copies: 2,
      colorType: 'COLOR',
    })

    // 2 copies * ₹40 (resume colorRate) = ₹80
    assert.equal(result.totalAmount, 80.0)
    assert.equal(result.rateApplied, 40.0)
    assert.equal(result.pricingType, 'RESUME_FLAT')
  })

  // 7. Duplex Surcharge Test
  test('7. Duplex adds additional charge per page on top of the base/range rate', () => {
    // 10 pages falls in [5-20] range @ ₹3.50 + ₹1.50 duplex = ₹5.00 effective
    const result = calculatePrice({
      shop: baseShop,
      totalPages: 10,
      copies: 1,
      colorType: 'BLACK_AND_WHITE',
      isDuplex: true,
    })

    assert.equal(result.duplexCharge, 1.5)
    assert.equal(result.totalAmount, 50.0) // 10 * (3.5 + 1.5) = 50.00
  })

  // 8. Master Toggle OFF Test
  test('8. When advanceFeaturesEnabled is OFF, all advance logic is bypassed to normal A4 pricing', () => {
    const disabledShop = {
      ...baseShop,
      pricingSettings: {
        ...baseShop.pricingSettings,
        advanceFeaturesEnabled: false,
      },
    }

    const result = calculatePrice({
      shop: disabledShop,
      totalPages: 10, // normally matches range [5-20] @ ₹3.5
      copies: 1,
      colorType: 'BLACK_AND_WHITE',
      isDuplex: true, // duplex surcharge should also be bypassed
    })

    // Forces standard 10 * 5.0 (bwRate) = 50.00 without duplex surcharge
    assert.equal(result.totalAmount, 50.0)
    assert.equal(result.rateApplied, 5.0)
    assert.equal(result.pricingType, 'STANDARD_A4')
  })

  // 9. Validation Test: Overlapping Ranges & Invalid Inputs
  test('9. Range validator properly rejects overlapping ranges and invalid from/to', () => {
    // Overlapping ranges: [1-10] and [10-20]
    const overlapRanges = [
      { fromPage: 1, toPage: 10, ratePerPage: 4 },
      { fromPage: 10, toPage: 20, ratePerPage: 3 },
    ]
    const valResult1 = validatePageRanges(overlapRanges)
    assert.equal(valResult1.valid, false)
    assert.match(valResult1.error, /Overlapping page ranges detected/)

    // Invalid from > to
    const invertedRanges = [
      { fromPage: 15, toPage: 5, ratePerPage: 4 },
    ]
    const valResult2 = validatePageRanges(invertedRanges)
    assert.equal(valResult2.valid, false)
    assert.match(valResult2.error, /must be >=/)

    // Valid non-overlapping ranges
    const validRanges = [
      { fromPage: 1, toPage: 10, ratePerPage: 4 },
      { fromPage: 11, toPage: 20, ratePerPage: 3 },
    ]
    const valResult3 = validatePageRanges(validRanges)
    assert.equal(valResult3.valid, true)
    assert.equal(valResult3.sanitized.length, 2)
  })
})
