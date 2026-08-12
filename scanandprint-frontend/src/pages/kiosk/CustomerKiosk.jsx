import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

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

  const { shopInfo: storeShopInfo, isLoadingShop, fetchShopInfo, resetJobFlow, } = useKioskStore()

  useEffect(() => {
    fetchShopInfo(shopCode)
  }, [shopCode, fetchShopInfo])

  const shopInfo = storeShopInfo || {
    shopCode: shopCode,
    shopName: 'Sharma Cyber Cafe & Prints',
    ownerName: 'Rahul Kumar',
    address: 'Main Market, Opposite Railway Station, New Delhi',
    bwRate: 5,
    colorRate: 10,
    isOnline: true,
  }

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

  const ratePerPage = colorType === 'COLOR' ? (shopInfo.colorRate || 10) : (shopInfo.bwRate || 5)
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

  return (
    <div className="min-h-screen bg-stone-100/80 flex flex-col justify-between font-sans text-stone-800 pb-10 relative">
      {/* Header with Live Rates & Status */}
      <KioskHeader shopInfo={shopInfo} />

      {/*  Main Step Container */}
      <main className="max-w-xl w-full mx-auto px-4 py-6 flex-1 flex flex-col justify-center">
        {isLoadingShop && !storeShopInfo ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-stone-500">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
            <span className="text-sm font-semibold">Loading Print Shop Details...</span>
          </div>
        ) : (
          <>
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
          </>
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
