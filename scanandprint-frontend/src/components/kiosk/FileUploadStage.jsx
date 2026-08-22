import React, { useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileText,
  ShieldCheck,
  Crop,
  ArrowRight,
  Sparkles,
  Camera,
  Loader2,
  FileCheck2,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react'

export default function FileUploadStage({
  selectedFile,
  totalPages,
  isAnalyzingPdf,
  isPreUploading,
  onFileSelect,
  onOpenImageEditor,
  onOpenCropModal,
  onProceed,
}) {
  const isImage = selectedFile && selectedFile.type?.startsWith('image/')
  const cameraInputRef = useRef(null)

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0])
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
  })

  const handleCameraCapture = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5"
    >
      {/* Full-Screen Drag Active Overlay */}
      <AnimatePresence>
        {isDragActive && (
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
                Drop your File to Upload! 🚀
              </h2>
              <p className="text-sm text-rose-100 font-medium">
                Supports PDF, DOCX, JPG, PNG, WEBP files
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Welcome Banner */}
      <div className="bg-linear-to-r from-brand via-rose-600 to-rose-700 text-white p-5 sm:p-6 rounded-3xl shadow-lg shadow-rose-500/15 flex flex-col gap-1.5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider bg-white/20 px-3 py-0.5 rounded-full w-max backdrop-blur-xs">
            Self-Service Smart Printing
          </span>
          <div className="flex items-center gap-1 text-[11px] font-bold text-rose-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Zero-Wait Printing</span>
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold font-heading mt-1">
          Upload & Print in 60 Seconds 🖨️
        </h2>
        <p className="text-xs text-rose-100 font-medium leading-relaxed max-w-lg">
          Select your PDF document or capture photo ➔ Configure color & copies ➔ Pay via UPI / Counter ➔ Collect fresh printout!
        </p>
      </div>

      {/* Hidden Camera Input */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={handleCameraCapture}
        className="hidden"
      />

      {/* Dropzone Container */}
      <div
        {...getRootProps()}
        className={`bg-white rounded-3xl p-7 sm:p-9 border-2 border-dashed transition-all shadow-xs text-center flex flex-col items-center justify-center gap-3.5 relative group cursor-pointer ${
          isDragActive
            ? 'border-brand bg-rose-50/50 scale-[1.01]'
            : 'border-stone-300 hover:border-brand hover:bg-stone-50/60'
        }`}
      >
        <input {...getInputProps()} />

        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-brand flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
          <Upload className="w-8 h-8 stroke-[2.2]" />
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-base sm:text-lg font-extrabold text-stone-900 font-heading">
            {isDragActive ? 'Drop File Here Now' : 'Upload Document or Photo'}
          </h3>
          <p className="text-xs text-stone-500 font-medium max-w-xs">
            Drag & drop PDF, Word DOCX or Images (JPG, PNG) or tap to browse
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              cameraInputRef.current?.click()
            }}
            className="btn py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-stone-300 bg-white text-stone-800 shadow-2xs hover:bg-rose-50 hover:border-brand hover:text-brand hover:shadow-xs transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4 text-brand" />
            <span>Camera Photo</span>
          </button>

          <div className="inline-flex items-center gap-1.5 bg-stone-100 text-stone-600 px-3 py-2 rounded-xl text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Private · Auto-deleted</span>
          </div>
        </div>
      </div>

      {/* Selected File Details Card (Fully Responsive & Wrap-Safe) */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-3.5 sm:p-5 border border-stone-200 shadow-md flex flex-col gap-3"
        >
          <div className="flex items-center justify-between gap-2.5 sm:gap-3.5">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-100 text-brand flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                {isImage ? <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : <FileText className="w-5 h-5 sm:w-6 sm:h-6" />}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-extrabold text-xs sm:text-sm text-stone-900 truncate" title={selectedFile.name}>
                  {selectedFile.name}
                </span>
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5 sm:mt-1">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-stone-600 whitespace-nowrap bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200/80">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  {isAnalyzingPdf ? (
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-brand font-extrabold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 whitespace-nowrap">
                      <Loader2 className="w-3 h-3 animate-spin" /> Counting Pages...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 whitespace-nowrap">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      {totalPages} {totalPages === 1 ? 'Page' : 'Pages'}
                    </span>
                  )}
                  {isPreUploading && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 whitespace-nowrap">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" /> Pre-caching...
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onProceed}
              disabled={isAnalyzingPdf}
              className="btn btn-primary px-4 sm:px-5 py-2.5 sm:py-3 shadow-md shrink-0 flex items-center justify-center gap-1.5 text-xs font-extrabold cursor-pointer disabled:opacity-50"
            >
              {isAnalyzingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">Checking...</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </>
              )}
            </button>
          </div>

          {/* Image Action Buttons (Crop & Adjust / Aadhaar Layout) */}
          {isImage && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={onOpenImageEditor}
                className="btn btn-outline w-full text-brand! bg-rose-50/80! hover:bg-rose-100! border-rose-200! flex items-center justify-center gap-2 text-xs font-extrabold py-2.5 rounded-2xl cursor-pointer shadow-2xs transition-all"
              >
                <Crop className="w-4 h-4 text-brand" />
                <span>✂️ Crop & Adjust Image</span>
              </button>

              <button
                type="button"
                onClick={onOpenCropModal}
                className="btn btn-outline w-full text-stone-700! bg-stone-50! hover:bg-stone-100! border-stone-200! flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-2xl cursor-pointer shadow-2xs transition-all"
              >
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>📄 Aadhaar / 2nd Side Layout</span>
              </button>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
