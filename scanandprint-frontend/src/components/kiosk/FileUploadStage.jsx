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
  X,
  Plus,
  Trash2,
  Layers,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function FileUploadStage({
  selectedFile,
  selectedFiles = [],
  totalPages,
  isAnalyzingPdf,
  isPreUploading,
  onFileSelect,
  onRemoveFile,
  onOpenStudioModal,
  onOpenPdfStudioModal,
  onOpenImageEditor,
  onOpenCropModal,
  onProceed,
}) {
  const isImage = selectedFile && selectedFile.type?.startsWith('image/')
  const cameraInputRef = useRef(null)

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      if (acceptedFiles.length > 5) {
        toast.error('Maximum 5 files can be selected at once. First 5 files were taken.')
      }
      const filesToUse = acceptedFiles.slice(0, 5)
      onFileSelect(filesToUse)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxFiles: 5,
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
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      if (files.length > 5) {
        toast.error('Maximum 5 files can be selected at once. First 5 photos taken.')
      }
      onFileSelect(files.slice(0, 5))
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
      <div className="bg-linear-to-r from-brand via-rose-600 to-rose-700 text-white p-4 sm:p-6 rounded-3xl shadow-lg shadow-rose-500/15 flex flex-col gap-2 relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full whitespace-nowrap backdrop-blur-xs shrink-0">
            Self-Service Smart Printing
          </span>
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-rose-100 whitespace-nowrap shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
            <span>Zero-Wait Printing</span>
          </div>
        </div>
        <h2 className="text-lg sm:text-2xl font-extrabold font-heading mt-0.5 leading-snug">
          Upload & Print in 60 Seconds 🖨️
        </h2>
        <p className="text-[11.5px] sm:text-xs text-rose-100 font-medium leading-relaxed max-w-lg">
          Select PDF or photo ➔ Configure color & copies ➔ Pay via UPI / Cash ➔ Collect instant printout!
        </p>
      </div>

      {/* Hidden Camera / Gallery Multiple Input */}
      <input
        type="file"
        accept="image/*"
        multiple
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
            {isDragActive ? 'Drop Files Here (Max 5)' : selectedFiles?.length > 0 ? 'Add More or Replace Files (Max 5)' : 'Upload Documents or Photos (Max 5)'}
          </h3>
          <p className="text-xs text-stone-500 font-medium max-w-xs">
            Select up to 5 items (PDF, Word DOCX, JPG, PNG, Photos)
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
            <span>Camera / Photos (Max 5)</span>
          </button>

          <div className="inline-flex items-center gap-1.5 bg-stone-100 text-stone-600 px-3 py-2 rounded-xl text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Private · Auto-deleted</span>
          </div>
        </div>
      </div>

      {/* Selected File Details Card (Single or Multi-Files up to 5) */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-3.5 sm:p-5 border border-stone-200 shadow-md flex flex-col gap-3"
        >
          <div className="flex items-center justify-between gap-2.5 sm:gap-3.5">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-100 text-brand flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                {selectedFiles?.length > 1 ? (
                  <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : isImage ? (
                  <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-extrabold text-xs sm:text-sm text-stone-900 truncate" title={selectedFile.name}>
                  {selectedFiles?.length > 1 ? `${selectedFiles.length} Items Selected (Combined Document)` : selectedFile.name}
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

          {/* Multiple Selected Files Chips List */}
          {selectedFiles?.length > 1 && (
            <div className="pt-2 border-t border-stone-100 flex flex-col gap-1.5">
              <span className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">
                Selected Files ({selectedFiles.length}/5)
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-stone-50 rounded-xl border border-stone-200">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs text-xs font-bold text-stone-700 max-w-full"
                  >
                    <span className="text-[10px] bg-rose-50 text-brand px-1 rounded font-black">
                      {idx + 1}
                    </span>
                    <span className="truncate max-w-36 text-[11px]">{file.name}</span>
                    <span className="text-[10px] text-stone-400 font-normal">
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                    {onRemoveFile && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemoveFile(idx)
                        }}
                        className="hover:text-rose-600 text-stone-400 p-0.5 cursor-pointer ml-0.5"
                        title="Remove file"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Action Button (Unified Crop & Document Studio) */}
          {isImage && (
            <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={onOpenStudioModal || onOpenImageEditor || onOpenCropModal}
                className="btn btn-outline w-full text-brand! bg-rose-50/90! hover:bg-rose-100! border-rose-200! flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl cursor-pointer shadow-xs transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <Crop className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-xs font-extrabold text-stone-900 group-hover:text-brand transition-colors truncate">
                      Edit &amp; Crop Document Image
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium truncate">
                      4-Point Crop · ID Card 2-in-1 · Passport Grid
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-brand text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black shadow-xs shrink-0 ml-2">
                  <span>Edit Image</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                </div>
              </button>
            </div>
          )}

          {/* PDF Action Button (PDF Studio & Page Manager) */}
          {!isImage && selectedFile && (
            <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={onOpenPdfStudioModal || onOpenStudioModal}
                className="btn btn-outline w-full text-brand! bg-rose-50/90! hover:bg-rose-100! border-rose-200! flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl cursor-pointer shadow-xs transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-xs font-extrabold text-stone-900 group-hover:text-brand transition-colors truncate">
                      Manage &amp; Edit PDF Pages
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium truncate">
                      Page Preview · Rotate Portrait/Landscape · Custom Range · Delete/Merge
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-brand text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black shadow-xs shrink-0 ml-2">
                  <span>Edit PDF</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                </div>
              </button>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
