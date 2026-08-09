import React, { useRef } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { Printer, Smartphone, ArrowRight, Download, ScanLine, CheckCircle2 } from 'lucide-react';
import { toPng } from 'html-to-image';

export default function OwnerQrCode() {
  const shopCode = 'SHOP_98234';
  const kioskUrl = `https://qrprintpe.com/p/${shopCode}`;

  // Ref for the poster container to capture it
  const posterRef = useRef(null);

  const handleDownloadImage = async () => {
    if (!posterRef.current) return;

    try {
      const btn = document.getElementById('download-btn');
      const originalText = btn.innerHTML;
      btn.innerHTML = 'Generating High-Res Image...';
      btn.style.opacity = '0.5';

      // pixelRatio: 4 ensures 4K ultra-high quality print resolution
      const dataUrl = await toPng(posterRef.current, {
        pixelRatio: 4,
        backgroundColor: '#e2e8f0', // Matches the slate-200 background
        style: {
          margin: '0',
        }
      });

      const link = document.createElement('a');
      link.download = `Scan_And_Print_Horizontal_Poster.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      btn.innerHTML = originalText;
      btn.style.opacity = '1';

    } catch (error) {
      console.error('Error generating poster image:', error);
      alert("Download error: " + error.message);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl w-full mx-auto">

      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
            Horizontal QR Poster
          </h1>
          <p className="text-stone-500 text-sm mt-1 font-medium">
            Download this landscape poster matching your reference design
          </p>
        </div>

        <button
          id="download-btn"
          onClick={handleDownloadImage}
          className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-xl text-sm font-extrabold flex items-center gap-2 shadow-md shrink-0 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Poster (PNG)</span>
        </button>
      </div>

      {/* --- HORIZONTAL POSTER LAYOUT (Based on image_158315.png) --- */}
      <div className="flex justify-center w-full pb-10 overflow-x-auto">

        {/*
          A4 Landscape Aspect Ratio (1.414 : 1).
          No rounded corners on the main container so it prints full-bleed on paper.
        */}
        <div
          ref={posterRef}
          className="w-full min-w-[700px] max-w-[900px] aspect-[1.4142/1] bg-slate-200 shadow-2xl flex flex-col items-center py-10 px-12 border border-slate-300"
        >

          {/* 1. Header Area: Scan & Print */}
          <div className="flex items-center justify-center gap-5 w-full">
            <Printer className="w-16 h-16 text-blue-900 stroke-[2.5]" />
            <h1 className="text-[5.5rem] leading-none font-black text-slate-800 font-heading tracking-tight">
              Scan <span className="text-blue-900">& Print</span>
            </h1>
          </div>

          {/* 2. Blue Steps Banner */}
          <div className="bg-blue-900 text-white font-black text-2xl uppercase tracking-[0.3em] w-[105%] py-3 mt-8 text-center shadow-md">
            SCAN • UPLOAD • PAY • PRINT
          </div>

          {/* 3. Main Row: Step 1 -> QR -> Step 2 */}
          <div className="flex-1 flex items-center justify-between w-full mt-10 px-4">

            {/* Left Box (Step 1) */}
            <div className="flex flex-col items-center justify-center bg-white border-2 border-slate-300 rounded-2xl w-48 h-48 shadow-lg p-4">
              <div className="w-20 h-20 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center mb-3">
                <ScanLine className="w-10 h-10 stroke-[2.5]" />
              </div>
              <span className="font-black text-2xl text-slate-800">1. SCAN</span>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">With Phone</span>
            </div>

            {/* Arrow */}
            <ArrowRight className="w-16 h-16 text-blue-900 stroke-[3]" />

            {/* Center Box (QR Code) */}
            <div className="bg-white p-5 rounded-3xl shadow-xl border-4 border-slate-300 relative flex flex-col items-center">
              <QRCode
                value={kioskUrl}
                size={220}
                qrStyle="dots"
                eyeRadius={[8, 8, 8]}
                fgColor="#1e3a8a" // dark blue color for QR dots
                bgColor="#ffffff"
                logoWidth={50}
                logoHeight={50}
                quietZone={0}
              />
              {/* Shop ID Tag inside QR Box */}
              <div className="mt-4 bg-slate-100 text-slate-800 font-bold text-sm tracking-widest px-4 py-1.5 rounded-md border border-slate-200">
                ID: {shopCode}
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight className="w-16 h-16 text-blue-900 stroke-[3]" />

            {/* Right Box (Step 2) */}
            <div className="flex flex-col items-center justify-center bg-white border-2 border-slate-300 rounded-2xl w-48 h-48 shadow-lg p-4">
              <div className="w-20 h-20 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <span className="font-black text-2xl text-slate-800">2. PRINT</span>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Instant Output</span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}