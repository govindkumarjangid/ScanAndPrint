import React, { useRef } from 'react'
import { QRCode } from 'react-qrcode-logo'
import { Printer, ArrowRight, ArrowDown, Download, ScanLine, CloudUpload, MapPin } from 'lucide-react'
import { toPng } from 'html-to-image'
import { useAuthStore } from '../../store/useAuthStore'

export default function OwnerQrCode() {
  const { currentShop } = useAuthStore()
  const shopCode = currentShop?.shopCode || 'DEMO_SHOP'
  const shopName = currentShop?.shopName || 'Demo Cyber Cafe'
  const kioskUrl = `${window.location.origin}/p/${shopCode}`

  // Ref for the poster container to capture it
  const posterRef = useRef(null)

  const handleDownloadImage = async () => {
    if (!posterRef.current) return

    try {
      const btn = document.getElementById('download-btn')
      const originalText = btn.innerHTML
      btn.innerHTML = 'Generating High-Res Poster...'
      btn.style.opacity = '0.5'

      // pixelRatio: 4 ensures 4K ultra-high quality print resolution
      const dataUrl = await toPng(posterRef.current, {
        pixelRatio: 4,
        backgroundColor: '#ffffff',
        style: { margin: '0' },
      })

      const link = document.createElement('a')
      link.download = `QR_PrintPe_${shopCode}_Poster.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      btn.innerHTML = originalText
      btn.style.opacity = '1'

    } catch (error) {
      console.error('Error generating poster image:', error)
      alert("Download error: " + error.message)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl w-full mx-auto">

      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
            Shop QR Poster (A4)
          </h1>
          <p className="text-stone-500 text-sm mt-1 font-medium">
            Download this portrait poster matching the official QR Se Print theme.
          </p>
        </div>

        <button
          id="download-btn"
          onClick={handleDownloadImage}
          className="bg-brand hover:bg-blue-800 text-white px-6 py-3 rounded-xl text-sm font-extrabold flex items-center gap-2 shadow-md shrink-0 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Poster (PNG)</span>
        </button>
      </div>

      {/* --- PORTRAIT POSTER LAYOUT (A4 Aspect Ratio: ~1:1.414) --- */}
      <div className="flex justify-center w-full pb-10 overflow-x-auto">
        
        {/*
          A4 Portrait container: Fixed width, height calculated by aspect ratio
        */}
        <div
          ref={posterRef}
          className="w-[794px] h-[1123px] bg-white shadow-2xl relative border-4 border-slate-100 flex flex-col justify-between overflow-hidden shrink-0"
        >
          {/* Main Content Wrapper */}
          <div className="flex flex-col items-center h-full pt-10 pb-0 px-8 relative z-10 bg-slate-50/50">

            {/* 1. Logo Area */}
            <div className="flex flex-col items-center relative mb-8">
              <div className="absolute -top-12 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                <Printer className="text-indigo-600 w-12 h-12 stroke-[2.5]" />
              </div>
              <div className="flex items-end gap-2 text-[90px] leading-none font-black font-heading tracking-tighter mt-4">
                <span className="text-slate-900 tracking-tighter drop-shadow-sm">Scan</span>
                <span className="text-4xl pb-4 font-bold text-slate-400">&</span>
                <span className="text-indigo-600 drop-shadow-sm">Print</span>
              </div>
            </div>

            {/* 2. Gradient Ribbon Banner */}
            <div className="w-[110%] bg-gradient-to-r from-indigo-700 via-blue-600 to-indigo-700 py-4 shadow-lg flex justify-center mb-14 relative overflow-hidden">
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
              
              <h2 className="text-white text-[26px] font-black uppercase tracking-[0.25em] whitespace-nowrap px-10 drop-shadow-md">
                SCAN <span className="text-amber-300 mx-3 opacity-80">•</span> UPLOAD <span className="text-amber-300 mx-3 opacity-80">•</span> PAY <span className="text-amber-300 mx-3 opacity-80">•</span> PRINT
              </h2>
            </div>

            {/* 3. Steps and QR Layout */}
            <div className="relative w-full flex justify-center items-start mt-2 px-4">
              
              {/* Left Step 1 */}
              <div className="absolute left-0 top-1/2 -translate-y-[80%] flex flex-col items-center">
                <div className="bg-white border border-slate-200 rounded-3xl flex flex-col items-center justify-center w-36 py-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative z-10 hover:-translate-y-1 transition-transform">
                  <div className="bg-indigo-50 text-indigo-600 p-3.5 rounded-2xl mb-3">
                    <ScanLine className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <h3 className="text-slate-800 font-black text-xl leading-tight mb-1">1. SCAN</h3>
                  <p className="text-sm font-semibold text-slate-500">QR Code</p>
                  <p className="text-sm font-semibold text-slate-500">Scan करें</p>
                </div>
                <ArrowRight className="text-indigo-300 w-10 h-10 absolute -right-12 top-1/2 -translate-y-1/2 stroke-[3]" />
              </div>

              {/* Center QR Code Container */}
              <div className="bg-white p-6 rounded-[2.5rem] border-8 border-indigo-50 shadow-[0_20px_50px_rgb(55,48,163,0.15)] relative z-20 flex flex-col items-center">
                <QRCode
                  value={kioskUrl}
                  size={260}
                  qrStyle="dots"
                  eyeRadius={[10, 10, 10]}
                  fgColor="#1e1b4b" // very dark indigo
                  bgColor="#ffffff"
                  logoWidth={50}
                  logoHeight={50}
                  quietZone={10}
                />
                {/* Modern Tag */}
                <div className="absolute -bottom-5 bg-indigo-600 text-white text-xs font-black tracking-widest px-6 py-2 rounded-full shadow-md border-2 border-white">
                  AUTO-PRINT
                </div>
              </div>

              {/* Right Step 3 */}
              <div className="absolute right-0 top-1/2 -translate-y-[80%] flex flex-col items-center">
                <ArrowRight className="text-indigo-300 w-10 h-10 absolute -left-12 top-1/2 -translate-y-1/2 stroke-[3]" />
                <div className="bg-white border border-slate-200 rounded-3xl flex flex-col items-center justify-center w-36 py-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative z-10 hover:-translate-y-1 transition-transform">
                  <div className="bg-indigo-50 text-indigo-600 p-3.5 rounded-2xl mb-3">
                    <Printer className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <h3 className="text-slate-800 font-black text-xl leading-tight mb-1">3. PRINT</h3>
                  <p className="text-sm font-semibold text-slate-500">Automatic</p>
                  <p className="text-sm font-semibold text-slate-500">Print होगा</p>
                </div>
              </div>
            </div>

            {/* Bottom Step 2 (Upload & Pay) */}
            <div className="mt-14 flex justify-center w-full z-10">
              <div className="bg-white border border-slate-200 rounded-2xl flex items-center justify-start w-4/5 py-4 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] gap-6 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-600"></div>
                <div className="bg-indigo-50 text-indigo-600 p-3.5 rounded-xl shrink-0">
                  <CloudUpload className="w-8 h-8 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-slate-800 font-black text-2xl leading-tight">2. UPLOAD & PAY</h3>
                  <p className="text-[15px] font-semibold text-slate-500 mt-1">अपनी File Upload करें और Payment करें</p>
                </div>
              </div>
            </div>

            {/* Modern Action Banner */}
            <div className="w-full mt-12 flex flex-col items-center">
              <div className="bg-amber-400 px-10 py-4 rounded-[2rem] shadow-md flex justify-center items-center gap-4 transform -rotate-1 border-4 border-white">
                <Printer className="text-amber-950 w-8 h-8 stroke-[3]" />
                <h2 className="text-amber-950 text-4xl font-black uppercase tracking-wider font-heading">
                  INSTANT PRINTING
                </h2>
              </div>
              <div className="bg-slate-800 text-white px-8 py-2.5 rounded-full mt-5 font-bold tracking-wide shadow-sm text-sm">
                UPI • Online Payment • Cash Option Available
              </div>
            </div>
            
            <div className="flex-grow"></div>
          </div>

          {/* Premium Footer Area */}
          <div className="bg-indigo-950 w-full py-10 px-12 flex items-center justify-between relative z-20 overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-blue-900/20 transform skew-x-12 translate-x-20"></div>
            
            <div className="bg-white p-4 rounded-2xl rotate-3 shadow-xl relative z-10">
              <MapPin className="text-indigo-600 w-10 h-10 stroke-[2.5]" />
            </div>
            <div className="w-full text-right relative z-10">
              <h3 className="text-indigo-300 text-sm font-black tracking-[0.3em] uppercase mb-1">AVAILABLE ONLY AT</h3>
              <h2 className="text-white text-4xl font-black uppercase font-heading tracking-tight drop-shadow-md">{shopName}</h2>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}