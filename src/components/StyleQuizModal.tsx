import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, Sparkles, X } from 'lucide-react'
import {
  ColorFinishId,
  EYEWEAR_CATALOG,
  EyewearProduct,
} from '../data/goswamiData'
import { getPrimaryProductPhoto } from '../data/productMedia'

interface StyleQuizModalProps {
  isOpen: boolean
  onClose: () => void
  onViewPhotos: (product: EyewearProduct, color: ColorFinishId) => void
  onOpenCustomizer: (product: EyewearProduct, color: ColorFinishId) => void
}

export const StyleQuizModal: React.FC<StyleQuizModalProps> = ({
  isOpen,
  onClose,
  onViewPhotos,
  onOpenCustomizer,
}) => {
  const [step, setStep] = useState(0)
  const [faceShape, setFaceShape] = useState('Oval')
  const [purpose, setPurpose] = useState<'optical' | 'sun' | 'clip'>('optical')
  const [styleVibe, setStyleVibe] = useState<'classic' | 'minimal' | 'bold'>('classic')
  const [preferredTone, setPreferredTone] = useState<'dark' | 'warm' | 'metal'>('warm')

  if (!isOpen) return null

  const recommendations = EYEWEAR_CATALOG.filter((product) => !product.isContactLensPack)
    .map((product) => {
      let score = 70
      if (product.recommendedFaces.includes(faceShape)) score += 12
      if (purpose === 'sun' && product.category === 'sunglasses') score += 14
      if (purpose === 'clip' && product.hasMagneticClip) score += 20
      if (purpose === 'optical' && product.category === 'eyeglasses') score += 12
      if (styleVibe === 'minimal' && (product.shape === 'round' || product.shape === 'hexagon'))
        score += 10
      if (styleVibe === 'bold' && (product.shape === 'wayfarer' || product.shape === 'cateye'))
        score += 10
      if (styleVibe === 'classic' && (product.shape === 'clubmaster' || product.shape === 'aviator'))
        score += 10

      const color: ColorFinishId =
        preferredTone === 'metal' && product.colors.includes('polished-gold')
          ? 'polished-gold'
          : preferredTone === 'warm' && product.colors.includes('ristretto-tortoise')
            ? 'ristretto-tortoise'
            : product.colors[0]

      return { product, color, score: Math.min(99, score) }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  const chooseTone = (tone: 'dark' | 'warm' | 'metal') => {
    setPreferredTone(tone)
    setStep(3)
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#211b16]/65 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="style-quiz-title"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-t-[28px] border border-[#e4d9cc] bg-[#fbf8f2] p-5 pb-safe shadow-2xl sm:rounded-[28px] sm:p-8 lg:p-10"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex min-h-9 items-center justify-between gap-4">
          {step > 0 && step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((current) => current - 1)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#75695e] transition hover:text-[#30271f]"
            >
              <ArrowLeft className="h-4 w-4" /> Previous question
            </button>
          ) : (
            <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#90664a]">
              <Sparkles className="h-4 w-4" /> The Goswami frame finder
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close frame finder"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e3d8cb] text-[#6e6257] transition hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-8 h-1 overflow-hidden rounded-full bg-[#eee6da]">
          <div
            className="h-full rounded-full bg-[#8d684c] transition-[width] duration-500"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          />
        </div>

        {step === 0 && (
          <div className="space-y-7">
            <div className="mx-auto max-w-xl text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9b826a]">01 · Your features</p>
              <h2 id="style-quiz-title" className="mt-2 font-editorial text-3xl leading-tight text-[#30271f] sm:text-4xl">
                What best describes your face shape?
              </h2>
              <p className="mt-2 text-sm text-[#766b60]">Choose the closest match. We’ll make a thoughtful shortlist for you.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { id: 'Oval', desc: 'Balanced proportions and a softly rounded chin' },
                { id: 'Round', desc: 'Full cheeks with a gently curved jawline' },
                { id: 'Square', desc: 'Defined angles and a strong jaw' },
                { id: 'Heart', desc: 'Wider brow tapering to a narrower chin' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setFaceShape(item.id)
                    setStep(1)
                  }}
                  className={`min-h-36 border p-4 text-left transition sm:p-5 ${
                    faceShape === item.id
                      ? 'border-[#90664a] bg-[#f2e9dd]'
                      : 'border-[#e3d8cb] bg-white/65 hover:border-[#b89b7e] hover:bg-white'
                  }`}
                >
                  <span className="font-editorial text-xl text-[#30271f]">{item.id}</span>
                  <span className="mt-2 block text-[11px] leading-relaxed text-[#766b60]">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-7">
            <div className="mx-auto max-w-xl text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9b826a]">02 · Your everyday</p>
              <h2 id="style-quiz-title" className="mt-2 font-editorial text-3xl leading-tight text-[#30271f] sm:text-4xl">
                Where will you wear this pair most?
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  id: 'optical' as const,
                  title: 'Study, clinic & daily work',
                  desc: 'Lightweight prescription or screen-friendly optical frames',
                },
                {
                  id: 'clip' as const,
                  title: 'Indoors and outdoor sun',
                  desc: 'A magnetic clip-on frame with a versatile second life',
                },
                {
                  id: 'sun' as const,
                  title: 'Bright outdoor days',
                  desc: 'Polarized and UV400 sunglasses for the Rajasthan sun',
                },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setPurpose(option.id)
                    setStep(2)
                  }}
                  className="min-h-40 border border-[#e3d8cb] bg-white/65 p-5 text-left transition hover:border-[#b89b7e] hover:bg-white"
                >
                  <span className="font-editorial text-xl text-[#30271f]">{option.title}</span>
                  <span className="mt-2 block text-xs leading-relaxed text-[#766b60]">{option.desc}</span>
                  <span className="mt-4 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#90664a]">
                    Choose <ArrowRight className="h-3 w-3" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-7">
            <div className="mx-auto max-w-xl text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9b826a]">03 · Your point of view</p>
              <h2 id="style-quiz-title" className="mt-2 font-editorial text-3xl leading-tight text-[#30271f] sm:text-4xl">
                Choose a silhouette and finish you’re drawn to.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['classic', 'Timeless heritage'],
                ['minimal', 'Fine & considered'],
                ['bold', 'Sculpted statement'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setStyleVibe(id as 'classic' | 'minimal' | 'bold')}
                  aria-pressed={styleVibe === id}
                  className={`border p-4 text-sm font-semibold transition ${
                    styleVibe === id
                      ? 'border-[#90664a] bg-[#f2e9dd] text-[#30271f]'
                      : 'border-[#e3d8cb] bg-white/65 text-[#665a4f] hover:border-[#b89b7e]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['warm', 'Warm tortoise & crystal'],
                ['dark', 'Jet black & olive'],
                ['metal', 'Gold & silver wire'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => chooseTone(id as 'dark' | 'warm' | 'metal')}
                  className="flex min-h-12 items-center justify-between border border-[#e3d8cb] bg-white/65 px-4 text-xs font-semibold text-[#55483d] transition hover:border-[#b89b7e] hover:bg-white"
                >
                  {label}
                  <ArrowRight className="h-4 w-4 text-[#90664a]" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-7">
            <div className="text-center">
              <span className="inline-flex rounded-full bg-[#e9efe7] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#59674f]">
                Curated for a {faceShape.toLowerCase()} face shape
              </span>
              <h2 id="style-quiz-title" className="mt-3 font-editorial text-3xl text-[#30271f] sm:text-4xl">
                A few frames to begin with.
              </h2>
              <p className="mt-2 text-xs text-[#766b60]">A starting point for browsing — our Kota team can help with fit in person.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {recommendations.map(({ product, color, score }) => {
                const primaryPhoto = getPrimaryProductPhoto(product)
                return (
                  <article key={product.id} className="overflow-hidden border border-[#e3d8cb] bg-white">
                    <div className="relative aspect-[4/3] bg-[#eee6da]">
                      <img
                        src={primaryPhoto.src}
                        alt={primaryPhoto.alt}
                        loading="lazy"
                        className="image-grade-warm h-full w-full object-cover"
                        style={{ objectPosition: primaryPhoto.position ?? 'center' }}
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-[#fbf8f2]/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#55483d]">
                        {score}% match
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9a7255]">{product.brand}</p>
                      <h3 className="mt-1 font-editorial text-xl leading-tight text-[#30271f]">{product.name}</h3>
                      <p className="mt-1 text-[11px] text-[#827568]">
                        ₹{product.price.toLocaleString('en-IN')} · {product.fitWidth} fit
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onClose()
                            onViewPhotos(product, color)
                          }}
                          className="min-h-10 border border-[#d9ccbe] px-2 text-[10px] font-semibold text-[#514439] transition hover:border-[#967052] hover:bg-[#fbf8f2]"
                        >
                          View photos
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onClose()
                            onOpenCustomizer(product, color)
                          }}
                          className="min-h-10 bg-[#30271f] px-2 text-[10px] font-semibold text-white transition hover:bg-[#594332]"
                        >
                          Select lenses
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
