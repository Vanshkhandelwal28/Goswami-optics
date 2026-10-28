import React, { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Image as ImageIcon,
  X,
} from 'lucide-react'
import {
  COLOR_FINISHES,
  ColorFinishId,
  EyewearProduct,
} from '../data/goswamiData'
import { getProductMedia } from '../data/productMedia'

interface ProductMediaModalProps {
  product: EyewearProduct | null
  colorId: ColorFinishId
  onClose: () => void
  onSelectLenses: (product: EyewearProduct, colorId: ColorFinishId) => void
}

export const ProductMediaModal: React.FC<ProductMediaModalProps> = ({
  product,
  colorId,
  onClose,
  onSelectLenses,
}) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const media = product ? getProductMedia(product) : []

  useEffect(() => {
    if (!product) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') {
        setActiveIndex((index) => (index + 1) % media.length)
      }
      if (event.key === 'ArrowLeft') {
        setActiveIndex((index) => (index - 1 + media.length) % media.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [media.length, onClose, product])

  if (!product) return null

  const activeMedia = media[activeIndex] ?? media[0]
  const selectedFinish = COLOR_FINISHES[colorId]

  const goToPrevious = () => {
    setActiveIndex((index) => (index - 1 + media.length) % media.length)
  }

  const goToNext = () => {
    setActiveIndex((index) => (index + 1) % media.length)
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-[#211b16]/65 backdrop-blur-sm p-0 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-media-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[96dvh] sm:max-h-[90dvh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px] border border-white/50 bg-[#fbf8f2] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product photo"
          className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-[#fbf8f2]/90 text-[#30271f] shadow-sm transition hover:bg-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid min-h-[min(750px,88dvh)] grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex min-h-[360px] flex-col bg-[#eee6da] p-3 sm:min-h-[520px] sm:p-5 lg:min-h-[650px]">
            <div className="relative flex-1 overflow-hidden rounded-[20px] bg-[#e7ddcf]">
              {activeMedia?.type === 'video' ? (
                <video
                  key={activeMedia.src}
                  className="h-full min-h-[340px] w-full object-cover sm:min-h-[500px]"
                  controls
                  playsInline
                  preload="metadata"
                  poster={activeMedia.poster}
                  aria-label={activeMedia.alt}
                >
                  <source src={activeMedia.src} type="video/mp4" />
                  Your browser does not support embedded video.
                </video>
              ) : activeMedia ? (
                <img
                  key={activeMedia.src}
                  src={activeMedia.src}
                  alt={activeMedia.alt}
                  className="h-full min-h-[340px] w-full object-cover sm:min-h-[500px]"
                  style={{ objectPosition: activeMedia.position ?? 'center' }}
                />
              ) : null}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-[#211b16]/55 to-transparent px-4 pb-4 pt-16 text-white sm:px-6 sm:pb-5">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-[#211b16]/35 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] backdrop-blur-sm">
                  <ImageIcon className="h-3.5 w-3.5" />
                  {activeMedia?.type === 'video' ? 'Film' : 'Frame photo'}
                </span>
                <span className="text-xs font-medium text-white/90">
                  {String(activeIndex + 1).padStart(2, '0')} /{' '}
                  {String(media.length).padStart(2, '0')}
                </span>
              </div>

              {media.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goToPrevious}
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-[#fbf8f2]/90 text-[#30271f] shadow-sm transition hover:bg-white sm:left-4"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-[#fbf8f2]/90 text-[#30271f] shadow-sm transition hover:bg-white sm:right-4"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {media.length > 1 && (
              <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 no-scrollbar sm:mt-4">
                {media.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`View ${item.type === 'video' ? 'film' : 'photo'} ${index + 1}: ${item.caption}`}
                    aria-current={activeIndex === index ? 'true' : undefined}
                    className={`relative h-[68px] w-[88px] shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-[76px] sm:w-[104px] ${
                      activeIndex === index
                        ? 'border-[#90664a] shadow-sm'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={item.type === 'video' ? item.poster : item.src}
                      alt=""
                      className="h-full w-full object-cover"
                      style={{ objectPosition: item.type === 'photo' ? item.position : 'center' }}
                    />
                  </button>
                ))}
              </div>
            )}
            <p className="mt-3 text-[10px] leading-relaxed text-[#75695e] sm:text-[11px]">
              Editorial styling photo; confirm exact model, finish and availability with our Kota team.
            </p>
          </div>

          <div className="flex flex-col justify-between p-5 sm:p-8 lg:p-10">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#90664a] sm:text-[11px]">
                {product.brand} · Goswami Optics, Kota
              </p>
              <h2
                id="product-media-title"
                className="mt-2 max-w-lg font-editorial text-[32px] leading-[1.02] text-[#30271f] sm:text-5xl"
              >
                {product.name}
              </h2>
              <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-2xl font-semibold tracking-tight text-[#30271f]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.mrp && (
                  <span className="text-sm text-[#918579] line-through">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                )}
                {product.badge && (
                  <span className="rounded-full bg-[#e9dfd2] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#70523e]">
                    {product.badge}
                  </span>
                )}
              </div>

              <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#6d6258]">
                {product.description}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 border-y border-[#e3d8ca] py-4 text-xs">
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9b8d7d]">
                    Finish
                  </span>
                  <span className="mt-1 inline-flex items-center gap-2 font-medium text-[#30271f]">
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: selectedFinish?.swatchHex ?? '#bba68b' }}
                    />
                    {selectedFinish?.name ?? 'Selected finish'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9b8d7d]">
                    Fit
                  </span>
                  <span className="mt-1 block font-medium text-[#30271f]">
                    {product.fitWidth} · {product.measurements}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9b8d7d]">
                  Details to love
                </p>
                <ul className="mt-3 space-y-2.5">
                  {product.highlights.slice(0, 3).map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-start gap-2.5 text-xs leading-relaxed text-[#5f554b] sm:text-[13px]"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#718064]" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 space-y-3 border-t border-[#e3d8ca] pt-5">
              <button
                type="button"
                onClick={() => onSelectLenses(product, colorId)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#30271f] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#594332]"
              >
                {product.isContactLensPack ? 'Check power & reserve' : 'Choose lenses & reserve'}
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-center text-[10px] leading-relaxed text-[#8a7d70]">
                No online payment or account needed. We’ll help confirm fit and availability in-store.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
