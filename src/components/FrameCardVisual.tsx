import React, { useEffect, useId, useState } from 'react'
import {
  COLOR_FINISHES,
  ColorFinishId,
  FrameShape,
  LensTintId,
} from '../data/goswamiData'
import type { StudioShotPair } from '../three/studioPhotoBooth'

interface FrameCardVisualProps {
  shape: FrameShape
  colorId: ColorFinishId
  lensId: LensTintId
  hasMagneticClip?: boolean
  isContactLensPack?: boolean
  clipActive?: boolean
  showAngle?: boolean
  className?: string
}

// Schedule studio renders gently (max 2 per animation frame) so initial scroll never stutters
const pendingQueue: (() => void)[] = []
let drainScheduled = false
function enqueueStudioTask(fn: () => void) {
  pendingQueue.push(fn)
  if (!drainScheduled) {
    drainScheduled = true
    const step = () => {
      const a = pendingQueue.shift()
      const b = pendingQueue.shift()
      if (a) a()
      if (b) b()
      if (pendingQueue.length > 0) {
        requestAnimationFrame(step)
      } else {
        drainScheduled = false
      }
    }
    requestAnimationFrame(step)
  }
}

export const FrameCardVisual: React.FC<FrameCardVisualProps> = ({
  shape,
  colorId,
  lensId,
  hasMagneticClip,
  isContactLensPack,
  clipActive = false,
  showAngle = false,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '')
  const [shots, setShots] = useState<StudioShotPair | null>(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (isContactLensPack) return
    let cancelled = false

    import('../three/studioPhotoBooth').then(({ renderStudioShots }) => {
      enqueueStudioTask(() => {
        if (cancelled) return
        try {
          const result = renderStudioShots({
            shape,
            colorId,
            lensId,
            clipStyle: clipActive ? 'polarized-smoke' : 'none',
          })
          if (!cancelled) setShots(result)
        } catch {
          // ignore WebGL fallback
        }
      })
    })

    return () => {
      cancelled = true
    }
  }, [shape, colorId, lensId, clipActive, isContactLensPack])

  if (isContactLensPack) {
    const finish = COLOR_FINISHES[colorId] || COLOR_FINISHES['sea-glass-grey']
    return (
      <svg
        viewBox="0 0 320 185"
        className={`w-full h-full select-none ${className}`}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`shadow-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`box-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0064B5" />
            <stop offset="55%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0F294A" />
          </linearGradient>
          <radialGradient id={`lensdrop-${uid}`} cx="38%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#BAE6FD" stopOpacity="0.58" />
            <stop offset="88%" stopColor={finish.swatchHex} stopOpacity="0.48" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0.72" />
          </radialGradient>
        </defs>
        <ellipse cx="160" cy="150" rx="108" ry="11" fill={`url(#shadow-${uid})`} />
        <rect x="56" y="52" width="158" height="86" rx="12" fill={`url(#box-${uid})`} />
        <rect
          x="64"
          y="60"
          width="142"
          height="70"
          rx="8"
          fill="#FFFFFF"
          fillOpacity="0.12"
        />
        <text
          x="78"
          y="87"
          fill="#FFFFFF"
          fontSize="11"
          fontWeight="700"
          letterSpacing="0.08em"
          fontFamily="Plus Jakarta Sans, sans-serif"
        >
          BAUSCH + LOMB
        </text>
        <text
          x="78"
          y="104"
          fill="#E0F2FE"
          fontSize="9.5"
          fontWeight="500"
          fontFamily="Plus Jakarta Sans, sans-serif"
        >
          SoftLens · Lacelle HD
        </text>
        <text
          x="78"
          y="120"
          fill="#BAE6FD"
          fontSize="8"
          fontWeight="600"
          fontFamily="Plus Jakarta Sans, sans-serif"
        >
          UV BLOCK · MOISTURE SEAL
        </text>
        <circle
          cx="228"
          cy="104"
          r="33"
          fill={`url(#lensdrop-${uid})`}
          stroke="#7DD3FC"
          strokeWidth="1.5"
        />
        <circle
          cx="228"
          cy="104"
          r="21"
          fill="none"
          stroke={finish.swatchHex}
          strokeWidth="2.5"
          strokeDasharray="3 2"
          opacity="0.55"
        />
        <ellipse
          cx="216"
          cy="91"
          rx="9"
          ry="5"
          transform="rotate(-28 216 91)"
          fill="#FFFFFF"
          opacity="0.88"
        />
      </svg>
    )
  }

  const displayAngle = showAngle || hovered

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative w-full h-full flex items-center justify-center select-none ${className}`}
    >
      {shots ? (
        <>
          <img
            src={shots.front}
            alt=""
            draggable={false}
            className={`w-full h-full object-contain transition-opacity duration-300 ${
              displayAngle ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <img
            src={shots.angle}
            alt=""
            draggable={false}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              displayAngle ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      ) : (
        <div className="w-40 h-14 rounded-full bg-slate-200/60 animate-pulse" />
      )}

      {hasMagneticClip && (
        <span className="pointer-events-none absolute bottom-1 right-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#182232]/90 text-white text-[10px] font-semibold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          3-Clip Snap
        </span>
      )}
    </div>
  )
}
