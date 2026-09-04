import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Layers,
  Check,
  AlertCircle,
  Crop,
  Maximize2,
  Image as ImageIcon,
} from 'lucide-react'
import { parsePageRange } from '../../lib/pdfUtil'

export default function PrintOptionsStage({
  shopInfo,
  selectedFile,
  colorType,
  setColorType,
  copies,
  setCopies,
  isDuplex,
  setIsDuplex,
  paperSize = 'A4',
  setPaperSize,
  photoCount = 0,
  setPhotoCount,
  jobType = 'DOCUMENT',
  setJobType,
  pricingBreakdown,
  pricingResult,
  customerPhone,
  setCustomerPhone,
  totalDocPages,
  pageRangeMode,
  setPageRangeMode,
  customRangeStr,
  setCustomRangeStr,
  selectedPagesCount,
  setSelectedPagesCount,
  totalAmount,
  onOpenStudioModal,
  onOpenPdfStudioModal,
  onOpenImageEditor,
  onBack,
  onProceedToPayment,
}) {
  const bwRate = shopInfo?.bwRate ?? 5
  const colorRate = shopInfo?.colorRate ?? 10
  const [rangeError, setRangeError] = useState('')
  const isImage = selectedFile && selectedFile.type?.startsWith('image/')

  const settings = shopInfo?.pricingSettings || {}
  const advanceEnabled = Boolean(settings.advanceFeaturesEnabled)
  const bigSizeEnabled = advanceEnabled && Boolean(settings.bigSizeEnabled)
  const duplexEnabled = advanceEnabled && Boolean(settings.duplexEnabled)
  const duplexExtraRate = Number(settings.duplexExtraRate) || 0
  const photoSheetEnabled = advanceEnabled && Boolean(settings.photoSheetEnabled)

  const handleCustomRangeChange = (val) => {
    setCustomRangeStr(val)
    const result = parsePageRange(val, totalDocPages)
    if (!result.valid) {
      setRangeError(result.error || 'Invalid range format')
      setSelectedPagesCount(totalDocPages)
    } else {
      setRangeError('')
      setSelectedPagesCount(result.count)
    }
  }

  const handleRangeModeChange = (mode) => {
    setPageRangeMode(mode)
    if (mode === 'all') {
      setSelectedPagesCount(totalDocPages)
      setCustomRangeStr('')
      setRangeError('')
    } else if (mode === 'first') {
      setSelectedPagesCount(1)
      setCustomRangeStr('1')
      setRangeError('')
    } else if (mode === 'custom') {
      setCustomRangeStr('')
      setSelectedPagesCount(1)
    }
  }

  // Available photo rates
  const validPhotoCounts = [4, 6, 8, 10, 12].filter(
    (cnt) => Number(settings.photoSheetPricing?.rates?.[`p${cnt}`]) > 0
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-6 flex flex-col gap-4 sm:gap-5"
    >
      {/* Top Header Row with Change File */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-heading leading-tight">
            Print Configuration
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
            Customize print settings for your document
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="btn btn-ghost btn-sm text-stone-600 hover:text-stone-900 flex items-center gap-1 text-xs cursor-pointer shrink-0 bg-stone-100/80 hover:bg-stone-200/80 rounded-xl px-2.5 py-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Change File</span>
        </button>
      </div>

      {/* Main Options Form */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200/80 shadow-md flex flex-col gap-4 sm:gap-5">
        {/* Image Cropping & Editing Shortcut Banner */}
        {isImage && (
          <div className="p-3 sm:p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200/80 flex items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-white text-brand border border-rose-100 flex items-center justify-center shadow-xs shrink-0">
                <Crop className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-extrabold text-stone-900 truncate">Image Studio &amp; Crop</span>
                <span className="text-[10px] sm:text-[11px] text-stone-500 font-medium truncate">Trim borders, multi-image A4, passport photos</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenStudioModal || onOpenImageEditor}
              className="btn btn-primary py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-bold shrink-0 shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Crop className="w-3.5 h-3.5" />
              <span>Edit Image</span>
            </button>
          </div>
        )}

        {/* PDF Studio & Page Manager Shortcut Banner */}
        {!isImage && selectedFile && (
          <div className="p-3 sm:p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200/80 flex items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-white text-purple-600 border border-purple-100 flex items-center justify-center shadow-xs shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-extrabold text-stone-900 truncate">PDF Studio &amp; Pages</span>
                <span className="text-[10px] sm:text-[11px] text-stone-500 font-medium truncate">Thumbnails, rotation, delete &amp; merge</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenPdfStudioModal || onOpenStudioModal}
              className="bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-bold shrink-0 shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Edit PDF</span>
            </button>
          </div>
        )}

        {/* Big Size Paper Selection (A4, A3, A2, A1) */}
        {bigSizeEnabled && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-stone-500" />
              <span>Paper Size</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {['A4', 'A3', 'A2', 'A1'].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setPaperSize && setPaperSize(sz)}
                  className={`py-2 px-2 rounded-2xl border text-center font-extrabold text-xs transition-all cursor-pointer ${
                    paperSize === sz
                      ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4x6 Photo Sheet Mode Selector (if image and photoSheetEnabled) */}
        {isImage && photoSheetEnabled && validPhotoCounts.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
                <span>Print Mode</span>
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (setJobType) setJobType('DOCUMENT')
                  if (setPhotoCount) setPhotoCount(0)
                }}
                className={`py-2 px-3 rounded-2xl border text-center font-extrabold text-xs transition-all cursor-pointer ${
                  jobType === 'DOCUMENT'
                    ? 'bg-brand text-white border-brand shadow-sm'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Standard Document
              </button>

              <button
                type="button"
                onClick={() => {
                  if (setJobType) setJobType('PHOTO_SHEET')
                  if (setPhotoCount && photoCount === 0) setPhotoCount(validPhotoCounts[0])
                }}
                className={`py-2 px-3 rounded-2xl border text-center font-extrabold text-xs transition-all cursor-pointer ${
                  jobType === 'PHOTO_SHEET'
                    ? 'bg-brand text-white border-brand shadow-sm'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                4×6 Photo Sheet
              </button>
            </div>

            {jobType === 'PHOTO_SHEET' && (
              <div className="pt-1 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-stone-600">
                  Select Photos per Sheet:
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {validPhotoCounts.map((cnt) => (
                    <button
                      key={`pc-${cnt}`}
                      type="button"
                      onClick={() => setPhotoCount && setPhotoCount(cnt)}
                      className={`py-1.5 rounded-xl border text-center text-xs font-black cursor-pointer ${
                        photoCount === cnt
                          ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {cnt} Pcs
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 1. Page Range Selection (If document has > 1 page and not photo sheet) */}
        {jobType !== 'PHOTO_SHEET' && totalDocPages > 1 && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 flex items-center justify-between">
              <span>Pages to Print</span>
              <span className="text-[10px] sm:text-[11px] font-bold text-stone-500 lowercase">
                Total: {totalDocPages} pages
              </span>
            </label>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => handleRangeModeChange('all')}
                className={`py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-2xl border text-center font-extrabold text-[11px] sm:text-xs transition-all cursor-pointer ${
                  pageRangeMode === 'all'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                All ({totalDocPages})
              </button>

              <button
                type="button"
                onClick={() => handleRangeModeChange('first')}
                className={`py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-2xl border text-center font-extrabold text-[11px] sm:text-xs transition-all cursor-pointer ${
                  pageRangeMode === 'first'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Page 1 Only
              </button>

              <button
                type="button"
                onClick={() => handleRangeModeChange('custom')}
                className={`py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-2xl border text-center font-extrabold text-[11px] sm:text-xs transition-all cursor-pointer ${
                  pageRangeMode === 'custom'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Custom Range
              </button>
            </div>

            {pageRangeMode === 'custom' && (
              <div className="mt-1 flex flex-col gap-1">
                <input
                  type="text"
                  placeholder="e.g. 1-3, 5, 8-10"
                  value={customRangeStr}
                  onChange={(e) => handleCustomRangeChange(e.target.value)}
                  className="w-full h-10 px-4 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:border-brand text-xs font-bold text-stone-900 outline-none"
                />
                {rangeError ? (
                  <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {rangeError}
                  </span>
                ) : (
                  <span className="text-[11px] text-stone-500 font-medium">
                    Printing {selectedPagesCount} of {totalDocPages} pages
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. Color Type Switcher (only for documents/resumes) */}
        {jobType !== 'PHOTO_SHEET' && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
              Print Color Mode
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setColorType('BLACK_AND_WHITE')}
                className={`p-3 sm:p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  colorType === 'BLACK_AND_WHITE'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-md ring-2 ring-stone-900/10'
                    : 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs sm:text-sm">Black &amp; White</span>
                  {colorType === 'BLACK_AND_WHITE' && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 stroke-3 shrink-0" />}
                </div>
                <span
                  className={`text-xs ${
                    colorType === 'BLACK_AND_WHITE' ? 'text-stone-300 font-semibold' : 'text-stone-500 font-medium'
                  }`}
                >
                  ₹{bwRate} / page
                </span>
              </button>

              <button
                type="button"
                onClick={() => setColorType('COLOR')}
                className={`p-3 sm:p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  colorType === 'COLOR'
                    ? 'bg-brand text-white border-brand shadow-md shadow-rose-500/20 ring-2 ring-brand/10'
                    : 'bg-rose-50/50 text-stone-800 border-rose-200 hover:bg-rose-100/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs sm:text-sm">Color Print</span>
                  {colorType === 'COLOR' && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-3 shrink-0" />}
                </div>
                <span
                  className={`text-xs ${
                    colorType === 'COLOR' ? 'text-rose-100 font-semibold' : 'text-rose-600 font-semibold'
                  }`}
                >
                  ₹{colorRate} / page
                </span>
              </button>
            </div>
          </div>
        )}

        {/* 3. Sides Mode: Single-Sided vs Double-Sided Book Mode */}
        {duplexEnabled && jobType !== 'PHOTO_SHEET' && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
              Print Sides &amp; Book Duplex
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setIsDuplex(false)}
                className={`p-3 sm:p-3.5 rounded-2xl border flex flex-col justify-between gap-1 text-left transition-all cursor-pointer ${
                  !isDuplex
                    ? 'bg-rose-50/70 border-brand ring-2 ring-brand/20 shadow-xs'
                    : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs sm:text-sm font-black text-stone-900 leading-tight">Single-Sided</span>
                  <span className="text-[9px] sm:text-[10px] font-bold bg-white text-stone-600 px-1.5 py-0.5 rounded-md border border-stone-200 w-max shrink-0">
                    1-Side
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-stone-500 font-medium leading-tight">
                  1 page per sheet (Front only)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsDuplex(true)}
                className={`p-3 sm:p-3.5 rounded-2xl border flex flex-col justify-between gap-1 text-left transition-all cursor-pointer ${
                  isDuplex
                    ? 'bg-rose-50/70 border-brand ring-2 ring-brand/20 shadow-xs'
                    : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs sm:text-sm font-black text-stone-900 leading-tight">Double-Sided</span>
                  <span className="text-[9px] sm:text-[10px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md w-max shrink-0">
                    {duplexExtraRate > 0 ? `+₹${duplexExtraRate}/pg` : 'Front & Back'}
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-stone-500 font-medium leading-tight">
                  Front = Page 1, Back = Page 2
                </span>
              </button>
            </div>
          </div>
        )}

        {/* 4. Number of Copies */}
        <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-stone-900">
              {jobType === 'PHOTO_SHEET' ? 'Sets of Sheets' : 'Copies (Sets)'}
            </span>
            <span className="text-[10px] sm:text-[11px] text-stone-500 font-medium">
              Number of print copies
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-stone-300 shadow-2xs">
            <button
              type="button"
              onClick={() => setCopies(Math.max(1, copies - 1))}
              className="btn btn-ghost p-1 w-7 h-7 bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center cursor-pointer rounded-lg"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-extrabold text-sm text-stone-900 w-5 text-center">
              {copies}
            </span>
            <button
              type="button"
              onClick={() => setCopies(copies + 1)}
              className="btn btn-ghost p-1 w-7 h-7 bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center cursor-pointer rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Customer Mobile Number */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
            Mobile Number (Optional)
          </label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="98765 43210 (For SMS / WhatsApp Receipt)"
            className="w-full h-10 sm:h-11 px-3.5 sm:px-4 rounded-xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-brand text-xs font-medium outline-none"
          />
        </div>

        {/* 5. Transparent Price Breakdown Card */}
        <div className="bg-linear-to-br from-rose-50/70 to-rose-100/40 p-3.5 sm:p-4 rounded-2xl border border-rose-200/80 flex items-center justify-between">
          <div className="flex flex-col min-w-0 flex-1 mr-2">
            <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
              Total Calculation Breakdown
            </span>
            <span className="text-xs text-stone-800 font-bold mt-0.5 break-words">
              {pricingBreakdown || `${selectedPagesCount} page(s) × ${copies} copy(ies)`}
            </span>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xl sm:text-2xl font-extrabold text-brand font-heading">
              ₹{totalAmount}
            </span>
          </div>
        </div>

        {/* Proceed to Pay Button */}
        <button
          type="button"
          onClick={onProceedToPayment}
          disabled={totalAmount <= 0}
          className="btn btn-primary py-3.5 shadow-lg w-full text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>Proceed to Payment (₹{totalAmount})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}
