import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Crop,
  X,
  Check,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize2,
  SlidersHorizontal,
  RefreshCw as ResetIcon,
  Move,
  aspectPresets,
  filterPresets,
} from '../../assets/assets'
import getCroppedImg from '../../lib/cropImage'

export default function ImageEditorModal({ imageFile, isOpen, onClose, onSave }) {
  // 1. ALL HOOK DECLARATIONS AT THE VERY TOP LEVEL (NO EARLY RETURNS BEFORE HOOKS)
  const [imageSrc, setImageSrc] = useState(null)
  const [imgElement, setImgElement] = useState(null)

  // Edit States
  const [rotation, setRotation] = useState(0) // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [isGrayscale, setIsGrayscale] = useState(false)
  const [isSepia, setIsSepia] = useState(false)
  const [zoom, setZoom] = useState(1.0)
  const [aspect, setAspect] = useState(null)
  const [activeTab, setActiveTab] = useState('crop') // 'crop' | 'filters' | 'adjust'
  const [isProcessing, setIsProcessing] = useState(false)

  // Interactive Crop Box Percentage Coordinates (0 to 100) - Full 100% Image Cover by Default
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, w: 100, h: 100 })
  const [dragMode, setDragMode] = useState(null) // 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e'
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, crop: { x: 0, y: 0, w: 100, h: 100 } })

  const stageRef = useRef(null)

  // Load Image Object URL & Element
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

  // Mouse & Touch Drag Handler Move (Hook declared at top level)
  const handleMouseMove = useCallback(
    (e) => {
      if (!dragMode || !stageRef.current) return
      const stageRect = stageRef.current.getBoundingClientRect()
      if (!stageRect.width || !stageRect.height) return

      const clientX = e.clientX || (e.touches && e.touches[0].clientX)
      const clientY = e.clientY || (e.touches && e.touches[0].clientY)

      const deltaXPercent = ((clientX - dragStart.x) / stageRect.width) * 100
      const deltaYPercent = ((clientY - dragStart.y) / stageRect.height) * 100

      const { x: startX, y: startY, w: startW, h: startH } = dragStart.crop

      if (dragMode === 'move') {
        const newX = Math.max(0, Math.min(100 - startW, startX + deltaXPercent))
        const newY = Math.max(0, Math.min(100 - startH, startY + deltaYPercent))
        setCropBox({ x: newX, y: newY, w: startW, h: startH })
      } else {
        let newX = startX
        let newY = startY
        let newW = startW
        let newH = startH

        // Handle Resizing Directions
        if (dragMode.includes('e')) {
          newW = Math.max(5, Math.min(100 - startX, startW + deltaXPercent))
        }
        if (dragMode.includes('s')) {
          newH = Math.max(5, Math.min(100 - startY, startH + deltaYPercent))
        }
        if (dragMode.includes('w')) {
          const maxDeltaX = startW - 5
          const clampedDeltaX = Math.min(maxDeltaX, Math.max(-startX, deltaXPercent))
          newX = startX + clampedDeltaX
          newW = startW - clampedDeltaX
        }
        if (dragMode.includes('n')) {
          const maxDeltaY = startH - 5
          const clampedDeltaY = Math.min(maxDeltaY, Math.max(-startY, deltaYPercent))
          newY = startY + clampedDeltaY
          newH = startH - clampedDeltaY
        }

        // Apply Aspect Ratio Constraint if locked
        if (aspect) {
          if (dragMode.includes('e') || dragMode.includes('w')) {
            newH = newW / aspect
            if (newY + newH > 100) {
              newH = 100 - newY
              newW = newH * aspect
            }
          } else {
            newW = newH * aspect
            if (newX + newW > 100) {
              newW = 100 - newX
              newH = newW / aspect
            }
          }
        }

        setCropBox({
          x: Math.max(0, newX),
          y: Math.max(0, newY),
          w: Math.min(100 - Math.max(0, newX), newW),
          h: Math.min(100 - Math.max(0, newY), newH),
        })
      }
    },
    [dragMode, dragStart, aspect]
  )

  // 2. NOW CONDITIONAL RENDER (AFTER ALL HOOKS ARE FULLY DECLARED)
  if (!isOpen || !imageFile) return null

  // Reset All Edits to 100% Full Image
  const handleReset = () => {
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setIsGrayscale(false)
    setIsSepia(false)
    setZoom(1.0)
    setAspect(null)
    setCropBox({ x: 0, y: 0, w: 100, h: 100 })
  }

  // Rotate 90 deg
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  // Apply Aspect Ratio Preset (up to 100% full bounds)
  const handleSelectAspect = (presetValue) => {
    setAspect(presetValue)
    if (!presetValue) {
      // Free Crop Mode: Default to 100% full cover
      setCropBox({ x: 0, y: 0, w: 100, h: 100 })
      return
    }

    setCropBox((prev) => {
      let newW = 100
      let newH = newW / presetValue

      if (newH > 100) {
        newH = 100
        newW = newH * presetValue
      }

      const newX = Math.max(0, (100 - newW) / 2)
      const newY = Math.max(0, (100 - newH) / 2)

      return { x: newX, y: newY, w: newW, h: newH }
    })
  }

  // Apply Filter Preset
  const applyPreset = (preset) => {
    setBrightness(preset.brightness)
    setContrast(preset.contrast)
    setSaturation(preset.saturation)
    setIsGrayscale(preset.isGrayscale)
    setIsSepia(preset.isSepia)
  }

  // Mouse & Touch Drag Handler Start
  const handleMouseDown = (e, mode) => {
    e.preventDefault()
    e.stopPropagation()
    const clientX = e.clientX || (e.touches && e.touches[0].clientX)
    const clientY = e.clientY || (e.touches && e.touches[0].clientY)

    setDragMode(mode)
    setDragStart({
      x: clientX,
      y: clientY,
      crop: { ...cropBox },
    })
  }

  const handleMouseUp = () => {
    setDragMode(null)
  }

  // Generate Cropped HTML5 Canvas Image File
  const handleApplyEdits = async () => {
    if (!imgElement) return

    try {
      setIsProcessing(true)

      const isRotated = rotation === 90 || rotation === 270
      const fullW = isRotated ? imgElement.naturalHeight : imgElement.naturalWidth
      const fullH = isRotated ? imgElement.naturalWidth : imgElement.naturalHeight

      const pixelCrop = {
        x: (cropBox.x / 100) * fullW,
        y: (cropBox.y / 100) * fullH,
        width: Math.max(1, (cropBox.w / 100) * fullW),
        height: Math.max(1, (cropBox.h / 100) * fullH),
      }

      const croppedFile = await getCroppedImg(
        imageSrc,
        pixelCrop,
        rotation,
        flipH,
        flipV,
        { brightness, contrast, isGrayscale, isSepia, saturation },
        `edited_${imageFile.name || 'print.png'}`
      )

      if (croppedFile) {
        onSave(croppedFile)
      }
    } catch (err) {
      console.error('Error cropping image:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  // Live CSS Filter string for image preview
  const previewFilterCss = [
    brightness !== 100 ? `brightness(${brightness}%)` : '',
    contrast !== 100 ? `contrast(${contrast}%)` : '',
    saturation !== 100 ? `saturate(${saturation}%)` : '',
    isGrayscale ? 'grayscale(100%)' : '',
    isSepia ? 'sepia(100%)' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/85 backdrop-blur-md select-none"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[94vh] max-h-[840px]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Crop className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-stone-900 leading-tight">
                Interactive Image Crop
              </h3>
              <span className="text-xs text-stone-500 font-medium">
                Drag corner handles on image to resize crop area freely
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ResetIcon className="w-4 h-4" />
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

        {/* Center Canvas Stage with Sleek Dark Checkerboard Background */}
        <div className="flex-1 min-h-0 bg-[#09090b] bg-[repeating-conic-gradient(#18181b_0%_25%,_#09090b_0%_50%)] bg-[length:24px_24px] p-4 sm:p-6 flex items-center justify-center overflow-hidden relative">
          
          {/* Floating Zoom Controls Badge on Canvas */}
          <div className="absolute top-4 right-4 z-30 bg-stone-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-stone-700/80 text-white flex items-center gap-2.5 shadow-xl">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.15).toFixed(2))))}
              className="p-1 rounded-lg hover:bg-stone-700 text-stone-300 cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-extrabold text-amber-400">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3.0, Number((z + 0.15).toFixed(2))))}
              className="p-1 rounded-lg hover:bg-stone-700 text-stone-300 cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Inline-Block Wrapper matching Image Dimensions 1-to-1 */}
          <div
            ref={stageRef}
            className="relative inline-block max-h-[52vh] max-w-full"
            style={{
              transform: `scale(${zoom})`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            {imageSrc && (
              <img
                src={imageSrc}
                alt="Crop preview"
                style={{
                  transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${
                    flipV ? -1 : 1
                  })`,
                  filter: previewFilterCss || 'none',
                }}
                className="max-h-[52vh] max-w-full block object-contain shadow-2xl pointer-events-none"
              />
            )}

            {/* Interactive Crop Box Overlay spanning 0..100% of Image Height & Width */}
            <div
              onMouseDown={(e) => handleMouseDown(e, 'move')}
              onTouchStart={(e) => handleMouseDown(e, 'move')}
              style={{
                left: `${cropBox.x}%`,
                top: `${cropBox.y}%`,
                width: `${cropBox.w}%`,
                height: `${cropBox.h}%`,
              }}
              className="absolute border-2 border-[#F0245C] shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] cursor-move flex items-center justify-center z-20 group"
            >
              {/* 4 CORNER RESIZE HANDLES */}
              <div
                onMouseDown={(e) => handleMouseDown(e, 'nw')}
                onTouchStart={(e) => handleMouseDown(e, 'nw')}
                className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-[#F0245C] border-2 border-white rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 'ne')}
                onTouchStart={(e) => handleMouseDown(e, 'ne')}
                className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-[#F0245C] border-2 border-white rounded-full cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 'sw')}
                onTouchStart={(e) => handleMouseDown(e, 'sw')}
                className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-[#F0245C] border-2 border-white rounded-full cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 'se')}
                onTouchStart={(e) => handleMouseDown(e, 'se')}
                className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-[#F0245C] border-2 border-white rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
              />

              {/* 4 EDGE RESIZE HANDLES */}
              <div
                onMouseDown={(e) => handleMouseDown(e, 'n')}
                onTouchStart={(e) => handleMouseDown(e, 'n')}
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-[#F0245C] border-2 border-white rounded-full cursor-ns-resize shadow-md"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 's')}
                onTouchStart={(e) => handleMouseDown(e, 's')}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-[#F0245C] border-2 border-white rounded-full cursor-ns-resize shadow-md"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 'w')}
                onTouchStart={(e) => handleMouseDown(e, 'w')}
                className="absolute top-1/2 -left-2 -translate-y-1/2 w-3 h-8 bg-[#F0245C] border-2 border-white rounded-full cursor-ew-resize shadow-md"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 'e')}
                onTouchStart={(e) => handleMouseDown(e, 'e')}
                className="absolute top-1/2 -right-2 -translate-y-1/2 w-3 h-8 bg-[#F0245C] border-2 border-white rounded-full cursor-ew-resize shadow-md"
              />

              {/* Grid Guidelines Inside Crop Box */}
              <div className="w-full h-full border border-white/40 grid grid-cols-3 grid-rows-3 pointer-events-none">
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20 flex items-center justify-center">
                  <Move className="w-5 h-5 text-white opacity-80" />
                </div>
                <div className="border-b border-white/20" />
                <div className="border-r border-white/20" />
                <div className="border-r border-white/20" />
                <div />
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Control Panel */}
        <div className="p-4 sm:p-5 bg-white border-t border-stone-200 flex flex-col gap-4 shrink-0 shadow-lg">
          
          {/* Sub-Tab Navigation Header */}
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('crop')}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === 'crop'
                    ? 'bg-white text-brand shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Crop & Ratio
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('filters')}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === 'filters'
                    ? 'bg-white text-brand shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Color Filters
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('adjust')}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === 'adjust'
                    ? 'bg-white text-brand shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Adjustments
              </button>
            </div>

            {/* Transform Quick Controls: Rotate & Flips */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleRotate}
                title="Rotate 90°"
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCw className="w-4 h-4 text-brand" />
                <span className="hidden sm:inline">Rotate 90°</span>
              </button>
              <button
                type="button"
                onClick={() => setFlipH(!flipH)}
                title="Flip Horizontal"
                className={`p-2 rounded-xl text-xs font-bold cursor-pointer transition-colors border ${
                  flipH
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                }`}
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setFlipV(!flipV)}
                title="Flip Vertical"
                className={`p-2 rounded-xl text-xs font-bold cursor-pointer transition-colors border ${
                  flipV
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                }`}
              >
                <FlipVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* TAB 1: CROP & ASPECT RATIOS */}
          {activeTab === 'crop' && (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-extrabold uppercase text-stone-500 tracking-wider">
                Select Aspect Ratio Preset:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {aspectPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSelectAspect(preset.value)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold shrink-0 transition-all cursor-pointer border ${
                      aspect === preset.value
                        ? 'bg-brand text-white border-brand shadow-md shadow-rose-500/20'
                        : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: COLOR FILTERS PRESETS */}
          {activeTab === 'filters' && (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-extrabold uppercase text-stone-500 tracking-wider">
                Color Filter Presets:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {filterPresets.map((preset) => {
                  const isActive =
                    isGrayscale === preset.isGrayscale &&
                    isSepia === preset.isSepia &&
                    brightness === preset.brightness
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className={`px-4 py-2 rounded-2xl text-xs font-extrabold shrink-0 transition-all cursor-pointer border flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-brand text-white border-brand shadow-md shadow-rose-500/20'
                          : 'bg-stone-100 text-stone-800 border-stone-200 hover:bg-stone-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{preset.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB 3: FINE ADJUSTMENTS (SLIDERS FOR BRIGHTNESS, CONTRAST, SATURATION) */}
          {activeTab === 'adjust' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

              {/* Saturation */}
              <div className="flex flex-col gap-1 bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between text-xs font-extrabold text-stone-800">
                  <span>Saturation</span>
                  <span className="text-brand font-mono">{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full accent-brand cursor-pointer h-2 bg-stone-200 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Footer Save & Cancel Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-stone-300 text-stone-700 text-xs font-extrabold hover:bg-stone-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyEdits}
              disabled={isProcessing}
              className="btn-primary px-6 py-2.5 text-xs font-extrabold flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isProcessing ? 'Processing Image...' : 'Crop & Save Edits'}</span>
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  )
}
