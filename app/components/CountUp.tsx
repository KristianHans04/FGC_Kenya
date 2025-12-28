'use client'

import { useEffect, useState } from 'react'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

interface CountUpProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
}

/**
 * CountUp component
 * Animates a number counting up from 0 to a target value when in view
 * 
 * @param {number} end - The target number to count up to
 * @param {number} [duration=2000] - Duration of the animation in milliseconds
 * @param {string} [suffix=''] - Text to append after the number
 * @param {string} [prefix=''] - Text to prepend before the number
 * @returns {JSX.Element} The animated count up component
 */
export default function CountUp({ end, duration = 2000, suffix = '', prefix = '' }: CountUpProps) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    let startTime: number | null = null
    const startValue = 0

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      setCount(Math.floor(progress * (end - startValue) + startValue))

      if (progress < 1) {
        requestAnimationFrame(updateCount)
      }
    }

    requestAnimationFrame(updateCount)
  }, [end, duration, isInView])

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  )
}