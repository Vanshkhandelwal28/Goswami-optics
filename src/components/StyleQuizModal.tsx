import React, { useState } from 'react'
import { ArrowLeft, Camera, Cuboid, Sparkles, X } from 'lucide-react'
import {
  COLOR_FINISHES,
  ColorFinishId,
  EYEWEAR_CATALOG,
  EyewearProduct,
} from '../data/goswamiData'
import { FrameCardVisual } from './FrameCardVisual'

interface StyleQuizModalProps {
  isOpen: boolean
  onClose: () => void
  onTryOn: (product: EyewearProduct, color: ColorFinishId) => void
  onInspect3D: (product: EyewearProduct, color: ColorFinishId) => void
}

export const StyleQuizModal: React.FC<StyleQuizModalProps> = ({
  isOpen,
  onClose,
  onTryOn,
  onInspect3D,
}) => {
  const [step, setStep] = useState(0)
  const [faceShape, setFaceShape] = useState('Oval')
  const [purpose, setPurpose] = useState<'optical' | 'sun' | 'clip'>('optical')
  const [styleVibe, setStyleVibe] = useState<'classic' | 'minimal' | 'bold'>('classic')
  const [preferredTone, setPreferredTone] = useState<'dark' | 'warm' | 'metal'>('warm')

  if (!isOpen) return null

  const recommendations = EYEWEAR_CATALOG.filter((p) => !p.isContactLensPack)
    .map((p) => {
      let score = 70
      if (p.recommendedFaces.includes(faceShape)) score += 12
      if (purpose === 'sun' && p.category === 'sunglasses') score += 14
      if (purpose === 'clip' && p.hasMagneticClip) score += 20
      if (purpose === 'optical' && p.category === 'eyeglasses') score += 12
      if (styleVibe === 'minimal' && (p.shape === 'round' || p.shape === 'hexagon'))
        score += 10
      if (styleVibe === 'bold' && (p.shape === 'wayfarer' || p.shape === 'cateye'))
        score += 10
      if (styleVibe === 'classic' && (p.shape === 'clubmaster' || p.shape === 'aviator'))
        score += 10

      const matchedColor: ColorFinishId =
        preferredTone === 'metal' && p.colors.includes('polished-gold')
          ? 'polished-gold'
          : preferredTone === 'warm' && p.colors.includes('ristretto-tortoise')
            ? 'ristretto-tortoise'
            : p.colors[0]

      return { product: p, color: matchedColor, score: Math.min(99, score) }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-3xl rounded-t-3xl sm:rounded-3xl p-5 sm:p-9 pb-safe border border-slate-200 shadow-2xl relative max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#526071] hover:text-[#182232] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Previous question
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0064B5]">
              <Sparkles className="w-3.5 h-3.5" /> 30-Second Frame Finder Quiz
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close frame quiz"
            className="p-2 rounded-full hover:bg-slate-100 text-[#526071] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-7">
          <div
            className="h-full bg-[#0064B5] transition-all duration-300"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          />
        </div>

        {step === 0 && (
          <div className="space-y-6">
            <div className="text-center max-w-lg mx-auto">
              <h3 className="text-2xl sm:text-3xl font-editorial text-[#182232]">
                First, what best describes your face shape?
              </h3>
              <p className="text-sm text-[#526071] mt-1">
                Not sure? Pick the closest match — our Virtual Try-On will confirm it live!
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'Oval', desc: 'Balanced proportions & softly rounded chin' },
                { id: 'Round', desc: 'Full cheeks with soft, curved jawline' },
                { id: 'Square', desc: 'Strong forehead & defined angular jaw' },
                { id: 'Heart', desc: 'Wider brow tapering to a narrower chin' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setFaceShape(item.id)
                    setStep(1)
                  }}
                  className={`p-5 rounded-2xl border text-center space-y-2 transition cursor-pointer hover:border-[#0064B5] ${
                    faceShape === item.id
                      ? 'border-[#0064B5] bg-[#0064B5]/5'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="text-lg font-editorial font-medium text-[#182232]">
                    {item.id}
                  </div>
                  <p className="text-xs text-[#526071]">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center max-w-lg mx-auto">
              <h3 className="text-2xl sm:text-3xl font-editorial text-[#182232]">
                Where will you wear this pair most in Kota?
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {[
                {
                  id: 'optical' as const,
                  title: 'Study, Clinic & Daily Work',
                  desc: 'Lightweight prescription or zero-power Crizal Blue-Cut frames',
                },
                {
                  id: 'clip' as const,
                  title: 'Both Indoors & Outdoor Sun',
                  desc: '2-in-1 Greyjack Magnetic Clip-On — switch in 0.2 seconds',
                },
                {
                  id: 'sun' as const,
                  title: 'Bright Outdoor UV400 Sun',
                  desc: 'Polarized Ray-Ban, Vogue & Fastrack sunglasses',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setPurpose(opt.id)
                    setStep(2)
                  }}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-[#0064B5] text-left space-y-2 transition cursor-pointer"
                >
                  <div className="font-semibold text-base text-[#182232]">{opt.title}</div>
                  <p className="text-xs text-[#526071] leading-relaxed">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center max-w-lg mx-auto">
              <h3 className="text-2xl sm:text-3xl font-editorial text-[#182232]">
                Pick your preferred frame aesthetic &amp; tone
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {[
                ['classic', 'Timeless Heritage'],
                ['minimal', 'Slim Minimalist'],
                ['bold', 'Sculpted Acetate'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setStyleVibe(id as 'classic' | 'minimal' | 'bold')}
                  className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold cursor-pointer ${
                    styleVibe === id
                      ? 'border-[#0064B5] bg-[#0064B5]/8 text-[#182232]'
                      : 'border-slate-200 text-[#526071]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {[
                ['warm', 'Warm Tortoise & Crystal'],
                ['dark', 'Jet Black & Olive'],
                ['metal', 'Gold & Silver Wire'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setPreferredTone(id as 'dark' | 'warm' | 'metal')
                    setStep(3)
                  }}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-[#0064B5] text-xs sm:text-sm font-semibold text-[#182232] cursor-pointer"
                >
                  {label} →
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Curated for {faceShape} Face Shape
              </span>
              <h3 className="text-2xl sm:text-3xl font-editorial text-[#182232] mt-2">
                Your top 3 Goswami Optics matches
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommendations.map(({ product, color, score }) => (
                <div
                  key={product.id}
                  className="rounded-2xl border border-slate-200 p-4 flex flex-col justify-between bg-[#F9FAFB]"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                      <span className="text-[#0064B5]">{product.brand}</span>
                      <span className="text-emerald-700">{score}% Match</span>
                    </div>
                    <div className="h-32">
                      <FrameCardVisual
                        shape={product.shape}
                        colorId={color}
                        lensId={product.defaultLens}
                        hasMagneticClip={product.hasMagneticClip}
                      />
                    </div>
                    <h4 className="font-editorial text-lg text-[#182232] mt-1">
                      {product.name}
                    </h4>
                    <p className="text-xs text-[#526071]">
                      {COLOR_FINISHES[color]?.name} · ₹{product.price.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        onClose()
                        onTryOn(product, color)
                      }}
                      className="inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-full bg-[#0064B5] text-white text-[11px] font-semibold cursor-pointer"
                    >
                      <Camera className="w-3 h-3" /> Try On
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose()
                        onInspect3D(product, color)
                      }}
                      className="inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-full border border-slate-300 text-[#182232] text-[11px] font-semibold cursor-pointer bg-white"
                    >
                      <Cuboid className="w-3 h-3" /> 3D View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
