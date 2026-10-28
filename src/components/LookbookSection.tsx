import React, { useState } from 'react'
import { ArrowUpRight, Play } from 'lucide-react'
import { ColorFinishId, EYEWEAR_CATALOG, EyewearProduct } from '../data/goswamiData'

interface LookbookSectionProps {
  onViewPhotos: (product: EyewearProduct, color: ColorFinishId) => void
}

const LOOKBOOK_STORIES = [
  {
    src: '/images/hero-editorial.jpg',
    alt: 'Two models wearing contemporary eyewear in late afternoon light',
    title: 'Everyday silhouettes',
    productIndex: 0,
    color: 'ristretto-tortoise' as ColorFinishId,
    position: 'center',
  },
  {
    src: '/images/wild-2.jpg',
    alt: 'A man wearing aviator sunglasses in warm Kota sunlight',
    title: 'The long way home',
    productIndex: 4,
    color: 'polished-gold' as ColorFinishId,
    position: '54% 36%',
  },
  {
    src: '/images/wild-1.jpg',
    alt: 'A woman wearing clear optical frames at a cafe',
    title: 'A softer point of view',
    productIndex: 8,
    color: 'crystal-clear' as ColorFinishId,
    position: '43% 36%',
  },
  {
    src: '/images/editorial-bluecut.jpg',
    alt: 'A woman wearing fine metal optical frames while reading by a window',
    title: 'Room for focus',
    productIndex: 2,
    color: 'ristretto-tortoise' as ColorFinishId,
    position: '38% 36%',
  },
]

export const LookbookSection: React.FC<LookbookSectionProps> = ({ onViewPhotos }) => {
  const [filmOpen, setFilmOpen] = useState(false)

  return (
    <section id="lookbook" className="scroll-mt-28 bg-[#30271f] py-16 text-[#fbf8f2] sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d0ad7a] sm:text-[11px]">
              The Goswami edit · photo & film
            </p>
            <h2 className="mt-3 font-editorial text-4xl leading-[0.98] text-[#fbf8f2] sm:text-5xl lg:text-[58px]">
              Frames, seen in <span className="italic text-[#d8bd94]">everyday light.</span>
            </h2>
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-[#d1c5b7] sm:text-sm">
            A small visual journal of the silhouettes, materials and moments that make eyewear
            personal. Choose any story to browse related frames.
          </p>
        </div>

        <div className="mt-9 grid gap-4 lg:mt-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-5">
          <div className="relative aspect-[4/3] overflow-hidden bg-[#514234] sm:aspect-video lg:aspect-[1.22/1]">
            {filmOpen ? (
              <video
                key="goswami-lookbook-film"
                className="h-full w-full object-cover"
                controls
                autoPlay
                playsInline
                preload="metadata"
                poster="/images/hero-editorial.jpg"
                aria-label="A short Goswami Optics eyewear photo story"
                onEnded={() => setFilmOpen(false)}
              >
                <source src="/video/goswami-lookbook.mp4" type="video/mp4" />
                Your browser does not support embedded video.
              </video>
            ) : (
              <>
                <img
                  src="/images/hero-editorial.jpg"
                  alt="Two models wearing contemporary eyewear in late afternoon light"
                  loading="lazy"
                  className="image-grade-warm h-full w-full object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#211a14]/65 via-[#211a14]/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-6">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#e2c999]">12-second silent film</p>
                    <p className="mt-1 font-editorial text-2xl leading-tight text-white sm:text-3xl">A Kota frame story</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFilmOpen(true)}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-white/65 bg-white/10 px-5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-[#30271f]"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Play the film
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {LOOKBOOK_STORIES.map((story) => {
              const product = EYEWEAR_CATALOG[story.productIndex]
              return (
                <button
                  key={story.title}
                  type="button"
                  onClick={() => onViewPhotos(product, story.color)}
                  className="group relative aspect-[4/5] overflow-hidden bg-[#514234] text-left"
                  aria-label={`Open photo story: ${story.title}`}
                >
                  <img
                    src={story.src}
                    alt={story.alt}
                    loading="lazy"
                    className="image-grade-warm h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    style={{ objectPosition: story.position }}
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-[#211a14]/70 via-transparent to-transparent opacity-90 transition-opacity group-hover:opacity-100" />
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 sm:p-4">
                    <span className="font-editorial text-base leading-tight text-white sm:text-xl">{story.title}</span>
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/55 bg-white/10 text-white backdrop-blur-sm transition group-hover:bg-white group-hover:text-[#30271f]">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <p className="mt-4 text-[10px] leading-relaxed text-[#b9aa99]">
          The short film is a motion edit of the existing editorial photographs. Frame imagery is for styling inspiration; exact product photography can be confirmed in-store.
        </p>
      </div>
    </section>
  )
}
