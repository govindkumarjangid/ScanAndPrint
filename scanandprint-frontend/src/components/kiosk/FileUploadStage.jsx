import React from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileText,
  ShieldCheck,
  Crop,
  ArrowRight,
  Sparkles,
  FileCheck,
} from 'lucide-react'

export default function FileUploadStage({
  selectedFile,
  totalPages,
  onFileSelect,
  onOpenCropModal,
  onProceed,
}) {
  const isImage = selectedFile && selectedFile.type?.startsWith('image/')

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
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
      <div className="bg-linear-to-r from-rose-500 to-brand text-white p-6 rounded-3xl shadow-lg shadow-rose-500/20 flex flex-col gap-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider bg-white/20 px-3 py-0.5 rounded-full w-max">
          Self-Service Smart Printing
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold font-heading">
          Upload & Print Instantly 🖨️
        </h2>
        <p className="text-xs text-rose-100 font-medium leading-relaxed">
          Drop your document ➔ Configure Print ➔ Pay via UPI (PhonePe / GPay) ➔ Collect fresh printout!
        </p>
      </div>

      {/* Dropzone Container */}
      <div
        {...getRootProps()}
        className={`bg-white rounded-3xl p-8 border-2 border-dashed transition-all shadow-sm text-center flex flex-col items-center justify-center gap-4 relative group cursor-pointer ${isDragActive
            ? 'border-brand bg-rose-50/40 scale-[1.01]'
            : 'border-stone-300 hover:border-brand hover:bg-stone-50/60'
          }`}
      >
        <input {...getInputProps()} />

        <div className="w-16 h-16 rounded-full bg-rose-50 text-brand flex items-center justify-center group-hover:scale-110 transition-transform">
          <Upload className="w-8 h-8 stroke-[2.2]" />
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-extrabold text-stone-900 font-heading">
            {isDragActive ? 'Drop File Here Now' : 'Drag & Drop PDF or Image File'}
          </h3>
          <p className="text-xs text-stone-500 font-medium">
            Or tap anywhere to browse files from your device (Max 50MB)
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-stone-100 text-stone-700 px-4 py-2 rounded-2xl text-xs font-bold mt-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>100% Private · Auto-deleted after printing</span>
        </div>
      </div>

      {/* Selected File Details Card */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-5 border border-stone-200 shadow-md flex flex-col gap-3.5"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-brand flex items-center justify-center shrink-0 font-bold text-xs">
                {isImage ? 'IMG' : 'PDF'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-sm text-stone-900 truncate">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · {totalPages} {totalPages === 1 ? 'Page' : 'Pages'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onProceed}
              className="btn btn-primary px-5 py-3 shadow-md shrink-0 flex items-center gap-2 text-xs font-bold"
            >
              <span>Configure Print</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Edit Image Button if file is an image */}
          {isImage && (
            <button
              type="button"
              onClick={onOpenCropModal}
              className="btn btn-outline w-full text-brand! bg-rose-50! hover:bg-rose-100! border-rose-200/80! flex items-center justify-center gap-2 text-xs font-bold py-2.5"
            >
              <Crop className="w-4 h-4" />
              <span>Crop, Rotate & Enhance Image</span>
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
