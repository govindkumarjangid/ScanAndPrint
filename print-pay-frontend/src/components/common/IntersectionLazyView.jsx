import React, { useState, useEffect, useRef } from 'react'

/**
 * Scroll-driven Lazy Loading Wrapper.
 * Only renders its children when the element enters the viewport via IntersectionObserver!
 */
export default function IntersectionLazyView({ children, placeholderHeight = '300px' }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect() // Stop observing once loaded
        }
      },
      {
        rootMargin: '150px', // Load 150px before entering viewport for seamless scrolling
        threshold: 0.01,
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="w-full">
      {isVisible ? children : <div style={{ minHeight: placeholderHeight }} className="w-full" />}
    </div>
  )
}
