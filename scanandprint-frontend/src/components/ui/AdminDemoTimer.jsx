import React, { useState, useEffect } from 'react'
import { Clock, AlertCircle } from 'lucide-react'

export default function AdminDemoTimer({
  expiresAt,
  demoExpiresAt,
  subscriptionExpiresAt,
  createdAt,
  status,
  planType = 'FREE_TRIAL',
  className = '',
}) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isExpired, setIsExpired] = useState(false)

  const effectiveExpiresAt = expiresAt || (planType === 'FREE_TRIAL' ? demoExpiresAt : subscriptionExpiresAt)

  useEffect(() => {
    let targetTime = null
    if (effectiveExpiresAt) {
      targetTime = new Date(effectiveExpiresAt).getTime()
    } else if (createdAt) {
      if (planType === 'FREE_TRIAL') {
        targetTime = new Date(createdAt).getTime() + 2 * 60 * 60 * 1000
      } else if (planType === 'YEARLY_799') {
        targetTime = new Date(createdAt).getTime() + 365 * 24 * 60 * 60 * 1000
      } else {
        targetTime = new Date(createdAt).getTime() + 30 * 24 * 60 * 60 * 1000
      }
    }

    if (!targetTime || isNaN(targetTime)) {
      if (status === 'Demo Active' || status === 'Active') {
        setIsExpired(false)
        setTimeLeft('Active')
      } else {
        setIsExpired(true)
        setTimeLeft('Expired')
      }
      return
    }

    const updateTimer = () => {
      const diffMs = targetTime - Date.now()
      if (diffMs <= 0 || status === 'Demo Expired' || status === 'Expired') {
        setIsExpired(true)
        setTimeLeft('00h 00m 00s')
      } else {
        setIsExpired(false)
        const totalSeconds = Math.floor(diffMs / 1000)
        const days = Math.floor(totalSeconds / 86400)
        const hours = Math.floor((totalSeconds % 86400) / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60
        const pad = (num) => String(num).padStart(2, '0')

        if (days > 0) {
          setTimeLeft(`${days}d ${pad(hours)}h ${pad(minutes)}m`)
        } else {
          setTimeLeft(`${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`)
        }
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [effectiveExpiresAt, createdAt, status, planType])

  if (isExpired) {
    return (
      <span className={`inline-flex items-center gap-1.5 bg-rose-950/90 text-rose-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-rose-900 font-mono whitespace-nowrap select-none shrink-0 ${className}`}>
        <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
        <span>{planType === 'FREE_TRIAL' ? 'Trial Expired' : 'Plan Expired'}</span>
      </span>
    )
  }

  const isDemo = planType === 'FREE_TRIAL'
  const isYearly = planType === 'YEARLY_799'

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono whitespace-nowrap shadow-xs select-none shrink-0 ${
        isDemo
          ? 'bg-stone-900 text-amber-400 border border-amber-500/30'
          : isYearly
          ? 'bg-purple-950/80 text-purple-400 border border-purple-500/30'
          : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
      } ${className}`}
    >
      <Clock className={`w-3 h-3 animate-pulse shrink-0 ${isDemo ? 'text-amber-400' : isYearly ? 'text-purple-400' : 'text-emerald-400'}`} />
      <span>{timeLeft} left</span>
    </span>
  )
}
