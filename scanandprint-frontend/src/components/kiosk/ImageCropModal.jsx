import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crop,
  X,
  Check,
  RotateCw,
  Plus,
  Trash2,
  Maximize2,
  Sparkles,
  Layers,
  Move,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react'

export default function ImageCropModal({ imageFile, isOpen, onClose, onSave }) {
  // Array of items on the A4 page: [{ id, file, url, x, y, width, height, rotation }]
  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeDrag, setActiveDrag] = useState(null) // { type: 'move' | 'resize', handle?: 'tl'|'tr'|'bl'|'br', startX, startY, origX, origY, origW, origH }

  const containerRef = useRef(null)
  const fileInputRef = useRef(null)

  // Initialize with initial image
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile)
      const img = new Image()
      img.src = url
      img.onload = () => {
        const initialItem = {
          id: 'img_' + Date.now(),
          file: imageFile,
          url,
          name: imageFile.name || 'Image 1',
          x: 20,
          y: 20,
          width: 60, // percentage of A4 width
          height: (60 * (img.height / img.width)) / 1.414, // percentage of A4 height
          rotation: 0,
          aspectRatio: img.width / img.height,
        }
        setItems([initialItem])
        setSelectedId(initialItem.id)
      }
    } else {
      setItems([])
      setSelectedId(null)
    }
  }, [imageFile, isOpen])

  // Handle Adding Additional Images (e.g. Back Side of Aadhaar Card)
  const handleAddAdditionalImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    const img = new Image()
    img.src = url
    img.onload = () => {
      const newItem = {
        id: 'img_' + Date.now(),
        file,
        url,
        name: file.name || 'Image ' + (items.length + 1),
        x: 20,
        y: items.length > 0 ? 55 : 20, // place below first image by default
        width: 60,
        height: (60 * (img.height / img.width)) / 1.414,
        rotation: 0,
        aspectRatio: img.width / img.height,
      }
      setItems((prev) => [...prev, newItem])
      setSelectedId(newItem.id)
    }
  }

  // Preset Layout: Aadhaar Card (Top & Bottom)
  const applyAadhaarPreset = () => {
    if (items.length < 2) return
    setItems((prev) => [
      {
        ...prev[0],
        x: 15,
        y: 10,
        width: 70,
        height: (70 / (prev[0].aspectRatio || 1.5)) / 1.414,
        rotation: 0,
      },
      {
        ...prev[1],
        x: 15,
        y: 50,
        width: 70,
        height: (70 / (prev[1].aspectRatio || 1.5)) / 1.414,
        rotation: 0,
      },
      ...prev.slice(2),
    ])
  }

  // Preset Layout: Side by Side
  const applySideBySidePreset = () => {
    if (items.length < 2) return
    setItems((prev) => [
      {
        ...prev[0],
        x: 5,
        y: 25,
        width: 42,
        height: (42 / (prev[0].aspectRatio || 1.5)) / 1.414,
        rotation: 0,
      },
      {
        ...prev[1],
        x: 53,
        y: 25,
        width: 42,
        height: (42 / (prev[1].aspectRatio || 1.5)) / 1.414,
        rotation: 0,
      },
      ...prev.slice(2),
    ])
  }

  // Rotate Selected Item
  const handleRotateSelected = () => {
    if (!selectedId) return
    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedId
          ? { ...item, rotation: (item.rotation + 90) % 360 }
          : item
      )
    )
  }

  // Delete Selected Item
  const handleDeleteSelected = () => {
    if (!selectedId) return
    setItems((prev) => {
      const filtered = prev.filter((item) => item.id !== selectedId)
      setSelectedId(filtered[0]?.id || null)
      return filtered
    })
  }

  // Pointer/Touch Down Handler for Moving or Resizing
  const handlePointerDown = (e, item, actionType, handle) => {
    e.stopPropagation()
    setSelectedId(item.id)

    const clientX = e.clientX || e.touches?.[0]?.clientX
    const clientY = e.clientY || e.touches?.[0]?.clientY

    setActiveDrag({
      type: actionType,
      itemId: item.id,
      handle,
      startX: clientX,
      startY: clientY,
      origX: item.x,
      origY: item.y,
      origW: item.width,
      origH: item.height,
    })
  }

  // Pointer/Touch Move Handler
  const handlePointerMove = useCallback(
    (e) => {
      if (!activeDrag || !containerRef.current) return

      const clientX = e.clientX || e.touches?.[0]?.clientX
      const clientY = e.clientY || e.touches?.[0]?.clientY
      if (clientX === undefined || clientY === undefined) return

      const rect = containerRef.current.getBoundingClientRect()
      const deltaXPercent = ((clientX - activeDrag.startX) / rect.width) * 100
      const deltaYPercent = ((clientY - activeDrag.startY) / rect.height) * 100

      if (activeDrag.type === 'move') {
        const newX = Math.max(0, Math.min(100 - activeDrag.origW, activeDrag.origX + deltaXPercent))
        const newY = Math.max(0, Math.min(100 - activeDrag.origH, activeDrag.origY + deltaYPercent))

        setItems((prev) =>
          prev.map((item) =>
            item.id === activeDrag.itemId ? { ...item, x: newX, y: newY } : item
          )
        )
      } else if (activeDrag.type === 'resize') {
        setItems((prev) =>
          prev.map((item) => {
            if (item.id !== activeDrag.itemId) return item

            let newW = activeDrag.origW
            let newH = activeDrag.origH
            let newX = activeDrag.origX
            let newY = activeDrag.origY

            if (activeDrag.handle === 'br') {
              newW = Math.max(15, Math.min(100 - item.x, activeDrag.origW + deltaXPercent))
              newH = (newW / (item.aspectRatio || 1.5)) / 1.414
            } else if (activeDrag.handle === 'bl') {
              newW = Math.max(15, activeDrag.origW - deltaXPercent)
              newX = activeDrag.origX + (activeDrag.origW - newW)
              newH = (newW / (item.aspectRatio || 1.5)) / 1.414
            } else if (activeDrag.handle === 'tr') {
              newW = Math.max(15, Math.min(100 - item.x, activeDrag.origW + deltaXPercent))
              newH = (newW / (item.aspectRatio || 1.5)) / 1.414
              newY = activeDrag.origY + (activeDrag.origH - newH)
            } else if (activeDrag.handle === 'tl') {
              newW = Math.max(15, activeDrag.origW - deltaXPercent)
              newX = activeDrag.origX + (activeDrag.origW - newW)
              newH = (newW / (item.aspectRatio || 1.5)) / 1.414
              newY = activeDrag.origY + (activeDrag.origH - newH)
            }

            return {
              ...item,
              x: Math.max(0, newX),
              y: Math.max(0, newY),
              width: Math.min(100, newW),
              height: Math.min(100, newH),
            }
          })
        )
      }
    },
    [activeDrag]
  )

  const handlePointerUp = useCallback(() => {
    setActiveDrag(null)
  }, [])

  useEffect(() => {
    if (activeDrag) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      window.addEventListener('touchmove', handlePointerMove)
      window.addEventListener('touchend', handlePointerUp)
      return () => {
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
        window.removeEventListener('touchmove', handlePointerMove)
        window.removeEventListener('touchend', handlePointerUp)
      }
    }
  }, [activeDrag, handlePointerMove, handlePointerUp])

  // Export Combined Canvas to High-Res Image (300 DPI A4)
  const handleSaveMergedCanvas = async () => {
    if (items.length === 0) return

    try {
      setIsProcessing(true)
      const A4_WIDTH = 2480 // 300 DPI A4
      const A4_HEIGHT = 3508

      const canvas = document.createElement('canvas')
      canvas.width = A4_WIDTH
      canvas.height = A4_HEIGHT
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas not supported')

      // White A4 Background
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT)

      // Draw all items in sequence
      for (const item of items) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise((res, rej) => {
          img.onload = res
          img.onerror = rej
          img.src = item.url
        })

        const itemPixelX = (item.x / 100) * A4_WIDTH
        const itemPixelY = (item.y / 100) * A4_HEIGHT
        const itemPixelW = (item.width / 100) * A4_WIDTH
        const itemPixelH = (item.height / 100) * A4_HEIGHT

        ctx.save()
        ctx.translate(itemPixelX + itemPixelW / 2, itemPixelY + itemPixelH / 2)
        ctx.rotate((item.rotation * Math.PI) / 180)
        ctx.drawImage(img, -itemPixelW / 2, -itemPixelH / 2, itemPixelW, itemPixelH)
        ctx.restore()
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsProcessing(false)
            return
          }
          const mergedFile = new File([blob], `document_page_${Date.now()}.png`, {
            type: 'image/png',
            lastModified: Date.now(),
          })
          setIsProcessing(false)
          onSave(mergedFile)
        },
        'image/png',
        0.95
      )
    } catch (err) {
      console.error('Failed to export canvas:', err)
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-stone-950/90 backdrop-blur-md select-none touch-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          className="bg-white w-full h-[100dvh] sm:h-[94vh] sm:max-h-215 sm:max-w-4xl sm:rounded-3xl rounded-none overflow-hidden shadow-2xl flex flex-col border-0 sm:border sm:border-stone-200"
        >
          {/* Header */}
          <div className="px-3 sm:px-6 py-2 sm:py-3 border-b border-stone-200 flex items-center justify-between gap-2 bg-stone-50 shrink-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand text-white flex items-center justify-center shadow-xs shrink-0">
                <Crop className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <h3 className="font-extrabold text-xs sm:text-base text-stone-900 leading-tight truncate">
                  Page Layout & Aadhaar
                </h3>
                <span className="text-[10px] sm:text-[11px] text-stone-500 font-medium truncate hidden xs:inline">
                  Drag corner dots to resize · Multiple photos on 1 sheet
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Hidden Additional File Input */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleAddAdditionalImage}
                className="hidden"
              />

              {/* Add 2nd Side / Additional Image Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-extrabold flex items-center gap-1 bg-brand text-white hover:bg-rose-600 active:bg-rose-700 shadow-xs transition-all cursor-pointer border-none shrink-0 whitespace-nowrap"
                title="Add Front or Back Image"
              >
                <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                <span>Add More</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost p-1.5 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-200/60 shrink-0"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Preset Quick Actions Bar (Wrap-safe & Horizontally Scrollable on Mobile) */}
          <div className="px-3 sm:px-4 py-2 bg-stone-100/95 border-b border-stone-200 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0 text-xs whitespace-nowrap">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-extrabold text-[10px] sm:text-[11px] text-stone-500 uppercase tracking-wider shrink-0">
                Presets:
              </span>
              <button
                type="button"
                onClick={applyAadhaarPreset}
                disabled={items.length < 2}
                className="py-1 px-2 sm:px-2.5 rounded-lg font-bold bg-white text-stone-800 border border-stone-200 hover:bg-rose-50 hover:border-brand hover:text-brand disabled:opacity-40 transition-all cursor-pointer shadow-2xs shrink-0 text-[11px] sm:text-xs"
              >
                Aadhaar (Top & Bottom)
              </button>
              <button
                type="button"
                onClick={applySideBySidePreset}
                disabled={items.length < 2}
                className="py-1 px-2 sm:px-2.5 rounded-lg font-bold bg-white text-stone-800 border border-stone-200 hover:bg-rose-50 hover:border-brand hover:text-brand disabled:opacity-40 transition-all cursor-pointer shadow-2xs shrink-0 text-[11px] sm:text-xs"
              >
                Side by Side
              </button>
            </div>

            {selectedId && (
              <div className="flex items-center gap-1.5 shrink-0 pl-1">
                <div className="h-4 w-px bg-stone-300 mx-0.5 shrink-0" />
                <button
                  type="button"
                  onClick={handleRotateSelected}
                  className="py-1 px-2 sm:px-2.5 rounded-lg font-bold bg-white text-stone-800 border border-stone-300 hover:bg-stone-50 flex items-center gap-1 cursor-pointer shadow-2xs text-[11px] sm:text-xs shrink-0"
                >
                  <RotateCw className="w-3.5 h-3.5 text-brand" />
                  <span>Rotate</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="py-1 px-2 sm:px-2.5 rounded-lg font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 flex items-center gap-1 cursor-pointer shadow-2xs text-[11px] sm:text-xs shrink-0"
                  title="Delete selected image"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>

          {/* Interactive A4 Sheet Canvas Area */}
          <div className="relative flex-1 min-h-0 bg-stone-950 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
            {/* A4 Sheet Container (1 : 1.414 aspect ratio) */}
            <div
              ref={containerRef}
              onClick={() => setSelectedId(null)}
              className="relative bg-white shadow-2xl rounded-xs overflow-hidden border border-stone-300 transition-all"
              style={{
                aspectRatio: '1 / 1.414',
                height: '100%',
                maxHeight: '100%',
              }}
            >
              {/* Subtle A4 Print Margins */}
              <div className="absolute inset-1 sm:inset-2 border border-dashed border-stone-200 pointer-events-none rounded-xs" />

              {/* Rendered Items with Active Selection & Corner Scaling Handles */}
              {items.map((item) => {
                const isSelected = selectedId === item.id

                return (
                  <div
                    key={item.id}
                    onPointerDown={(e) => handlePointerDown(e, item, 'move')}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedId(item.id)
                    }}
                    className={`absolute cursor-move select-none touch-none ${
                      isSelected
                        ? 'ring-2 ring-brand ring-offset-2 ring-offset-white shadow-xl z-30'
                        : 'hover:ring-1 hover:ring-stone-400 z-10'
                    }`}
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      width: `${item.width}%`,
                      height: `${item.height}%`,
                      transform: `rotate(${item.rotation}deg)`,
                      transformOrigin: 'center center',
                    }}
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-contain pointer-events-none rounded-xs shadow-xs"
                      draggable={false}
                    />

                    {/* Corner Resize Handles (Dots) - ONLY VISIBLE WHEN SELECTED */}
                    {isSelected && (
                      <>
                        <div
                          onPointerDown={(e) => handlePointerDown(e, item, 'resize', 'tl')}
                          className="absolute -top-3 -left-3 sm:-top-2.5 sm:-left-2.5 w-6 h-6 sm:w-5 sm:h-5 bg-white border-2 border-brand scale-115 shadow-md ring-2 ring-brand/40 rounded-full cursor-nwse-resize z-30 flex items-center justify-center hover:scale-125 transition-transform touch-none"
                          title="Drag to resize"
                        >
                          <div className="w-2 h-2 sm:w-1.5 sm:h-1.5 bg-brand rounded-full" />
                        </div>

                        <div
                          onPointerDown={(e) => handlePointerDown(e, item, 'resize', 'tr')}
                          className="absolute -top-3 -right-3 sm:-top-2.5 sm:-right-2.5 w-6 h-6 sm:w-5 sm:h-5 bg-white border-2 border-brand scale-115 shadow-md ring-2 ring-brand/40 rounded-full cursor-nesw-resize z-30 flex items-center justify-center hover:scale-125 transition-transform touch-none"
                          title="Drag to resize"
                        >
                          <div className="w-2 h-2 sm:w-1.5 sm:h-1.5 bg-brand rounded-full" />
                        </div>

                        <div
                          onPointerDown={(e) => handlePointerDown(e, item, 'resize', 'bl')}
                          className="absolute -bottom-3 -left-3 sm:-bottom-2.5 sm:-left-2.5 w-6 h-6 sm:w-5 sm:h-5 bg-white border-2 border-brand scale-115 shadow-md ring-2 ring-brand/40 rounded-full cursor-nesw-resize z-30 flex items-center justify-center hover:scale-125 transition-transform touch-none"
                          title="Drag to resize"
                        >
                          <div className="w-2 h-2 sm:w-1.5 sm:h-1.5 bg-brand rounded-full" />
                        </div>

                        <div
                          onPointerDown={(e) => handlePointerDown(e, item, 'resize', 'br')}
                          className="absolute -bottom-3 -right-3 sm:-bottom-2.5 sm:-right-2.5 w-6 h-6 sm:w-5 sm:h-5 bg-white border-2 border-brand scale-115 shadow-md ring-2 ring-brand/40 rounded-full cursor-nwse-resize z-30 flex items-center justify-center hover:scale-125 transition-transform touch-none"
                          title="Drag to resize"
                        >
                          <div className="w-2 h-2 sm:w-1.5 sm:h-1.5 bg-brand rounded-full" />
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom Save & Cancel Bar */}
          <div className="px-3 sm:px-6 py-2.5 sm:py-3 bg-white border-t border-stone-200 flex items-center justify-between gap-2 shrink-0">
            <span className="text-[11px] sm:text-xs text-stone-500 font-medium hidden sm:inline">
              {items.length} {items.length === 1 ? 'image' : 'images'} on A4 page · 300 DPI high resolution
            </span>

            <div className="flex items-center gap-2 ml-auto w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline px-3 sm:px-4 py-2 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMergedCanvas}
                disabled={isProcessing || items.length === 0}
                className="btn btn-primary px-5 sm:px-6 py-2.5 shadow-md flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isProcessing ? 'Rendering...' : 'Save & Print 1 Page'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
