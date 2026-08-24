import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  X,
  Check,
  RotateCw,
  Trash2,
  Plus,
  CheckSquare,
  Square,
  Loader2,
  Layers,
  Eye,
  Filter,
  BookOpen,
} from 'lucide-react'
import { renderPdfPagesToThumbnails, exportEditedPdf, parsePageRange } from '../../lib/pdfUtil';
import toast from 'react-hot-toast';

export default function KioskPdfStudioModal({ pdfFile, isOpen, onClose, onSave }) {
  const [pages, setPages] = useState([])
  const [isLoadingPages, setIsLoadingPages] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 })
  const [customRangeText, setCustomRangeText] = useState('')
  const [layoutMode, setLayoutMode] = useState('standard') // 'standard' | '2in1_book'
  const [previewingPage, setPreviewingPage] = useState(null)
  const [additionalFiles, setAdditionalFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const addFilesInputRef = useRef(null)

  // Load and Render PDF pages
  useEffect(() => {
    let isMounted = true
    if (pdfFile && isOpen) {
      setIsLoadingPages(true)
      setCustomRangeText('')
      setAdditionalFiles([])
      setPreviewingPage(null)

      renderPdfPagesToThumbnails(pdfFile, (current, total) => {
        if (isMounted) {
          setLoadingProgress({ current, total })
        }
      })
        .then((renderedPages) => {
          if (isMounted) {
            setPages(renderedPages)
            setIsLoadingPages(false)
          }
        })
        .catch((err) => {
          console.error('Failed to render PDF pages:', err)
          if (isMounted) {
            toast.error('Failed to load PDF pages preview')
            setIsLoadingPages(false)
          }
        })
    }

    return () => {
      isMounted = false
    }
  }, [pdfFile, isOpen])

  // Handle Custom Page Range Input (e.g. "1, 3-5")
  const handleRangeInputChange = (e) => {
    const val = e.target.value
    setCustomRangeText(val)

    if (!val.trim() || val.trim().toLowerCase() === 'all') {
      setPages((prev) => prev.map((p) => ({ ...p, selected: true })))
      return
    }

    const { valid, selectedPages } = parsePageRange(val, pages.length)
    if (valid && selectedPages.length > 0) {
      const pageSet = new Set(selectedPages)
      setPages((prev) =>
        prev.map((p) => ({
          ...p,
          selected: pageSet.has(p.pageNumber),
        }))
      )
    }
  }

  // Toggle Single Page Selection
  const handleTogglePageSelect = (id, e) => {
    if (e) e.stopPropagation()
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    )
  }

  // Select / Deselect All
  const handleSelectAll = (selectStatus) => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: selectStatus })))
    setCustomRangeText(selectStatus ? 'all' : '')
  }

  // Rotate Single Page Clockwise
  const handleRotatePage = (id, e) => {
    if (e) e.stopPropagation()
    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const nextRot = (p.rotation + 90) % 360
        return {
          ...p,
          rotation: nextRot,
          isLandscape: (nextRot === 90 || nextRot === 270) ? (p.height > p.width) : (p.width > p.height),
        }
      })
    )
  }

  // Batch Rotate All Pages
  const handleRotateAll = (delta) => {
    setPages((prev) =>
      prev.map((p) => {
        const nextRot = (p.rotation + delta + 360) % 360
        return {
          ...p,
          rotation: nextRot,
          isLandscape: (nextRot === 90 || nextRot === 270) ? (p.height > p.width) : (p.width > p.height),
        }
      })
    )
    toast.success(`Rotated all pages ${delta > 0 ? '+90°' : '-90°'}`)
  }

  // Set All Orientation (Portrait or Landscape)
  const handleSetAllOrientation = (targetOrientation) => {
    setPages((prev) =>
      prev.map((p) => {
        const isCurrentlyLandscape = (p.rotation === 90 || p.rotation === 270) ? (p.height > p.width) : (p.width > p.height)
        if (targetOrientation === 'landscape' && !isCurrentlyLandscape) {
          return { ...p, rotation: (p.rotation + 90) % 360, isLandscape: true }
        }
        if (targetOrientation === 'portrait' && isCurrentlyLandscape) {
          return { ...p, rotation: (p.rotation + 90) % 360, isLandscape: false }
        }
        return p
      })
    )
    toast.success(`Set all pages to ${targetOrientation}`)
  }

  // Delete Single Page
  const handleDeletePage = (id, e) => {
    if (e) e.stopPropagation()
    setPages((prev) => {
      const filtered = prev.filter((p) => p.id !== id)
      // Re-number remaining pages
      return filtered.map((p, idx) => ({ ...p, pageNumber: idx + 1 }))
    })
    toast.success('Page removed from PDF')
  }

  // Add More PDF / Image Pages
  const handleAddFiles = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setAdditionalFiles((prev) => [...prev, ...files])
    toast.success(`Attached ${files.length} extra file${files.length > 1 ? 's' : ''} to PDF!`)
  }

  // Remove Attached Extra File
  const handleRemoveAdditionalFile = (idx, e) => {
    if (e) e.stopPropagation()
    setAdditionalFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  // Save & Export Edited PDF
  const handleSaveEditedPdf = async () => {
    const selectedPages = pages.filter((p) => p.selected !== false)
    if (!selectedPages.length && !additionalFiles.length) {
      toast.error('Please select at least 1 page to print')
      return
    }

    setIsProcessing(true)
    try {
      const editedPdfFile = await exportEditedPdf({
        originalFile: pdfFile,
        pages,
        additionalFiles,
        layoutMode,
      })

      toast.success(
        layoutMode === '2in1_book'
          ? '2-in-1 Book PDF created successfully!'
          : 'PDF updated successfully!'
      )
      onSave(editedPdfFile)
    } catch (err) {
      console.error('Error exporting PDF:', err)
      toast.error(err.message || 'Failed to generate edited PDF')
    } finally {
      setIsProcessing(false)
    }
  }

  const selectedCount = pages.filter((p) => p.selected !== false).length

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-3 md:p-4 bg-stone-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          className="bg-white border-0 sm:border border-stone-200/90 rounded-none sm:rounded-3xl w-full h-dvh sm:h-[92vh] max-w-full sm:max-w-5xl shadow-2xl overflow-hidden flex flex-col text-stone-800"
        >
          {/* TOP HEADER */}
          <div className="px-3.5 sm:px-6 py-2.5 sm:py-3.5 border-b border-stone-200/80 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-rose-50 text-brand border border-rose-100 flex items-center justify-center font-bold shadow-2xs shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h2 className="text-sm sm:text-lg font-black text-stone-900 font-heading truncate">
                    PDF Studio &amp; Page Manager
                  </h2>
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase bg-rose-50 text-brand px-2 py-0.5 rounded-full border border-rose-200 shrink-0">
                    Smart Kiosk
                  </span>
                </div>
                <p className="text-stone-500 text-[11px] sm:text-xs font-medium hidden sm:block truncate">
                  Select page range, rotate portrait/landscape, delete pages, or merge documents
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
                title="Close PDF Studio"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* QUICK TOOLBAR (SELECT RANGE, ROTATE ALL, ADD PAGES) */}
          <div className="bg-stone-50/90 border-b border-stone-200/80 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
            {/* Left: Custom Range Input & Select All */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
                <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Range: e.g. 1, 3-5"
                  value={customRangeText}
                  onChange={handleRangeInputChange}
                  className="w-28 sm:w-36 text-xs font-bold text-stone-800 placeholder-stone-400 outline-none bg-transparent"
                />
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSelectAll(true)}
                  className="px-2.5 py-1.5 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-[11px] font-bold text-stone-700 cursor-pointer shadow-2xs transition-colors flex items-center gap-1"
                >
                  <CheckSquare className="w-3 h-3 text-emerald-600" />
                  <span>Select All</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAll(false)}
                  className="px-2.5 py-1.5 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-[11px] font-bold text-stone-700 cursor-pointer shadow-2xs transition-colors flex items-center gap-1"
                >
                  <Square className="w-3 h-3 text-stone-400" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Center: Book Layout Selector */}
            <div className="flex items-center bg-white border border-stone-200 p-0.5 rounded-xl shadow-2xs">
              <button
                type="button"
                onClick={() => setLayoutMode('standard')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold cursor-pointer transition-all ${layoutMode === 'standard'
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                  }`}
              >
                1 Page/Sheet
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('2in1_book')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold cursor-pointer transition-all flex items-center gap-1 ${layoutMode === '2in1_book'
                    ? 'bg-brand text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                  }`}
                title="Place 2 pages side-by-side on 1 Landscape A4 sheet (Like an open book!)"
              >
                <BookOpen className="w-3 h-3" />
                <span>2-in-1 Book Mode</span>
              </button>
            </div>

            {/* Right: Orientation & Add Pages */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleRotateAll(90)}
                className="px-2.5 py-1.5 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-[11px] font-bold text-stone-700 cursor-pointer shadow-2xs transition-colors flex items-center gap-1"
                title="Rotate all pages 90° clockwise"
              >
                <RotateCw className="w-3 h-3 text-brand" />
                <span>Rotate All</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetAllOrientation('portrait')}
                className="px-2.5 py-1.5 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-[11px] font-bold text-stone-700 cursor-pointer shadow-2xs transition-colors hidden sm:flex items-center gap-1"
              >
                <span>Portrait</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetAllOrientation('landscape')}
                className="px-2.5 py-1.5 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-[11px] font-bold text-stone-700 cursor-pointer shadow-2xs transition-colors hidden sm:flex items-center gap-1"
              >
                <span>Landscape</span>
              </button>

              <button
                type="button"
                onClick={() => addFilesInputRef.current?.click()}
                className="px-3 py-1.5 bg-brand hover:bg-rose-700 text-white rounded-xl text-[11px] font-extrabold cursor-pointer shadow-xs transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Pages</span>
              </button>
            </div>
          </div>

          {/* MAIN PAGE THUMBNAILS GRID (SCROLLABLE) */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-stone-100/90 relative">
            {isLoadingPages ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-stone-500 py-12">
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-brand" />
                <span className="text-xs sm:text-sm font-bold text-stone-700">
                  Rendering PDF Previews ({loadingProgress.current} / {loadingProgress.total || '...'})
                </span>
                <span className="text-[11px] text-stone-400">Please wait while high-res thumbnails are generated</span>
              </div>
            ) : pages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-stone-400 py-12 text-center">
                <Layers className="w-10 h-10 stroke-[1.5]" />
                <span className="text-sm font-bold text-stone-600">No pages in this document</span>
                <button
                  type="button"
                  onClick={() => addFilesInputRef.current?.click()}
                  className="btn btn-sm bg-brand text-white text-xs font-bold rounded-xl mt-2 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Pages
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-4">
                {pages.map((p) => {
                  const isSelected = p.selected !== false

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleTogglePageSelect(p.id)}
                      className={`relative bg-white rounded-xl border-2 transition-all cursor-pointer overflow-hidden group shadow-2xs ${isSelected
                          ? 'border-brand ring-2 ring-brand/30 shadow-md'
                          : 'border-stone-300 opacity-55 grayscale-40 hover:opacity-80'
                        }`}
                    >
                      {/* Top Bar: Checkbox & Page Badge */}
                      <div className="absolute top-1.5 left-1.5 z-20 flex items-center gap-1">
                        <div
                          onClick={(e) => handleTogglePageSelect(p.id, e)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center cursor-pointer shadow-xs transition-colors ${isSelected ? 'bg-brand text-white' : 'bg-white/90 border border-stone-300 text-transparent'
                            }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-3" />
                        </div>
                        <span className="bg-stone-900/85 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                          P.{p.pageNumber}
                        </span>
                      </div>

                      {/* Top Right: Delete Single Page Button */}
                      <button
                        type="button"
                        onClick={(e) => handleDeletePage(p.id, e)}
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md border border-white cursor-pointer z-20 transition-transform hover:scale-115 active:scale-95"
                        title="Delete this page"
                      >
                        <X className="w-3 h-3 stroke-3" />
                      </button>

                      {/* Rendered Thumbnail Image Viewport */}
                      <div className="aspect-[1/1.414] bg-stone-100 flex items-center justify-center p-1.5 overflow-hidden">
                        <img
                          src={p.dataUrl}
                          alt={`Page ${p.pageNumber}`}
                          className="max-h-full max-w-full object-contain pointer-events-none shadow-xs rounded-xs transition-transform duration-200"
                          style={{
                            transform: `rotate(${p.rotation}deg)`,
                          }}
                        />
                      </div>

                      {/* Bottom Bar: Orientation Tag & Action Buttons */}
                      <div className="p-1.5 bg-stone-50 border-t border-stone-200/80 flex items-center justify-between gap-1 text-[10px]">
                        <span className="text-[9px] font-bold text-stone-500 truncate">
                          {p.isLandscape ? 'Landscape' : 'Portrait'} ({p.rotation}°)
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                          {/* Zoom Preview Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setPreviewingPage(p)
                            }}
                            className="p-1 hover:bg-stone-200 text-stone-600 rounded cursor-pointer"
                            title="Zoom Page Preview"
                          >
                            <Eye className="w-3 h-3" />
                          </button>

                          {/* Rotate Page Button */}
                          <button
                            type="button"
                            onClick={(e) => handleRotatePage(p.id, e)}
                            className="p-1 hover:bg-rose-50 text-brand rounded cursor-pointer"
                            title="Rotate +90°"
                          >
                            <RotateCw className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Additional Attached Files List */}
            {additionalFiles.length > 0 && (
              <div className="mt-4 p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs flex flex-col gap-2">
                <span className="text-xs font-extrabold text-stone-800">
                  Attached Merged Documents ({additionalFiles.length})
                </span>
                <div className="flex flex-col gap-1.5">
                  {additionalFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-brand shrink-0" />
                        <span className="font-bold text-stone-800 truncate">{file.name}</span>
                        <span className="text-[10px] text-stone-500 shrink-0">
                          ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveAdditionalFile(idx, e)}
                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        title="Remove attached file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* FULL SCREEN ZOOM PREVIEW MODAL */}
          {previewingPage && (
            <div
              onClick={() => setPreviewingPage(null)}
              className="fixed inset-0 z-60 bg-stone-950/90 flex flex-col items-center justify-center p-3 sm:p-6"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative max-h-[85vh] max-w-[90vw] bg-white rounded-2xl p-2 shadow-2xl flex flex-col items-center overflow-hidden"
              >
                <div className="w-full flex items-center justify-between pb-2 border-b border-stone-200 mb-2 px-2">
                  <span className="text-xs sm:text-sm font-extrabold text-stone-800">
                    Preview: Page {previewingPage.pageNumber} ({previewingPage.rotation}°)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleRotatePage(previewingPage.id)}
                      className="p-1.5 bg-stone-100 hover:bg-stone-200 text-brand rounded-lg cursor-pointer flex items-center gap-1 text-xs font-bold"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Rotate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewingPage(null)}
                      className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <img
                  src={previewingPage.dataUrl}
                  alt={`Page ${previewingPage.pageNumber}`}
                  className="max-h-[75vh] max-w-full object-contain rounded-sm"
                  style={{
                    transform: `rotate(${previewingPage.rotation}deg)`,
                  }}
                />
              </div>
            </div>
          )}

          {/* STICKY BOTTOM ACTION BAR */}
          <div className="px-3.5 sm:px-6 py-3 pb-8 sm:pb-3 border-t border-stone-200/80 bg-white flex items-center justify-between gap-3 shrink-0">
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-extrabold text-stone-900 truncate">
                Selected for Print: {selectedCount} of {pages.length} Pages
              </span>
              <span className="text-[10px] sm:text-[11px] text-stone-500 font-medium truncate">
                Only selected pages will be included in the final print job
              </span>
            </div>

            <button
              type="button"
              onClick={handleSaveEditedPdf}
              disabled={isProcessing || selectedCount === 0}
              className="btn btn-primary px-5 sm:px-8 py-3 text-xs sm:text-sm font-extrabold shadow-lg shadow-rose-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing PDF...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-3" />
                  <span>Save &amp; Apply</span>
                </>
              )}
            </button>
          </div>

          {/* Hidden File Input for Adding Extra Pages/Files */}
          <input
            type="file"
            ref={addFilesInputRef}
            onChange={handleAddFiles}
            multiple
            accept="application/pdf,image/*"
            className="hidden"
          />
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
