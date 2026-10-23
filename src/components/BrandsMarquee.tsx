import React from 'react'
import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import { ColorFinishId, EYEWEAR_CATALOG, EyewearProduct } from '../data/goswamiData'

interface BrandsMarqueeProps {
  onSelectBrandProduct: (product: EyewearProduct, color: ColorFinishId) => void
  onOpenContactsCustomizer: (product: EyewearProduct, color: ColorFinishId) => void
}

interface BrandShowcaseItem {
  id: string
  label: string
  tagline: string
  accentHex: string
  accentSoftBg: string
  accentBorderHover: string
  productIndex: number
  preferredColor: ColorFinishId
  isContacts?: boolean
  renderWordmark: () => React.ReactNode
  renderEmblem: (accentHex: string) => React.ReactNode
}

const BRAND_SHOWCASE: BrandShowcaseItem[] = [
  {
    id: 'ray-ban',
    label: 'Ray-Ban',
    tagline: 'Genuine Iconic Sun & Rx',
    accentHex: '#C8102E',
    accentSoftBg: 'rgba(200, 16, 46, 0.08)',
    accentBorderHover: 'rgba(200, 16, 46, 0.35)',
    productIndex: 0,
    preferredColor: 'sea-glass-grey',
    renderWordmark: () => (
      <span className="font-brand-playfair italic font-extrabold text-[21px] tracking-[-0.025em] text-[#182232] group-hover/card:text-[#C8102E] transition-colors">
        Ray<span className="mx-[1px] font-bold">-</span>Ban
      </span>
    ),
    renderEmblem: (hex) => (
      <span
        className="w-8 h-8 rounded-xl flex items-center justify-center font-brand-playfair italic font-extrabold text-xs tracking-tight border"
        style={{
          color: hex,
          backgroundColor: 'rgba(200, 16, 46, 0.07)',
          borderColor: 'rgba(200, 16, 46, 0.20)',
        }}
      >
        RB
      </span>
    ),
  },
  {
    id: 'titan-eyeplus',
    label: 'Titan Eye+',
    tagline: 'Indra Vihar Exclusive Store',
    accentHex: '#0D9488',
    accentSoftBg: 'rgba(13, 148, 136, 0.08)',
    accentBorderHover: 'rgba(13, 148, 136, 0.36)',
    productIndex: 2,
    preferredColor: 'ristretto-tortoise',
    renderWordmark: () => (
      <span className="font-sans font-extrabold text-[16px] tracking-[0.15em] text-[#182232] uppercase flex items-center">
        TITAN EYE
        <span className="text-[#0D9488] text-[19px] font-extrabold ml-0.5 leading-none">+</span>
      </span>
    ),
    renderEmblem: (hex) => (
      <span
        className="w-8 h-8 rounded-xl flex items-center justify-center font-sans font-extrabold text-xs border"
        style={{
          color: hex,
          backgroundColor: 'rgba(13, 148, 136, 0.08)',
          borderColor: 'rgba(13, 148, 136, 0.22)',
        }}
      >
        T+
      </span>
    ),
  },
  {
    id: 'vogue',
    label: 'Vogue Eyewear',
    tagline: 'Couture Acetate & Sun',
    accentHex: '#9F1239',
    accentSoftBg: 'rgba(159, 18, 57, 0.08)',
    accentBorderHover: 'rgba(159, 18, 57, 0.34)',
    productIndex: 3,
    preferredColor: 'ristretto-tortoise',
    renderWordmark: () => (
      <span className="font-brand-playfair font-bold text-[20px] tracking-[0.22em] text-[#182232] group-hover/card:text-[#9F1239] transition-colors uppercase">
        VOGUE
      </span>
    ),
    renderEmblem: (hex) => (
      <span
        className="w-8 h-8 rounded-xl flex items-center justify-center font-brand-playfair font-bold text-sm border"
        style={{
          color: hex,
          backgroundColor: 'rgba(159, 18, 57, 0.07)',
          borderColor: 'rgba(159, 18, 57, 0.20)',
        }}
      >
        V
      </span>
    ),
  },
  {
    id: 'greyjack',
    label: 'Greyjack 3-Clip',
    tagline: 'Magnetic Sun & Night Snap',
    accentHex: '#0064B5',
    accentSoftBg: 'rgba(0, 100, 181, 0.08)',
    accentBorderHover: 'rgba(0, 100, 181, 0.38)',
    productIndex: 1,
    preferredColor: 'jet-black',
    renderWordmark: () => (
      <span className="font-sans font-extrabold text-[15.5px] tracking-[0.12em] text-[#182232] flex items-center gap-1.5 uppercase">
        <span>GREYJACK</span>
        <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-[#0064B5]/10 text-[#0064B5]">
          3-CLIP
        </span>
      </span>
    ),
    renderEmblem: (hex) => (
      <span
        className="w-8 h-8 rounded-xl flex items-center justify-center font-sans font-extrabold text-[11px] tracking-tight border"
        style={{
          color: hex,
          backgroundColor: 'rgba(0, 100, 181, 0.08)',
          borderColor: 'rgba(0, 100, 181, 0.22)',
        }}
      >
        3X
      </span>
    ),
  },
  {
    id: 'fastrack',
    label: 'Fastrack',
    tagline: 'Youth Polarized Sport',
    accentHex: '#EA580C',
    accentSoftBg: 'rgba(234, 88, 12, 0.08)',
    accentBorderHover: 'rgba(234, 88, 12, 0.36)',
    productIndex: 6,
    preferredColor: 'silver-titanium',
    renderWordmark: () => (
      <span className="font-sans italic font-extrabold text-[18px] tracking-[0.07em] text-[#182232] group-hover/card:text-[#EA580C] transition-colors uppercase">
        FASTRACK
      </span>
    ),
    renderEmblem: (hex) => (
      <span
        className="w-8 h-8 rounded-xl flex items-center justify-center font-sans italic font-extrabold text-xs border"
        style={{
          color: hex,
          backgroundColor: 'rgba(234, 88, 12, 0.08)',
          borderColor: 'rgba(234, 88, 12, 0.22)',
        }}
      >
        FT
      </span>
    ),
  },
  {
    id: 'crizal',
    label: 'Crizal Anti-Glare',
    tagline: 'Sapphire UV & Blue-Cut',
    accentHex: '#0284C7',
    accentSoftBg: 'rgba(2, 132, 199, 0.08)',
    accentBorderHover: 'rgba(2, 132, 199, 0.36)',
    productIndex: 0,
    preferredColor: 'crystal-clear',
    renderWordmark: () => (
      <span className="font-sans font-bold text-[16.5px] tracking-[0.22em] text-[#182232] group-hover/card:text-[#0284C7] transition-colors uppercase">
        CRIZAL
      </span>
    ),
    renderEmblem: (hex) => (
      <span
        className="w-8 h-8 rounded-xl flex items-center justify-center border"
        style={{
          color: hex,
          backgroundColor: 'rgba(2, 132, 199, 0.08)',
          borderColor: 'rgba(2, 132, 199, 0.22)',
        }}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="8" />
          <path d="M9 9l6 6M15 9l-2.5 2.5" strokeLinecap="round" />
        </svg>
      </span>
    ),
  },
  {
    id: 'azzaro',
    label: 'Azzaro Paris',
    tagline: '8g Japanese Beta-Titanium',
    accentHex: '#A16207',
    accentSoftBg: 'rgba(161, 98, 7, 0.08)',
    accentBorderHover: 'rgba(161, 98, 7, 0.36)',
    productIndex: 5,
    preferredColor: 'polished-gold',
    renderWordmark: () => (
      <span className="font-brand-cormorant font-bold text-[22px] tracking-[0.24em] text-[#182232] group-hover/card:text-[#A16207] transition-colors uppercase">
        AZZARO
      </span>
    ),
    renderEmblem: (hex) => (
      <span
        className="w-8 h-8 rounded-xl flex items-center justify-center font-brand-cormorant font-bold text-sm border"
        style={{
          color: hex,
          backgroundColor: 'rgba(161, 98, 7, 0.08)',
          borderColor: 'rgba(161, 98, 7, 0.24)',
        }}
      >
        AZ
      </span>
    ),
  },
  {
    id: 'bausch-lomb',
    label: 'Bausch + Lomb',
    tagline: 'SoftLens Toric & Lacelle',
    accentHex: '#0077B6',
    accentSoftBg: 'rgba(0, 119, 182, 0.08)',
    accentBorderHover: 'rgba(0, 119, 182, 0.36)',
    productIndex: 11,
    preferredColor: 'crystal-clear',
    isContacts: true,
    renderWordmark: () => (
      <span className="font-sans font-extrabold text-[15px] tracking-[0.12em] text-[#182232] uppercase flex items-center">
        BAUSCH
        <span className="mx-1 text-[#0077B6] font-extrabold text-[17px]">+</span>
        LOMB
      </span>
    ),
    renderEmblem: (hex) => (
      <span
        className="w-8 h-8 rounded-xl flex items-center justify-center font-sans font-extrabold text-xs border"
        style={{
          color: hex,
          backgroundColor: 'rgba(0, 119, 182, 0.08)',
          borderColor: 'rgba(0, 119, 182, 0.22)',
        }}
      >
        B+L
      </span>
    ),
  },
  {
    id: 'coopervision',
    label: 'CooperVision',
    tagline: 'Breathable Silicone Hydrogel',
    accentHex: '#4F46E5',
    accentSoftBg: 'rgba(79, 70, 229, 0.08)',
    accentBorderHover: 'rgba(79, 70, 229, 0.35)',
    productIndex: 11,
    preferredColor: 'sea-glass-grey',
    isContacts: true,
    renderWordmark: () => (
      <span className="font-sans font-bold text-[17.5px] tracking-[-0.01em] text-[#182232] group-hover/card:text-[#4F46E5] transition-colors">
        Cooper<span className="font-extrabold text-[#4F46E5]">Vision</span>
      </span>
    ),
    renderEmblem: (hex) => (
      <span
        className="w-8 h-8 rounded-xl flex items-center justify-center font-sans font-extrabold text-xs border"
        style={{
          color: hex,
          backgroundColor: 'rgba(79, 70, 229, 0.08)',
          borderColor: 'rgba(79, 70, 229, 0.22)',
        }}
      >
        CV
      </span>
    ),
  },
  {
    id: 'x-ford',
    label: 'X-Ford Eyewear',
    tagline: '2-in-1 Browline Sun Clips',
    accentHex: '#7C4A21',
    accentSoftBg: 'rgba(124, 74, 33, 0.08)',
    accentBorderHover: 'rgba(124, 74, 33, 0.36)',
    productIndex: 9,
    preferredColor: 'two-tone',
    renderWordmark: () => (
      <span className="font-editorial font-semibold text-[19px] tracking-[0.16em] text-[#182232] group-hover/card:text-[#7C4A21] transition-colors uppercase">
        X-FORD
      </span>
    ),
    renderEmblem: (hex) => (
      <span
        className="w-8 h-8 rounded-xl flex items-center justify-center font-editorial font-bold text-xs border"
        style={{
          color: hex,
          backgroundColor: 'rgba(124, 74, 33, 0.08)',
          borderColor: 'rgba(124, 74, 33, 0.22)',
        }}
      >
        XF
      </span>
    ),
  },
  {
    id: 'wolf-eye',
    label: 'Wolf Eye',
    tagline: 'Crystal Corewire Acetate',
    accentHex: '#334155',
    accentSoftBg: 'rgba(51, 65, 85, 0.08)',
    accentBorderHover: 'rgba(51, 65, 85, 0.36)',
    productIndex: 8,
    preferredColor: 'crystal-clear',
    renderWordmark: () => (
      <span className="font-sans font-extrabold text-[15.5px] tracking-[0.19em] text-[#182232] uppercase">
        WOLF EYE
      </span>
    ),
    renderEmblem: (hex) => (
      <span
        className="w-8 h-8 rounded-xl flex items-center justify-center font-sans font-extrabold text-xs border"
        style={{
          color: hex,
          backgroundColor: 'rgba(51, 65, 85, 0.08)',
          borderColor: 'rgba(51, 65, 85, 0.22)',
        }}
      >
        WE
      </span>
    ),
  },
  {
    id: 'hashtag',
    label: 'Hashtag Eyewear',
    tagline: 'Architectural Campus Metals',
    accentHex: '#1D4ED8',
    accentSoftBg: 'rgba(29, 78, 216, 0.08)',
    accentBorderHover: 'rgba(29, 78, 216, 0.36)',
    productIndex: 7,
    preferredColor: 'polished-gold',
    renderWordmark: () => (
      <span className="font-sans font-extrabold text-[16px] tracking-[0.14em] text-[#182232] group-hover/card:text-[#1D4ED8] transition-colors uppercase flex items-center gap-0.5">
        <span className="text-[#1D4ED8] italic font-black">#</span>HASHTAG
      </span>
    ),
    renderEmblem: (hex) => (
      <span
        className="w-8 h-8 rounded-xl flex items-center justify-center font-sans font-black text-sm border"
        style={{
          color: hex,
          backgroundColor: 'rgba(29, 78, 216, 0.08)',
          borderColor: 'rgba(29, 78, 216, 0.22)',
        }}
      >
        #
      </span>
    ),
  },
]

export const BrandsMarquee: React.FC<BrandsMarqueeProps> = ({
  onSelectBrandProduct,
  onOpenContactsCustomizer,
}) => {
  const handleBrandClick = (brand: BrandShowcaseItem) => {
    const product = EYEWEAR_CATALOG[brand.productIndex] || EYEWEAR_CATALOG[0]
    if (brand.isContacts) {
      onOpenContactsCustomizer(product, brand.preferredColor)
    } else {
      onSelectBrandProduct(product, brand.preferredColor)
    }
  }

  const renderTrackCopy = (isClone: boolean) => (
    <div
      aria-hidden={isClone || undefined}
      className="flex shrink-0 items-center gap-3 sm:gap-5 pr-3 sm:pr-5"
    >
      {BRAND_SHOWCASE.map((brand) => (
        <button
          key={`${isClone ? 'clone' : 'main'}-${brand.id}`}
          type="button"
          tabIndex={isClone ? -1 : 0}
          onClick={() => handleBrandClick(brand)}
          style={
            {
              '--brand-accent': brand.accentHex,
              '--brand-border-hover': brand.accentBorderHover,
              '--brand-soft-bg': brand.accentSoftBg,
            } as React.CSSProperties
          }
          className="group/card relative flex items-center gap-3 sm:gap-3.5 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-white/95 hover:bg-white border border-stone-200/90 hover:border-[var(--brand-border-hover)] shadow-[0_2px_10px_rgba(24,34,50,0.035)] hover:shadow-[0_10px_26px_rgba(24,34,50,0.08)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer text-left select-none"
        >
          {/* Top hairline brand color accent that illuminates on hover */}
          <span
            className="pointer-events-none absolute inset-x-4 top-0 h-[2px] rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
            style={{ backgroundColor: brand.accentHex }}
          />

          {/* Bespoke Brand Monogram Crest */}
          {brand.renderEmblem(brand.accentHex)}

          {/* Brand Custom Typography + Micro Specialty Subtitle */}
          <div className="pr-1">
            <div className="leading-none flex items-center">{brand.renderWordmark()}</div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[10.5px] font-medium tracking-[0.04em] text-[#64748B] group-hover/card:text-[#182232] transition-colors whitespace-nowrap">
              <span>{brand.tagline}</span>
              <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover/card:opacity-100 group-hover/card:translate-x-0 transition-all duration-200 text-[#0064B5]" />
            </div>
          </div>
        </button>
      ))}
    </div>
  )

  return (
    <div
      aria-label="Authorised eyewear and optical lens brands carried at Goswami Optics Kota"
      className="relative bg-gradient-to-b from-[#FAF8F4] via-white to-[#F7F5F0]/80 border-t border-stone-200/85 pt-5 pb-6 overflow-hidden"
    >
      {/* Subtle architectural cobalt & champagne center shimmer rule */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0064B5]/25 to-transparent" />

      {/* Editorial Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#182232]/85">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0064B5] shrink-0" />
          <span>Authorised Multi-Brand Optical House</span>
          <span className="hidden md:inline text-stone-300">·</span>
          <span className="hidden md:inline text-[#0064B5] font-semibold">
            12 Certified Maisons in Stock
          </span>
        </div>

        <span className="text-[11px] font-medium text-[#526071]">
          Click any brand to preview live in 3D Virtual Try-On →
        </span>
      </div>

      {/* Infinite Seamless 60FPS GPU Marquee Viewport */}
      <div className="brands-marquee-viewport w-full overflow-hidden py-1">
        <div className="brands-marquee-track">
          {renderTrackCopy(false)}
          {renderTrackCopy(true)}
        </div>
      </div>
    </div>
  )
}
