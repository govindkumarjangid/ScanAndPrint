import React from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import IdCardPrintStudio from '../components/kiosk/IdCardPrintStudio'

export default function IdCardPrintPage() {
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      <Helmet>
        <title>ID Card Print Layout (Front &amp; Back) - Scan&amp;Print</title>
        <meta
          name="description"
          content="Upload and crop front and back photos of your ID Card (Aadhaar, PAN, DL) to standard CR80 ratio and generate a centered, print-ready A4 PDF with cutting guides."
        />
      </Helmet>

      {/* Header */}
      <header className="bg-white border-b border-stone-200/80 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <img src="/svgs/logo.svg" alt="Scan&Print" className="w-6 h-6 object-contain" />
            <h1 className="font-extrabold text-sm sm:text-base text-stone-900 font-heading">
              Scan<span className="text-brand">&amp;</span>Print <span className="text-stone-300 font-normal">|</span> ID Card Print Studio
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-xl">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>100% Free · Client-Side Processing</span>
          </span>
        </div>
      </header>

      {/* Main Studio Container */}
      <main className="flex-1 flex flex-col p-2 sm:p-6 max-w-6xl w-full mx-auto">
        <div className="flex-1 bg-white rounded-3xl border border-stone-200/80 shadow-md overflow-hidden flex flex-col min-h-170">
          <IdCardPrintStudio />
        </div>
      </main>
    </div>
  )
}
