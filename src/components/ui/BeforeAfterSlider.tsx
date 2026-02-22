import { useState, useRef, useCallback } from 'react'
import { MoveHorizontal } from 'lucide-react'

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className = '',
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const updatePosition = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setPosition((x / rect.width) * 100)
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      updatePosition(e.clientX)
    },
    [updatePosition]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return
      updatePosition(e.clientX)
    },
    [updatePosition]
  )

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = 5
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        setPosition((p) => Math.max(0, p - step))
        break
      case 'ArrowRight':
        e.preventDefault()
        setPosition((p) => Math.min(100, p + step))
        break
      case 'Home':
        e.preventDefault()
        setPosition(0)
        break
      case 'End':
        e.preventDefault()
        setPosition(100)
        break
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none rounded-2xl cursor-ew-resize ${className}`}
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* After image (full background) */}
      <img
        src={afterImage}
        alt={afterLabel}
        className="w-full h-full object-cover"
        width={800}
        height={500}
        loading="lazy"
        decoding="async"
        draggable={false}
      />

      {/* Before image (clipped by position) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="w-full h-full object-cover"
          width={800}
          height={500}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </div>

      {/* Labels */}
      <span className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full pointer-events-none">
        {beforeLabel}
      </span>
      <span className="absolute top-3 right-3 px-3 py-1 bg-brand-blue/90 backdrop-blur-sm text-white text-xs font-medium rounded-full pointer-events-none">
        {afterLabel}
      </span>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/80 pointer-events-none"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      />

      {/* Draggable handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-lg shadow-black/30 flex items-center justify-center cursor-ew-resize z-10"
        style={{ left: `${position}%` }}
        role="slider"
        tabIndex={0}
        aria-valuenow={Math.round(position)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Before and after comparison slider"
        onKeyDown={handleKeyDown}
      >
        <MoveHorizontal className="w-5 h-5 text-navy" />
      </div>
    </div>
  )
}
