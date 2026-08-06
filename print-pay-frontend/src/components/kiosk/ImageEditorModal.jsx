import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Check,
  RotateCcw as ResetIcon,
  Sparkles,
  Move,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react'

export default function ImageEditorModal({ imageFile, isOpen, onClose, onSave }) {
  const [imageSrc, setImageSrc] = useState(null)
  const [imgElement, setImgElement] = useState(null)

  // Edit States
  const [rotation, setRotation] = useState(0) // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [isGrayscale, setIsGrayscale] = useState(false)
  const [zoom, setZoom] = useState(1.0) // 0.5 to 3.0

  // Interactive Crop Box Percentages (0 to 100)
  const [crop, setCrop] = useState({ x: 10, y: 10, width: 80, height: 80 })
  const [isDraggingCrop, setIsDraggingCrop] = useState(false)
  const [isResizingCrop, setIsResizingCrop] = useState(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const containerRef = useRef(null)

  // Load image file into ObjectURL and HTMLImageElement
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile)
      setImageSrc(url)

      const img = new Image()
      img.onload = () => setImgElement(img)
      img.src = url

      return () => URL.revokeObjectURL(url)
    }
  }, [imageFile])

  if (!isOpen || !imageFile) return null

  // Reset all edits and zoom/crop box
  const handleReset = () => {
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
    setBrightness(100)
    setContrast(100)
    setIsGrayscale(false)
    setZoom(1.0)
    setCrop({ x: 10, y: 10, width: 80, height: 80 })
  }

  // Zoom Helpers
  const handleZoomIn = () => setZoom((prev) => Math.min(3.0, Number((prev + 0.15).toFixed(2))))
  const handleZoomOut = () => setZoom((prev) => Math.max(0.5, Number((prev - 0.15).toFixed(2))))

  // Rotate 90 deg
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  // Crop Ratio Presets
  const setCropPreset = (ratio) => {
    if (ratio === '1:1') {
      setCrop({ x: 15, y: 15, width: 70, height: 70 })
    } else if (ratio === '4:3') {
      setCrop({ x: 10, y: 15, width: 80, height: 60 })
    } else if (ratio === 'A4') {
      setCrop({ x: 15, y: 5, width: 70, height: 90 })
    } else if (ratio === 'PASSPORT') {
      setCrop({ x: 25, y: 10, width: 50, height: 65 })
    } else {
      setCrop({ x: 5, y: 5, width: 90, height: 90 }) // FULL
    }
  }

  // Mouse & Touch Drag Event Handlers for Crop Box
  const handleMouseDown = (e, type) => {
    e.preventDefault()
    e.stopPropagation()
    const clientX = e.clientX || (e.touches && e.touches[0].clientX)
    const clientY = e.clientY || (e.touches && e.touches[0].clientY)

    setDragStart({ x: clientX, y: clientY })
    if (type === 'move') {
      setIsDraggingCrop(true)
    } else {
      setIsResizingCrop(type)
    }
  }

  const handleMouseMove = (e) => {
    if (!isDraggingCrop && !isResizingCrop) return
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const clientX = e.clientX || (e.touches && e.touches[0].clientX)
    const clientY = e.clientY || (e.touches && e.touches[0].clientY)

    const deltaXPercent = ((clientX - dragStart.x) / rect.width) * 100
    const deltaYPercent = ((clientY - dragStart.y) / rect.height) * 100

    setDragStart({ x: clientX, y: clientY })

    if (isDraggingCrop) {
      setCrop((prev) => {
        const newX = Math.max(0, Math.min(100 - prev.width, prev.x + deltaXPercent))
        const newY = Math.max(0, Math.min(100 - prev.height, prev.y + deltaYPercent))
        return { ...prev, x: newX, y: newY }
      })
    } else if (isResizingCrop) {
      setCrop((prev) => {
        let { x, y, width, height } = prev
        if (isResizingCrop.includes('r')) {
          width = Math.max(10, Math.min(100 - x, width + deltaXPercent))
        }
        if (isResizingCrop.includes('b')) {
          height = Math.max(10, Math.min(100 - y, height + deltaYPercent))
        }
        if (isResizingCrop.includes('l')) {
          const possibleW = width - deltaXPercent
          if (possibleW >= 10 && x + deltaXPercent >= 0) {
            x += deltaXPercent
            width = possibleW
          }
        }
        if (isResizingCrop.includes('t')) {
          const possibleH = height - deltaYPercent
          if (possibleH >= 10 && y + deltaYPercent >= 0) {
            y += deltaYPercent
            height = possibleH
          }
        }
        return { x, y, width, height }
      })
    }
  }

  const handleMouseUp = () => {
    setIsDraggingCrop(false)
    setIsResizingCrop(null)
  }

  // Apply edits & crop to export cropped HTML5 Canvas Blob
  const handleApply = () => {
    if (!imgElement) return

    const isRotated = rotation === 90 || rotation === 270
    const origWidth = isRotated ? imgElement.naturalHeight : imgElement.naturalWidth
    const origHeight = isRotated ? imgElement.naturalWidth : imgElement.naturalHeight

    // Step 1: Render transformed full image on temp canvas
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = origWidth
    tempCanvas.height = origHeight
    const tCtx = tempCanvas.getContext('2d')

    tCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) ${
      isGrayscale ? 'grayscale(100%)' : ''
    }`

    tCtx.save()
    tCtx.translate(origWidth / 2, origHeight / 2)
    tCtx.rotate((rotation * Math.PI) / 180)
    tCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1)

    tCtx.drawImage(
      imgElement,
      -imgElement.naturalWidth / 2,
      -imgElement.naturalHeight / 2,
      imgElement.naturalWidth,
      imgElement.naturalHeight
    )
    tCtx.restore()

    // Step 2: Crop from temp canvas
    const cropX = (crop.x / 100) * origWidth
    const cropY = (crop.y / 100) * origHeight
    const cropW = (crop.width / 100) * origWidth
    const cropH = (crop.height / 100) * origHeight

    const cropCanvas = document.createElement('canvas')
    cropCanvas.width = Math.max(1, cropW)
    cropCanvas.height = Math.max(1, cropH)
    const cCtx = cropCanvas.getContext('2d')

    cCtx.drawImage(
      tempCanvas,
      cropX,
      cropY,
      cropW,
      cropH,
      0,
      0,
      cropW,
      cropH
    )

    cropCanvas.toBlob(
      (blob) => {
        if (blob) {
          const editedFile = new File([blob], `cropped_${imageFile.name}`, {
            type: 'image/png',
            lastModified: Date.now(),
          })
          onSave(editedFile)
        }
      },
      'image/png',
      0.95
    )
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/85 backdrop-blur-md select-none"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[94vh] max-h-[820px]"
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand text-white flex items-center justify-center shadow-md">
              <Crop className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-extrabold text-base text-stone-900 font-heading leading-tight">
                Crop & Zoom Image
              </h3>
              <span className="text-[11px] text-stone-500 font-medium">Use zoom (+/-) and drag crop handles</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200 flex items-center gap-1 cursor-pointer"
            >
              <ResetIcon className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-500 hover:bg-stone-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Live Preview & Crop Area with White/Gray Checkerboard Grid Background */}
        <div className="flex-1 min-h-0 bg-[repeating-conic-gradient(#f3f4f6_0%_25%,_#ffffff_0%_50%)] bg-[length:24px_24px] p-4 sm:p-6 flex items-center justify-center overflow-hidden relative">
          
          {/* Floating Zoom Controls Badge on Canvas */}
          <div className="absolute top-4 right-4 z-30 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-md border border-stone-200 flex items-center gap-2">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-extrabold text-stone-900 font-mono px-1">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div
            ref={containerRef}
            className="relative max-h-full max-w-full flex items-center justify-center"
          >
            {imageSrc && (
              <img
                src={imageSrc}
                alt="Preview"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${
                    flipH ? -1 : 1
                  }) scaleY(${flipV ? -1 : 1})`,
                  filter: `brightness(${brightness}%) contrast(${contrast}%) ${
                    isGrayscale ? 'grayscale(100%)' : ''
                  }`,
                }}
                className="max-h-[48vh] max-w-full object-contain shadow-2xl pointer-events-none transition-transform duration-150"
              />
            )}

            {/* Interactive Crop Box Overlay */}
            <div
              onMouseDown={(e) => handleMouseDown(e, 'move')}
              onTouchStart={(e) => handleMouseDown(e, 'move')}
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.width}%`,
                height: `${crop.height}%`,
              }}
              className="absolute border-2 border-brand shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] cursor-move flex items-center justify-center z-20 group"
            >
              {/* Corner Handles */}
              <div
                onMouseDown={(e) => handleMouseDown(e, 'tl')}
                onTouchStart={(e) => handleMouseDown(e, 'tl')}
                className="absolute -top-2 -left-2 w-4 h-4 bg-brand border-2 border-white rounded-full cursor-nwse-resize shadow-md"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 'tr')}
                onTouchStart={(e) => handleMouseDown(e, 'tr')}
                className="absolute -top-2 -right-2 w-4 h-4 bg-brand border-2 border-white rounded-full cursor-nesw-resize shadow-md"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 'bl')}
                onTouchStart={(e) => handleMouseDown(e, 'bl')}
                className="absolute -bottom-2 -left-2 w-4 h-4 bg-brand border-2 border-white rounded-full cursor-nesw-resize shadow-md"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 'br')}
                onTouchStart={(e) => handleMouseDown(e, 'br')}
                className="absolute -bottom-2 -right-2 w-4 h-4 bg-brand border-2 border-white rounded-full cursor-nwse-resize shadow-md"
              />

              {/* Grid Guidelines Inside Crop Box */}
              <div className="w-full h-full border border-white/40 grid grid-cols-3 grid-rows-3 pointer-events-none">
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20 flex items-center justify-center">
                  <Move className="w-4 h-4 text-white opacity-80" />
                </div>
                <div className="border-b border-white/20" />
                <div className="border-r border-white/20" />
                <div className="border-r border-white/20" />
                <div />
              </div>
            </div>

          </div>

        </div>

        {/* Toolbar & Controls Area - Fixed Shrink-0 Content */}
        <div className="p-4 sm:p-5 bg-white border-t border-stone-200 flex flex-col gap-3.5 shrink-0 shadow-lg z-30">
          
          {/* Crop Ratio Presets Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-extrabold uppercase text-stone-500 shrink-0">Crop Ratio:</span>
            {['FULL', '1:1', '4:3', 'A4', 'PASSPORT'].map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => setCropPreset(ratio)}
                className="px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-300 hover:bg-stone-200 text-stone-800 text-xs font-bold shrink-0 cursor-pointer transition-all"
              >
                {ratio}
              </button>
            ))}
          </div>

          {/* Action Buttons Row: Rotation, Flips & B&W Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Rotate */}
              <button
                type="button"
                onClick={handleRotate}
                className="px-3.5 py-2 rounded-2xl bg-stone-100 border border-stone-300 hover:bg-stone-200 text-stone-800 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
              >
                <RotateCw className="w-4 h-4 text-brand" />
                <span>Rotate 90°</span>
              </button>

              {/* Flip Horizontal */}
              <button
                type="button"
                onClick={() => setFlipH(!flipH)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all border ${
                  flipH
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-100 text-stone-800 border-stone-300 hover:bg-stone-200'
                }`}
              >
                <FlipHorizontal className="w-4 h-4" />
                <span>Flip H</span>
              </button>

              {/* Flip Vertical */}
              <button
                type="button"
                onClick={() => setFlipV(!flipV)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all border ${
                  flipV
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-100 text-stone-800 border-stone-300 hover:bg-stone-200'
                }`}
              >
                <FlipVertical className="w-4 h-4" />
                <span>Flip V</span>
              </button>
            </div>

            {/* Make B&W Toggle */}
            <button
              type="button"
              onClick={() => setIsGrayscale(!isGrayscale)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all border shadow-sm ${
                isGrayscale
                  ? 'bg-brand text-white border-brand shadow-rose-500/20'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGrayscale ? 'B&W Mode Active' : 'Make B&W'}</span>
            </button>
          </div>

          {/* Action Row 2: Sliders for Brightness & Contrast */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Brightness */}
            <div className="flex flex-col gap-1 bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between text-xs font-extrabold text-stone-800">
                <span>Brightness</span>
                <span className="text-brand font-mono">{brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-brand cursor-pointer h-2 bg-stone-200 rounded-lg"
              />
            </div>

            {/* Contrast */}
            <div className="flex flex-col gap-1 bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between text-xs font-extrabold text-stone-800">
                <span>Contrast</span>
                <span className="text-brand font-mono">{contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-brand cursor-pointer h-2 bg-stone-200 rounded-lg"
              />
            </div>
          </div>

          {/* Footer Save & Cancel Buttons */}
          <div className="flex items-center justify-end gap-3 pt-1 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-stone-300 text-stone-700 text-xs font-extrabold hover:bg-stone-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="btn-primary px-6 py-2.5 text-xs font-extrabold flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Crop & Save Edits</span>
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  )
}
