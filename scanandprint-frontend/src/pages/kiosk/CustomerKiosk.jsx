import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileText,
  CheckCircle2,
  Printer,
  Sparkles,
  ArrowRight,
  RefreshCw,
  QrCode,
  ShieldCheck,
  Zap,
  Plus,
  Minus,
  FileCheck,
  Smartphone,
  Crop,
  Edit3,
} from 'lucide-react'

import ImageEditorModal from '../../components/kiosk/ImageEditorModal'

export default function CustomerKiosk() {
  const { shopCode: paramShopCode } = useParams()
  const shopCode = paramShopCode || 'SHOP_98234'

  // Shop Info State
  const shopInfo = {
    code: shopCode,
    name: 'Sharma Cyber Cafe & Prints',
    owner: 'Rahul Kumar',
    address: 'Main Market, Opposite Railway Station, New Delhi',
    bwRate: 5,
    colorRate: 10,
    isOnline: true,
  }

  // Customer Order Flow States
  const [step, setStep] = useState(1) // 1: Upload, 2: Options, 3: Payment, 4: Status
  const [selectedFile, setSelectedFile] = useState(null)
  const [totalPages, setTotalPages] = useState(1)
  const [colorType, setColorType] = useState('BLACK_AND_WHITE') // 'BLACK_AND_WHITE' | 'COLOR'
  const [copies, setCopies] = useState(1)
  const [isDuplex, setIsDuplex] = useState(false)
  const [customerPhone, setCustomerPhone] = useState('')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [printStatus, setPrintStatus] = useState('PAYMENT_VERIFIED')

  // Global Window Drag & Drop Overlay State
  const [isWindowDragging, setIsWindowDragging] = useState(false)

  // Image Editor Modal State
  const [editorOpen, setEditorOpen] = useState(false)

  // Global Window Drag & Drop Listeners (For laptop File Explorer drag drop)
  useEffect(() => {
    let dragCounter = 0

    const handleDragEnter = (e) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounter++
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsWindowDragging(true)
      }
    }

    const handleDragOver = (e) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDragLeave = (e) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounter--
      if (dragCounter === 0) {
        setIsWindowDragging(false)
      }
    }

    const handleDrop = (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsWindowDragging(false)
      dragCounter = 0

      const files = e.dataTransfer && e.dataTransfer.files
      if (files && files[0]) {
        processUploadedFile(files[0])
      }
    }

    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('drop', handleDrop)
    }
  }, [])

  // Process File Upload
  const processUploadedFile = (file) => {
    setSelectedFile(file)
    const isImg = file.type.startsWith('image/')
    const estimatedPages = file.type.includes('pdf') ? Math.floor(Math.random() * 4) + 2 : 1
    setTotalPages(estimatedPages)
    setStep(1)

    // Auto-open image editor if an image file is uploaded
    if (isImg) {
      setEditorOpen(true)
    }
  }

  // Handle Dropzone Input Handler
  const handleFileDrop = (e) => {
    e.preventDefault()
    const files = e.target.files || (e.dataTransfer && e.dataTransfer.files)
    if (files && files[0]) {
      processUploadedFile(files[0])
    }
  }

  // Save Edited Image from Modal
  const handleSaveEditedImage = (editedFile) => {
    setSelectedFile(editedFile)
    setEditorOpen(false)
  }

  // Calculate Costs
  const ratePerPage = colorType === 'COLOR' ? shopInfo.colorRate : shopInfo.bwRate
  const totalAmount = totalPages * copies * ratePerPage

  // Handle Payment Trigger
  const handleInitiatePayment = (e) => {
    e.preventDefault()
    setIsProcessingPayment(true)
    setTimeout(() => {
      setIsProcessingPayment(false)
      setStep(4)

      setTimeout(() => setPrintStatus('DISPATCHED_TO_AGENT'), 1200)
      setTimeout(() => setPrintStatus('PRINTING'), 2800)
      setTimeout(() => setPrintStatus('COMPLETED'), 5000)
    }, 1000)
  }

  // Reset Order
  const handleNewOrder = () => {
    setSelectedFile(null)
    setStep(1)
    setPrintStatus('PAYMENT_VERIFIED')
  }

  const isImageFile = selectedFile && selectedFile.type.startsWith('image/')

  return (
    <div className="min-h-screen bg-stone-100/80 flex flex-col justify-between font-sans text-stone-800 pb-10 relative">

      {/* GLOBAL DRAG OVERLAY FOR LAPTOP DRAG & DROP */}
      <AnimatePresence>
        {isWindowDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="p-10 rounded-3xl bg-brand/90 border-4 border-dashed border-white shadow-2xl flex flex-col items-center gap-4 max-w-md"
            >
              <div className="w-20 h-20 rounded-full bg-white text-brand flex items-center justify-center shadow-lg animate-bounce">
                <Upload className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h2 className="text-2xl font-extrabold font-heading">
                Drop your File Anywhere to Upload! 🚀
              </h2>
              <p className="text-sm text-rose-100 font-medium">
                Supports PDF, DOCX, JPG, PNG, WEBP files
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP KIOSK BRANDING HEADER */}
      <header className="bg-white border-b border-stone-200/80 px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Printer className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-extrabold text-base sm:text-lg text-stone-900 leading-snug">
                {shopInfo.name}
              </h1>
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
                <span className="font-mono text-stone-700">{shopInfo.code}</span>
                <span>·</span>
                <span className="text-stone-700">₹{shopInfo.bwRate} B&W / ₹{shopInfo.colorRate} Color</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-extrabold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PRINTER READY</span>
          </div>
        </div>
      </header>

      {/* MAIN KIOSK CONTAINER */}
      <main className="max-w-xl w-full mx-auto px-4 py-6 flex-1 flex flex-col justify-center">

        {/* STEP 1: FILE UPLOAD */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Banner info */}
            <div className="bg-gradient-to-r from-rose-500 to-brand text-white p-6 rounded-3xl shadow-lg shadow-rose-500/20 flex flex-col gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider bg-white/20 px-3 py-0.5 rounded-full w-max">
                Self-Service Printing
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold font-heading">
                Upload & Print Instantly 🖨️
              </h2>
              <p className="text-xs text-rose-100 font-medium leading-relaxed">
                Scan QR code or drag file from laptop ➔ Upload ➔ Crop/Edit ➔ Pay via UPI ➔ Collect printout!
              </p>
            </div>

            {/* Dropzone Box */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="bg-white rounded-3xl p-8 border-2 border-dashed border-rose-300 hover:border-brand transition-all shadow-md text-center flex flex-col items-center justify-center gap-4 relative group cursor-pointer"
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                onChange={handleFileDrop}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />

              <div className="w-16 h-16 rounded-full bg-rose-50 text-brand flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 stroke-[2.2]" />
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-extrabold text-stone-900">
                  Drag & Drop PDF or Image file from Laptop
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  Or tap to browse PDF, DOCX, JPG, PNG, WEBP files (Max 50MB)
                </p>
              </div>

              <div className="inline-flex items-center gap-2 bg-stone-100 text-stone-700 px-4 py-2 rounded-2xl text-xs font-bold mt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Private · Auto-deleted after printing</span>
              </div>
            </div>

            {/* Selected File Card */}
            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-5 border border-stone-200 shadow-md flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 text-brand flex items-center justify-center shrink-0 font-bold text-xs">
                      {isImageFile ? 'IMG' : 'PDF'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-extrabold text-sm text-stone-900 truncate">
                        {selectedFile.name}
                      </span>
                      <span className="text-xs text-stone-500 font-medium">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · {totalPages} Pages
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="btn btn-primary px-5 py-3 shadow-md shrink-0"
                  >
                    <span>Configure Print</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Edit Image Button if Image File */}
                {isImageFile && (
                  <button
                    onClick={() => setEditorOpen(true)}
                    className="btn btn-outline w-full !text-brand !bg-rose-50 hover:!bg-rose-100 !border-rose-200/80 mt-2"
                  >
                    <Crop className="w-4 h-4" />
                    <span>Crop, Rotate & Enhance Image Edits</span>
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* STEP 2: PRINT OPTIONS & SPECS */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-stone-900 font-heading">
                Configure Print Options
              </h2>
              <button
                onClick={() => setStep(1)}
                className="btn btn-ghost btn-sm text-stone-500 hover:text-stone-800"
              >
                Change File
              </button>
            </div>

            {/* Main Options Form */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-lg flex flex-col gap-5">

              {/* Color Type Pill Switcher */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                  Print Output Color
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setColorType('BLACK_AND_WHITE')}
                    className={`p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${colorType === 'BLACK_AND_WHITE'
                        ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                        : 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100'
                      }`}
                  >
                    <span className="font-extrabold text-sm">Black & White</span>
                    <span className={`text-xs ${colorType === 'BLACK_AND_WHITE' ? 'text-stone-300' : 'text-stone-500'}`}>
                      ₹{shopInfo.bwRate} per page
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setColorType('COLOR')}
                    className={`p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${colorType === 'COLOR'
                        ? 'bg-brand text-white border-brand shadow-md shadow-rose-500/25'
                        : 'bg-rose-50/50 text-stone-800 border-rose-200 hover:bg-rose-100/50'
                      }`}
                  >
                    <span className="font-extrabold text-sm">Color Print</span>
                    <span className={`text-xs ${colorType === 'COLOR' ? 'text-rose-100' : 'text-rose-600'}`}>
                      ₹{shopInfo.colorRate} per page
                    </span>
                  </button>
                </div>
              </div>

              {/* Number of Copies */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-stone-900">Copies Count</span>
                  <span className="text-xs text-stone-500 font-medium">How many printed sets?</span>
                </div>
                <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-stone-300 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setCopies(Math.max(1, copies - 1))}
                    className="btn btn-ghost p-1 w-8 h-8 !bg-stone-100 hover:!bg-stone-200 text-stone-800"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-extrabold text-base text-stone-900 w-6 text-center">{copies}</span>
                  <button
                    type="button"
                    onClick={() => setCopies(copies + 1)}
                    className="btn btn-ghost p-1 w-8 h-8 !bg-stone-100 hover:!bg-stone-200 text-stone-800"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Duplex Switch */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-stone-900">Double-Sided (Duplex)</span>
                  <span className="text-xs text-stone-500 font-medium">Print on front & back</span>
                </div>
                <input
                  type="checkbox"
                  checked={isDuplex}
                  onChange={(e) => setIsDuplex(e.target.checked)}
                  className="w-5 h-5 accent-brand rounded cursor-pointer"
                />
              </div>

              {/* Customer Mobile Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-stone-700">Mobile Number (For Receipt SMS)</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="98765 43210 (Optional)"
                  className="w-full h-11 px-4 rounded-2xl border border-stone-300 bg-stone-50/50 focus:bg-white focus:border-brand text-xs font-medium outline-none"
                />
              </div>

              {/* Price Calculation Card */}
              <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200/80 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-stone-500">Total Calculation</span>
                  <span className="text-xs text-stone-700 font-medium">
                    {totalPages} Pages × {copies} Copy ({colorType === 'COLOR' ? 'Color' : 'B&W'})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-brand font-heading">₹{totalAmount}</span>
                </div>
              </div>

              {/* Proceed to Pay Button */}
              <button
                onClick={() => setStep(3)}
                className="btn btn-primary py-4 shadow-lg w-full text-base"
              >
                <span>Proceed to Pay ₹{totalAmount}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

            </div>
          </motion.div>
        )}

        {/* STEP 3: UPI CHECKOUT & PAYMENT */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-5 max-w-md mx-auto w-full"
          >
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xl flex flex-col gap-6 text-center">

              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Smartphone className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h2 className="text-2xl font-extrabold text-stone-900 font-heading">
                  Pay ₹{totalAmount} via UPI
                </h2>
                <p className="text-xs text-stone-500 font-medium">
                  Instant 1-Click Payment via PhonePe, GPay, or Paytm
                </p>
              </div>

              {/* Order Summary Box */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left flex flex-col gap-2 text-xs font-semibold">
                <div className="flex justify-between text-stone-600">
                  <span>Document</span>
                  <span className="text-stone-900 font-bold truncate max-w-[180px]">{selectedFile?.name || 'Document.pdf'}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Print Specs</span>
                  <span className="text-stone-900 font-bold">{totalPages} pgs · {colorType === 'COLOR' ? 'Color' : 'B&W'}</span>
                </div>
                <div className="flex justify-between border-t border-stone-200/80 pt-2 text-stone-900 font-extrabold text-sm">
                  <span>Total Amount</span>
                  <span className="text-brand">₹{totalAmount}</span>
                </div>
              </div>

              {/* UPI Payment Apps Grid */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleInitiatePayment}
                  disabled={isProcessingPayment}
                  className="btn btn-primary w-full py-4 !bg-stone-900 hover:!bg-black shadow-md"
                >
                  {isProcessingPayment ? (
                    <span>Verifying Payment...</span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>Pay ₹{totalAmount} with Google Pay / PhonePe</span>
                    </>
                  )}
                </button>

                <div className="text-[11px] text-stone-400 font-medium flex items-center justify-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Secure UPI Payment (0% Transaction Charge)</span>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* STEP 4: LIVE REAL-TIME PRINT TRACKING STATUS */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-6 max-w-md mx-auto w-full"
          >
            <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-2xl flex flex-col items-center text-center gap-6">

              {/* Status Animation Icon */}
              {printStatus === 'COMPLETED' ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
                </motion.div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-rose-100 text-brand flex items-center justify-center shadow-lg shadow-rose-500/20 relative">
                  <Printer className="w-10 h-10 stroke-[2.2] animate-bounce" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-ping" />
                </div>
              )}

              {/* Status Title */}
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-extrabold text-stone-900 font-heading">
                  {printStatus === 'COMPLETED'
                    ? 'Print Completed! 🎉'
                    : 'Auto-Printing Your Document...'}
                </h2>
                <p className="text-xs text-stone-500 font-medium">
                  {printStatus === 'COMPLETED'
                    ? 'Please collect your printed pages from the shop counter.'
                    : 'Your file has been routed silently to the shop printer hardware.'}
                </p>
              </div>

              {/* Timeline Progress List */}
              <div className="w-full bg-stone-50 p-5 rounded-2xl border border-stone-200 flex flex-col gap-3 text-left text-xs font-bold">
                <div className="flex items-center gap-3 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1. Payment ₹{totalAmount} Verified</span>
                </div>
                <div className={`flex items-center gap-3 ${printStatus !== 'PAYMENT_VERIFIED' ? 'text-emerald-700' : 'text-stone-400'}`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>2. Dispatched to Shop PC Agent</span>
                </div>
                <div className={`flex items-center gap-3 ${printStatus === 'PRINTING' || printStatus === 'COMPLETED' ? 'text-emerald-700' : 'text-stone-400'}`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>3. Hardware Printer Output</span>
                </div>
                <div className={`flex items-center gap-3 ${printStatus === 'COMPLETED' ? 'text-emerald-700' : 'text-stone-400'}`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>4. Job Complete & Temp File Purged</span>
                </div>
              </div>

              {/* Print New Document Button */}
              {printStatus === 'COMPLETED' && (
                <button
                  onClick={handleNewOrder}
                  className="btn btn-primary w-full py-4 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Print Another Document</span>
                </button>
              )}

            </div>
          </motion.div>
        )}

      </main>

      {/* IN-APP IMAGE EDITOR MODAL */}
      <ImageEditorModal
        imageFile={isImageFile ? selectedFile : null}
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSaveEditedImage}
      />

      {/* FOOTER */}
      <footer className="text-center text-xs font-semibold text-stone-500">
        Powered by <span className="text-stone-800 font-extrabold">QR PrintPe</span> · Smart Printing Platform
      </footer>

    </div>
  )
}
