import { useState, useEffect } from 'react'
import {
  Save,
  Loader2,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  BookOpen,
  Maximize2,
  Copy,
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function OwnerPricing() {
  const { currentShop, fetchProfile, updateRates, isSavingRates } = useAuthStore()

  // Standard A4 Base Rates
  const [bwRate, setBwRate] = useState(currentShop?.bwRate ?? 5)
  const [colorRate, setColorRate] = useState(currentShop?.colorRate ?? 10)

  // Pricing Settings State
  const [advanceEnabled, setAdvanceEnabled] = useState(
    Boolean(currentShop?.pricingSettings?.advanceFeaturesEnabled)
  )

  // Feature Toggles (Checked/Unchecked for Customer Kiosk)
  const [documentPrintEnabled, setDocumentPrintEnabled] = useState(
    currentShop?.pricingSettings?.documentPrintEnabled !== false
  )
  const [duplexEnabled, setDuplexEnabled] = useState(
    Boolean(currentShop?.pricingSettings?.duplexEnabled)
  )
  const [bigSizeEnabled, setBigSizeEnabled] = useState(
    Boolean(currentShop?.pricingSettings?.bigSizeEnabled)
  )
  const [photoSheetEnabled, setPhotoSheetEnabled] = useState(
    Boolean(currentShop?.pricingSettings?.photoSheetEnabled)
  )
  const [resumeEnabled, setResumeEnabled] = useState(
    Boolean(currentShop?.pricingSettings?.resumeEnabled)
  )
  const [miniPrintEnabled, setMiniPrintEnabled] = useState(
    Boolean(currentShop?.pricingSettings?.miniPrintEnabled)
  )

  // Surcharges & Rates
  const [duplexExtraRate, setDuplexExtraRate] = useState(
    currentShop?.pricingSettings?.duplexExtraRate ?? 0
  )

  // Page Range Pricing State
  const [rangePricingEnabled, setRangePricingEnabled] = useState(
    Boolean(currentShop?.pricingSettings?.pageRangePricing?.enabled)
  )
  const [bwRanges, setBwRanges] = useState(
    currentShop?.pricingSettings?.pageRangePricing?.bwRanges || []
  )
  const [colorRanges, setColorRanges] = useState(
    currentShop?.pricingSettings?.pageRangePricing?.colorRanges || []
  )

  // Big Size Pricing
  const [bigSizeA3, setBigSizeA3] = useState({
    bwRate: currentShop?.pricingSettings?.bigSizePricing?.a3?.bwRate ?? 0,
    colorRate: currentShop?.pricingSettings?.bigSizePricing?.a3?.colorRate ?? 0,
  })
  const [bigSizeA2, setBigSizeA2] = useState({
    bwRate: currentShop?.pricingSettings?.bigSizePricing?.a2?.bwRate ?? 0,
    colorRate: currentShop?.pricingSettings?.bigSizePricing?.a2?.colorRate ?? 0,
  })
  const [bigSizeA1, setBigSizeA1] = useState({
    bwRate: currentShop?.pricingSettings?.bigSizePricing?.a1?.bwRate ?? 0,
    colorRate: currentShop?.pricingSettings?.bigSizePricing?.a1?.colorRate ?? 0,
  })

  // 4x6 Photo Sheet Pricing
  const [photoRates, setPhotoRates] = useState({
    p4: currentShop?.pricingSettings?.photoSheetPricing?.rates?.p4 ?? 0,
    p6: currentShop?.pricingSettings?.photoSheetPricing?.rates?.p6 ?? 0,
    p8: currentShop?.pricingSettings?.photoSheetPricing?.rates?.p8 ?? 0,
    p10: currentShop?.pricingSettings?.photoSheetPricing?.rates?.p10 ?? 0,
    p12: currentShop?.pricingSettings?.photoSheetPricing?.rates?.p12 ?? 0,
  })

  // Resume Maker Pricing
  const [resumeRates, setResumeRates] = useState({
    bwRate: currentShop?.pricingSettings?.resumePricing?.bwRate ?? 0,
    colorRate: currentShop?.pricingSettings?.resumePricing?.colorRate ?? 0,
  })

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (currentShop) {
      if (currentShop.bwRate !== undefined) setBwRate(currentShop.bwRate)
      if (currentShop.colorRate !== undefined) setColorRate(currentShop.colorRate)

      const s = currentShop.pricingSettings || {}
      setAdvanceEnabled(Boolean(s.advanceFeaturesEnabled))
      setDocumentPrintEnabled(s.documentPrintEnabled !== false)
      setDuplexEnabled(Boolean(s.duplexEnabled))
      setBigSizeEnabled(Boolean(s.bigSizeEnabled))
      setPhotoSheetEnabled(Boolean(s.photoSheetEnabled))
      setResumeEnabled(Boolean(s.resumeEnabled))
      setMiniPrintEnabled(Boolean(s.miniPrintEnabled))
      setDuplexExtraRate(s.duplexExtraRate ?? 0)

      setRangePricingEnabled(Boolean(s.pageRangePricing?.enabled))
      setBwRanges(s.pageRangePricing?.bwRanges || [])
      setColorRanges(s.pageRangePricing?.colorRanges || [])

      setBigSizeA3({
        bwRate: s.bigSizePricing?.a3?.bwRate ?? 0,
        colorRate: s.bigSizePricing?.a3?.colorRate ?? 0,
      })
      setBigSizeA2({
        bwRate: s.bigSizePricing?.a2?.bwRate ?? 0,
        colorRate: s.bigSizePricing?.a2?.colorRate ?? 0,
      })
      setBigSizeA1({
        bwRate: s.bigSizePricing?.a1?.bwRate ?? 0,
        colorRate: s.bigSizePricing?.a1?.colorRate ?? 0,
      })

      setPhotoRates({
        p4: s.photoSheetPricing?.rates?.p4 ?? 0,
        p6: s.photoSheetPricing?.rates?.p6 ?? 0,
        p8: s.photoSheetPricing?.rates?.p8 ?? 0,
        p10: s.photoSheetPricing?.rates?.p10 ?? 0,
        p12: s.photoSheetPricing?.rates?.p12 ?? 0,
      })

      setResumeRates({
        bwRate: s.resumePricing?.bwRate ?? 0,
        colorRate: s.resumePricing?.colorRate ?? 0,
      })
    }
  }, [currentShop])

  // Range Handlers
  const addRange = (type) => {
    const newRow = { fromPage: '', toPage: '', ratePerPage: '' }
    if (type === 'bw') setBwRanges([...bwRanges, newRow])
    else setColorRanges([...colorRanges, newRow])
  }

  const updateRange = (type, index, field, value) => {
    const list = type === 'bw' ? [...bwRanges] : [...colorRanges]
    list[index] = { ...list[index], [field]: value }
    if (type === 'bw') setBwRanges(list)
    else setColorRanges(list)
  }

  const removeRange = (type, index) => {
    const list = type === 'bw' ? [...bwRanges] : [...colorRanges]
    list.splice(index, 1)
    if (type === 'bw') setBwRanges(list)
    else setColorRanges(list)
  }

  // Client-side range validation check
  const checkRangeErrors = (ranges) => {
    if (!ranges || ranges.length === 0) return null
    for (let i = 0; i < ranges.length; i++) {
      const from = Number(ranges[i].fromPage)
      const to = Number(ranges[i].toPage)
      const rate = Number(ranges[i].ratePerPage)
      if (!from || !to || !rate) continue
      if (from > to) return `Row ${i + 1}: "From Page" (${from}) cannot be greater than "To Page" (${to})`
    }
    // Check overlap
    const sorted = [...ranges]
      .filter((r) => r.fromPage && r.toPage)
      .sort((a, b) => Number(a.fromPage) - Number(b.fromPage))
    for (let i = 0; i < sorted.length - 1; i++) {
      if (Number(sorted[i].toPage) >= Number(sorted[i + 1].fromPage)) {
        return `Overlap detected between range [${sorted[i].fromPage}-${sorted[i].toPage}] and [${sorted[i + 1].fromPage}-${sorted[i + 1].toPage}]`
      }
    }
    return null
  }

  const bwRangeError = rangePricingEnabled ? checkRangeErrors(bwRanges) : null
  const colorRangeError = rangePricingEnabled ? checkRangeErrors(colorRanges) : null

  const handleSaveRates = async (e) => {
    e.preventDefault()

    if (rangePricingEnabled) {
      if (bwRangeError) {
        toast.error(`B&W Ranges: ${bwRangeError}`)
        return
      }
      if (colorRangeError) {
        toast.error(`Color Ranges: ${colorRangeError}`)
        return
      }
    }

    const payload = {
      bwRate: Number(bwRate),
      colorRate: Number(colorRate),
      pricingSettings: {
        advanceFeaturesEnabled: advanceEnabled,
        documentPrintEnabled,
        resumeEnabled,
        photoSheetEnabled,
        bigSizeEnabled,
        miniPrintEnabled,
        duplexEnabled,
        duplexExtraRate: Number(duplexExtraRate) || 0,

        pageRangePricing: {
          enabled: rangePricingEnabled,
          bwRanges: bwRanges
            .filter((r) => r.fromPage && r.toPage && r.ratePerPage)
            .map((r) => ({
              fromPage: Number(r.fromPage),
              toPage: Number(r.toPage),
              ratePerPage: Number(r.ratePerPage),
            })),
          colorRanges: colorRanges
            .filter((r) => r.fromPage && r.toPage && r.ratePerPage)
            .map((r) => ({
              fromPage: Number(r.fromPage),
              toPage: Number(r.toPage),
              ratePerPage: Number(r.ratePerPage),
            })),
        },

        bigSizePricing: {
          a3: { bwRate: Number(bigSizeA3.bwRate) || 0, colorRate: Number(bigSizeA3.colorRate) || 0 },
          a2: { bwRate: Number(bigSizeA2.bwRate) || 0, colorRate: Number(bigSizeA2.colorRate) || 0 },
          a1: { bwRate: Number(bigSizeA1.bwRate) || 0, colorRate: Number(bigSizeA1.colorRate) || 0 },
        },

        photoSheetPricing: {
          rates: {
            p4: Number(photoRates.p4) || 0,
            p6: Number(photoRates.p6) || 0,
            p8: Number(photoRates.p8) || 0,
            p10: Number(photoRates.p10) || 0,
            p12: Number(photoRates.p12) || 0,
          },
        },

        resumePricing: {
          bwRate: Number(resumeRates.bwRate) || 0,
          colorRate: Number(resumeRates.colorRate) || 0,
        },
      },
    }

    try {
      await updateRates(payload)
    } catch (err) {
      // toast handled in store
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl w-full pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
          Print Rates &amp; Customer Pricing
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm mt-0.5 font-medium">
          Manage your standard A4 rates, bulk page ranges, big size prints, 4×6 photo sheets, and duplex surcharges.
        </p>
      </div>

      <form onSubmit={handleSaveRates} className="flex flex-col gap-6">
        {/* Section 1: Standard A4 Base Rates */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand" />
              <h2 className="text-base sm:text-lg font-extrabold text-stone-900 font-heading">
                Standard A4 Print Rates (Base Price)
              </h2>
            </div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Mandatory
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* B&W Rate */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col gap-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                Black &amp; White Rate (₹ / page) *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-stone-500 font-bold text-base">₹</span>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  value={bwRate}
                  onChange={(e) => setBwRate(e.target.value)}
                  className="w-full h-11 pl-8 pr-4 rounded-xl border border-stone-300 bg-white text-base font-extrabold text-stone-900 outline-none focus:border-brand"
                />
              </div>
              <span className="text-[11px] text-stone-500 font-medium">
                Standard B&amp;W single-sided A4 page rate
              </span>
            </div>

            {/* Color Rate */}
            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200/80 flex flex-col gap-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-brand">
                Color Rate (₹ / page) *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-brand font-bold text-base">₹</span>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  required
                  value={colorRate}
                  onChange={(e) => setColorRate(e.target.value)}
                  className="w-full h-11 pl-8 pr-4 rounded-xl border border-rose-300 bg-white text-base font-extrabold text-stone-900 outline-none focus:border-brand"
                />
              </div>
              <span className="text-[11px] text-rose-600 font-medium">
                Standard Color single-sided A4 page rate
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Advance Pricing & Services Container */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-xs flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-stone-900 font-heading">
                  Advance Pricing &amp; Services
                </h2>
                <p className="text-xs text-stone-500 font-medium mt-0.5">
                  Enable bulk discounts, photo sheets, resume maker, A3/A2/A1 prints, and duplex charges.
                </p>
              </div>
            </div>

            {/* Master Toggle */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={advanceEnabled}
                onChange={(e) => setAdvanceEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="ml-3 text-xs font-extrabold text-stone-800">
                {advanceEnabled ? 'ACTIVE (ON)' : 'OFF'}
              </span>
            </label>
          </div>

          {/* All Sections Below - NEVER COLLAPSE based on individual checkboxes */}
          <div className="flex flex-col gap-6 pt-2">
            {/* Service Level Toggles (Checkboxes at Top) */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                  Customer Kiosk Available Services
                </label>
                <span className="text-[11px] text-stone-400 font-semibold">
                  Controls which options customers see on Kiosk
                </span>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                <label className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer text-xs font-bold transition-all flex-1 min-w-[130px] sm:min-w-[140px] whitespace-nowrap select-none ${
                  documentPrintEnabled ? 'bg-rose-50/70 border-brand/30 text-stone-900 shadow-2xs' : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
                }`}>
                  <input
                    type="checkbox"
                    checked={documentPrintEnabled}
                    onChange={(e) => setDocumentPrintEnabled(e.target.checked)}
                    className="rounded text-brand shrink-0 w-4 h-4 cursor-pointer"
                  />
                  <span className="whitespace-nowrap select-none">Document</span>
                </label>

                <label className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer text-xs font-bold transition-all flex-1 min-w-[130px] sm:min-w-[140px] whitespace-nowrap select-none ${
                  duplexEnabled ? 'bg-indigo-50/70 border-indigo-300 text-stone-900 shadow-2xs' : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
                }`}>
                  <input
                    type="checkbox"
                    checked={duplexEnabled}
                    onChange={(e) => setDuplexEnabled(e.target.checked)}
                    className="rounded text-brand shrink-0 w-4 h-4 cursor-pointer"
                  />
                  <span className="whitespace-nowrap select-none">Duplex (2-Side)</span>
                </label>

                <label className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer text-xs font-bold transition-all flex-1 min-w-[130px] sm:min-w-[140px] whitespace-nowrap select-none ${
                  bigSizeEnabled ? 'bg-amber-50/70 border-amber-300 text-stone-900 shadow-2xs' : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
                }`}>
                  <input
                    type="checkbox"
                    checked={bigSizeEnabled}
                    onChange={(e) => setBigSizeEnabled(e.target.checked)}
                    className="rounded text-brand shrink-0 w-4 h-4 cursor-pointer"
                  />
                  <span className="whitespace-nowrap select-none">Big Size (A3/A2)</span>
                </label>

                <label className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer text-xs font-bold transition-all flex-1 min-w-[130px] sm:min-w-[140px] whitespace-nowrap select-none ${
                  photoSheetEnabled ? 'bg-emerald-50/70 border-emerald-300 text-stone-900 shadow-2xs' : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
                }`}>
                  <input
                    type="checkbox"
                    checked={photoSheetEnabled}
                    onChange={(e) => setPhotoSheetEnabled(e.target.checked)}
                    className="rounded text-brand shrink-0 w-4 h-4 cursor-pointer"
                  />
                  <span className="whitespace-nowrap select-none">4×6 Photo</span>
                </label>

                <label className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer text-xs font-bold transition-all flex-1 min-w-[130px] sm:min-w-[140px] whitespace-nowrap select-none ${
                  resumeEnabled ? 'bg-purple-50/70 border-purple-300 text-stone-900 shadow-2xs' : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
                }`}>
                  <input
                    type="checkbox"
                    checked={resumeEnabled}
                    onChange={(e) => setResumeEnabled(e.target.checked)}
                    className="rounded text-brand shrink-0 w-4 h-4 cursor-pointer"
                  />
                  <span className="whitespace-nowrap select-none">Resume</span>
                </label>

                <label className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer text-xs font-bold transition-all flex-1 min-w-[130px] sm:min-w-[140px] whitespace-nowrap select-none ${
                  miniPrintEnabled ? 'bg-blue-50/70 border-blue-300 text-stone-900 shadow-2xs' : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
                }`}>
                  <input
                    type="checkbox"
                    checked={miniPrintEnabled}
                    onChange={(e) => setMiniPrintEnabled(e.target.checked)}
                    className="rounded text-brand shrink-0 w-4 h-4 cursor-pointer"
                  />
                  <span className="whitespace-nowrap select-none">Mini Print</span>
                </label>
              </div>
            </div>

            {/* 1. Duplex Surcharge Setting (ALWAYS VISIBLE) */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              duplexEnabled ? 'bg-indigo-50/50 border-indigo-200' : 'bg-stone-50/80 border-stone-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Copy className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-extrabold text-stone-900">
                      Duplex (Both-Side) Additional Charge
                    </h4>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      duplexEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {duplexEnabled ? 'Active on Kiosk' : 'Disabled on Kiosk'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                    Extra amount added per page for front &amp; back printing (0 = standard page rate only)
                  </p>
                </div>
              </div>
              <div className="relative flex items-center w-full sm:w-36 shrink-0">
                <span className="absolute left-3 text-stone-500 font-bold text-sm">+₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={duplexExtraRate}
                  onChange={(e) => setDuplexExtraRate(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-stone-300 bg-white text-sm font-bold text-stone-900 outline-none focus:border-brand"
                />
                <span className="ml-2 text-xs font-bold text-stone-600">/page</span>
              </div>
            </div>

            {/* 2. Page Range Pricing (ALWAYS VISIBLE) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 text-stone-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <Layers className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-extrabold text-stone-900">
                        Bulk Page Range Pricing (Kagaz Se – Kagaz Tak)
                      </h3>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        rangePricingEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                      }`}>
                        {rangePricingEnabled ? 'Active on Kiosk' : 'Disabled on Kiosk'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                      Total sheets (pages × copies) matching defined range gets discounted rate.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={rangePricingEnabled}
                    onChange={(e) => setRangePricingEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
                </label>
              </div>

              {/* Range Tables - ALWAYS VISIBLE */}
              <div className="flex flex-col gap-5 pt-1">
                {/* B&W Ranges */}
                <div className="flex flex-col gap-2.5 bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase text-stone-700 tracking-wider">
                      Black &amp; White Ranges
                    </span>
                    <button
                      type="button"
                      onClick={() => addRange('bw')}
                      className="btn btn-sm btn-ghost text-xs text-brand font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add B&amp;W Range
                    </button>
                  </div>

                  {bwRangeError && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-700 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {bwRangeError}
                    </div>
                  )}

                  {bwRanges.length === 0 ? (
                    <p className="text-xs text-stone-400 italic py-1">
                      No B&amp;W ranges set. Standard ₹{bwRate}/page applies.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {bwRanges.map((r, idx) => (
                        <div key={`bw-${idx}`} className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                          <span className="text-xs font-bold text-stone-500 w-5">{idx + 1}.</span>
                          <input
                            type="number"
                            placeholder="From"
                            value={r.fromPage}
                            onChange={(e) => updateRange('bw', idx, 'fromPage', e.target.value)}
                            className="w-20 sm:w-24 h-9 px-2.5 rounded-lg border border-stone-300 text-xs font-bold outline-none focus:border-brand"
                          />
                          <span className="text-xs text-stone-400 font-medium">to</span>
                          <input
                            type="number"
                            placeholder="To"
                            value={r.toPage}
                            onChange={(e) => updateRange('bw', idx, 'toPage', e.target.value)}
                            className="w-20 sm:w-24 h-9 px-2.5 rounded-lg border border-stone-300 text-xs font-bold outline-none focus:border-brand"
                          />
                          <span className="text-xs text-stone-400 font-medium">@</span>
                          <div className="relative flex items-center">
                            <span className="absolute left-2.5 text-stone-400 font-bold text-xs">₹</span>
                            <input
                              type="number"
                              step="0.1"
                              placeholder="Rate"
                              value={r.ratePerPage}
                              onChange={(e) => updateRange('bw', idx, 'ratePerPage', e.target.value)}
                              className="w-24 sm:w-28 h-9 pl-6 pr-2 rounded-lg border border-stone-300 text-xs font-extrabold text-stone-900 outline-none focus:border-brand"
                            />
                          </div>
                          <span className="text-[11px] text-stone-400">/page</span>
                          <button
                            type="button"
                            onClick={() => removeRange('bw', idx)}
                            className="text-stone-400 hover:text-rose-600 p-1.5 cursor-pointer ml-auto"
                            title="Remove Range"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Color Ranges */}
                <div className="flex flex-col gap-2.5 bg-white p-3.5 sm:p-4 rounded-xl border border-rose-200/80 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase text-brand tracking-wider">
                      Color Ranges
                    </span>
                    <button
                      type="button"
                      onClick={() => addRange('color')}
                      className="btn btn-sm btn-ghost text-xs text-brand font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Color Range
                    </button>
                  </div>

                  {colorRangeError && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-700 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {colorRangeError}
                    </div>
                  )}

                  {colorRanges.length === 0 ? (
                    <p className="text-xs text-stone-400 italic py-1">
                      No Color ranges set. Standard ₹{colorRate}/page applies.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {colorRanges.map((r, idx) => (
                        <div key={`color-${idx}`} className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                          <span className="text-xs font-bold text-stone-500 w-5">{idx + 1}.</span>
                          <input
                            type="number"
                            placeholder="From"
                            value={r.fromPage}
                            onChange={(e) => updateRange('color', idx, 'fromPage', e.target.value)}
                            className="w-20 sm:w-24 h-9 px-2.5 rounded-lg border border-stone-300 text-xs font-bold outline-none focus:border-brand"
                          />
                          <span className="text-xs text-stone-400 font-medium">to</span>
                          <input
                            type="number"
                            placeholder="To"
                            value={r.toPage}
                            onChange={(e) => updateRange('color', idx, 'toPage', e.target.value)}
                            className="w-20 sm:w-24 h-9 px-2.5 rounded-lg border border-stone-300 text-xs font-bold outline-none focus:border-brand"
                          />
                          <span className="text-xs text-stone-400 font-medium">@</span>
                          <div className="relative flex items-center">
                            <span className="absolute left-2.5 text-stone-400 font-bold text-xs">₹</span>
                            <input
                              type="number"
                              step="0.1"
                              placeholder="Rate"
                              value={r.ratePerPage}
                              onChange={(e) => updateRange('color', idx, 'ratePerPage', e.target.value)}
                              className="w-24 sm:w-28 h-9 pl-6 pr-2 rounded-lg border border-stone-300 text-xs font-extrabold text-brand outline-none focus:border-brand"
                            />
                          </div>
                          <span className="text-[11px] text-stone-400">/page</span>
                          <button
                            type="button"
                            onClick={() => removeRange('color', idx)}
                            className="text-stone-400 hover:text-rose-600 p-1.5 cursor-pointer ml-auto"
                            title="Remove Range"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Big Size Pricing (ALWAYS VISIBLE) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col gap-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 text-stone-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <Maximize2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-extrabold text-stone-900">
                      Big Size Pricing (A3, A2, A1 Flat ₹ / page)
                    </h3>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      bigSizeEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {bigSizeEnabled ? 'Active on Kiosk' : 'Disabled on Kiosk'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                    Specific rate per page for large formats. Leave as 0 to fallback to standard A4 rate.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* A3 */}
                <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex flex-col gap-2 shadow-2xs">
                  <span className="text-xs font-extrabold text-stone-800">A3 Size Rate</span>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="B&W (₹)"
                      value={bigSizeA3.bwRate || ''}
                      onChange={(e) => setBigSizeA3({ ...bigSizeA3, bwRate: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg border border-stone-300 text-xs font-bold outline-none focus:border-brand"
                    />
                    <input
                      type="number"
                      placeholder="Color (₹)"
                      value={bigSizeA3.colorRate || ''}
                      onChange={(e) => setBigSizeA3({ ...bigSizeA3, colorRate: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg border border-rose-200 text-xs font-bold text-brand outline-none focus:border-brand"
                    />
                  </div>
                </div>

                {/* A2 */}
                <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex flex-col gap-2 shadow-2xs">
                  <span className="text-xs font-extrabold text-stone-800">A2 Size Rate</span>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="B&W (₹)"
                      value={bigSizeA2.bwRate || ''}
                      onChange={(e) => setBigSizeA2({ ...bigSizeA2, bwRate: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg border border-stone-300 text-xs font-bold outline-none focus:border-brand"
                    />
                    <input
                      type="number"
                      placeholder="Color (₹)"
                      value={bigSizeA2.colorRate || ''}
                      onChange={(e) => setBigSizeA2({ ...bigSizeA2, colorRate: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg border border-rose-200 text-xs font-bold text-brand outline-none focus:border-brand"
                    />
                  </div>
                </div>

                {/* A1 */}
                <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex flex-col gap-2 shadow-2xs">
                  <span className="text-xs font-extrabold text-stone-800">A1 Size Rate</span>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="B&W (₹)"
                      value={bigSizeA1.bwRate || ''}
                      onChange={(e) => setBigSizeA1({ ...bigSizeA1, bwRate: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg border border-stone-300 text-xs font-bold outline-none focus:border-brand"
                    />
                    <input
                      type="number"
                      placeholder="Color (₹)"
                      value={bigSizeA1.colorRate || ''}
                      onChange={(e) => setBigSizeA1({ ...bigSizeA1, colorRate: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-lg border border-rose-200 text-xs font-bold text-brand outline-none focus:border-brand"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. 4×6 Photo Sheet Pricing (ALWAYS VISIBLE) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col gap-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 text-stone-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <ImageIcon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-extrabold text-stone-900">
                      4×6 Photo Sheet Pricing (Flat ₹ / sheet)
                    </h3>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      photoSheetEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {photoSheetEnabled ? 'Active on Kiosk' : 'Disabled on Kiosk'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                    Flat rate per photo sheet. 0 = that count is hidden from customer.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[4, 6, 8, 10, 12].map((cnt) => (
                  <div key={`photo-${cnt}`} className="bg-white p-3 rounded-xl border border-stone-200 flex flex-col gap-1.5 shadow-2xs">
                    <span className="text-xs font-extrabold text-stone-700">{cnt} Photos</span>
                    <div className="relative flex items-center">
                      <span className="absolute left-2.5 text-stone-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={photoRates[`p${cnt}`] || ''}
                        onChange={(e) =>
                          setPhotoRates({ ...photoRates, [`p${cnt}`]: e.target.value })
                        }
                        placeholder="0"
                        className="w-full h-9 pl-6 pr-2 rounded-lg border border-stone-300 text-xs font-extrabold text-stone-900 outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Resume Maker Pricing (ALWAYS VISIBLE) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col gap-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 text-stone-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-extrabold text-stone-900">
                      Resume Maker Pricing (Flat ₹ / resume)
                    </h3>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      resumeEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {resumeEnabled ? 'Active on Kiosk' : 'Disabled on Kiosk'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                    Flat rate per resume regardless of pages.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex flex-col gap-2 shadow-2xs">
                  <span className="text-xs font-extrabold text-stone-700">Black &amp; White Resume Rate</span>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-stone-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={resumeRates.bwRate || ''}
                      onChange={(e) => setResumeRates({ ...resumeRates, bwRate: e.target.value })}
                      placeholder="e.g. 20"
                      className="w-full h-9 pl-6 pr-3 rounded-lg border border-stone-300 text-xs font-bold text-stone-900 outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-rose-200/80 flex flex-col gap-2 shadow-2xs">
                  <span className="text-xs font-extrabold text-brand">Color Resume Rate</span>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-brand font-bold text-xs">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={resumeRates.colorRate || ''}
                      onChange={(e) => setResumeRates({ ...resumeRates, colorRate: e.target.value })}
                      placeholder="e.g. 40"
                      className="w-full h-9 pl-6 pr-3 rounded-lg border border-rose-300 text-xs font-bold text-brand outline-none focus:border-brand"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-start pt-1">
          <button
            type="submit"
            disabled={isSavingRates || Boolean(bwRangeError) || Boolean(colorRangeError)}
            className="btn btn-primary py-3.5 sm:py-4 px-6 sm:px-8 flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base font-bold shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSavingRates ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSavingRates ? 'Saving Rates...' : 'Save Customer Print Rates'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
