import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crop,
  X,
  Check,
  RotateCw,
  RotateCcw,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  Plus,
  Trash2,
  Grid,
  Loader2,
  Copy,
  Layers,
  ScanLine,
  Maximize2,
  ArrowLeft,
} from 'lucide-react'
import {
  renderCroppedImageCanvas,
  renderPerspectiveCropCanvas,
  renderA4MultiImageCanvas,
  renderPassportGridCanvas,
  canvasToPdfFile,
  canvasToImageFile,
} from '../../lib/kioskCanvasUtil'
import toast from 'react-hot-toast'

export default function KioskStudioModal({ imageFile, isOpen, onClose, onSave }) {
  // Master Tabs: 'doc_studio' (Doc Scanner & Layout) | 'passport' (Passport Photo Grid)
  const [activeMode, setActiveMode] = useState('doc_studio')
  const [exportFormat, setExportFormat] = useState('pdf') // 'pdf' | 'png'
  const [isProcessing, setIsProcessing] = useState(false)

  // =========================================================================
  // 1. DOC STUDIO: ALL-IN-ONE A4 CANVAS (ADD, DRAG, CORNER RESIZE, 4-POINT CROP)
  // =========================================================================
  const [imageSrc, setImageSrc] = useState(null)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)

  // Multi-Image A4 Canvas Items
  // Each item: { id, url, rawUrl, name, x, y, width, height, rotation, corners: [TL, TR, BR, BL] }
  const [canvasItems, setCanvasItems] = useState([])
  const [selectedItemId, setSelectedItemId] = useState(null)

  const multiFileInputRef = useRef(null)
  const a4CanvasRef = useRef(null)
  const [canvasDragState, setCanvasDragState] = useState(null)

  // =========================================================================
  // DEDICATED 4-POINT PERSPECTIVE CROPPER OVERLAY (PIXEL-PERFECT TIGHT BOUNDS)
  // =========================================================================
  const [croppingItem, setCroppingItem] = useState(null) // null or item object being cropped
  const [cropImgSize, setCropImgSize] = useState({ w: 4, h: 3 })
  const [docCorners, setDocCorners] = useState([
    { x: 5, y: 5 },
    { x: 95, y: 5 },
    { x: 95, y: 95 },
    { x: 5, y: 95 },
  ])
  const [activeCornerHandle, setActiveCornerHandle] = useState(null)
  const [cornerDragStart, setCornerDragStart] = useState(null)
  const cropStageRef = useRef(null)

  // =========================================================================
  // 2. PASSPORT PHOTO GRID STATES (16+ COPIES & ZERO-GAP)
  // =========================================================================
  const [passportCount, setPassportCount] = useState(16) // 16, 20, 24, 30, 32, 36, 40, 48
  const [passportNoGap, setPassportNoGap] = useState(true) // Always zero space between photos

  // Load Initial Image
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile)
      setImageSrc(url)

      // Initialize A4 Canvas with initial image
      const initialItem = {
        id: 'item_' + Date.now(),
        url,
        rawUrl: url,
        name: imageFile.name || 'Document 1',
        x: 12,
        y: 8,
        width: 76,
        height: 42,
        rotation: 0,
        corners: [
          { x: 5, y: 5 },
          { x: 95, y: 5 },
          { x: 95, y: 95 },
          { x: 5, y: 95 },
        ],
      }
      setCanvasItems([initialItem])
      setSelectedItemId(initialItem.id)
      setBrightness(100)
      setContrast(100)
      setPassportCount(16)
      setPassportNoGap(true)
      setCroppingItem(null)

      return () => URL.revokeObjectURL(url)
    }
  }, [imageFile, isOpen])

  // Get active item
  const activeItem = canvasItems.find((i) => i.id === selectedItemId) || canvasItems[0] || null

  // =========================================================================
  // MOUSE & TOUCH HANDLERS: A4 CANVAS MOVE & BOTTOM-RIGHT CORNER RESIZE
  // =========================================================================
  const handleCanvasMouseMove = useCallback(
    (e) => {
      if (!canvasDragState || !a4CanvasRef.current) return
      const canvasRect = a4CanvasRef.current.getBoundingClientRect()
      if (!canvasRect.width || !canvasRect.height) return

      const clientX = e.clientX || (e.touches && e.touches[0].clientX)
      const clientY = e.clientY || (e.touches && e.touches[0].clientY)

      const deltaXPercent = ((clientX - canvasDragState.startX) / canvasRect.width) * 100
      const deltaYPercent = ((clientY - canvasDragState.startY) / canvasRect.height) * 100

      const { origItem, type, itemId } = canvasDragState

      setCanvasItems((prev) =>
        prev.map((item) => {
          if (item.id !== itemId) return item

          if (type === 'move') {
            const newX = Math.max(0, Math.min(100 - origItem.width, origItem.x + deltaXPercent))
            const newY = Math.max(0, Math.min(100 - origItem.height, origItem.y + deltaYPercent))
            return { ...item, x: newX, y: newY }
          } else if (type === 'resize_br') {
            const newW = Math.max(10, Math.min(100 - origItem.x, origItem.width + deltaXPercent))
            const newH = Math.max(8, Math.min(100 - origItem.y, origItem.height + deltaYPercent))
            return { ...item, width: newW, height: newH }
          }
          return item
        })
      )
    },
    [canvasDragState]
  )

  const handleCanvasMouseUp = useCallback(() => {
    setCanvasDragState(null)
  }, [])

  useEffect(() => {
    if (canvasDragState) {
      window.addEventListener('mousemove', handleCanvasMouseMove)
      window.addEventListener('mouseup', handleCanvasMouseUp)
      window.addEventListener('touchmove', handleCanvasMouseMove)
      window.addEventListener('touchend', handleCanvasMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleCanvasMouseMove)
      window.removeEventListener('mouseup', handleCanvasMouseUp)
      window.removeEventListener('touchmove', handleCanvasMouseMove)
      window.removeEventListener('touchend', handleCanvasMouseUp)
    }
  }, [canvasDragState, handleCanvasMouseMove, handleCanvasMouseUp])

  const handleStartCanvasDrag = (type, item, e) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedItemId(item.id)
    const clientX = e.clientX || (e.touches && e.touches[0].clientX)
    const clientY = e.clientY || (e.touches && e.touches[0].clientY)
    setCanvasDragState({
      type,
      itemId: item.id,
      startX: clientX,
      startY: clientY,
      origItem: { ...item },
    })
  }

  // =========================================================================
  // MOUSE & TOUCH HANDLERS: 4-POINT PERSPECTIVE CROPPER OVERLAY
  // =========================================================================
  const handleCornerMouseMove = useCallback(
    (e) => {
      if (activeCornerHandle === null || !cornerDragStart || !cropStageRef.current) return
      const stageRect = cropStageRef.current.getBoundingClientRect()
      if (!stageRect.width || !stageRect.height) return

      const clientX = e.clientX || (e.touches && e.touches[0].clientX)
      const clientY = e.clientY || (e.touches && e.touches[0].clientY)

      const deltaX = ((clientX - cornerDragStart.x) / stageRect.width) * 100
      const deltaY = ((clientY - cornerDragStart.y) / stageRect.height) * 100

      if (typeof activeCornerHandle === 'number') {
        const orig = cornerDragStart.corners[activeCornerHandle]
        const newX = Math.max(0, Math.min(100, orig.x + deltaX))
        const newY = Math.max(0, Math.min(100, orig.y + deltaY))

        setDocCorners((prev) => {
          const copy = [...prev]
          copy[activeCornerHandle] = { x: newX, y: newY }
          return copy
        })
      }
    },
    [activeCornerHandle, cornerDragStart]
  )

  const handleCornerMouseUp = useCallback(() => {
    setActiveCornerHandle(null)
    setCornerDragStart(null)
  }, [])

  useEffect(() => {
    if (activeCornerHandle !== null) {
      window.addEventListener('mousemove', handleCornerMouseMove)
      window.addEventListener('mouseup', handleCornerMouseUp)
      window.addEventListener('touchmove', handleCornerMouseMove)
      window.addEventListener('touchend', handleCornerMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleCornerMouseMove)
      window.removeEventListener('mouseup', handleCornerMouseUp)
      window.removeEventListener('touchmove', handleCornerMouseMove)
      window.removeEventListener('touchend', handleCornerMouseUp)
    }
  }, [activeCornerHandle, handleCornerMouseMove, handleCornerMouseUp])

  const handleStartCornerDrag = (cornerIdx, e) => {
    e.preventDefault()
    e.stopPropagation()
    const clientX = e.clientX || (e.touches && e.touches[0].clientX)
    const clientY = e.clientY || (e.touches && e.touches[0].clientY)
    setActiveCornerHandle(cornerIdx)
    setCornerDragStart({
      x: clientX,
      y: clientY,
      corners: docCorners.map((c) => ({ ...c })),
    })
  }

  // Open 4-Point Crop View for Specific Item
  const handleOpenCropForItem = (item) => {
    setCroppingItem(item)
    // Pre-calculate image natural dimensions
    const img = new Image()
    img.src = item.rawUrl || item.url
    img.onload = () => {
      setCropImgSize({ w: img.naturalWidth || 4, h: img.naturalHeight || 3 })
    }
    setDocCorners(
      item.corners && item.corners.length === 4
        ? item.corners.map((c) => ({ ...c }))
        : [
          { x: 5, y: 5 },
          { x: 95, y: 5 },
          { x: 95, y: 95 },
          { x: 5, y: 95 },
        ]
    )
  }

  // Apply 4-Point Crop & Save Result onto A4 Canvas
  const handleApplyCropAndSave = async () => {
    if (!croppingItem) return
    setIsProcessing(true)

    try {
      const croppedCanvas = await renderPerspectiveCropCanvas({
        imageSrc: croppingItem.rawUrl || croppingItem.url,
        corners: docCorners,
        rotation: croppingItem.rotation || 0,
        filters: { brightness: 100, contrast: 100, saturation: 100, isGrayscale: false, isSepia: false, isXerox: false },
      })

      const croppedDataUrl = croppedCanvas.toDataURL('image/png')
      const cropAspect = croppedCanvas.width / croppedCanvas.height

      // Maintain placed width on A4, adjust height proportionally to A4 ratio
      const a4Aspect = 1 / 1.414
      const newHeight = Math.max(8, Math.min(85, (croppingItem.width / cropAspect) * a4Aspect))

      setCanvasItems((prev) =>
        prev.map((it) =>
          it.id === croppingItem.id
            ? {
              ...it,
              url: croppedDataUrl,
              height: newHeight,
              corners: [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 },
              ],
            }
            : it
        )
      )
      setCroppingItem(null)
      toast.success('Document cropped & straightened!')
    } catch (err) {
      console.error('Failed to crop document:', err)
      toast.error('Failed to crop document')
    } finally {
      setIsProcessing(false)
    }
  }

  // =========================================================================
  // MULTI-IMAGE MANAGEMENT (ADD, DELETE, ROTATE, DUPLICATE)
  // =========================================================================
  const handleAddMultipleFiles = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const newItems = files.map((file, idx) => {
      const url = URL.createObjectURL(file)
      const slotIndex = canvasItems.length + idx
      return {
        id: 'item_' + Date.now() + '_' + idx,
        url,
        rawUrl: url,
        name: file.name || `Document ${slotIndex + 1}`,
        x: 12,
        y: Math.min(55, 8 + slotIndex * 24),
        width: 76,
        height: 40,
        rotation: 0,
        corners: [
          { x: 5, y: 5 },
          { x: 95, y: 5 },
          { x: 95, y: 95 },
          { x: 5, y: 95 },
        ],
      }
    })

    setCanvasItems((prev) => [...prev, ...newItems])
    if (newItems.length > 0) {
      setSelectedItemId(newItems[newItems.length - 1].id)
    }
    toast.success(`Added ${files.length} document image${files.length > 1 ? 's' : ''}!`)
  }

  const handleDeleteCanvasItem = (id, e) => {
    if (e) e.stopPropagation()
    setCanvasItems((prev) => prev.filter((item) => item.id !== id))
    if (selectedItemId === id) {
      setSelectedItemId(null)
    }
    toast.success('Image deleted from A4 page')
  }

  const handleRotateCanvasItem = (id, e) => {
    if (e) e.stopPropagation()
    setCanvasItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, rotation: (item.rotation + 90) % 360 } : item))
    )
  }

  const handleDuplicateCanvasItem = (id, e) => {
    if (e) e.stopPropagation()
    const target = canvasItems.find((i) => i.id === id)
    if (!target) return

    const dupItem = {
      ...target,
      id: 'item_' + Date.now(),
      name: `${target.name} (Copy)`,
      x: Math.min(25, target.x + 5),
      y: Math.min(52, target.y + 12),
      corners: target.corners ? target.corners.map((c) => ({ ...c })) : null,
    }

    setCanvasItems((prev) => [...prev, dupItem])
    setSelectedItemId(dupItem.id)
    toast.success('Image duplicated')
  }

  const handleResetAll = () => {
    if (canvasItems.length > 0) {
      setCanvasItems((prev) =>
        prev.map((item, idx) => ({
          ...item,
          rotation: 0,
          x: 12,
          y: Math.min(55, 8 + idx * 24),
          width: 76,
          height: 40,
          corners: [
            { x: 5, y: 5 },
            { x: 95, y: 5 },
            { x: 95, y: 95 },
            { x: 5, y: 95 },
          ],
        }))
      )
    }
    setBrightness(100)
    setContrast(100)
    setPassportCount(16)
    setPassportNoGap(true)
    setCroppingItem(null)
    toast.success('Reset to original')
  }

  // =========================================================================
  // FINAL MASTER SAVE FUNCTION (PDF / IMAGE EXPORT)
  // =========================================================================
  const handleSaveAndApply = async () => {
    if (!canvasItems.length && !imageSrc) return
    setIsProcessing(true)

    try {
      let finalCanvas = null
      const fileNameBase = imageFile?.name ? imageFile.name.replace(/\.[^/.]+$/, '') : 'document'

      if (activeMode === 'doc_studio') {
        // Mode 1: All-in-One Multi-Image A4 Canvas (with 4-Point Cropping, Position, Scale, Rotation)
        finalCanvas = await renderA4MultiImageCanvas({
          items: canvasItems,
          showCutLine: false,
          showBorder: false,
          globalFilters: { brightness, contrast },
        })
      } else if (activeMode === 'passport') {
        // Mode 2: Passport Photo Grid (16+ copies, top-aligned, seamless zero-gap)
        const primaryImageSrc = activeItem?.url || imageSrc
        const passportCropCanvas = await renderCroppedImageCanvas({
          imageSrc: primaryImageSrc,
          cropBox: { x: 5, y: 5, w: 90, h: 90 },
          rotation: activeItem?.rotation || 0,
          filters: { brightness, contrast, saturation: 100, isGrayscale: false, isSepia: false },
        })
        const passportDataUrl = passportCropCanvas.toDataURL('image/png')
        finalCanvas = await renderPassportGridCanvas({
          imageSrc: passportDataUrl,
          copiesCount: passportCount,
          showCutLines: false,
          noGap: true,
        })
      }

      if (!finalCanvas) {
        throw new Error('Failed to generate document canvas')
      }

      const generatedFile = await canvasToPdfFile(finalCanvas, `${fileNameBase}_print.pdf`)

      toast.success('A4 PDF Document ready for printing!')
      onSave(generatedFile)
    } catch (err) {
      console.error('Error generating document:', err)
      toast.error('Failed to process image: ' + (err.message || 'Unknown error'))
    } finally {
      setIsProcessing(false)
    }
  }

  const getPassportGridCols = (count) => {
    if (count <= 24) return 4
    if (count <= 35) return 5
    return 6
  }

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
          {/* Top Header Bar */}
          <div className="px-3.5 sm:px-6 py-2.5 sm:py-3.5 border-b border-stone-200/80 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-rose-50 text-brand border border-rose-100 flex items-center justify-center font-bold shadow-2xs shrink-0">
                <Crop className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h2 className="text-sm sm:text-lg font-black text-stone-900 font-heading truncate">
                    Image &amp; Document Studio
                  </h2>
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase bg-rose-50 text-brand px-2 py-0.5 rounded-full border border-rose-200 shrink-0">
                    Smart Kiosk
                  </span>
                </div>
                <p className="text-stone-500 text-[11px] sm:text-xs font-medium hidden sm:block truncate">
                  All-in-one document cropper, multi-image A4 layout, and photo grids
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
                title="Close Studio"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* TWO MAIN TABS (Doc Scanner & Multi-Layout | Passport Photo Grid) */}
          <div className="bg-stone-50/90 border-b border-stone-200/80 px-3 sm:px-6 py-2 flex items-center justify-between gap-2 overflow-x-auto shrink-0 scrollbar-none">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('doc_studio')
                  setCroppingItem(null)
                }}
                className={`py-1.5 sm:py-2 px-3 sm:px-5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-2xs ${activeMode === 'doc_studio'
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-100 border border-stone-200/80'
                  }`}
              >
                <ScanLine className="w-4 h-4" />
                <span>Doc Scanner &amp; Layout ({canvasItems.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMode('passport')
                  setCroppingItem(null)
                }}
                className={`py-1.5 sm:py-2 px-3 sm:px-5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-2xs ${activeMode === 'passport'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-100 border border-stone-200/80'
                  }`}
              >
                <Grid className="w-4 h-4" />
                <span>Passport Photo Grid ({passportCount} Copies)</span>
              </button>
            </div>

            {/* Quick Reset Button */}
            <button
              type="button"
              onClick={handleResetAll}
              className="text-stone-500 hover:text-stone-800 bg-white hover:bg-stone-100 border border-stone-200/80 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
              title="Reset all edits"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>

          {/* Main Studio Workspace (Stacked on Mobile, Side-by-Side on Desktop) */}
          <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden min-h-0 relative">

            {/* LEFT / CENTER: Clean Light Mode Canvas Viewport */}
            <div className="h-[46vh] xs:h-[50vh] sm:h-[54vh] md:h-auto md:flex-1 bg-stone-200/80 p-3 sm:p-6 flex items-center justify-center overflow-hidden relative select-none border-b md:border-b-0 md:border-r border-stone-300 shrink-0">

              {/* TAB 1: ALL-IN-ONE A4 CANVAS (ADD, DRAG, CORNER RESIZE, CLICK TRASH TO DELETE) */}
              {activeMode === 'doc_studio' && (
                <div
                  ref={a4CanvasRef}
                  onClick={() => setSelectedItemId(null)}
                  className="relative h-full max-h-full max-w-full bg-white rounded-xl shadow-2xl border-2 border-stone-400 overflow-hidden text-stone-900 select-none"
                  style={{
                    aspectRatio: '1 / 1.414',
                    height: '100%',
                    maxHeight: '100%',
                    maxWidth: '100%',
                    width: 'auto',
                  }}
                >
                  {/* Empty State Banner */}
                  {canvasItems.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-stone-400 p-4 text-center">
                      <Layers className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.5] text-stone-400" />
                      <span className="text-xs font-bold text-stone-600">No images on A4 page</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          multiFileInputRef.current?.click()
                        }}
                        className="btn btn-sm bg-brand text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer mt-1"
                      >
                        <Plus className="w-4 h-4" /> Add Images
                      </button>
                    </div>
                  )}

                  {/* Placed Images with Drag, Sleek Top-Right Delete, and Sleek Bottom-Right Resize Handle */}
                  {canvasItems.map((item, idx) => {
                    const isSelected = selectedItemId === item.id

                    return (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedItemId(item.id)
                        }}
                        onMouseDown={(e) => handleStartCanvasDrag('move', item, e)}
                        onTouchStart={(e) => handleStartCanvasDrag('move', item, e)}
                        className={`absolute cursor-move transition-shadow touch-none ${isSelected
                            ? 'ring-2 ring-purple-600 ring-offset-1 z-30 shadow-xl'
                            : 'hover:ring-1 hover:ring-stone-400 z-20'
                          }`}
                        style={{
                          left: `${item.x}%`,
                          top: `${item.y}%`,
                          width: `${item.width}%`,
                          height: `${item.height}%`,
                        }}
                      >
                        {/* Image Content */}
                        <div className="w-full h-full relative overflow-hidden bg-stone-50 rounded-xs">
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-contain pointer-events-none"
                            style={{
                              transform: `rotate(${item.rotation}deg)`,
                              filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                            }}
                          />
                        </div>

                        {/* 1. TOP-RIGHT CORNER: SLEEK RED DELETE ICON */}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCanvasItem(item.id, e)}
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          className="absolute -top-2.5 -right-2.5 w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md border border-white cursor-pointer z-40 transition-transform hover:scale-115 active:scale-95"
                          title="Delete image"
                        >
                          <X className="w-3 h-3 stroke-3" />
                        </button>

                        {/* 2. BOTTOM-RIGHT CORNER: SLEEK PURPLE RESIZE HANDLE */}
                        <div
                          onMouseDown={(e) => handleStartCanvasDrag('resize_br', item, e)}
                          onTouchStart={(e) => handleStartCanvasDrag('resize_br', item, e)}
                          className="absolute -bottom-2.5 -right-2.5 w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-md border border-white cursor-se-resize z-40 transition-transform hover:scale-115 active:scale-95 touch-none"
                          title="Resize card"
                        >
                          <Maximize2 className="w-2.5 h-2.5 rotate-90" />
                        </div>

                        {/* FLOATING ACTION PILL (ICON-ONLY WITHOUT BULKY TEXT) */}
                        {isSelected && (
                          <div
                            className="absolute -top-7.5 left-0 z-40 flex items-center gap-1 bg-white/95 backdrop-blur-xs text-stone-800 px-1.5 py-0.5 rounded-lg shadow-md border border-stone-200 pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenCropForItem(item)
                              }}
                              className="p-1 hover:bg-rose-50 text-brand rounded-md transition-colors cursor-pointer"
                              title="4-Point Perspective Crop & Unskew"
                            >
                              <Crop className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleRotateCanvasItem(item.id, e)}
                              className="p-1 hover:bg-stone-100 rounded-md text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                              title="Rotate 90°"
                            >
                              <RotateCw className="w-3.5 h-3.5 text-brand" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleDuplicateCanvasItem(item.id, e)}
                              className="p-1 hover:bg-stone-100 rounded-md text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                              title="Duplicate"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* TAB 2: PASSPORT PHOTO GRID PREVIEW (16+ COPIES, LIVE TILING WITH ZERO-GAP) */}
              {activeMode === 'passport' && (
                <div
                  className="relative h-full max-h-full max-w-full bg-white rounded-xl shadow-2xl border-2 border-stone-400 p-2.5 sm:p-5 overflow-hidden text-stone-900 flex flex-col"
                  style={{
                    aspectRatio: '1 / 1.414',
                    height: '100%',
                    maxHeight: '100%',
                    maxWidth: '100%',
                    width: 'auto',
                  }}
                >
                  <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-stone-200 mb-2 sm:mb-3 shrink-0">
                    <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-stone-800">
                      Passport Sheet ({passportCount} Copies)
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                      3.5 × 4.5 cm
                    </span>
                  </div>

                  <div
                    className={`grid ${getPassportGridCols(passportCount) === 4
                        ? 'grid-cols-4'
                        : getPassportGridCols(passportCount) === 5
                          ? 'grid-cols-5'
                          : 'grid-cols-6'
                      } gap-0 border border-stone-300 w-full content-start items-start justify-center p-1 overflow-y-auto overflow-x-hidden flex-1`}
                  >
                    {Array.from({ length: passportCount }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-3.5/4.5 bg-stone-50 overflow-hidden relative border-r border-b border-stone-300 last:border-none"
                      >
                        {(activeItem?.url || imageSrc) && (
                          <img
                            src={activeItem?.url || imageSrc}
                            alt={`Passport Copy ${i + 1}`}
                            className="w-full h-full object-cover"
                            style={{
                              transform: `rotate(${activeItem?.rotation || 0}deg)`,
                              filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DEDICATED 4-POINT PERSPECTIVE CROPPER OVERLAY (MAX VERTICAL SPACE & PIXEL PERFECT MAPPING) */}
              {croppingItem && (
                <div className="absolute inset-0 bg-stone-950/95 z-50 p-2 sm:p-4 flex flex-col justify-between">
                  {/* Cropper Viewport with EXACT aspect-ratio tight wrapper */}
                  <div className="flex-1 my-1 sm:my-2 flex items-center justify-center overflow-hidden relative">
                    <div
                      ref={cropStageRef}
                      className="relative max-w-full max-h-full overflow-visible select-none shadow-2xl flex items-center justify-center bg-stone-900 rounded-sm"
                      style={{
                        aspectRatio: `${cropImgSize.w} / ${cropImgSize.h}`,
                        height: '100%',
                        maxHeight: '100%',
                        maxWidth: '100%',
                        width: 'auto',
                      }}
                    >
                      <img
                        src={croppingItem.rawUrl || croppingItem.url}
                        alt="Crop Viewport"
                        className="w-full h-full object-contain pointer-events-none rounded-xs"
                        onLoad={(e) => {
                          if (e.target.naturalWidth && e.target.naturalHeight) {
                            setCropImgSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })
                          }
                        }}
                        style={{
                          transform: `rotate(${croppingItem.rotation || 0}deg)`,
                        }}
                      />

                      {/* SVG Mask and Dual High-Contrast Quad Outline */}
                      <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible"
                      >
                        <defs>
                          <mask id="doc-full-crop-mask">
                            <rect x="0" y="0" width="100" height="100" fill="white" />
                            <polygon
                              points={`${docCorners[0].x},${docCorners[0].y} ${docCorners[1].x},${docCorners[1].y} ${docCorners[2].x},${docCorners[2].y} ${docCorners[3].x},${docCorners[3].y}`}
                              fill="black"
                            />
                          </mask>
                        </defs>

                        {/* Dim region outside crop box */}
                        <rect
                          x="0"
                          y="0"
                          width="100"
                          height="100"
                          fill="rgba(15, 23, 42, 0.45)"
                          mask="url(#doc-full-crop-mask)"
                        />

                        {/* Tint inside selected document */}
                        <polygon
                          points={`${docCorners[0].x},${docCorners[0].y} ${docCorners[1].x},${docCorners[1].y} ${docCorners[2].x},${docCorners[2].y} ${docCorners[3].x},${docCorners[3].y}`}
                          fill="rgba(240, 36, 92, 0.08)"
                        />

                        {/* High-Contrast White Underlay Stroke */}
                        <polygon
                          points={`${docCorners[0].x},${docCorners[0].y} ${docCorners[1].x},${docCorners[1].y} ${docCorners[2].x},${docCorners[2].y} ${docCorners[3].x},${docCorners[3].y}`}
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth="4"
                          vectorEffect="non-scaling-stroke"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />

                        {/* High-Visibility Brand Rose/Pink Stroke */}
                        <polygon
                          points={`${docCorners[0].x},${docCorners[0].y} ${docCorners[1].x},${docCorners[1].y} ${docCorners[2].x},${docCorners[2].y} ${docCorners[3].x},${docCorners[3].y}`}
                          fill="none"
                          stroke="#F0245C"
                          strokeWidth="2.5"
                          vectorEffect="non-scaling-stroke"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />
                      </svg>

                      {/* 4 Draggable Corner Magnifier Pins */}
                      {docCorners.map((pt, cIdx) => (
                        <div
                          key={cIdx}
                          onMouseDown={(e) => handleStartCornerDrag(cIdx, e)}
                          onTouchStart={(e) => handleStartCornerDrag(cIdx, e)}
                          className="absolute z-40 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing group pointer-events-auto touch-none"
                          style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                        >
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand/35 border-2 border-white flex items-center justify-center shadow-2xl transition-transform group-hover:scale-125">
                            <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-brand shadow-md" />
                          </div>
                          <span className="absolute -top-4.5 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[7px] sm:text-[8px] font-black px-1 py-0.2 rounded shadow-xs pointer-events-none">
                            {cIdx === 0 ? 'TL' : cIdx === 1 ? 'TR' : cIdx === 2 ? 'BR' : 'BL'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cropper Bottom Action Controls */}
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl shadow-lg shrink-0 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCroppingItem(null)}
                      className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleApplyCropAndSave}
                      disabled={isProcessing}
                      className="px-4 py-1.5 sm:px-5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-lg cursor-pointer shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-3" />
                          <span>Save</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR: Controls & Tools */}
            <div className="flex-1 md:w-85 lg:w-95 bg-white p-3.5 sm:p-5 flex flex-col justify-between overflow-visible md:overflow-y-auto shrink-0 gap-4">

              {/* SIDEBAR CONTENT: TAB 1 (DOC SCANNER & MULTI-LAYOUT) */}
              {activeMode === 'doc_studio' && (
                <div className="flex flex-col gap-3.5 sm:gap-4">
                  {/* Add Images & Document List */}
                  <div className="flex flex-col gap-2.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                      Document Images ({canvasItems.length})
                    </label>

                    {/* Parallel Action Buttons: [ + Add Images ] and [ 📐 Perspective Crop ] */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => multiFileInputRef.current?.click()}
                        className="py-2.5 px-3 bg-brand hover:bg-rose-700 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                      >
                        <Plus className="w-4 h-4 shrink-0" />
                        <span className="truncate">Add Images</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (activeItem) handleOpenCropForItem(activeItem)
                          else if (canvasItems[0]) handleOpenCropForItem(canvasItems[0])
                        }}
                        className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-brand rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                      >
                        <Crop className="w-4 h-4 shrink-0" />
                        <span className="truncate">Perspective Crop</span>
                      </button>
                    </div>

                    {/* Thumbnail List */}
                    <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-stone-50 rounded-xl border border-stone-200">
                      {canvasItems.map((item, idx) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItemId(item.id)}
                          className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors shadow-2xs ${selectedItemId === item.id
                              ? 'bg-purple-50 border border-purple-600 text-stone-900 font-bold'
                              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/80'
                            }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-5 h-5 rounded bg-stone-100 text-brand flex items-center justify-center text-[10px] font-bold shrink-0 border border-stone-200">
                              {idx + 1}
                            </div>
                            <span className="text-xs truncate max-w-28 sm:max-w-36">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenCropForItem(item)
                              }}
                              className="p-1 hover:text-brand text-stone-600 cursor-pointer"
                              title="Crop"
                            >
                              <Crop className="w-3.5 h-3.5 text-brand" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleRotateCanvasItem(item.id, e)}
                              className="p-1 hover:text-brand text-stone-500 cursor-pointer"
                              title="Rotate +90°"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCanvasItem(item.id, e)}
                              className="p-1 hover:text-rose-600 text-stone-400 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Brightness & Contrast Sliders */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                      Image Brightness &amp; Contrast
                    </label>
                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-700 font-bold">Brightness ({brightness}%)</span>
                        <input
                          type="range"
                          min="50"
                          max="180"
                          value={brightness}
                          onChange={(e) => setBrightness(Number(e.target.value))}
                          className="w-28 sm:w-32 accent-brand cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-700 font-bold">Contrast ({contrast}%)</span>
                        <input
                          type="range"
                          min="50"
                          max="200"
                          value={contrast}
                          onChange={(e) => setContrast(Number(e.target.value))}
                          className="w-28 sm:w-32 accent-brand cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SIDEBAR CONTENT: TAB 2 (PASSPORT PHOTO GRID - 16+ COPIES & ZERO-GAP) */}
              {activeMode === 'passport' && (
                <div className="flex flex-col gap-3.5 sm:gap-4">
                  {/* Preset Buttons for Passport Copies (16 and above) */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                      Number of Passport Copies (16+)
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[16, 20, 24, 30, 32, 36, 40, 48].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setPassportCount(count)}
                          className={`py-2 rounded-xl border text-center font-extrabold text-xs cursor-pointer transition-all shadow-2xs ${passportCount === count
                              ? 'bg-purple-600 border-purple-600 text-white shadow-xs'
                              : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                            }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STICKY BOTTOM EXPORT & SAVE CONTROLS */}
              <div className="pt-2 sm:pt-3 pb-10 sm:pb-2 border-t border-stone-200/80 flex flex-col gap-2 shrink-0">
                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={handleSaveAndApply}
                  disabled={isProcessing}
                  className="btn btn-primary w-full py-3.5 sm:py-4 text-xs sm:text-sm font-extrabold shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Print Document...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-3" />
                      <span>Apply &amp; Print Document</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

          {/* Hidden File Input for Adding Multiple Images / Documents */}
          <input
            type="file"
            ref={multiFileInputRef}
            onChange={handleAddMultipleFiles}
            multiple
            accept="image/*"
            className="hidden"
          />
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
