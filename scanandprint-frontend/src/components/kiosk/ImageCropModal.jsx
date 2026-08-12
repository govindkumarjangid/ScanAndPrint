import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crop,
  X,
  Check,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
} from 'lucide-react'

// Canvas helper to extract cropped area from image
const getCroppedImgFile = (imageSrc, pixelCrop, rotation = 0, fileName = 'edited_photo.png') => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        return reject(new Error('Canvas context not available'))
      }

      const rotRad = (rotation * Math.PI) / 180

      // Calculate bounding box size of rotated image
      const bBoxWidth =
        Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height)
      const bBoxHeight =
        Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height)

      canvas.width = bBoxWidth
      canvas.height = bBoxHeight

      ctx.save()
      ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
      ctx.rotate(rotRad)
      ctx.drawImage(image, -image.width / 2, -image.height / 2)
      ctx.restore()

      // Create cropped canvas
      const croppedCanvas = document.createElement('canvas')
      const croppedCtx = croppedCanvas.getContext('2d')

      if (!croppedCtx) {
        return reject(new Error('Cropped canvas context not available'))
      }

      croppedCanvas.width = pixelCrop.width
      croppedCanvas.height = pixelCrop.height

      croppedCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      )

      croppedCanvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error('Canvas is empty'))
          }
          const file = new File([blob], fileName, {
            type: 'image/png',
            lastModified: Date.now(),
          })
          resolve(file)
        },
        'image/png',
        0.95
      )
    }
    image.onerror = (err) => reject(err)
    image.src = imageSrc
  })
}

export default function ImageCropModal({ imageFile, isOpen, onClose, onSave }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [aspect, setAspect] = useState(null) // null = Free
  const [isProcessing, setIsProcessing] = useState(false)

  const imageSrc = React.useMemo(() => {
    return imageFile ? URL.createObjectURL(imageFile) : null
  }, [imageFile])

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleApplyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return

    try {
      setIsProcessing(true)
      const croppedFile = await getCroppedImgFile(
        imageSrc,
        croppedAreaPixels,
        rotation,
        `edited_${imageFile?.name || 'photo.png'}`
      )
      onSave(croppedFile)
    } catch (err) {
      console.error('Failed to crop image:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setAspect(null)
  }

  if (!isOpen || !imageSrc) return null

  const aspectPresets = [
    { label: 'Free', value: null },
    { label: '1:1 Square', value: 1 / 1 },
    { label: '4:3 Standard', value: 4 / 3 },
    { label: '16:9 Wide', value: 16 / 9 },
    { label: 'A4 Document', value: 1 / 1.414 },
    { label: 'Passport (3.5x4.5)', value: 3.5 / 4.5 },
  ]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/85 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[92vh] max-h-200 border border-stone-200"
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand text-white flex items-center justify-center shadow-md shadow-rose-500/20">
                <Crop className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-stone-900 leading-tight">
                  Image Crop & Orientation
                </h3>
                <span className="text-xs text-stone-500 font-medium">
                  Adjust crop area, zoom, and orientation before printing
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-ghost btn-sm text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost btn-sm p-2 text-stone-500 hover:bg-stone-200!"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Cropper Stage */}
          <div className="relative flex-1 min-h-0 bg-stone-950 overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect || undefined}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              classes={{
                containerClassName: 'relative w-full h-full',
              }}
            />
          </div>

          {/* Bottom Toolbar & Presets */}
          <div className="p-4 sm:p-5 bg-white border-t border-stone-200 flex flex-col gap-4 shrink-0">
            {/* Aspect Presets Row */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <span className="text-xs font-bold text-stone-500 shrink-0 mr-1">Aspect:</span>
              {aspectPresets.map((p) => {
                const isActive = aspect === p.value
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setAspect(p.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${isActive
                        ? 'bg-brand text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                      }`}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>

            {/* Controls: Zoom & Rotate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {/* Zoom Slider */}
              <div className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
                <ZoomOut className="w-4 h-4 text-stone-500 shrink-0" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-brand cursor-pointer h-2 bg-stone-200 rounded-lg"
                />
                <ZoomIn className="w-4 h-4 text-stone-500 shrink-0" />
                <span className="text-xs font-mono font-bold text-stone-700 w-10 text-right shrink-0">
                  {zoom.toFixed(1)}x
                </span>
              </div>

              {/* Rotate Button */}
              <div className="flex items-center justify-between bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
                <span className="text-xs font-bold text-stone-700">Rotate +90°</span>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="btn btn-outline btn-sm py-1 px-3 bg-white text-stone-800 flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5 text-brand" />
                  <span>Rotate</span>
                </button>
              </div>
            </div>

            {/* Save & Cancel Footer */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline px-5 py-2.5 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                disabled={isProcessing}
                className="btn btn-primary px-6 py-2.5 shadow-md flex items-center gap-2 text-xs font-bold"
              >
                <Check className="w-4 h-4" />
                <span>{isProcessing ? 'Processing Image...' : 'Crop & Save Edits'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
