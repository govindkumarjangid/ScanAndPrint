import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crop,
  X,
  Check,
  RotateCw,
  Plus,
  Trash2,
  Loader2,
  Layers,
  Maximize2,
  Sparkles,
  ScanLine,
  Grid,
  RefreshCw,
  Copy,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  renderPerspectiveCropCanvas,
  renderA4MultiImageCanvas,
  renderPassportGridPages,
  canvasesToPdfFile,
  canvasToPdfFile,
} from '../../lib/kioskCanvasUtil'
import toast from 'react-hot-toast'
import {
  createImageElement,
  detectCardCorners,
  extractCardPerspective,
} from '../../utils/jscanifyUtil'

import { getNonOverlappingSlot } from '../../utils/kioskSlots'
import KioskPerspectiveModal from './studio/KioskPerspectiveModal'
import KioskPassportTab from './studio/KioskPassportTab'

export default function KioskStudioModal({ imageFile, imageFiles = [], isOpen, onClose, onSave, photoRates = {} }) {

  const [activeMode, setActiveMode] = useState('doc_studio')
  const [isProcessing, setIsProcessing] = useState(false)


  const [imageSrc, setImageSrc] = useState(null)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)

  const [canvasItems, setCanvasItems] = useState([])
  const [selectedItemId, setSelectedItemId] = useState(null)

  const multiFileInputRef = useRef(null)
  const a4CanvasRef = useRef(null)
  const [canvasDragState, setCanvasDragState] = useState(null)

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

  const [passportCount, setPassportCount] = useState(16) // 16, 20, 24, 30, 32, 36, 40, 48
  const [passportPreviewPage, setPassportPreviewPage] = useState(1)
  const passportTotalPages = Math.ceil(passportCount / 30)

  useEffect(() => {
    if (passportPreviewPage > passportTotalPages) {
      const timer = setTimeout(() => setPassportPreviewPage(1), 0)
      return () => clearTimeout(timer)
    }
  }, [passportPreviewPage, passportTotalPages])

  // Load Images (single or multiple) with Non-Overlapping A4 Grid Layout
  useEffect(() => {
    const filesToLoad = (imageFiles && imageFiles.length > 0) ? imageFiles : (imageFile ? [imageFile] : [])
    if (!filesToLoad.length) return

    const loadAll = async () => {
      const items = await Promise.all(
        filesToLoad.map((file, idx) => {
          return new Promise((resolve) => {
            const url = URL.createObjectURL(file)
            const img = new Image()
            img.onload = () => {
              const naturalW = img.naturalWidth || 1000
              const naturalH = img.naturalHeight || 1000

              // Calculate clean, non-overlapping default slot on A4
              const slot = getNonOverlappingSlot(idx, filesToLoad.length)

              resolve({
                id: `img_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`,
                file,
                url,
                imgElement: img,
                naturalW,
                naturalH,
                // A4 relative percent coordinates (non-overlapping)
                x: slot.x,
                y: slot.y,
                width: slot.width,
                height: slot.height,
                rotation: 0,
                flipH: false,
                flipV: false,
                isXerox: false,
                corners: [
                  { x: 0, y: 0 },
                  { x: 100, y: 0 },
                  { x: 100, y: 100 },
                  { x: 0, y: 100 },
                ],
              })
            }
            img.onerror = () => {
              const slot = getNonOverlappingSlot(idx, filesToLoad.length)
              resolve({
                id: `img_${Date.now()}_${idx}`,
                file,
                url,
                imgElement: img,
                naturalW: 1000,
                naturalH: 1000,
                x: slot.x,
                y: slot.y,
                width: slot.width,
                height: slot.height,
                rotation: 0,
                flipH: false,
                flipV: false,
                isXerox: false,
                corners: [
                  { x: 0, y: 0 },
                  { x: 100, y: 0 },
                  { x: 100, y: 100 },
                  { x: 0, y: 100 },
                ],
              })
            }
            img.src = url
          })
        })
      )

      setCanvasItems(items)
      if (items.length > 0) {
        setSelectedItemId(items[0].id)
        setImageSrc(items[0].url)
      }
      setBrightness(100)
      setContrast(100)
      setPassportCount(16)
    }

    loadAll()
  }, [imageFile, imageFiles])

  // Get active item
  const activeItem = canvasItems.find((i) => i.id === selectedItemId) || canvasItems[0] || null


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

  const [isAutoScanningAll, setIsAutoScanningAll] = useState(false)
  const [isDetectingCropItem, setIsDetectingCropItem] = useState(false)

  // 1-Click Master Auto-Crop & 2-in-1 Alignment for ID Cards / Documents
  const handleAutoScanAndAlignAll = async () => {
    if (!canvasItems.length) {
      toast.error('Please add images first')
      return
    }

    setIsAutoScanningAll(true)
    const toastId = toast.loading('⚡ Auto-scanning document borders & removing background...')

    try {
      const updatedItems = []

      for (let i = 0; i < canvasItems.length; i++) {
        const item = canvasItems[i]
        const src = item.rawUrl || item.url
        try {
          const img = await createImageElement(src)
          const { cornersPct } = await detectCardCorners(img)
          const { dataUrl } = await extractCardPerspective(img, cornersPct, 1400, 85.6 / 53.98)

          updatedItems.push({
            ...item,
            rawUrl: src,
            url: dataUrl,
            corners: [
              { x: 0, y: 0 },
              { x: 100, y: 0 },
              { x: 100, y: 100 },
              { x: 0, y: 100 },
            ],
            rotation: 0,
          })
        } catch (err) {
          console.warn(`Auto-scan failed for item ${item.name}:`, err)
          updatedItems.push(item)
        }
      }

      // Automatically align documents on the A4 page
      const total = updatedItems.length

      if (total === 2) {
        const cardW = 72
        const cardH = 32.1
        const cardX = 14

        updatedItems[0] = {
          ...updatedItems[0],
          x: cardX,
          y: 10,
          width: cardW,
          height: cardH,
          aspectRatio: 85.6 / 53.98,
        }
        updatedItems[1] = {
          ...updatedItems[1],
          x: cardX,
          y: 57.5,
          width: cardW,
          height: cardH,
          aspectRatio: 85.6 / 53.98,
        }
      } else if (total === 1) {
        // Single Document: centered on page
        const cardW = 76
        const cardH = 33.9
        const cardX = 12
        const cardY = 33
        updatedItems[0] = {
          ...updatedItems[0],
          x: cardX,
          y: cardY,
          width: cardW,
          height: cardH,
          aspectRatio: 85.6 / 53.98,
        }
      } else {
        // 3+ items: distribute cleanly across quadrants
        updatedItems.forEach((it, idx) => {
          const slot = getNonOverlappingSlot(idx, total)
          updatedItems[idx] = {
            ...it,
            ...slot,
          }
        })
      }

      setCanvasItems(updatedItems)
      toast.success(
        total === 2
          ? '⚡ Both cards auto-cropped & aligned 2-in-1 on A4!'
          : '⚡ Documents auto-cropped & aligned on A4!',
        { id: toastId }
      )
    } catch (err) {
      console.error('Auto-scan all error:', err)
      toast.error('Failed to auto-scan documents: ' + (err.message || 'Unknown error'), { id: toastId })
    } finally {
      setIsAutoScanningAll(false)
    }
  }

  // Auto-detect corners inside the 4-point cropper overlay
  const handleAutoDetectInCropper = async () => {
    if (!croppingItem) return
    setIsDetectingCropItem(true)
    try {
      const src = croppingItem.rawUrl || croppingItem.url
      const img = await createImageElement(src)
      const { cornersPct } = await detectCardCorners(img)
      setDocCorners(cornersPct)
      toast.success('⚡ Card corners auto-detected!')
    } catch (err) {
      console.warn('Cropper auto-detect error:', err)
      toast.error('Could not detect card corners automatically')
    } finally {
      setIsDetectingCropItem(false)
    }
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

  const handleAddMultipleFiles = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const newTotal = canvasItems.length + files.length

    files.forEach((file, idx) => {
      const url = URL.createObjectURL(file)
      const slotIndex = canvasItems.length + idx
      const slot = getNonOverlappingSlot(slotIndex, newTotal)

      const img = new Image()
      img.onload = () => {
        const naturalW = img.naturalWidth || 1000
        const naturalH = img.naturalHeight || 1000
        const imgAspect = naturalW / naturalH

        const newItem = {
          id: 'item_' + Date.now() + '_' + slotIndex,
          url,
          rawUrl: url,
          name: file.name || `Document ${slotIndex + 1}`,
          x: slot.x,
          y: slot.y,
          width: slot.width,
          height: slot.height,
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
    setCroppingItem(null)
    toast.success('Reset to original')
  }

  const handleSaveAndApply = async () => {
    if (!canvasItems.length && !imageSrc) return
    setIsProcessing(true)

    try {
      let generatedFile = null
      const fileNameBase = imageFile?.name ? imageFile.name.replace(/\.[^/.]+$/, '') : 'document'

      if (activeMode === 'doc_studio') {
        // Mode 1: All-in-One Multi-Image A4 Canvas (with 4-Point Cropping, Position, Scale, Rotation)
        const finalCanvas = await renderA4MultiImageCanvas({
          items: canvasItems,
          showCutLine: false,
          showBorder: false,
          globalFilters: { brightness, contrast },
        })
        if (!finalCanvas) throw new Error('Failed to generate document canvas')
        generatedFile = await canvasToPdfFile(finalCanvas, `${fileNameBase}_print.pdf`)
        toast.success('A4 PDF Document ready for printing!')
      } else if (activeMode === 'passport') {
        // Mode 2: Passport Photo Grid (35mm x 45mm Fixed Size, Top-Down Fill, Multi-Page Overflow)
        const primaryImageSrc = activeItem?.rawUrl || activeItem?.url || imageSrc
        const canvases = await renderPassportGridPages({
          imageSrc: primaryImageSrc,
          copiesCount: passportCount,
          showCutLines: true,
          rotation: activeItem?.rotation || 0,
          filters: { brightness, contrast },
        })
        if (!canvases || !canvases.length) throw new Error('Failed to generate passport photo canvases')
        generatedFile = await canvasesToPdfFile(canvases, `${fileNameBase}_passport_${passportCount}.pdf`)
        toast.success(
          `Passport Photo Document (${passportCount} copies, ${canvases.length} page${canvases.length > 1 ? 's' : ''}) ready!`
        )
      }

      if (activeMode === 'passport') {
        onSave(generatedFile, { mode: 'passport', passportCount })
      } else {
        onSave(generatedFile, { mode: 'doc_studio' })
      }
    } catch (err) {
      console.error('Error generating document:', err)
      toast.error('Failed to process image: ' + (err.message || 'Unknown error'))
    } finally {
      setIsProcessing(false)
    }
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

          {/* Main Studio Workspace */}
          <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden min-h-0 relative">

            {/* LEFT / CENTER: Clean Light Mode Canvas Viewport */}
            <div className="h-[46vh] xs:h-[50vh] sm:h-[54vh] md:h-auto md:flex-1 bg-stone-200/80 p-3 sm:p-6 flex items-center justify-center overflow-hidden relative select-none border-b md:border-b-0 md:border-r border-stone-300 shrink-0">

              {/* TAB 1: ALL-IN-ONE A4 CANVAS (ADD, DRAG, CORNER RESIZE, CLICK TRASH TO DELETE) */}
              {activeMode === 'doc_studio' && (
                <div
                  ref={a4CanvasRef}
                  onClick={() => setSelectedItemId(null)}
                  className="relative h-full max-h-full max-w-full bg-white rounded-none shadow-[0_10px_35px_-5px_rgba(0,0,0,0.3)] border-0 overflow-hidden text-stone-900 select-none"
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
                  {canvasItems.map((item) => {
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

              {/* TAB 2: PASSPORT PHOTO GRID PREVIEW (35x45mm True Fixed Size, Top-Down Fill, Multi-Page) */}
              {activeMode === 'passport' && (
                <div className="relative h-full max-h-full max-w-full flex items-center justify-center">
                  {/* Floating Page Switcher for >30 copies */}
                  {passportTotalPages > 1 && (
                    <div className="absolute top-2 z-30 bg-stone-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2.5 shadow-lg border border-stone-700/80">
                      <button
                        type="button"
                        disabled={passportPreviewPage === 1}
                        onClick={() => setPassportPreviewPage((p) => Math.max(1, p - 1))}
                        className="p-0.5 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-white cursor-pointer"
                        title="Previous Page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="font-mono">
                        Page {passportPreviewPage} of {passportTotalPages} ({passportPreviewPage === 1 ? 30 : passportCount - 30} Photos)
                      </span>
                      <button
                        type="button"
                        disabled={passportPreviewPage === passportTotalPages}
                        onClick={() => setPassportPreviewPage((p) => Math.min(passportTotalPages, p + 1))}
                        className="p-0.5 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-white cursor-pointer"
                        title="Next Page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div
                    className="relative h-full max-h-full max-w-full bg-white rounded-none shadow-[0_10px_35px_-5px_rgba(0,0,0,0.3)] border-0 p-0 overflow-hidden text-stone-900 select-none"
                    style={{
                      aspectRatio: '1 / 1.414',
                      height: '100%',
                      maxHeight: '100%',
                      maxWidth: '100%',
                      width: 'auto',
                    }}
                  >
                    {/* Render each photo on current page with fixed 35x45mm percentage dimensions and cutting border */}
                    {Array.from({
                      length: passportPreviewPage === 1 ? Math.min(30, passportCount) : Math.max(0, passportCount - 30),
                    }).map((_, i) => {
                      const col = i % 5
                      const row = Math.floor(i / 5)
                      const colWidthPct = 16.667 // 35mm / 210mm
                      const rowHeightPct = 15.152 // 45mm / 297mm
                      const marginLeftPct = 4.76 // 10mm
                      const gapXPct = 1.785 // 3.75mm
                      const marginTopPct = 3.2 // 9.5mm
                      const gapYPct = 0.54 // 1.6mm
                      const left = marginLeftPct + col * (colWidthPct + gapXPct)
                      const top = marginTopPct + row * (rowHeightPct + gapYPct)

                      return (
                        <div
                          key={i}
                          className="absolute bg-white overflow-hidden border border-stone-300 shadow-2xs"
                          style={{
                            left: `${left}%`,
                            top: `${top}%`,
                            width: `${colWidthPct}%`,
                            height: `${rowHeightPct}%`,
                          }}
                        >
                          {(activeItem?.rawUrl || activeItem?.url || imageSrc) && (
                            <img
                              src={activeItem?.rawUrl || activeItem?.url || imageSrc}
                              alt={`Passport Copy ${i + 1}`}
                              className="w-full h-full object-cover pointer-events-none select-none"
                              style={{
                                transform: `rotate(${activeItem?.rotation || 0}deg)`,
                                filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                              }}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* DEDICATED 4-POINT PERSPECTIVE CROPPER OVERLAY */}
              {croppingItem && (
                <KioskPerspectiveModal
                  croppingItem={croppingItem}
                  cropImgSize={cropImgSize}
                  setCropImgSize={setCropImgSize}
                  docCorners={docCorners}
                  onCornerDragStart={handleStartCornerDrag}
                  onClose={() => setCroppingItem(null)}
                  onAutoDetect={handleAutoDetectInCropper}
                  isDetecting={isDetectingCropItem}
                  onApply={handleApplyCropAndSave}
                  isProcessing={isProcessing}
                  cropStageRef={cropStageRef}
                />
              )}
            </div>

            {/* RIGHT SIDEBAR: Controls & Tools */}
            <div className="flex-1 md:w-85 lg:w-95 bg-white p-3.5 sm:p-5 flex flex-col justify-between overflow-visible md:overflow-y-auto shrink-0 gap-4">

              {/* SIDEBAR CONTENT: TAB 1 (DOC SCANNER & MULTI-LAYOUT) */}
              {activeMode === 'doc_studio' && (
                <div className="flex flex-col gap-3.5 sm:gap-4">
                  {/* Add Images & Document List */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                        Document Images ({canvasItems.length})
                      </label>
                    </div>

                    {/* 1-Click Master Auto-Crop & 2-in-1 Align Button */}
                    <button
                      type="button"
                      onClick={handleAutoScanAndAlignAll}
                      disabled={isAutoScanningAll || !canvasItems.length}
                      className="w-full py-3 px-3.5 bg-linear-to-r from-amber-500 via-rose-500 to-brand hover:from-amber-600 hover:to-rose-700 text-white rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-rose-400/30"
                      title="Automatically detect document borders, strip background, and align cards 2-in-1 on A4"
                    >
                      {isAutoScanningAll ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                          <span>Scanning &amp; Aligning...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-200 fill-amber-200 shrink-0" />
                          <span>⚡ 1-Click Auto-Crop &amp; Align (2-in-1)</span>
                        </>
                      )}
                    </button>

                    {/* Parallel Action Buttons: [ + Add Images ] and [ 📐 Perspective Crop ] */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => multiFileInputRef.current?.click()}
                        className="py-2.5 px-3 bg-stone-900 hover:bg-black text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
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
                        className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                      >
                        <Crop className="w-4 h-4 shrink-0 text-brand" />
                        <span className="truncate">Adjust Crop</span>
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

              {/* SIDEBAR CONTENT: TAB 2 (PASSPORT PHOTO GRID) */}
              {activeMode === 'passport' && (
                <KioskPassportTab
                  passportCount={passportCount}
                  setPassportCount={setPassportCount}
                  photoRates={photoRates}
                />
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
