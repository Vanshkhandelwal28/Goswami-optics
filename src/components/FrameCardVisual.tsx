import React, { useId } from 'react'
import {
  COLOR_FINISHES,
  ColorFinishId,
  FrameShape,
  LENS_OPTIONS,
  LensTintId,
} from '../data/goswamiData'

interface FrameCardVisualProps {
  shape: FrameShape
  colorId: ColorFinishId
  lensId: LensTintId
  hasMagneticClip?: boolean
  isContactLensPack?: boolean
  clipActive?: boolean
  className?: string
}

const LENS_PATHS: Record<FrameShape, { left: string; bridge: string; browLeft?: string }> = {
  wayfarer: {
    left: 'M 42,64 C 58,58 118,57 136,64 C 144,68 144,98 134,114 C 122,128 66,130 50,115 C 39,103 36,72 42,64 Z',
    bridge: 'M 135,70 Q 160,62 185,70',
  },
  round: {
    left: 'M 92,58 C 122,58 140,75 138,96 C 136,118 117,131 91,131 C 64,131 46,117 45,95 C 44,74 63,58 92,58 Z',
    bridge: 'M 137,78 C 149,66 171,66 183,78',
  },
  aviator: {
    left: 'M 44,64 C 66,57 124,59 139,69 C 146,75 142,108 125,125 C 107,140 66,135 50,114 C 38,98 36,71 44,64 Z',
    bridge: 'M 136,66 L 184,66 M 139,79 Q 160,73 181,79',
  },
  cateye: {
    left: 'M 34,55 C 58,52 118,61 136,72 C 143,80 139,108 125,121 C 108,133 65,130 49,112 C 37,98 29,65 34,55 Z',
    bridge: 'M 135,75 Q 160,67 185,75',
  },
  clubmaster: {
    left: 'M 42,63 C 62,57 120,58 137,66 C 143,72 141,105 130,119 C 117,131 67,131 52,116 C 41,104 38,72 42,63 Z',
    browLeft: 'M 35,66 C 56,53 121,54 142,66 L 138,73 C 118,63 60,62 39,73 Z',
    bridge: 'M 137,72 Q 160,65 183,72',
  },
  hexagon: {
    left: 'M 55,60 L 122,60 L 140,84 L 131,117 L 92,130 L 53,117 L 41,84 Z',
    bridge: 'M 139,79 Q 160,72 181,79',
  },
}

export const FrameCardVisual: React.FC<FrameCardVisualProps> = ({
  shape,
  colorId,
  lensId,
  hasMagneticClip,
  isContactLensPack,
  clipActive = false,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '')
  const finish = COLOR_FINISHES[colorId] || COLOR_FINISHES['jet-black']
  const lens = LENS_OPTIONS[lensId] || LENS_OPTIONS.clear

  if (isContactLensPack) {
    return (
      <svg
        viewBox="0 0 320 185"
        className={`w-full h-full select-none ${className}`}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`shadow-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.13" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`box-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0077B6" />
            <stop offset="55%" stopColor="#0096C7" />
            <stop offset="100%" stopColor="#023E8A" />
          </linearGradient>
          <radialGradient id={`lensdrop-${uid}`} cx="38%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
            <stop offset="55%" stopColor="#BAE6FD" stopOpacity="0.58" />
            <stop offset="90%" stopColor={finish.swatchHex} stopOpacity="0.45" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0.7" />
          </radialGradient>
        </defs>
        <ellipse cx="160" cy="149" rx="108" ry="11" fill={`url(#shadow-${uid})`} />
        {/* Blister pack box */}
        <rect
          x="58"
          y="54"
          width="156"
          height="84"
          rx="12"
          fill={`url(#box-${uid})`}
        />
        <rect
          x="66"
          y="62"
          width="140"
          height="68"
          rx="8"
          fill="#FFFFFF"
          fillOpacity="0.12"
        />
        <text
          x="80"
          y="88"
          fill="#FFFFFF"
          fontSize="11"
          fontWeight="700"
          letterSpacing="0.08em"
          fontFamily="Plus Jakarta Sans, sans-serif"
        >
          BAUSCH + LOMB
        </text>
        <text
          x="80"
          y="105"
          fill="#E0F2FE"
          fontSize="9.5"
          fontWeight="500"
          fontFamily="Plus Jakarta Sans, sans-serif"
        >
          SoftLens · Lacelle HD
        </text>
        <text
          x="80"
          y="120"
          fill="#BAE6FD"
          fontSize="8"
          fontWeight="600"
          fontFamily="Plus Jakarta Sans, sans-serif"
        >
          UV BLOCK · MOISTURE SEAL
        </text>
        {/* Hydrogel contact lens dome */}
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
          opacity="0.85"
        />
      </svg>
    )
  }

  const paths = LENS_PATHS[shape]
  const strokeWidth =
    shape === 'aviator' || shape === 'hexagon'
      ? 4.2
      : shape === 'clubmaster'
        ? 3.6
        : 7.4

  const effectiveLens = clipActive
    ? LENS_OPTIONS['smoke']
    : lens

  return (
    <svg
      viewBox="0 0 320 185"
      className={`w-full h-full select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`floor-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.14" />
          <stop offset="70%" stopColor="#0f172a" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={`frame-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          {finish.isTortoise ? (
            <>
              <stop offset="0%" stopColor={finish.frameHex} />
              <stop offset="28%" stopColor={finish.secondaryHex} />
              <stop offset="52%" stopColor="#2A170B" />
              <stop offset="78%" stopColor={finish.secondaryHex} />
              <stop offset="100%" stopColor={finish.frameHex} />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor={finish.frameHex} />
              <stop offset="50%" stopColor={finish.secondaryHex} />
              <stop offset="100%" stopColor={finish.frameHex} />
            </>
          )}
        </linearGradient>

        <linearGradient id={`lens-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop
            offset="0%"
            stopColor={effectiveLens.colorHex}
            stopOpacity={effectiveLens.opacity}
          />
          <stop
            offset="100%"
            stopColor={effectiveLens.colorHex}
            stopOpacity={
              effectiveLens.id === 'amber-grad' || effectiveLens.id === 'rose-tint'
                ? effectiveLens.opacity * 0.42
                : effectiveLens.opacity * 0.88
            }
          />
        </linearGradient>

        <linearGradient id={`glare-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.52" />
          <stop offset="28%" stopColor={effectiveLens.sheenHex} stopOpacity="0.22" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Studio floor shadow */}
      <ellipse cx="160" cy="150" rx="118" ry="10" fill={`url(#floor-${uid})`} />

      {/* Subtle perspective temple arms visible through upper lens */}
      <path
        d="M 46,72 L 82,63 L 92,69"
        fill="none"
        stroke={finish.frameHex}
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.34"
      />
      <path
        d="M 274,72 L 238,63 L 228,69"
        fill="none"
        stroke={finish.frameHex}
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.34"
      />

      {/* Nose pads on metal/clubmaster shapes */}
      {(shape === 'aviator' || shape === 'clubmaster' || shape === 'hexagon') && (
        <g opacity="0.72">
          <ellipse
            cx="144"
            cy="92"
            rx="3.2"
            ry="6.5"
            transform="rotate(-14 144 92)"
            fill="#E2E8F0"
            stroke={finish.metalHex}
            strokeWidth="1"
          />
          <ellipse
            cx="176"
            cy="92"
            rx="3.2"
            ry="6.5"
            transform="rotate(14 176 92)"
            fill="#E2E8F0"
            stroke={finish.metalHex}
            strokeWidth="1"
          />
        </g>
      )}

      {/* Left Lens & Rim */}
      <g>
        <path d={paths.left} fill={`url(#lens-${uid})`} />
        <path d={paths.left} fill={`url(#glare-${uid})`} />
        <path
          d={paths.left}
          fill="none"
          stroke={
            shape === 'clubmaster'
              ? finish.metalHex
              : `url(#frame-${uid})`
          }
          strokeWidth={strokeWidth}
          strokeOpacity={finish.isTranslucent ? 0.72 : 1}
          strokeLinejoin="round"
        />
        {paths.browLeft && (
          <path
            d={paths.browLeft}
            fill={`url(#frame-${uid})`}
          />
        )}
      </g>

      {/* Right Lens & Rim (mirrored smoothly around x=160) */}
      <g transform="translate(320, 0) scale(-1, 1)">
        <path d={paths.left} fill={`url(#lens-${uid})`} />
        <path d={paths.left} fill={`url(#glare-${uid})`} />
        <path
          d={paths.left}
          fill="none"
          stroke={
            shape === 'clubmaster'
              ? finish.metalHex
              : `url(#frame-${uid})`
          }
          strokeWidth={strokeWidth}
          strokeOpacity={finish.isTranslucent ? 0.72 : 1}
          strokeLinejoin="round"
        />
        {paths.browLeft && (
          <path
            d={paths.browLeft}
            fill={`url(#frame-${uid})`}
          />
        )}
      </g>

      {/* Center Bridge */}
      <path
        d={paths.bridge}
        fill="none"
        stroke={
          shape === 'aviator' || shape === 'clubmaster' || shape === 'hexagon'
            ? finish.metalHex
            : `url(#frame-${uid})`
        }
        strokeWidth={shape === 'aviator' ? 3.2 : strokeWidth * 0.85}
        strokeLinecap="round"
        strokeOpacity={finish.isTranslucent ? 0.76 : 1}
      />

      {/* Endpiece Rivet Pins (Warby signature detail) */}
      <g fill={finish.metalHex}>
        <circle cx="38" cy="68" r="1.6" />
        <circle cx="43" cy="68" r="1.6" />
        <circle cx="282" cy="68" r="1.6" />
        <circle cx="277" cy="68" r="1.6" />
      </g>

      {/* Optional Magnetic Clip Indicator */}
      {hasMagneticClip && (
        <g transform="translate(216, 134)">
          <rect
            x="0"
            y="0"
            width="86"
            height="20"
            rx="10"
            fill="#182232"
            fillOpacity="0.9"
          />
          <circle cx="11" cy="10" r="3.5" fill="#38BDF8" />
          <text
            x="20"
            y="13.5"
            fill="#FFFFFF"
            fontSize="8.5"
            fontWeight="600"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            3-CLIP SNAP
          </text>
        </g>
      )}
    </svg>
  )
}
