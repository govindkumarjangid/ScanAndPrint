import { ArrowLeft, Sparkles, Loader2, Check } from 'lucide-react'

/**
 * Dedicated 4-Point Perspective Cropper Overlay Modal
 * Provides interactive corner drag pins, SVG boundary mask, and auto-detection
 */
export default function KioskPerspectiveModal({
  croppingItem,
  cropImgSize,
  setCropImgSize,
  docCorners,
  onCornerDragStart,
  onClose,
  onAutoDetect,
  isDetecting,
  onApply,
  isProcessing,
  cropStageRef,
}) {
  if (!croppingItem) return null

  return (
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
              onMouseDown={(e) => onCornerDragStart(cIdx, e)}
              onTouchStart={(e) => onCornerDragStart(cIdx, e)}
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
          onClick={onClose}
          className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAutoDetect}
            disabled={isDetecting}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            title="Auto-detect document boundaries"
          >
            {isDetecting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Auto-Detect</span>
          </button>

          <button
            type="button"
            onClick={onApply}
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
    </div>
  )
}
