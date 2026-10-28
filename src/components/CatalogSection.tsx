import React, { useMemo, useState } from 'react'
import { ArrowUpRight, Heart, Image as ImageIcon, Magnet } from 'lucide-react'
import {
  COLOR_FINISHES,
  ColorFinishId,
  EYEWEAR_CATALOG,
  EyewearProduct,
} from '../data/goswamiData'
import { getPrimaryProductPhoto } from '../data/productMedia'

interface CatalogSectionProps {
  onViewPhotos: (product: EyewearProduct, color: ColorFinishId) => void
  onOpenCustomizer: (product: EyewearProduct, color: ColorFinishId) => void
  favoriteProductIds: string[]
  onToggleFavorite: (product: EyewearProduct, color: ColorFinishId) => void
}

const CATEGORY_FILTERS = [
  ['all', 'All eyewear'],
  ['eyeglasses', 'Optical frames'],
  ['sunglasses', 'Sunglasses'],
  ['clip-on', 'Magnetic clip-on'],
  ['contacts', 'Contact lenses'],
] as const

const COLOR_STRIP_ORDER: ColorFinishId[] = [
  'sea-glass-grey',
  'jet-black',
  'ristretto-tortoise',
  'crystal-clear',
  'polished-gold',
  'sesame-tortoise',
  'olive-matte',
  'silver-titanium',
  'rose-water',
  'midnight-blue',
  'two-tone',
]

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  onViewPhotos,
  onOpenCustomizer,
  favoriteProductIds,
  onToggleFavorite,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<
    'all' | 'eyeglasses' | 'sunglasses' | 'clip-on' | 'contacts'
  >('all')
  const [colorFilter, setColorFilter] = useState<ColorFinishId | 'all'>('all')
  const [cardColors, setCardColors] = useState<Record<string, ColorFinishId>>(() => {
    const initial: Record<string, ColorFinishId> = {}
    EYEWEAR_CATALOG.forEach((product) => {
      initial[product.id] = product.colors[0]
    })
    return initial
  })
  const [clipActiveMap, setClipActiveMap] = useState<Record<string, boolean>>({})

  const handleGlobalColorClick = (colorId: ColorFinishId | 'all') => {
    setColorFilter(colorId)
    if (colorId === 'all') return

    setCardColors((previous) => {
      const next = { ...previous }
      EYEWEAR_CATALOG.forEach((product) => {
        if (product.colors.includes(colorId)) next[product.id] = colorId
      })
      return next
    })
  }

  const filteredProducts = useMemo(
    () =>
      EYEWEAR_CATALOG.filter((product) => {
        const categoryMatches = categoryFilter === 'all' || product.category === categoryFilter
        const colorMatches = colorFilter === 'all' || product.colors.includes(colorFilter)
        return categoryMatches && colorMatches
      }),
    [categoryFilter, colorFilter]
  )

  return (
    <section id="collection" className="scroll-mt-28 bg-[#fbf8f2] py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#90664a] sm:text-[11px]">
              A considered collection · 100% genuine brands
            </p>
            <h2 className="font-editorial text-4xl leading-[0.98] text-[#30271f] sm:text-5xl lg:text-[58px]">
              Find the frame <span className="italic text-[#8d694f]">that feels like you.</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#766b60] sm:text-[15px]">
              Explore optical, sun and magnetic clip-on styles, then choose the lens finish and
              Kota showroom that suit you.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar lg:max-w-[58%]">
            {CATEGORY_FILTERS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setCategoryFilter(id)}
                aria-pressed={categoryFilter === id}
                className={`shrink-0 rounded-full border px-4 py-2.5 text-[11px] font-semibold transition sm:text-xs ${
                  categoryFilter === id
                    ? 'border-[#30271f] bg-[#30271f] text-white'
                    : 'border-[#e1d7ca] bg-transparent text-[#66594d] hover:border-[#ad9278] hover:bg-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-9 border-y border-[#e4dacf] py-4 sm:mt-11 sm:py-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5d5146] sm:text-[11px]">
              Explore by finish
            </p>
            {colorFilter !== 'all' && (
              <button
                type="button"
                onClick={() => handleGlobalColorClick('all')}
                className="text-[11px] font-semibold text-[#90664a] underline underline-offset-4"
              >
                Clear {COLOR_FINISHES[colorFilter].name}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => handleGlobalColorClick('all')}
              aria-pressed={colorFilter === 'all'}
              className={`shrink-0 rounded-full px-3 py-2 text-[11px] font-medium transition ${
                colorFilter === 'all'
                  ? 'bg-[#e9dfd2] text-[#43382e]'
                  : 'bg-white text-[#71655a] hover:bg-[#f0e9df]'
              }`}
            >
              All finishes
            </button>
            {COLOR_STRIP_ORDER.map((colorId) => {
              const finish = COLOR_FINISHES[colorId]
              const active = colorFilter === colorId
              return (
                <button
                  key={colorId}
                  type="button"
                  onClick={() => handleGlobalColorClick(colorId)}
                  aria-pressed={active}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[11px] transition ${
                    active
                      ? 'border-[#8e674a] bg-white text-[#30271f] shadow-sm'
                      : 'border-transparent bg-transparent text-[#71655a] hover:border-[#e1d7ca] hover:bg-white'
                  }`}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-black/10"
                    style={{
                      background: finish.swatchSecondaryHex
                        ? `linear-gradient(135deg, ${finish.swatchHex} 50%, ${finish.swatchSecondaryHex} 50%)`
                        : finish.swatchHex,
                    }}
                  />
                  <span>{finish.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mb-4 mt-7 flex items-center justify-between gap-3 text-[11px] text-[#887a6c] sm:mt-8">
          <span aria-live="polite">Showing {filteredProducts.length} curated styles</span>
          <span className="hidden sm:inline">Photos are editorial styling references</span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-y-12">
            {filteredProducts.map((product) => {
              const activeColor = cardColors[product.id] || product.colors[0]
              const isFavorite = favoriteProductIds.includes(product.id)
              const clipOn = Boolean(clipActiveMap[product.id])
              const primaryPhoto = getPrimaryProductPhoto(product)

              return (
                <article key={product.id} className="group flex flex-col">
                  <div className="relative overflow-hidden bg-[#eee6da]">
                    <button
                      type="button"
                      onClick={() => onViewPhotos(product, activeColor)}
                      aria-label={`View photos and details for ${product.brand} ${product.name}`}
                      className="relative block aspect-[4/3] w-full overflow-hidden text-left"
                    >
                      <img
                        src={primaryPhoto.src}
                        alt={primaryPhoto.alt}
                        loading="lazy"
                        className="image-grade-warm h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                        style={{ objectPosition: primaryPhoto.position ?? 'center' }}
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-[#211a14]/55 via-transparent to-transparent opacity-75 transition-opacity group-hover:opacity-90" />
                      <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-white sm:bottom-5 sm:left-5">
                        <ImageIcon className="h-3.5 w-3.5" />
                        View photo story
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </button>

                    {product.badge && (
                      <span className="absolute left-3 top-3 max-w-[72%] rounded-full border border-white/70 bg-[#fbf8f2]/90 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#554434] backdrop-blur-sm sm:left-4 sm:top-4 sm:text-[10px]">
                        {product.badge}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => onToggleFavorite(product, activeColor)}
                      aria-label={`${isFavorite ? 'Remove' : 'Add'} ${product.brand} ${product.name} ${isFavorite ? 'from' : 'to'} favorites`}
                      aria-pressed={isFavorite}
                      title={isFavorite ? 'Remove from saved list' : 'Save this frame'}
                      className={`absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition sm:right-4 sm:top-4 ${
                        isFavorite
                          ? 'border-[#c98d83] bg-[#fff5f2] text-[#a35349]'
                          : 'border-white/70 bg-[#fbf8f2]/90 text-[#57493d] hover:border-[#b69b80] hover:bg-white'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>

                    {product.hasMagneticClip && (
                      <button
                        type="button"
                        onClick={() =>
                          setClipActiveMap((previous) => ({
                            ...previous,
                            [product.id]: !previous[product.id],
                          }))
                        }
                        aria-label={`${clipOn ? 'Hide' : 'Show'} magnetic clip details for ${product.name}`}
                        aria-pressed={clipOn}
                        className={`absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[10px] font-semibold shadow-sm transition sm:bottom-4 sm:right-4 ${
                          clipOn
                            ? 'border-[#30271f] bg-[#30271f] text-white'
                            : 'border-white/70 bg-[#fbf8f2]/90 text-[#493b30] hover:bg-white'
                        }`}
                      >
                        <Magnet className="h-3.5 w-3.5" />
                        {clipOn ? '3 clips included' : 'See clip-on'}
                      </button>
                    )}
                    {clipOn && product.hasMagneticClip && (
                      <span className="absolute bottom-[60px] right-3 rounded-full bg-[#fbf8f2]/95 px-3 py-1.5 text-[9px] font-medium text-[#55483d] shadow-sm sm:bottom-[68px] sm:right-4">
                        Polarized · night · mirror
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col px-0.5 pt-4 sm:pt-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a7255]">
                          {product.brand}
                        </p>
                        <h3 className="mt-1 font-editorial text-[21px] leading-tight text-[#30271f] sm:text-2xl">
                          {product.name}
                        </h3>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-sm font-semibold text-[#30271f] sm:text-base">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.mrp && (
                          <span className="mt-0.5 block text-[10px] text-[#9a8b7c] line-through">
                            ₹{product.mrp.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="truncate text-[11px] text-[#827568]">
                        {COLOR_FINISHES[activeColor]?.name} · {product.fitWidth} fit
                      </p>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {product.colors.map((colorId) => {
                          const finish = COLOR_FINISHES[colorId]
                          const selected = colorId === activeColor
                          return (
                            <button
                              key={colorId}
                              type="button"
                              onClick={() => setCardColors((previous) => ({ ...previous, [product.id]: colorId }))}
                              aria-label={`${product.name} in ${finish.name}`}
                              aria-pressed={selected}
                              title={finish.name}
                              className={`h-5 w-5 rounded-full p-[2px] transition ${
                                selected ? 'ring-1 ring-[#72543e] ring-offset-1' : 'hover:scale-110'
                              }`}
                            >
                              <span
                                className="block h-full w-full rounded-full border border-black/10"
                                style={{
                                  background: finish.swatchSecondaryHex
                                    ? `linear-gradient(135deg, ${finish.swatchHex} 50%, ${finish.swatchSecondaryHex} 50%)`
                                    : finish.swatchHex,
                                }}
                              />
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 min-h-[40px] text-xs leading-relaxed text-[#74695f]">
                      {product.description}
                    </p>

                    <div className="mt-4 grid grid-cols-[0.85fr_1.15fr] gap-2 border-t border-[#e8dfd4] pt-3">
                      <button
                        type="button"
                        onClick={() => onViewPhotos(product, activeColor)}
                        className="inline-flex min-h-11 items-center justify-center gap-1.5 border border-[#d9ccbe] px-3 text-[11px] font-semibold text-[#514439] transition hover:border-[#967052] hover:bg-white"
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        Photos
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenCustomizer(product, activeColor)}
                        className="inline-flex min-h-11 items-center justify-center gap-1.5 bg-[#30271f] px-3 text-[11px] font-semibold text-white transition hover:bg-[#594332]"
                      >
                        {product.isContactLensPack ? 'Check power & reserve' : 'Choose lenses'}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="border border-dashed border-[#d8cbbd] bg-white/50 px-5 py-16 text-center">
            <p className="font-editorial text-2xl text-[#30271f]">No frames in this edit yet.</p>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('all')
                handleGlobalColorClick('all')
              }}
              className="mt-3 text-xs font-semibold text-[#90664a] underline underline-offset-4"
            >
              Reset filters
            </button>
          </div>
        )}

        <p className="mt-8 max-w-2xl text-[10px] leading-relaxed text-[#8c7d6e] sm:text-[11px]">
          Our editorial photographs are for style inspiration. For exact product photography,
          colour and current availability, please contact the store or visit either Kota showroom.
        </p>
      </div>
    </section>
  )
}
