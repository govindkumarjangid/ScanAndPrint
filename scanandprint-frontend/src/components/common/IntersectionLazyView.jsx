import { useState, useEffect, useRef } from 'react'

export default function IntersectionLazyView({ children, placeholderHeight = '300px' }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        observer.disconnect()
      }
    },
      {
        rootMargin: '100px',
        threshold: 0.01,
      }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="w-full">
      {isVisible ? children : <div style={{ minHeight: placeholderHeight }} className="w-full" />}
    </div>
  )
}
