import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, AlertCircle, Store, RefreshCw, ArrowLeft } from 'lucide-react'

import KioskHeader from '../../components/kiosk/KioskHeader'
import FileUploadStage from '../../components/kiosk/FileUploadStage'
import ImageCropModal from '../../components/kiosk/ImageCropModal'
import PrintOptionsStage from '../../components/kiosk/PrintOptionsStage'
import PaymentStage from '../../components/kiosk/PaymentStage'
import PrintTrackingStage from '../../components/kiosk/PrintTrackingStage'
import { useKioskStore } from '../../store/useKioskStore'

export default function CustomerKiosk() {
  const { shopCode: paramShopCode } = useParams()
  const shopCode = paramShopCode || 'DEMO_SHOP'

  const { shopInfo: storeShopInfo, isLoadingShop, error, fetchShopInfo, resetJobFlow, } = useKioskStore()

  useEffect(() => {
    fetchShopInfo(shopCode)
  }, [shopCode, fetchShopInfo])

  const shopInfo = storeShopInfo
  const [step, setStep] = useState(1)
  const [selectedFile, setSelectedFile] = useState(null)
  const [totalPages, setTotalPages] = useState(1)
  const [colorType, setColorType] = useState('BLACK_AND_WHITE')
  const [copies, setCopies] = useState(1)
  const [isDuplex, setIsDuplex] = useState(false)
  const [customerPhone, setCustomerPhone] = useState('')
  const [cropModalOpen, setCropModalOpen] = useState(false)

  const handleFileSelect = (file) => {
    setSelectedFile(file)
    const isImg = file.type?.startsWith('image/')
    const estimatedPages = file.type?.includes('pdf') ? Math.floor(Math.random() * 3) + 1 : 1
    setTotalPages(estimatedPages)
    if (isImg) setCropModalOpen(true)
  }

  const handleSaveEditedImage = (editedFile) => {
    setSelectedFile(editedFile)
    setCropModalOpen(false)
  }

  const ratePerPage = colorType === 'COLOR' ? (shopInfo?.colorRate ?? 10) : (shopInfo?.bwRate ?? 5)
  const totalAmount = totalPages * copies * ratePerPage

  const getJobFormData = () => {
    const formData = new FormData()
    formData.append('shopCode', shopInfo?.shopCode || shopCode || 'DEMO')
    formData.append('customerPhone', customerPhone || '')
    formData.append('totalPages', String(totalPages))
    formData.append('colorType', colorType)
    formData.append('copies', String(copies))
    formData.append('isDuplex', String(isDuplex))

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
    setTotalPages(1)
    setCopies(1)
    setIsDuplex(false)
    setStep(1)
  }

  // Loading state
  if (isLoadingShop && !shopInfo) {
    return (
      <div className="min-h-screen bg-stone-100/80 flex flex-col items-center justify-center font-sans text-stone-800 p-4">
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xl max-w-sm w-full flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-brand">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-stone-900 font-heading">Connecting to Print Shop...</h2>
            <p className="text-xs text-stone-500 mt-1 font-medium">Fetching shop details & live print pricing</p>
          </div>
        </div>
      </div>
    )
  }

  // Shop Not Found / Error State
  if (!isLoadingShop && !shopInfo) {
    return (
      <div className="min-h-screen bg-stone-100/80 flex flex-col justify-between font-sans text-stone-800 p-4">
        <header className="py-4 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center font-extrabold font-heading text-sm shadow-md">
              P
            </div>
            <span className="text-lg font-extrabold text-stone-900 tracking-tight font-heading">
              QR Print<span className="text-brand">Pe</span>
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
          Powered by <span className="text-stone-700 font-extrabold">QR PrintPe</span>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-100/80 flex flex-col justify-between font-sans text-stone-800 pb-10 relative">
      {/* Header with Live Rates & Status */}
      <KioskHeader shopInfo={shopInfo} />

      {/* Main Step Container */}
      <main className="max-w-xl w-full mx-auto px-4 py-6 flex-1 flex flex-col justify-center">
        {/* Upload */}
        {step === 1 && (
          <FileUploadStage
            selectedFile={selectedFile}
            totalPages={totalPages}
            onFileSelect={handleFileSelect}
            onOpenCropModal={() => setCropModalOpen(true)}
            onProceed={() => setStep(2)}
          />
        )}

        {/* Print Options */}
        {step === 2 && (
          <PrintOptionsStage
            shopInfo={shopInfo}
            colorType={colorType}
            setColorType={setColorType}
            copies={copies}
            setCopies={setCopies}
            isDuplex={isDuplex}
            setIsDuplex={setIsDuplex}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            totalPages={totalPages}
            totalAmount={totalAmount}
            onBack={() => setStep(1)}
            onProceedToPayment={() => setStep(3)}
          />
        )}

        {/* Payment */}
        {step === 3 && (
          <PaymentStage
            selectedFile={selectedFile}
            totalPages={totalPages}
            colorType={colorType}
            totalAmount={totalAmount}
            customerPhone={customerPhone}
            onBack={() => setStep(2)}
            onPaymentSuccess={() => setStep(4)}
            getJobFormData={getJobFormData}
          />
        )}

        {/* Real-time Tracking Status */}
        {step === 4 && (
          <PrintTrackingStage
            shopInfo={shopInfo}
            totalAmount={totalAmount}
            onNewOrder={handleNewOrder}
          />
        )}
      </main>

      {/* In-App Image Cropper Modal (react-easy-crop) */}
      <ImageCropModal
        imageFile={selectedFile && selectedFile.type?.startsWith('image/') ? selectedFile : null}
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        onSave={handleSaveEditedImage}
      />

      {/* Footer */}
      <footer className="text-center text-xs font-semibold text-stone-500">
        Powered by <span className="text-stone-800 font-extrabold">QR PrintPe</span> · Smart Self-Service Printing
      </footer>
    </div>
  )
}
