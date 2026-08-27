import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  CreditCard,
  Loader2,
  Sparkles,
  Scissors,
  CheckCircle2,
  Maximize2,
  ArrowRight,
  RotateCcw,
  Sliders,
  Check,
  Camera,
  Layers,
  Sparkle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  loadOpenCv,
  createImageElement,
  detectCardCorners,
  extractCardPerspective,
} from '../../utils/jscanifyUtil'
import {
  generateIdCardA4Pdf,
  CR80_ASPECT_RATIO,
  XEROX_CARD_WIDTH_MM,
  XEROX_CARD_HEIGHT_MM,
  POCKET_CARD_WIDTH_MM,
  POCKET_CARD_HEIGHT_MM,
} from '../../utils/generateA4Layout'

export default function IdCardPrintStudio({ initialImage = null, onSave = null }) {
  // OpenCV Loading State
  const [isOpenCvReady, setIsOpenCvReady] = useState(false)
  const [isOpenCvLoading, setIsOpenCvLoading] = useState(true)

  // Layout Size Mode: 'xerox_fit' (145 × 91 mm) | 'pocket_cr80' (85.6 × 54 mm)
  const [layoutMode, setLayoutMode] = useState('xerox_fit')

  // Master Processing State
  const [isGenerating, setIsGenerating] = useState(false)

  // FRONT SIDE STATES
  const [frontRawSrc, setFrontRawSrc] = useState(null)
  const [frontCorners, setFrontCorners] = useState([
    { x: 3, y: 3 },
    { x: 97, y: 3 },
    { x: 97, y: 97 },
    { x: 3, y: 97 },
  ])
  const [frontCroppedUrl, setFrontCroppedUrl] = useState(null)
  const [frontAdjustMode, setFrontAdjustMode] = useState(false)
  const [isDetectingFront, setIsDetectingFront] = useState(false)

  // BACK SIDE STATES
  const [backRawSrc, setBackRawSrc] = useState(null)
  const [backCorners, setBackCorners] = useState([
    { x: 3, y: 3 },
    { x: 97, y: 3 },
    { x: 97, y: 97 },
    { x: 3, y: 97 },
  ])
  const [backCroppedUrl, setBackCroppedUrl] = useState(null)
  const [backAdjustMode, setBackAdjustMode] = useState(false)
  const [isDetectingBack, setIsDetectingBack] = useState(false)

  // Active Corner Dragging State: { side: 'front'|'back', cornerIdx: 0..3 }
  const [activeCorner, setActiveCorner] = useState(null)

  // Element Refs
  const frontInputRef = useRef(null)
  const backInputRef = useRef(null)
  const frontStageRef = useRef(null)
  const backStageRef = useRef(null)
  const frontImgRef = useRef(null)
  const backImgRef = useRef(null)

  // Asynchronously initialize OpenCV on mount
  useEffect(() => {
    loadOpenCv()
      .then(() => {
        setIsOpenCvReady(true)
        setIsOpenCvLoading(false)
      })
      .catch((err) => {
        console.warn('OpenCV initialization failed:', err)
        setIsOpenCvLoading(false)
      })
  }, [])

  // Auto-Crop Handler for Front Side
  const runFrontAutoCrop = useCallback(async (srcUrl) => {
    const src = srcUrl || frontRawSrc
    if (!src) return
    setIsDetectingFront(true)
    try {
      await loadOpenCv()
      const img = await createImageElement(src)
      frontImgRef.current = img

      const { cornersPct } = await detectCardCorners(img)
      setFrontCorners(cornersPct)

      const res = await extractCardPerspective(img, cornersPct)
      setFrontCroppedUrl(res.dataUrl)
      setFrontAdjustMode(false)
      toast.success('⚡ Card detected & perspective-corrected!', { id: 'front-detect' })
    } catch (err) {
      console.warn('Front auto-crop error:', err)
      toast.error('Could not detect card contour. You can adjust corners manually.')
      setFrontAdjustMode(true)
    } finally {
      setIsDetectingFront(false)
    }
  }, [frontRawSrc])

  // Auto-Crop Handler for Back Side
  const runBackAutoCrop = useCallback(async (srcUrl) => {
    const src = srcUrl || backRawSrc
    if (!src) return
    setIsDetectingBack(true)
    try {
      await loadOpenCv()
      const img = await createImageElement(src)
      backImgRef.current = img

      const { cornersPct } = await detectCardCorners(img)
      setBackCorners(cornersPct)

      const res = await extractCardPerspective(img, cornersPct)
      setBackCroppedUrl(res.dataUrl)
      setBackAdjustMode(false)
      toast.success('⚡ Card detected & perspective-corrected!', { id: 'back-detect' })
    } catch (err) {
      console.warn('Back auto-crop error:', err)
      toast.error('Could not detect card contour. You can adjust corners manually.')
      setBackAdjustMode(true)
    } finally {
      setIsDetectingBack(false)
    }
  }, [backRawSrc])

  // Re-apply perspective crop when corners are adjusted manually
  const applyCustomCorners = async (side) => {
    try {
      if (side === 'front') {
        const img = frontImgRef.current || (await createImageElement(frontRawSrc))
        frontImgRef.current = img
        const res = await extractCardPerspective(img, frontCorners)
        setFrontCroppedUrl(res.dataUrl)
        setFrontAdjustMode(false)
        toast.success('Applied custom corners crop!')
      } else {
        const img = backImgRef.current || (await createImageElement(backRawSrc))
        backImgRef.current = img
        const res = await extractCardPerspective(img, backCorners)
        setBackCroppedUrl(res.dataUrl)
        setBackAdjustMode(false)
        toast.success('Applied custom corners crop!')
      }
    } catch (err) {
      console.error('Error applying custom corners:', err)
      toast.error('Failed to crop with selected corners')
    }
  }

  // Load initial image if provided from parent modal
  useEffect(() => {
    if (initialImage && !frontRawSrc) {
      if (typeof initialImage === 'string') {
        setFrontRawSrc(initialImage)
        runFrontAutoCrop(initialImage)
      } else if (initialImage instanceof Blob || initialImage instanceof File) {
        const url = URL.createObjectURL(initialImage)
        setFrontRawSrc(url)
        runFrontAutoCrop(url)
      }
    }
  }, [initialImage, frontRawSrc, runFrontAutoCrop])

  // File Select Handlers (No react-dropzone!)
  const handleFrontFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setFrontRawSrc(url)
    await runFrontAutoCrop(url)
  }

  const handleBackFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setBackRawSrc(url)
    await runBackAutoCrop(url)
  }

  // Corner Dragging Events
  const handleStartCornerDrag = (side, cornerIdx, e) => {
    e.preventDefault()
    e.stopPropagation()
    setActiveCorner({ side, cornerIdx })
  }

  const handleCornerMove = useCallback(
    (e) => {
      if (!activeCorner) return
      const { side, cornerIdx } = activeCorner
      const stage = side === 'front' ? frontStageRef.current : backStageRef.current
      if (!stage) return

      const rect = stage.getBoundingClientRect()
      const clientX = e.clientX || (e.touches && e.touches[0].clientX)
      const clientY = e.clientY || (e.touches && e.touches[0].clientY)

      if (clientX == null || clientY == null) return

      let pctX = ((clientX - rect.left) / rect.width) * 100
      let pctY = ((clientY - rect.top) / rect.height) * 100

      pctX = Math.max(0, Math.min(100, Math.round(pctX * 10) / 10))
      pctY = Math.max(0, Math.min(100, Math.round(pctY * 10) / 10))

      if (side === 'front') {
        setFrontCorners((prev) => {
          const next = [...prev]
          next[cornerIdx] = { x: pctX, y: pctY }
          return next
        })
      } else {
        setBackCorners((prev) => {
          const next = [...prev]
          next[cornerIdx] = { x: pctX, y: pctY }
          return next
        })
      }
    },
    [activeCorner]
  )

  const handleCornerEnd = useCallback(() => {
    setActiveCorner(null)
  }, [])

  useEffect(() => {
    if (activeCorner) {
      window.addEventListener('mousemove', handleCornerMove)
      window.addEventListener('mouseup', handleCornerEnd)
      window.addEventListener('touchmove', handleCornerMove)
      window.addEventListener('touchend', handleCornerEnd)
    }
    return () => {
      window.removeEventListener('mousemove', handleCornerMove)
      window.removeEventListener('mouseup', handleCornerEnd)
      window.removeEventListener('touchmove', handleCornerMove)
      window.removeEventListener('touchend', handleCornerEnd)
    }
  }, [activeCorner, handleCornerMove, handleCornerEnd])

  // Master Single-Click Generate A4 PDF Handler
  const handleGenerateLayout = async () => {
    if (!frontCroppedUrl) {
      toast.error('Please upload and scan the Front side photo')
      return
    }
    if (!backCroppedUrl) {
      toast.error('Please upload and scan the Back side photo')
      return
    }

    setIsGenerating(true)

    try {
      const filename = `id_card_a4_${Date.now()}.pdf`
      const result = await generateIdCardA4Pdf({
        frontImage: frontCroppedUrl,
        backImage: backCroppedUrl,
        layoutMode,
        filename,
        triggerDownload: false,
      })

      toast.success('Document ready for printing!')

      if (onSave && typeof onSave === 'function') {
        const generatedPdfFile = new File([result.blob], filename, {
          type: 'application/pdf',
        })
        onSave(generatedPdfFile)
      }
    } catch (err) {
      console.error('ID card generation error:', err)
      toast.error('Failed to generate A4 print layout: ' + (err.message || 'Unknown error'))
    } finally {
      setIsGenerating(false)
    }
  }

  const activeCardWidth = layoutMode === 'xerox_fit' ? XEROX_CARD_WIDTH_MM : POCKET_CARD_WIDTH_MM
  const activeCardHeight = layoutMode === 'xerox_fit' ? XEROX_CARD_HEIGHT_MM : POCKET_CARD_HEIGHT_MM

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-stone-100/70 p-3 sm:p-5 gap-4">
      {/* OpenCV Loading Indicator Banner */}
      {isOpenCvLoading && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 rounded-xl p-2.5 px-3.5 flex items-center justify-between text-xs font-bold animate-pulse">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
            <span>Loading Document Auto-Detection Engine (OpenCV / WASM)...</span>
          </div>
          <span className="text-[10px] text-amber-700 font-mono">Initializing AI</span>
        </div>
      )}

      {/* Layout Size Selector */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-brand" />
            <span>Card Print Size on A4 Sheet</span>
          </span>
          <span className="text-[11px] text-stone-500 font-medium">
            Select printout scale (Large Xerox format fills top &amp; bottom half of A4 page)
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setLayoutMode('xerox_fit')}
            className={`flex-1 sm:flex-initial py-2 px-3.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${layoutMode === 'xerox_fit'
              ? 'bg-brand text-white shadow-xs'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
          >
            <span>Large Half-Page Fit (145 × 91 mm)</span>
            <span className="text-[10px] bg-amber-400 text-stone-950 px-1.5 py-0.2 rounded font-black">
              As Drawn
            </span>
          </button>

          <button
            type="button"
            onClick={() => setLayoutMode('pocket_cr80')}
            className={`flex-1 sm:flex-initial py-2 px-3.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${layoutMode === 'pocket_cr80'
              ? 'bg-brand text-white shadow-xs'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
          >
            <span>Pocket Size (85.6 × 54 mm)</span>
          </button>
        </div>
      </div>

      {/* Two Scanning Panels: Front Side & Back Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ========================================================================= */}
        {/* PANEL 1: FRONT SIDE */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand text-white text-xs font-black flex items-center justify-center">
                1
              </span>
              <h4 className="text-xs sm:text-sm font-extrabold text-stone-900">
                Front Side of ID Card
              </h4>
            </div>

            {frontRawSrc && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => runFrontAutoCrop()}
                  disabled={isDetectingFront}
                  className="text-[11px] font-extrabold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="Automatically scan card boundary and perspective-correct"
                >
                  {isDetectingFront ? (
                    <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                  )}
                  <span>Auto-Crop Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFrontAdjustMode(!frontAdjustMode)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${frontAdjustMode
                    ? 'bg-brand text-white border-brand shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                    }`}
                  title="Fine-tune 4 corner points"
                >
                  <Sliders className="w-3 h-3" />
                  <span>{frontAdjustMode ? 'Close Corners' : 'Adjust Corners'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => frontInputRef.current?.click()}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={frontInputRef}
            onChange={handleFrontFileChange}
            accept="image/*"
            className="hidden"
          />

          {!frontRawSrc ? (
            <div
              onClick={() => frontInputRef.current?.click()}
              className="h-60 sm:h-68 rounded-xl border-2 border-dashed border-stone-300 hover:border-brand hover:bg-stone-50/70 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all group"
            >
              <div className="w-13 h-13 rounded-2xl bg-rose-50 text-brand flex items-center justify-center mb-2.5 shadow-2xs group-hover:scale-105 transition-transform">
                <Camera className="w-6 h-6 stroke-[2.2]" />
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-stone-800">
                Select Front Side Photo
              </p>
              <p className="text-[11px] text-stone-500 font-medium mt-1">
                Click to browse or take photo (Auto-detects 4 corners)
              </p>
              <button
                type="button"
                className="mt-3 px-4 py-1.5 bg-brand text-white text-xs font-bold rounded-xl shadow-xs pointer-events-none"
              >
                Choose Photo
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Interactive Area: Either Adjust Corners on Raw Photo OR View Straight Clean Document */}
              <div className="relative w-full h-60 sm:h-68 rounded-xl overflow-hidden bg-stone-950 shadow-inner border border-stone-800 flex items-center justify-center">
                {isDetectingFront && (
                  <div className="absolute inset-0 bg-stone-950/80 z-50 flex flex-col items-center justify-center gap-2 text-white">
                    <Loader2 className="w-7 h-7 animate-spin text-amber-400" />
                    <span className="text-xs font-bold">Scanning Document Boundaries...</span>
                  </div>
                )}

                {frontAdjustMode ? (
                  /* 4-Corner Draggable Pins View */
                  <div
                    ref={frontStageRef}
                    className="relative inline-block select-none max-w-full max-h-full"
                  >
                    <img
                      src={frontRawSrc}
                      alt="Front Original"
                      className="block max-w-full max-h-58.75 sm:max-h-66.25 w-auto h-auto object-contain pointer-events-none"
                    />

                    {/* High-Visibility SVG Boundary Polygon */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                      <defs>
                        <mask id="front-crop-mask">
                          <rect x="0" y="0" width="100%" height="100%" fill="white" />
                          <polygon
                            points={`${frontCorners[0].x}%,${frontCorners[0].y}% ${frontCorners[1].x}%,${frontCorners[1].y}% ${frontCorners[2].x}%,${frontCorners[2].y}% ${frontCorners[3].x}%,${frontCorners[3].y}%`}
                            fill="black"
                          />
                        </mask>
                      </defs>
                      <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill="rgba(15, 23, 42, 0.45)"
                        mask="url(#front-crop-mask)"
                      />
                      <polygon
                        points={`${frontCorners[0].x}%,${frontCorners[0].y}% ${frontCorners[1].x}%,${frontCorners[1].y}% ${frontCorners[2].x}%,${frontCorners[2].y}% ${frontCorners[3].x}%,${frontCorners[3].y}%`}
                        fill="rgba(225, 29, 72, 0.08)"
                        stroke="#ffffff"
                        strokeWidth="3.5"
                        strokeLinejoin="round"
                      />
                      <polygon
                        points={`${frontCorners[0].x}%,${frontCorners[0].y}% ${frontCorners[1].x}%,${frontCorners[1].y}% ${frontCorners[2].x}%,${frontCorners[2].y}% ${frontCorners[3].x}%,${frontCorners[3].y}%`}
                        fill="none"
                        stroke="#e11d48"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>

                    {/* 4 Corner Draggable Magnifier Pins */}
                    {frontCorners.map((pt, idx) => (
                      <div
                        key={idx}
                        onMouseDown={(e) => handleStartCornerDrag('front', idx, e)}
                        onTouchStart={(e) => handleStartCornerDrag('front', idx, e)}
                        className="absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing group touch-none"
                        style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                      >
                        <div className="w-7 h-7 rounded-full bg-brand/40 border-2 border-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-125">
                          <div className="w-3 h-3 rounded-full bg-brand border border-white shadow-xs" />
                        </div>
                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[8px] font-black px-1 rounded pointer-events-none">
                          {idx === 0 ? 'TL' : idx === 1 ? 'TR' : idx === 2 ? 'BR' : 'BL'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Clean Perspective-Corrected Scanned Document Preview */
                  <div className="relative w-full h-full flex items-center justify-center p-2">
                    {frontCroppedUrl ? (
                      <img
                        src={frontCroppedUrl}
                        alt="Front Scanned Document"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-md border border-stone-800"
                      />
                    ) : (
                      <img
                        src={frontRawSrc}
                        alt="Front Raw"
                        className="max-w-full max-h-full object-contain"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Adjust Mode Bottom Confirmation */}
              {frontAdjustMode ? (
                <div className="flex items-center justify-between bg-stone-50 p-2 px-3 rounded-xl border border-stone-200 text-xs">
                  <span className="text-[11px] text-stone-600 font-medium">
                    Drag the 4 corner pins to frame the card
                  </span>
                  <button
                    type="button"
                    onClick={() => applyCustomCorners('front')}
                    className="btn btn-primary px-3 py-1 text-xs font-bold rounded-lg shadow-xs flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Scan</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-1 text-[11px] text-stone-500 font-medium">
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Perspective Corrected (CR80)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setFrontAdjustMode(true)}
                    className="text-stone-600 hover:text-stone-900 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Fine-tune corners</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* PANEL 2: BACK SIDE */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand text-white text-xs font-black flex items-center justify-center">
                2
              </span>
              <h4 className="text-xs sm:text-sm font-extrabold text-stone-900">
                Back Side of ID Card
              </h4>
            </div>

            {backRawSrc && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => runBackAutoCrop()}
                  disabled={isDetectingBack}
                  className="text-[11px] font-extrabold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="Automatically scan card boundary and perspective-correct"
                >
                  {isDetectingBack ? (
                    <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                  )}
                  <span>Auto-Crop Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBackAdjustMode(!backAdjustMode)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${backAdjustMode
                    ? 'bg-brand text-white border-brand shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                    }`}
                  title="Fine-tune 4 corner points"
                >
                  <Sliders className="w-3 h-3" />
                  <span>{backAdjustMode ? 'Close Corners' : 'Adjust Corners'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => backInputRef.current?.click()}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={backInputRef}
            onChange={handleBackFileChange}
            accept="image/*"
            className="hidden"
          />

          {!backRawSrc ? (
            <div
              onClick={() => backInputRef.current?.click()}
              className="h-60 sm:h-68 rounded-xl border-2 border-dashed border-stone-300 hover:border-brand hover:bg-stone-50/70 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all group"
            >
              <div className="w-13 h-13 rounded-2xl bg-rose-50 text-brand flex items-center justify-center mb-2.5 shadow-2xs group-hover:scale-105 transition-transform">
                <Camera className="w-6 h-6 stroke-[2.2]" />
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-stone-800">
                Select Back Side Photo
              </p>
              <p className="text-[11px] text-stone-500 font-medium mt-1">
                Click to browse or take photo (Auto-detects 4 corners)
              </p>
              <button
                type="button"
                className="mt-3 px-4 py-1.5 bg-brand text-white text-xs font-bold rounded-xl shadow-xs pointer-events-none"
              >
                Choose Photo
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Interactive Area: Either Adjust Corners on Raw Photo OR View Straight Clean Document */}
              <div className="relative w-full h-60 sm:h-68 rounded-xl overflow-hidden bg-stone-950 shadow-inner border border-stone-800 flex items-center justify-center">
                {isDetectingBack && (
                  <div className="absolute inset-0 bg-stone-950/80 z-50 flex flex-col items-center justify-center gap-2 text-white">
                    <Loader2 className="w-7 h-7 animate-spin text-amber-400" />
                    <span className="text-xs font-bold">Scanning Document Boundaries...</span>
                  </div>
                )}

                {backAdjustMode ? (
                  /* 4-Corner Draggable Pins View */
                  <div
                    ref={backStageRef}
                    className="relative inline-block select-none max-w-full max-h-full"
                  >
                    <img
                      src={backRawSrc}
                      alt="Back Original"
                      className="block max-w-full max-h-58.75 sm:max-h-66.25 w-auto h-auto object-contain pointer-events-none"
                    />

                    {/* High-Visibility SVG Boundary Polygon */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                      <defs>
                        <mask id="back-crop-mask">
                          <rect x="0" y="0" width="100%" height="100%" fill="white" />
                          <polygon
                            points={`${backCorners[0].x}%,${backCorners[0].y}% ${backCorners[1].x}%,${backCorners[1].y}% ${backCorners[2].x}%,${backCorners[2].y}% ${backCorners[3].x}%,${backCorners[3].y}%`}
                            fill="black"
                          />
                        </mask>
                      </defs>
                      <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill="rgba(15, 23, 42, 0.45)"
                        mask="url(#back-crop-mask)"
                      />
                      <polygon
                        points={`${backCorners[0].x}%,${backCorners[0].y}% ${backCorners[1].x}%,${backCorners[1].y}% ${backCorners[2].x}%,${backCorners[2].y}% ${backCorners[3].x}%,${backCorners[3].y}%`}
                        fill="rgba(225, 29, 72, 0.08)"
                        stroke="#ffffff"
                        strokeWidth="3.5"
                        strokeLinejoin="round"
                      />
                      <polygon
                        points={`${backCorners[0].x}%,${backCorners[0].y}% ${backCorners[1].x}%,${backCorners[1].y}% ${backCorners[2].x}%,${backCorners[2].y}% ${backCorners[3].x}%,${backCorners[3].y}%`}
                        fill="none"
                        stroke="#e11d48"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>

                    {/* 4 Corner Draggable Magnifier Pins */}
                    {backCorners.map((pt, idx) => (
                      <div
                        key={idx}
                        onMouseDown={(e) => handleStartCornerDrag('back', idx, e)}
                        onTouchStart={(e) => handleStartCornerDrag('back', idx, e)}
                        className="absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing group touch-none"
                        style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                      >
                        <div className="w-7 h-7 rounded-full bg-brand/40 border-2 border-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-125">
                          <div className="w-3 h-3 rounded-full bg-brand border border-white shadow-xs" />
                        </div>
                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[8px] font-black px-1 rounded pointer-events-none">
                          {idx === 0 ? 'TL' : idx === 1 ? 'TR' : idx === 2 ? 'BR' : 'BL'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Clean Perspective-Corrected Scanned Document Preview */
                  <div className="relative w-full h-full flex items-center justify-center p-2">
                    {backCroppedUrl ? (
                      <img
                        src={backCroppedUrl}
                        alt="Back Scanned Document"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-md border border-stone-800"
                      />
                    ) : (
                      <img
                        src={backRawSrc}
                        alt="Back Raw"
                        className="max-w-full max-h-full object-contain"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Adjust Mode Bottom Confirmation */}
              {backAdjustMode ? (
                <div className="flex items-center justify-between bg-stone-50 p-2 px-3 rounded-xl border border-stone-200 text-xs">
                  <span className="text-[11px] text-stone-600 font-medium">
                    Drag the 4 corner pins to frame the card
                  </span>
                  <button
                    type="button"
                    onClick={() => applyCustomCorners('back')}
                    className="btn btn-primary px-3 py-1 text-xs font-bold rounded-lg shadow-xs flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Scan</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-1 text-[11px] text-stone-500 font-medium">
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Perspective Corrected (CR80)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setBackAdjustMode(true)}
                    className="text-stone-600 hover:text-stone-900 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Fine-tune corners</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Card & Layout Specifications */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h5 className="text-xs sm:text-sm font-extrabold text-stone-900">
              A4 Print Placement Specification
            </h5>
            <p className="text-[11px] text-stone-500 font-medium mt-0.5">
              Portrait A4 (210×297mm) · Front on Top Half, Back on Bottom Half · {activeCardWidth} × {activeCardHeight} mm · 0.2mm Dashed Cutting Guides
            </p>
          </div>
        </div>

        {/* Master Single-Click Button (Save & Proceed without downloading) */}
        <button
          type="button"
          onClick={handleGenerateLayout}
          disabled={!frontCroppedUrl || !backCroppedUrl || isGenerating}
          className="btn btn-primary w-full sm:w-auto px-7 py-3.5 rounded-xl font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Document...</span>
            </>
          ) : (
            <>
              <span>Save &amp; Proceed to Print</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
