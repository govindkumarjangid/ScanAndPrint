import React, { useState, useEffect } from 'react'
import { Clock, AlertCircle } from 'lucide-react'

export default function AdminDemoTimer({ demoExpiresAt, createdAt, status, className = '' }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    let targetTime = null
    if (demoExpiresAt) {
      targetTime = new Date(demoExpiresAt).getTime()
    } else if (createdAt) {
      targetTime = new Date(createdAt).getTime() + 2 * 60 * 60 * 1000
    }

    if (!targetTime || isNaN(targetTime)) {
      if (status === 'Demo Active' || status === 'Active') {
        setIsExpired(false)
        setTimeLeft('02h 00m 00s')
      } else {
        setIsExpired(true)
        setTimeLeft('00h 00m 00s')
      }
      return
    }

    const updateTimer = () => {
      const diffMs = targetTime - Date.now()
      if (diffMs <= 0 || status === 'Demo Expired') {
        setIsExpired(true)
        setTimeLeft('00h 00m 00s')
      } else {
        setIsExpired(false)
        const totalSeconds = Math.floor(diffMs / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60
        const pad = (num) => String(num).padStart(2, '0')
        setTimeLeft(`${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [demoExpiresAt, createdAt, status])

  if (isExpired) {
    return (
      <span className={`inline-flex items-center gap-1.5 bg-rose-950/90 text-rose-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-rose-900 font-mono whitespace-nowrap select-none shrink-0 ${className}`}>
        <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
        <span>Trial Expired</span>
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1.5 bg-stone-900 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 font-mono whitespace-nowrap shadow-xs select-none shrink-0 ${className}`}>
      <Clock className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
      <span>{timeLeft} left</span>
    </span>
  )
}
