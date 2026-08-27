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
  getPassportGridDimensions,
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

  // Load Initial Image with Dynamic Natural Aspect Ratio Fitting
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile)
      setImageSrc(url)

      const img = new Image()
      img.onload = () => {
        const naturalW = img.naturalWidth || 1000
        const naturalH = img.naturalHeight || 1000
        const imgAspect = naturalW / naturalH // (width / height)

        // For bounding box to tightly fit the image on A4 canvas (1 / 1.4142 page aspect):
        // Physical aspect = (w / h) * (1 / 1.4142) = imgAspect
        // So h = w / (imgAspect * 1.4142)
        let initialW = 76
        let initialH = initialW / (imgAspect * 1.4142)

        // If portrait/tall flyer/document, limit height so it fits comfortably on page
        if (initialH > 78) {
          initialH = 78
          initialW = initialH * (imgAspect * 1.4142)
        }
        if (initialW > 88) {
          initialW = 88
          initialH = initialW / (imgAspect * 1.4142)
        }

        initialW = Math.round(initialW * 10) / 10
        initialH = Math.round(initialH * 10) / 10
        const initialX = Math.round(Math.max(2, (100 - initialW) / 2) * 10) / 10
        const initialY = Math.round(Math.max(4, (100 - initialH) / 2) * 10) / 10

        const initialItem = {
          id: 'item_' + Date.now(),
          url,
          rawUrl: url,
          name: imageFile.name || 'Document 1',
          x: initialX,
          y: initialY,
          width: initialW,
          height: initialH,
          aspectRatio: imgAspect,
          naturalWidth: naturalW,
          naturalHeight: naturalH,
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
      }

      img.onerror = () => {
        const fallbackItem = {
          id: 'item_' + Date.now(),
          url,
          rawUrl: url,
          name: imageFile.name || 'Document 1',
          x: 12,
          y: 8,
          width: 76,
          height: 42,
          aspectRatio: 1.25,
          rotation: 0,
          corners: [
            { x: 5, y: 5 },
            { x: 95, y: 5 },
            { x: 95, y: 95 },
            { x: 5, y: 95 },
          ],
        }
        setCanvasItems([fallbackItem])
        setSelectedItemId(fallbackItem.id)
      }
      img.src = url

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
            const aspect =
              origItem.aspectRatio ||
              (origItem.naturalWidth && origItem.naturalHeight ? origItem.naturalWidth / origItem.naturalHeight : null) ||
              origItem.width / (origItem.height * 1.4142) ||
              1
            const effectiveAspect = origItem.rotation % 180 === 0 ? aspect : 1 / aspect
            let newW = Math.max(10, Math.min(100 - origItem.x, origItem.width + deltaXPercent))
            let newH = newW / (effectiveAspect * 1.4142)
            if (origItem.y + newH > 100) {
              newH = 100 - origItem.y
              newW = newH * (effectiveAspect * 1.4142)
            }
            return {
              ...item,
              width: Math.round(newW * 10) / 10,
              height: Math.round(newH * 10) / 10,
            }
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
    if (item.naturalWidth && item.naturalHeight) {
      setCropImgSize({ w: item.naturalWidth, h: item.naturalHeight })
    }
    // Pre-calculate image natural dimensions if not already stored
    const img = new Image()
    img.src = item.rawUrl || item.url
    img.onload = () => {
      setCropImgSize({ w: img.naturalWidth || 4, h: img.naturalHeight || 3 })
    }
    setDocCorners(
      item.corners && item.corners.length === 4
        ? item.corners.map((c) => ({ ...c }))
        : [
            { x: 2, y: 2 },
            { x: 98, y: 2 },
            { x: 98, y: 98 },
            { x: 2, y: 98 },
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
      const actualW = croppedCanvas.width
      const actualH = croppedCanvas.height
      const cropAspect = actualW / actualH // aspect ratio (w / h)

      // Calculate width and height on A4 canvas (physical ratio 1 / 1.4142):
      // physical aspect = (w / h) * (1 / 1.4142) = cropAspect
      // Therefore: h = w / (cropAspect * 1.4142)
      let newW = croppingItem.width
      let newH = newW / (cropAspect * 1.4142)

      // Cap bounds if needed
      if (newH > 85) {
        newH = 85
        newW = newH * (cropAspect * 1.4142)
      }
      if (newW > 92) {
        newW = 92
        newH = newW / (cropAspect * 1.4142)
      }

      newW = Math.round(newW * 10) / 10
      newH = Math.round(newH * 10) / 10

      // Re-center around previous center
      const centerX = croppingItem.x + croppingItem.width / 2
      const centerY = croppingItem.y + croppingItem.height / 2
      const newX = Math.round(Math.max(1, Math.min(100 - newW - 1, centerX - newW / 2)) * 10) / 10
      const newY = Math.round(Math.max(2, Math.min(100 - newH - 2, centerY - newH / 2)) * 10) / 10

      setCanvasItems((prev) =>
        prev.map((it) =>
          it.id === croppingItem.id
            ? {
                ...it,
                url: croppedDataUrl,
                rawUrl: croppedDataUrl,
                x: newX,
                y: newY,
                width: newW,
                height: newH,
                aspectRatio: cropAspect,
                naturalWidth: actualW,
                naturalHeight: actualH,
                rotation: 0, // Rotation is baked into croppedCanvas by renderPerspectiveCropCanvas
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

    files.forEach((file, idx) => {
      const url = URL.createObjectURL(file)
      const slotIndex = canvasItems.length + idx

      const img = new Image()
      img.onload = () => {
        const naturalW = img.naturalWidth || 1000
        const naturalH = img.naturalHeight || 1000
        const imgAspect = naturalW / naturalH

        let initialW = 76
        let initialH = initialW / (imgAspect * 1.4142)
        if (initialH > 44) {
          initialH = 44
          initialW = initialH * (imgAspect * 1.4142)
        }
        if (initialW > 88) {
          initialW = 88
          initialH = initialW / (imgAspect * 1.4142)
        }
        initialW = Math.round(initialW * 10) / 10
        initialH = Math.round(initialH * 10) / 10

        const newItem = {
          id: 'item_' + Date.now() + '_' + idx,
          url,
          rawUrl: url,
          name: file.name || `Document ${slotIndex + 1}`,
          x: Math.round(Math.max(2, (100 - initialW) / 2) * 10) / 10,
          y: Math.min(55, 6 + slotIndex * 22),
          width: initialW,
          height: initialH,
          aspectRatio: imgAspect,
          naturalWidth: naturalW,
          naturalHeight: naturalH,
          rotation: 0,
          corners: [
            { x: 5, y: 5 },
            { x: 95, y: 5 },
            { x: 95, y: 95 },
            { x: 5, y: 95 },
          ],
        }

        setCanvasItems((prev) => [...prev, newItem])
        setSelectedItemId(newItem.id)
      }
      img.src = url
    })

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
      prev.map((item) => {
        if (item.id !== id) return item
        const newRotation = (item.rotation + 90) % 360
        const aspect =
          item.aspectRatio ||
          (item.naturalWidth && item.naturalHeight ? item.naturalWidth / item.naturalHeight : null) ||
          item.width / (item.height * 1.4142) ||
          1
        const effectiveAspect = newRotation % 180 === 0 ? aspect : 1 / aspect
        const centerX = item.x + item.width / 2
        const centerY = item.y + item.height / 2
        let newW = item.height * (effectiveAspect * 1.4142)
        let newH = item.height
        if (newW > 92) {
          newW = 88
          newH = newW / (effectiveAspect * 1.4142)
        }
        if (newH > 86) {
          newH = 80
          newW = newH * (effectiveAspect * 1.4142)
        }
        const newX = Math.max(1, Math.min(100 - newW - 1, centerX - newW / 2))
        const newY = Math.max(1, Math.min(100 - newH - 1, centerY - newH / 2))
        return {
          ...item,
          rotation: newRotation,
          width: Math.round(newW * 10) / 10,
          height: Math.round(newH * 10) / 10,
          x: Math.round(newX * 10) / 10,
          y: Math.round(newY * 10) / 10,
        }
      })
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
        // Mode 2: Passport Photo Grid (Full-page edge-to-edge layout, zero dead margins & aspect ratio preservation)
        const primaryImageSrc = activeItem?.rawUrl || activeItem?.url || imageSrc
        finalCanvas = await renderPassportGridCanvas({
          imageSrc: primaryImageSrc,
          copiesCount: passportCount,
          showCutLines: true,
          noGap: true,
          rotation: activeItem?.rotation || 0,
          filters: { brightness, contrast },
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
                        {/* Image Content - Auto-fits edge-to-edge with 0 gap */}
                        <div className="w-full h-full relative overflow-hidden rounded-xs">
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-fill pointer-events-none select-none"
                            style={{
                              transform: `rotate(${item.rotation}deg)`,
                              filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                            }}
                            onLoad={(e) => {
                              const nw = e.target.naturalWidth
                              const nh = e.target.naturalHeight
                              if (nw && nh) {
                                const effectiveRot = item.rotation || 0
                                const naturalAspect = nw / nh
                                const targetAspect = effectiveRot % 180 === 0 ? naturalAspect : 1 / naturalAspect
                                const currentBoxAspect = item.width / (item.height * 1.4142)

                                // If bounding box aspect ratio differs from image by > 1.5%, auto-snap height
                                if (Math.abs(currentBoxAspect - targetAspect) > 0.015) {
                                  const snappedH = Math.round((item.width / (targetAspect * 1.4142)) * 10) / 10
                                  setCanvasItems((prev) =>
                                    prev.map((it) =>
                                      it.id === item.id
                                        ? {
                                            ...it,
                                            height: Math.max(6, Math.min(94, snappedH)),
                                            aspectRatio: targetAspect,
                                            naturalWidth: nw,
                                            naturalHeight: nh,
                                          }
                                        : it
                                    )
                                  )
                                }
                              }
                            }}
                          />
                        </div>

                        {/* 1. TOP-RIGHT CORNER: COMPACT RED DELETE ICON */}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCanvasItem(item.id, e)}
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md border border-white cursor-pointer z-40 transition-transform hover:scale-115 active:scale-95"
                          title="Delete image"
                        >
                          <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[2.5]" />
                        </button>

                        {/* 2. BOTTOM-RIGHT CORNER: COMPACT PURPLE RESIZE HANDLE */}
                        <div
                          onMouseDown={(e) => handleStartCanvasDrag('resize_br', item, e)}
                          onTouchStart={(e) => handleStartCanvasDrag('resize_br', item, e)}
                          className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-md border border-white cursor-se-resize z-40 transition-transform hover:scale-115 active:scale-95 touch-none"
                          title="Resize card"
                        >
                          <Maximize2 className="w-2 h-2 sm:w-2.5 sm:h-2.5 rotate-90" />
                        </div>

                        {/* FLOATING ACTION PILL (COMPACT ICON-ONLY FOR MOBILE) */}
                        {isSelected && (
                          <div
                            className="absolute -top-6 sm:-top-7 left-0 z-40 flex items-center gap-0.5 bg-white/95 backdrop-blur-xs text-stone-800 px-1 py-0.5 rounded-md shadow-md border border-stone-200 pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenCropForItem(item)
                              }}
                              className="p-0.5 sm:p-1 hover:bg-rose-50 text-brand rounded transition-colors cursor-pointer"
                              title="4-Point Perspective Crop & Unskew"
                            >
                              <Crop className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleRotateCanvasItem(item.id, e)}
                              className="p-0.5 sm:p-1 hover:bg-stone-100 rounded text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                              title="Rotate 90°"
                            >
                              <RotateCw className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-brand" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleDuplicateCanvasItem(item.id, e)}
                              className="p-0.5 sm:p-1 hover:bg-stone-100 rounded text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                              title="Duplicate"
                            >
                              <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* TAB 2: PASSPORT PHOTO GRID PREVIEW (16+ COPIES, LIVE FULL PAGE TILING) */}
              {activeMode === 'passport' && (
                <div
                  className="relative h-full max-h-full max-w-full bg-white rounded-xl shadow-2xl border-2 border-stone-400 p-0 overflow-hidden text-stone-900 flex flex-col"
                  style={{
                    aspectRatio: '1 / 1.414',
                    height: '100%',
                    maxHeight: '100%',
                    maxWidth: '100%',
                    width: 'auto',
                  }}
                >
                  <div
                    className="grid w-full h-full gap-0 overflow-hidden"
                    style={{
                      gridTemplateColumns: `repeat(${getPassportGridDimensions(passportCount).cols}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${getPassportGridDimensions(passportCount).rows}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: passportCount }).map((_, i) => (
                      <div
                        key={i}
                        className="w-full h-full bg-stone-50 overflow-hidden relative border-r border-b border-stone-200"
                      >
                        {(activeItem?.rawUrl || activeItem?.url || imageSrc) && (
                          <img
                            src={activeItem?.rawUrl || activeItem?.url || imageSrc}
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
