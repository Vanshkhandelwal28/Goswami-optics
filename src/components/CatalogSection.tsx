import React, { useMemo, useState } from 'react'
import { Camera, Cuboid, Magnet } from 'lucide-react'
import {
  COLOR_FINISHES,
  ColorFinishId,
  EYEWEAR_CATALOG,
  EyewearProduct,
} from '../data/goswamiData'
import { FrameCardVisual } from './FrameCardVisual'

interface CatalogSectionProps {
  onOpenTryOn: (product: EyewearProduct, color: ColorFinishId) => void
  onInspectIn3D: (product: EyewearProduct, color: ColorFinishId) => void
  onOpenCustomizer: (product: EyewearProduct, color: ColorFinishId) => void
}

const COLOR_STRIP_ORDER: ColorFinishId[] = [
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
  onOpenTryOn,
  onInspectIn3D,
  onOpenCustomizer,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<
    'all' | 'eyeglasses' | 'sunglasses' | 'clip-on' | 'contacts'
  >('all')
  const [colorFilter, setColorFilter] = useState<ColorFinishId | 'all'>('all')

  // Selected color swatch per product card
  const [cardColors, setCardColors] = useState<Record<string, ColorFinishId>>(() => {
    const initial: Record<string, ColorFinishId> = {}
    EYEWEAR_CATALOG.forEach((p) => {
      initial[p.id] = p.colors[0]
    })
    return initial
  })

  // Optional live clip snap state on clip-on cards
  const [clipActiveMap, setClipActiveMap] = useState<Record<string, boolean>>({})

  const handleGlobalColorClick = (cid: ColorFinishId | 'all') => {
    setColorFilter(cid)
    if (cid !== 'all') {
      setCardColors((prev) => {
        const next = { ...prev }
        EYEWEAR_CATALOG.forEach((p) => {
          if (p.colors.includes(cid)) {
            next[p.id] = cid
          }
        })
        return next
      })
    }
  }

  const filteredProducts = useMemo(() => {
    return EYEWEAR_CATALOG.filter((p) => {
      const catOk = categoryFilter === 'all' || p.category === categoryFilter
      const colOk = colorFilter === 'all' || p.colors.includes(colorFilter)
      return catOk && colOk
    })
  }, [categoryFilter, colorFilter])

  return (
    <section id="collection" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading + Category Filter Pills */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#0064B5] block mb-2">
              100% Authentic Multi-Brand Showroom Collection
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] text-[#182232] font-normal leading-[1.12]">
              Shop eyeglasses, polarized sun &amp; <span className="italic">3-clip edits</span>
            </h2>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {(
              [
                ['all', 'All Eyewear'],
                ['eyeglasses', 'Eyeglasses'],
                ['sunglasses', 'Sunglasses'],
                ['clip-on', '3-Clip Magnetic'],
                ['contacts', 'Contact Lenses'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setCategoryFilter(id)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  categoryFilter === id
                    ? 'bg-[#182232] text-white'
                    : 'bg-[#F4F5F7] text-[#526071] hover:text-[#182232]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Warby Parker Signature "Shop by Color" Interactive Strip */}
        <div className="mb-10 p-4 sm:p-5 rounded-2xl bg-[#F7F5F0] border border-stone-200/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#182232]">
              Shop by frame color
            </span>
            {colorFilter !== 'all' && (
              <button
                type="button"
                onClick={() => handleGlobalColorClick('all')}
                className="text-xs font-semibold text-[#0064B5] hover:underline cursor-pointer"
              >
                Reset color ({COLOR_FINISHES[colorFilter].name})
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => handleGlobalColorClick('all')}
              className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold border transition cursor-pointer ${
                colorFilter === 'all'
                  ? 'bg-[#182232] text-white border-[#182232]'
                  : 'bg-white text-[#182232] border-slate-200 hover:border-slate-300'
              }`}
            >
              All Finishes
            </button>

            {COLOR_STRIP_ORDER.map((cid) => {
              const fin = COLOR_FINISHES[cid]
              const active = colorFilter === cid
              return (
                <button
                  key={cid}
                  type="button"
                  onClick={() => handleGlobalColorClick(cid)}
                  className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium border transition cursor-pointer ${
                    active
                      ? 'bg-[#182232] text-white border-[#182232]'
                      : 'bg-white text-[#182232] border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                    style={{
                      background: fin.swatchSecondaryHex
                        ? `linear-gradient(135deg, ${fin.swatchHex} 50%, ${fin.swatchSecondaryHex} 50%)`
                        : fin.swatchHex,
                    }}
                  />
                  <span>{fin.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const activeColor = cardColors[product.id] || product.colors[0]
            const clipOn = Boolean(clipActiveMap[product.id])

            return (
              <div
                key={product.id}
                className="group rounded-2xl border border-slate-200/90 bg-white overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-slate-300"
              >
                {/* Studio Card Top Canvas */}
                <div className="relative bg-[#F4F5F7] pt-4 pb-3 px-4">
                  {/* Top Bar: Badge + Warby-style "Try on" Pill */}
                  <div className="flex items-center justify-between gap-2 relative z-10">
                    {product.badge ? (
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white text-[#182232] border border-slate-200/80">
                        {product.badge}
                      </span>
                    ) : (
                      <span />
                    )}

                    {!product.isContactLensPack && (
                      <div className="flex items-center gap-1.5">
                        {product.hasMagneticClip && (
                          <button
                            type="button"
                            onClick={() =>
                              setClipActiveMap((m) => ({
                                ...m,
                                [product.id]: !m[product.id],
                              }))
                            }
                            title="Test Magnetic Sun Clip right on card"
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                              clipOn
                                ? 'bg-[#182232] text-white'
                                : 'bg-white/90 text-[#182232] hover:bg-white border border-slate-200'
                            }`}
                          >
                            <Magnet className="w-3 h-3" />
                            {clipOn ? 'Clip On' : 'Snap Clip'}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onOpenTryOn(product, activeColor)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-[#0064B5] text-[#182232] hover:text-white border border-slate-200/90 text-xs font-semibold transition cursor-pointer shadow-2xs"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          Try on
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Studio Optical Vector Illustration */}
                  <div
                    onClick={() =>
                      product.isContactLensPack
                        ? onOpenCustomizer(product, activeColor)
                        : onOpenTryOn(product, activeColor)
                    }
                    className="h-44 sm:h-48 flex items-center justify-center cursor-pointer transition-transform duration-300 group-hover:scale-[1.03]"
                  >
                    <FrameCardVisual
                      shape={product.shape}
                      colorId={activeColor}
                      lensId={product.defaultLens}
                      hasMagneticClip={product.hasMagneticClip}
                      isContactLensPack={product.isContactLensPack}
                      clipActive={clipOn}
                    />
                  </div>

                  {/* Interactive Color Swatches right inside studio card */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {product.colors.map((cid) => {
                      const fin = COLOR_FINISHES[cid]
                      const selected = cid === activeColor
                      return (
                        <button
                          key={cid}
                          type="button"
                          aria-label={`${product.name} in ${fin.name}`}
                          title={fin.name}
                          onClick={() =>
                            setCardColors((prev) => ({ ...prev, [product.id]: cid }))
                          }
                          className={`w-5 h-5 rounded-full p-0.5 transition cursor-pointer ${
                            selected
                              ? 'ring-2 ring-[#182232] ring-offset-1 scale-110'
                              : 'ring-1 ring-slate-300 opacity-85 hover:opacity-100'
                          }`}
                        >
                          <span
                            className="block w-full h-full rounded-full"
                            style={{
                              background: fin.swatchSecondaryHex
                                ? `linear-gradient(135deg, ${fin.swatchHex} 50%, ${fin.swatchSecondaryHex} 50%)`
                                : fin.swatchHex,
                            }}
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Card Details & Actions */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0064B5] block">
                          {product.brand}
                        </span>
                        <h3 className="text-xl font-editorial text-[#182232]">
                          {product.name}
                        </h3>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-lg font-bold text-[#182232]">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.mrp && (
                          <span className="block text-[11px] text-slate-400 line-through">
                            ₹{product.mrp.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#526071] mt-1">
                      {COLOR_FINISHES[activeColor]?.name} · {product.fitWidth} Fit
                    </p>
                    <p className="text-xs text-[#526071] mt-2 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    {!product.isContactLensPack && (
                      <button
                        type="button"
                        onClick={() => onInspectIn3D(product, activeColor)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-full border border-slate-300 hover:border-[#182232] text-xs font-semibold text-[#182232] transition cursor-pointer"
                      >
                        <Cuboid className="w-3.5 h-3.5 text-[#0064B5]" />
                        3D Check
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onOpenCustomizer(product, activeColor)}
                      className="flex-1 py-2.5 px-4 rounded-full bg-[#0064B5] hover:bg-[#004E8F] text-white text-xs font-semibold transition cursor-pointer text-center"
                    >
                      {product.isContactLensPack
                        ? 'Check Power & Reserve'
                        : 'Select Lenses & Reserve'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
