import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { motion } from 'framer-motion'
import { AlertCircle, Store, RefreshCw, ArrowLeft } from 'lucide-react'

import KioskHeader from '../../components/kiosk/KioskHeader'
import FileUploadStage from '../../components/kiosk/FileUploadStage'
import KioskStudioModal from '../../components/kiosk/KioskStudioModal'
import KioskPdfStudioModal from '../../components/kiosk/KioskPdfStudioModal'
import PrintOptionsStage from '../../components/kiosk/PrintOptionsStage'
import PaymentStage from '../../components/kiosk/PaymentStage'
import PrintTrackingStage from '../../components/kiosk/PrintTrackingStage'
import { useKioskStore } from '../../store/useKioskStore'
import { getExactPageCount } from '../../lib/pdfUtil'
import { getSocket } from '../../lib/socket'
import PageLoader from '../../components/common/PageLoader'

export default function CustomerKiosk() {
  const { shopCode: paramShopCode } = useParams()
  const shopCode = paramShopCode || 'DEMO_SHOP'

  const {
    shopInfo: storeShopInfo,
    isLoadingShop,
    error,
    tempId,
    isPreUploading,
    preUploadFile,
    fetchShopInfo,
    resetJobFlow,
  } = useKioskStore()

  const [shopInfo, setShopInfo] = useState(storeShopInfo)
  const [step, setStep] = useState(1)
  const [selectedFile, setSelectedFile] = useState(null)
  const [totalDocPages, setTotalDocPages] = useState(1)
  const [selectedPagesCount, setSelectedPagesCount] = useState(1)
  const [pageRangeMode, setPageRangeMode] = useState('all')
  const [customRangeStr, setCustomRangeStr] = useState('')
  const [isAnalyzingPdf, setIsAnalyzingPdf] = useState(false)
  const [colorType, setColorType] = useState('BLACK_AND_WHITE')
  const [copies, setCopies] = useState(1)
  const [isDuplex, setIsDuplex] = useState(false)
  const [customerPhone, setCustomerPhone] = useState('')
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('online')
  const [studioModalOpen, setStudioModalOpen] = useState(false)
  const [pdfStudioModalOpen, setPdfStudioModalOpen] = useState(false)

  useEffect(() => {
    fetchShopInfo(shopCode).then((info) => {
      if (info) setShopInfo(info)
    })
  }, [shopCode, fetchShopInfo])

  useEffect(() => {
    if (storeShopInfo) {
      setShopInfo(storeShopInfo)
    }
  }, [storeShopInfo])

  // Live Socket.IO Synchronization for Printer Online Status & Real-time Kiosk Events
  useEffect(() => {
    const socket = getSocket()
    if (!socket || !shopCode) return

    const joinKioskRoom = () => {
      socket.emit('JOIN_KIOSK', { shopCode })
      socket.emit('JOIN_SHOP_DASHBOARD', { shopCode })
    }

    if (socket.connected) {
      joinKioskRoom()
    }
    socket.on('connect', joinKioskRoom)

    const handleStatusChange = (data) => {
      if (data && data.shopCode === shopCode) {
        setShopInfo((prev) => (prev ? { ...prev, isOnline: data.isOnline } : prev))
      }
    }

    const handleShopStatus = (data) => {
      if (data && String(data.shopCode).toUpperCase() === String(shopCode).toUpperCase()) {
        setShopInfo((prev) => (prev ? { ...prev, isSuspended: Boolean(data.isSuspended) } : prev))
      }
    }

    const handleRatesUpdated = (data) => {
      if (data && String(data.shopCode).toUpperCase() === String(shopCode).toUpperCase()) {
        setShopInfo((prev) =>
          prev ? { ...prev, bwRate: data.bwRate, colorRate: data.colorRate } : prev
        )
      }
    }

    const handlePaymentSettings = (data) => {
      if (data && String(data.shopCode).toUpperCase() === String(shopCode).toUpperCase()) {
        setShopInfo((prev) =>
          prev
            ? {
                ...prev,
                paymentSettings: data.paymentSettings,
                upiId: data.upiId || data.paymentSettings?.upiId || '',
              }
            : prev
        )
      }
    }

    socket.on('AGENT_STATUS_CHANGE', handleStatusChange)
    socket.on('SHOP_STATUS_UPDATED', handleShopStatus)
    socket.on('SHOP_RATES_UPDATED', handleRatesUpdated)
    socket.on('PAYMENT_SETTINGS_UPDATED', handlePaymentSettings)

    return () => {
      socket.off('AGENT_STATUS_CHANGE', handleStatusChange)
      socket.off('SHOP_STATUS_UPDATED', handleShopStatus)
      socket.off('SHOP_RATES_UPDATED', handleRatesUpdated)
      socket.off('PAYMENT_SETTINGS_UPDATED', handlePaymentSettings)
    }
  }, [shopCode])

  // Exact PDF Page Count Detection & Instant Optimistic Pre-Upload
  const handleFileSelect = async (file) => {
    setSelectedFile(file)
    setIsAnalyzingPdf(true)

    // Trigger non-blocking optimistic pre-upload immediately in background
    preUploadFile(file)

    try {
      const realCount = await getExactPageCount(file)
      setTotalDocPages(realCount)
      setSelectedPagesCount(realCount)
      setPageRangeMode('all')
      setCustomRangeStr('')
    } catch (err) {
      console.warn('Page count error:', err)
      setTotalDocPages(1)
      setSelectedPagesCount(1)
    } finally {
      setIsAnalyzingPdf(false)
    }
  }

  const handleSaveEditedDocument = (editedDocFile) => {
    setSelectedFile(editedDocFile)
    setStudioModalOpen(false)
    setTotalDocPages(1)
    setSelectedPagesCount(1)
    setPageRangeMode('all')
    setCustomRangeStr('')
    // Pre-upload edited document
    preUploadFile(editedDocFile)
    // Advance directly to print options stage with processed file
    setStep(2)
  }

  const handleSaveEditedPdf = (editedPdfFile) => {
    setSelectedFile(editedPdfFile)
    setPdfStudioModalOpen(false)
    setIsAnalyzingPdf(true)
    getExactPageCount(editedPdfFile).then((count) => {
      setTotalDocPages(count)
      setSelectedPagesCount(count)
      setPageRangeMode('all')
      setCustomRangeStr('')
      setIsAnalyzingPdf(false)
    })
    preUploadFile(editedPdfFile)
    setStep(2)
  }

  // Suspended Shop State Screen
  if (shopInfo?.isSuspended) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col justify-between p-4 font-sans text-stone-800">
        <header className="max-w-md w-full mx-auto flex items-center justify-between py-2">
          <Link to="/" className="inline-block">
            <span className="text-xl font-black tracking-tight text-stone-900 font-heading">
              Scan<span className="text-brand">&</span>Print
            </span>
          </Link>
        </header>

        <main className="max-w-md w-full mx-auto my-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-7 border border-rose-200 shadow-xl flex flex-col items-center text-center gap-5"
          >
            <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500">
              <AlertCircle className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full bg-rose-100 text-rose-700 mb-2">
                <AlertCircle className="w-3.5 h-3.5" /> Service Temporarily Paused
              </div>
              <h2 className="text-2xl font-extrabold text-stone-900 font-heading">
                Shop Suspended
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm mt-2 leading-relaxed font-medium">
                This print kiosk for <strong className="text-stone-800">{shopInfo?.shopName || shopCode}</strong> is temporarily unavailable or suspended. Please contact the shopkeeper.
              </p>
            </div>

            <div className="w-full pt-2">
              <Link to="/" className="w-full">
                <button className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 text-xs font-bold">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
                </button>
              </Link>
            </div>
          </motion.div>
        </main>

        <footer className="text-center text-xs font-semibold text-stone-400 py-4">
          Powered by <span className="text-stone-700 font-extrabold">Scan&Print</span>
        </footer>
      </div>
    )
  }

  const ratePerPage = colorType === 'COLOR' ? (shopInfo?.colorRate ?? 10) : (shopInfo?.bwRate ?? 5)
  const totalAmount = selectedPagesCount * copies * ratePerPage

  const getJobFormData = () => {
    const formData = new FormData()
    formData.append('shopCode', shopInfo?.shopCode || shopCode || 'DEMO')
    formData.append('customerPhone', customerPhone || '')
    formData.append('totalPages', String(selectedPagesCount))
    formData.append('totalDocPages', String(totalDocPages))
    formData.append('pageRangeMode', pageRangeMode)
    formData.append('customRangeStr', customRangeStr || '')
    formData.append('colorType', colorType)
    formData.append('copies', String(copies))
    formData.append('isDuplex', String(isDuplex))

    if (tempId) {
      formData.append('tempId', tempId)
    }

    if (selectedFile) {
      formData.append('file', selectedFile, selectedFile.name || 'document.pdf')
      formData.append('originalFileName', selectedFile.name || 'document.pdf')
      formData.append('fileSizeBytes', String(selectedFile.size || 1024))
    }
    return formData
  }

  const handleNewOrder = () => {
    resetJobFlow()
    setSelectedFile(null)
    setTotalDocPages(1)
    setSelectedPagesCount(1)
    setPageRangeMode('all')
    setCustomRangeStr('')
    setCopies(1)
    setIsDuplex(false)
    setStep(1)
  }

  // Loading state with Original Logo Fallback Loader
  if ((isLoadingShop && !shopInfo) || (!shopInfo && !error)) {
    return <PageLoader message="Connecting to print kiosk..." subtitle="Loading shop pricing & live printers" />
  }

  // Shop Not Found / Error State
  if (!isLoadingShop && !shopInfo) {
    return (
      <div className="min-h-screen bg-stone-100/80 flex flex-col justify-between font-sans text-stone-800 p-4">
        <header className="py-4 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <img src="/svgs/logo.svg" alt="Scan&Print Logo" className="w-8 h-8 object-contain group-hover:scale-105 transition-transform" />
            <span className="text-xl font-extrabold text-stone-900 tracking-tight font-heading">
              Scan<span className="text-brand">&Print</span>
            </span>
          </Link>
        </header>

        <main className="max-w-md w-full mx-auto my-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-7 border border-stone-200 shadow-xl flex flex-col items-center text-center gap-5"
          >
            <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500">
              <Store className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full bg-rose-100 text-rose-700 mb-2">
                <AlertCircle className="w-3.5 h-3.5" /> Shop Not Found
              </div>
              <h2 className="text-2xl font-extrabold text-stone-900 font-heading">
                Shop Code Invalid
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm mt-2 leading-relaxed font-medium">
                No active print shop found with code <span className="font-mono font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">{shopCode}</span>. Please scan the QR code on the shop counter again.
              </p>
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={() => fetchShopInfo(shopCode)}
                className="btn btn-secondary flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Scan
              </button>
              <Link to="/" className="flex-1">
                <button className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 text-xs font-bold">
                  <ArrowLeft className="w-3.5 h-3.5" /> Go to Home
                </button>
              </Link>
            </div>
          </motion.div>
        </main>

        <footer className="text-center text-xs font-semibold text-stone-400 py-4">
          Powered by <span className="text-stone-700 font-extrabold">Scan&Print</span>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-100/90 flex flex-col justify-between font-sans text-stone-800 pb-4 sm:pb-8 relative">
      {/* Header with Live Rates & Status */}
      <KioskHeader shopInfo={shopInfo} />

      {/* 4-Step Progress Stepper */}
      <div className="max-w-xl w-full mx-auto px-2 sm:px-4 pt-2 sm:pt-3 pb-1">
        <div className="flex items-center justify-between bg-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-stone-200/80 shadow-2xs text-[11px] font-bold">
          <div className={`flex items-center gap-1 sm:gap-1.5 ${step >= 1 ? 'text-brand font-extrabold' : 'text-stone-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-brand text-white' : 'bg-stone-200 text-stone-600'}`}>
              1
            </span>
            <span>Upload</span>
          </div>

          <div className={`flex-1 h-0.5 mx-1.5 sm:mx-2 rounded-full ${step >= 2 ? 'bg-brand' : 'bg-stone-200'}`} />

          <div className={`flex items-center gap-1 sm:gap-1.5 ${step >= 2 ? 'text-brand font-extrabold' : 'text-stone-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-brand text-white' : 'bg-stone-200 text-stone-600'}`}>
              2
            </span>
            <span>Options</span>
          </div>

          <div className={`flex-1 h-0.5 mx-1.5 sm:mx-2 rounded-full ${step >= 3 ? 'bg-brand' : 'bg-stone-200'}`} />

          <div className={`flex items-center gap-1 sm:gap-1.5 ${step >= 3 ? 'text-brand font-extrabold' : 'text-stone-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-brand text-white' : 'bg-stone-200 text-stone-600'}`}>
              3
            </span>
            <span>Payment</span>
          </div>

          <div className={`flex-1 h-0.5 mx-1.5 sm:mx-2 rounded-full ${step >= 4 ? 'bg-brand' : 'bg-stone-200'}`} />

          <div className={`flex items-center gap-1 sm:gap-1.5 ${step >= 4 ? 'text-brand font-extrabold' : 'text-stone-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 4 ? 'bg-brand text-white' : 'bg-stone-200 text-stone-600'}`}>
              4
            </span>
            <span>Print</span>
          </div>
        </div>
      </div>

      {/* Main Step Container */}
      <main className="max-w-xl w-full mx-auto px-2 sm:px-4 py-2 sm:py-3 flex-1 flex flex-col justify-center">
        {/* Step 1: Upload */}
        {step === 1 && (
          <FileUploadStage
            selectedFile={selectedFile}
            totalPages={totalDocPages}
            isAnalyzingPdf={isAnalyzingPdf}
            isPreUploading={isPreUploading}
            onFileSelect={handleFileSelect}
            onOpenStudioModal={() => setStudioModalOpen(true)}
            onOpenPdfStudioModal={() => setPdfStudioModalOpen(true)}
            onOpenImageEditor={() => setStudioModalOpen(true)}
            onOpenCropModal={() => setStudioModalOpen(true)}
            onProceed={() => setStep(2)}
          />
        )}

        {/* Step 2: Print Options */}
        {step === 2 && (
          <PrintOptionsStage
            shopInfo={shopInfo}
            selectedFile={selectedFile}
            colorType={colorType}
            setColorType={setColorType}
            copies={copies}
            setCopies={setCopies}
            isDuplex={isDuplex}
            setIsDuplex={setIsDuplex}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            totalDocPages={totalDocPages}
            pageRangeMode={pageRangeMode}
            setPageRangeMode={setPageRangeMode}
            customRangeStr={customRangeStr}
            setCustomRangeStr={setCustomRangeStr}
            selectedPagesCount={selectedPagesCount}
            setSelectedPagesCount={setSelectedPagesCount}
            totalAmount={totalAmount}
            onOpenStudioModal={() => setStudioModalOpen(true)}
            onOpenPdfStudioModal={() => setPdfStudioModalOpen(true)}
            onOpenImageEditor={() => setStudioModalOpen(true)}
            onOpenCropModal={() => setStudioModalOpen(true)}
            onBack={() => setStep(1)}
            onProceedToPayment={() => setStep(3)}
          />
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <PaymentStage
            shopInfo={shopInfo}
            selectedFile={selectedFile}
            selectedPagesCount={selectedPagesCount}
            colorType={colorType}
            copies={copies}
            totalAmount={totalAmount}
            customerPhone={customerPhone}
            onBack={() => setStep(2)}
            onPaymentSuccess={(mode) => {
              setSelectedPaymentMode(mode || 'online')
              setStep(4)
            }}
            getJobFormData={getJobFormData}
          />
        )}

        {/* Step 4: Real-time Tracking Status */}
        {step === 4 && (
          <PrintTrackingStage
            shopInfo={shopInfo}
            selectedFile={selectedFile}
            selectedPagesCount={selectedPagesCount}
            colorType={colorType}
            copies={copies}
            totalAmount={totalAmount}
            paymentMethod={selectedPaymentMode}
            onNewOrder={handleNewOrder}
          />
        )}
      </main>

      {/* Unified Image Crop & 2-in-1 Aadhaar / ID Studio Modal */}
      <KioskStudioModal
        imageFile={selectedFile && selectedFile.type?.startsWith('image/') ? selectedFile : null}
        isOpen={studioModalOpen}
        onClose={() => setStudioModalOpen(false)}
        onSave={handleSaveEditedDocument}
      />

      {/* PDF Studio & Page Manager Modal */}
      <KioskPdfStudioModal
        pdfFile={selectedFile && !selectedFile.type?.startsWith('image/') ? selectedFile : null}
        isOpen={pdfStudioModalOpen}
        onClose={() => setPdfStudioModalOpen(false)}
        onSave={handleSaveEditedPdf}
      />

      {/* Footer */}
      <footer className="text-center text-xs font-semibold text-stone-500 pt-2 flex items-center justify-center gap-1.5">
        <span>Powered by</span>
        <img src="/svgs/logo.svg" alt="Scan&Print" className="w-4 h-4 object-contain inline-block" />
        <span className="text-stone-800 font-extrabold">Scan<span className="text-brand">&Print</span></span>
        <span>· Smart Self-Service Printing</span>
      </footer>
    </div>
  )
}
