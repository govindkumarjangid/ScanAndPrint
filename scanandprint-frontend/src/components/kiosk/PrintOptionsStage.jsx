import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, ArrowRight, ArrowLeft, Layers, Sparkles, Check, AlertCircle, Crop } from 'lucide-react'
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
  onOpenCropModal,
  onBack,
  onProceedToPayment,
}) {
  const bwRate = shopInfo?.bwRate ?? 5
  const colorRate = shopInfo?.colorRate ?? 10
  const [rangeError, setRangeError] = useState('')
  const isImage = selectedFile && selectedFile.type?.startsWith('image/')

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

  const ratePerPage = colorType === 'COLOR' ? colorRate : bwRate

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col gap-5"
    >
      {/* Top Header Row with Change File */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-heading">
            Print Configuration
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 font-medium">
            Customize print settings for your document
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="btn btn-ghost btn-sm text-stone-500 hover:text-stone-800 flex items-center gap-1 text-xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Change File</span>
        </button>
      </div>

      {/* Main Options Form */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-md flex flex-col gap-5">
        
        {/* Image Cropping & Editing Shortcut Banner */}
        {isImage && (
          <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white text-brand border border-rose-100 flex items-center justify-center shadow-xs shrink-0">
                <Crop className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-extrabold text-stone-900 truncate">Image Studio &amp; Crop</span>
                <span className="text-[11px] text-stone-500 font-medium truncate">Trim borders, multi-image A4 layout, or passport photos</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenStudioModal || onOpenImageEditor}
              className="btn btn-primary py-1.5 px-3 rounded-xl text-xs font-bold shrink-0 shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Crop className="w-3.5 h-3.5" />
              <span>Edit Image</span>
            </button>
          </div>
        )}

        {/* PDF Studio & Page Manager Shortcut Banner */}
        {!isImage && selectedFile && (
          <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white text-purple-600 border border-purple-100 flex items-center justify-center shadow-xs shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-extrabold text-stone-900 truncate">PDF Studio &amp; Page Manager</span>
                <span className="text-[11px] text-stone-500 font-medium truncate">Page thumbnails, rotate orientation, delete &amp; merge</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenPdfStudioModal || onOpenStudioModal}
              className="btn bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-3 rounded-xl text-xs font-bold shrink-0 shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Edit PDF</span>
            </button>
          </div>
        )}

        {/* 1. Page Range Selection (If document has > 1 page) */}
        {totalDocPages > 1 && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 flex items-center justify-between">
              <span>Pages to Print</span>
              <span className="text-[11px] font-bold text-stone-500 lowercase">
                Total document: {totalDocPages} pages
              </span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRangeModeChange('all')}
                className={`py-2.5 px-3 rounded-2xl border text-center font-extrabold text-xs transition-all cursor-pointer ${
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
                className={`py-2.5 px-3 rounded-2xl border text-center font-extrabold text-xs transition-all cursor-pointer ${
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
                className={`py-2.5 px-3 rounded-2xl border text-center font-extrabold text-xs transition-all cursor-pointer ${
                  pageRangeMode === 'custom'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Custom Range
              </button>
            </div>

            {pageRangeMode === 'custom' && (
              <div className="mt-1.5 flex flex-col gap-1">
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

        {/* 2. Color Type Switcher */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
            Print Color Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setColorType('BLACK_AND_WHITE')}
              className={`p-3.5 sm:p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                colorType === 'BLACK_AND_WHITE'
                  ? 'bg-stone-900 text-white border-stone-900 shadow-md ring-2 ring-stone-900/10'
                  : 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm">Black & White</span>
                {colorType === 'BLACK_AND_WHITE' && <Check className="w-4 h-4 text-emerald-400 stroke-3" />}
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
              className={`p-3.5 sm:p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                colorType === 'COLOR'
                  ? 'bg-brand text-white border-brand shadow-md shadow-rose-500/20 ring-2 ring-brand/10'
                  : 'bg-rose-50/50 text-stone-800 border-rose-200 hover:bg-rose-100/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm">Color Print</span>
                {colorType === 'COLOR' && <Check className="w-4 h-4 text-white stroke-3" />}
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

        {/* 3. Sides Mode: Single-Sided vs Double-Sided Book Mode */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
            Print Sides &amp; Book Duplex
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsDuplex(false)}
              className={`p-3.5 rounded-2xl border flex flex-col gap-1 text-left transition-all cursor-pointer ${
                !isDuplex
                  ? 'bg-rose-50/70 border-brand ring-2 ring-brand/20 shadow-xs'
                  : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-stone-900">Single-Sided</span>
                <span className="text-[10px] font-bold bg-white text-stone-600 px-2 py-0.5 rounded-md border border-stone-200">
                  1-Side
                </span>
              </div>
              <span className="text-[10px] text-stone-500 font-medium">
                1 page per sheet (Front only)
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsDuplex(true)}
              className={`p-3.5 rounded-2xl border flex flex-col gap-1 text-left transition-all cursor-pointer ${
                isDuplex
                  ? 'bg-rose-50/70 border-brand ring-2 ring-brand/20 shadow-xs'
                  : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-stone-900">Double-Sided Book</span>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                  Front &amp; Back
                </span>
              </div>
              <span className="text-[10px] text-stone-500 font-medium">
                Front = Page 1, Back = Page 2 (Book style)
              </span>
            </button>
          </div>
        </div>

        {/* 4. Number of Copies */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-stone-900">Copies (Sets)</span>
            <span className="text-[11px] text-stone-500 font-medium">Number of print copies</span>
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

        {/* 4. Customer Mobile Number */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
            Mobile Number (Optional)
          </label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="98765 43210 (For SMS / WhatsApp Receipt)"
            className="w-full h-11 px-4 rounded-xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-brand text-xs font-medium outline-none"
          />
        </div>

        {/* 5. Transparent Price Breakdown Card */}
        <div className="bg-linear-to-br from-rose-50/70 to-rose-100/40 p-4 rounded-2xl border border-rose-200/80 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
              Total Calculation
            </span>
            <span className="text-xs text-stone-800 font-bold mt-0.5">
              {selectedPagesCount} {selectedPagesCount === 1 ? 'Page' : 'Pages'} × {copies} {copies === 1 ? 'Copy' : 'Copies'} @ ₹{ratePerPage}
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-brand font-heading">
              ₹{totalAmount}
            </span>
          </div>
        </div>

        {/* Proceed to Pay Button */}
        <button
          type="button"
          onClick={onProceedToPayment}
          className="btn btn-primary py-3.5 shadow-lg w-full text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Proceed to Payment (₹{totalAmount})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}
