import React from 'react'
import { cn } from '@/lib/utils'

interface MarqueeProps {
  items: React.ReactNode[] | string[]
  speed?: 'slow' | 'normal' | 'fast'
  pauseOnHover?: boolean
  reverse?: boolean
  className?: string
  gap?: string // e.g. "gap-8" or "gap-12"
}

export function Marquee({
  items,
  speed = 'normal',
  pauseOnHover = true,
  reverse = false,
  className,
  gap = 'gap-8'
}: MarqueeProps) {
  const durationMap = {
    slow: '50s',
    normal: '30s',
    fast: '15s',
  }

  const duration = durationMap[speed]

  // We render two identical tracks side-by-side to make the scroll seamless
  return (
    <div
      className={cn(
        'group flex overflow-hidden p-2 select-none relative w-full bg-primary-container text-on-primary-container text-xs font-medium uppercase tracking-[0.15em] border-b border-primary/20',
        className
      )}
      style={{ '--marquee-duration': duration } as React.CSSProperties}
    >
      <div
        className={cn(
          'flex min-w-full shrink-0 items-center justify-around whitespace-nowrap animate-marquee',
          reverse && 'animate-marquee-reverse',
          pauseOnHover && 'group-hover:[animation-play-state:paused]',
          gap
        )}
      >
        {items.map((item, idx) => (
          <div key={`track1-${idx}`} className="flex items-center gap-2">
            {item}
          </div>
        ))}
      </div>
      <div
        aria-hidden="true"
        className={cn(
          'flex min-w-full shrink-0 items-center justify-around whitespace-nowrap animate-marquee',
          reverse && 'animate-marquee-reverse',
          pauseOnHover && 'group-hover:[animation-play-state:paused]',
          gap
        )}
      >
        {items.map((item, idx) => (
          <div key={`track2-${idx}`} className="flex items-center gap-2">
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
