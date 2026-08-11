import React, { useRef } from 'react'
import { QRCode } from 'react-qrcode-logo'
import { Printer, ArrowRight, Download, Smartphone, CloudUpload, MapPin, Wallet } from 'lucide-react'
import { toPng } from 'html-to-image'
import { useAuthStore } from '../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function OwnerQrCode() {
  const { currentShop } = useAuthStore()
  const shopCode = currentShop?.shopCode || 'DEMO_SHOP'
  const shopName = currentShop?.shopName || 'Demo Cyber Cafe'
  const kioskUrl = `${window.location.origin}/p/${shopCode}`

  const posterRef = useRef(null)

  const handleDownloadImage = async () => {
    if (!posterRef.current) return

    try {
      const btn = document.getElementById('download-btn')
      const originalText = btn.innerHTML
      btn.innerHTML = 'Generating High-Res Poster...'
      btn.style.opacity = '0.5'

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
      toast.error("Download error: " + error.message)
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
          className="btn btn-primary"
        >
          <Download className="w-4 h-4" />
          <span>Download Poster (PNG)</span>
        </button>
      </div>

      {/* --- PORTRAIT POSTER LAYOUT (A4 Aspect Ratio: ~1:1.414) --- */}
      <div className="flex justify-center w-full pb-10 overflow-x-auto">
        <div
          ref={posterRef}
          className="w-200 h-281 bg-[#FEFDF9] shadow-2xl relative flex flex-col justify-between overflow-hidden shrink-0 border border-slate-100 font-sans"
        >
          {/* Main Content Wrapper */}
          <div className="flex flex-col items-center h-full pt-12 pb-0 px-10 relative z-10">

            {/* 1. Header Area: Logo & Icons */}
            <div className="flex items-center justify-center w-full relative mb-6 px-12 gap-4">
              {/* Left red lines */}
              <div className="flex flex-col gap-2 rotate-[-20deg] mb-8">
                <div className="w-5 h-1.5 bg-[#E6005C] rounded-full transform -rotate-12"></div>
                <div className="w-6 h-1.5 bg-[#E6005C] rounded-full"></div>
              </div>

              <h1 className="text-[75px] font-black tracking-tight leading-none text-black font-heading flex items-baseline">
                Scan<span className="text-[#E6005C] mx-1">&</span>Print
              </h1>

              {/* Right printer icon in pink box */}
              <div className="bg-[#E6005C] p-3 rounded-2xl ml-2">
                <Printer className="w-12 h-12 text-white stroke-[2.5]" />
              </div>

              {/* Right red lines */}
              <div className="flex flex-col gap-2 rotate-20 mb-8 ml-2">
                <div className="w-6 h-1.5 bg-[#E6005C] rounded-full transform rotate-12"></div>
                <div className="w-5 h-1.5 bg-[#E6005C] rounded-full"></div>
              </div>
            </div>

            {/* 2. Ribbon Banner (Pill shaped) */}
            <div className="w-full max-w-[95%] bg-[#E6005C] py-4 rounded-full shadow-sm flex justify-center mb-10">
              <h2 className="text-white text-3xl font-black uppercase tracking-wider px-4 flex items-center gap-3">
                SCAN <span className="text-white text-lg opacity-80">●</span> UPLOAD <span className="text-white text-lg opacity-80">●</span> PAY <span className="text-white text-lg opacity-80">●</span> PRINT
              </h2>
            </div>

            {/* 3. Main Steps + QR Layout */}
            <div className="relative w-full flex justify-between items-start mt-2 px-2">

              {/* LEFT STEP 1 */}
              <div className="flex flex-col items-center mt-12 z-10 w-44">
                <div className="bg-[#FFF5F8] border-2 border-[#ffb3cc] rounded-3xl flex flex-col items-center justify-center w-full py-6 shadow-sm">
                  {/* Smartphone Icon Illustration */}
                  <div className="mb-4 relative">
                    <Smartphone className="w-14 h-14 text-black stroke-[1.5]" />
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#E6005C] flex flex-wrap p-0.5 gap-0.5">
                      <div className="w-2 h-2 bg-white rounded-sm"></div>
                      <div className="w-2 h-2 bg-white rounded-sm"></div>
                      <div className="w-2 h-2 bg-white rounded-sm"></div>
                      <div className="w-2 h-2 bg-transparent"></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-[#E6005C] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">1</div>
                    <h3 className="text-black font-black text-2xl leading-none">SCAN</h3>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mt-2">QR Code</p>
                  <p className="text-sm font-semibold text-slate-700">Scan करें</p>
                </div>
              </div>

              {/* ARROW LEFT -> CENTER */}
              <div className="flex flex-col items-center mt-32 gap-1 px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E6005C]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#E6005C]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#E6005C]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#E6005C]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#E6005C]"></div>
                <ArrowRight className="text-[#E6005C] w-8 h-8 mt-2 stroke-4" />
              </div>

              {/* CENTER QR CODE */}
              <div className="relative flex flex-col items-center z-20">
                <div className="bg-white p-4 rounded-3xl border-[3px] border-[#E6005C] shadow-sm relative w-75 h-75 flex items-center justify-center">
                  <QRCode
                    value={kioskUrl}
                    size={260}
                    qrStyle="squares"
                    eyeRadius={0}
                    fgColor="#000000"
                    bgColor="#ffffff"
                    logoWidth={50}
                    logoHeight={50}
                    quietZone={10}
                  />
                  {/* Downward triangle pointer */}
                  <div className="absolute -bottom-3.75 left-1/2 -translate-x-1/2 w-0 h-0 border-l-15 border-l-transparent border-t-15 border-t-[#E6005C] border-r-15 border-r-transparent"></div>
                </div>
              </div>

              {/* ARROW CENTER -> RIGHT */}
              <div className="flex flex-col items-center mt-32 gap-1 px-2">
                <ArrowRight className="text-[#E6005C] w-8 h-8 mb-2 stroke-4" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#E6005C]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#E6005C]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#E6005C]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#E6005C]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#E6005C]"></div>
              </div>

              {/* RIGHT STEP 3 */}
              <div className="flex flex-col items-center mt-12 z-10 w-44">
                <div className="bg-[#FFF5F8] border-2 border-[#ffb3cc] rounded-3xl flex flex-col items-center justify-center w-full py-6 shadow-sm">
                  <Printer className="w-14 h-14 text-black stroke-[1.5] mb-4" />
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-[#E6005C] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">3</div>
                    <h3 className="text-black font-black text-2xl leading-none">PRINT</h3>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mt-2">Automatic</p>
                  <p className="text-sm font-semibold text-slate-700">Print होगा</p>
                </div>
              </div>
            </div>

            {/* Bottom Step 2 (Upload & Pay) */}
            <div className="mt-8 flex justify-center w-full z-10">
              <div className="bg-white border-2 border-[#E6005C] rounded-2xl flex items-center justify-center w-[80%] max-w-lg py-5 px-6 shadow-sm gap-6">
                <div className="bg-[#E6005C] text-white p-4 rounded-full shrink-0 shadow-sm">
                  <CloudUpload className="w-10 h-10 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#E6005C] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">2</div>
                    <h3 className="text-black font-black text-[28px] leading-tight font-heading uppercase tracking-tight">UPLOAD & PAY</h3>
                  </div>
                  <p className="text-[16px] font-semibold text-slate-700 mt-1 pl-11">अपनी File Upload करें और Payment करें</p>
                </div>
              </div>
            </div>

            {/* Yellow / Peach Brush Banner */}
            <div className="w-full mt-12 flex flex-col items-center relative">
              {/* Brush stroke background effect (simulated with light orange div with rounded chaotic edges) */}
              <div className="w-[105%] bg-[#FFEBE6] py-8 rounded-3xl relative flex justify-center items-center gap-6 shadow-sm">

                <div className="bg-[#E6005C] p-3 rounded-xl ml-4">
                  <Printer className="text-white w-12 h-12 stroke-[2.5]" />
                </div>

                <div className="flex flex-col justify-center relative">
                  <h2 className="text-black text-5xl font-black uppercase tracking-wide font-heading mb-1">
                    AUTOMATIC PRINT
                  </h2>
                  <div className="flex items-center justify-center gap-3 text-slate-700 font-bold text-lg">
                    <span>Fast</span> <span className="text-[#E6005C]">●</span> <span>Easy</span> <span className="text-[#E6005C]">●</span> <span>Secure</span>
                  </div>
                </div>

                {/* Right red lines */}
                <div className="flex flex-col gap-2 rotate-20 absolute right-8 top-1/2 -translate-y-1/2">
                  <div className="w-8 h-1.5 bg-[#E6005C] rounded-full transform rotate-12"></div>
                  <div className="w-6 h-1.5 bg-[#E6005C] rounded-full"></div>
                </div>
              </div>

              {/* Pay Online Pill */}
              <div className="bg-white border border-slate-100 rounded-full px-8 py-4 shadow-md flex items-center gap-4 mt-6 z-20">
                <div className="bg-[#E6005C] p-1.5 rounded-lg">
                  <Wallet className="text-white w-6 h-6 stroke-2" />
                </div>
                <span className="text-xl font-bold text-black tracking-tight">
                  Pay Online Or Pay Cash Option Available
                </span>
              </div>
            </div>

            <div className="grow" />
          </div>

          {/* Black Footer Area */}
          <div className="bg-black w-full py-6 px-12 flex flex-col items-center justify-center relative z-20 overflow-visible mt-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-24 h-0.5 bg-[#E6005C]"></div>
              <h3 className="text-white text-[15px] font-extrabold tracking-[0.15em] uppercase">AVAILABLE ONLY AT</h3>
              <div className="w-24 h-0.5 bg-[#E6005C]"></div>
            </div>

            <div className="flex items-center justify-center w-full relative">
              <div className="absolute left-10 -top-8">
                <MapPin className="text-[#E6005C] w-12 h-12 stroke-[2.5] fill-transparent" />
              </div>
              <h2 className="text-white text-3xl font-black uppercase tracking-tight">{shopName}</h2>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}