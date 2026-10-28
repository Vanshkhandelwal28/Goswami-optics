import React, { useState } from 'react'
import { Check, Heart, MessageCircle, ShieldCheck, Store, X } from 'lucide-react'
import {
  COLOR_FINISHES,
  ColorFinishId,
  EyewearProduct,
  KOTA_BRANCHES,
  KotaBranch,
} from '../data/goswamiData'
import { getPrimaryProductPhoto } from '../data/productMedia'

export interface SavedBagItem {
  id: string
  product: EyewearProduct
  colorId: ColorFinishId
  usageLabel: string
  lensPackageLabel: string
  branchId: KotaBranch['id']
  totalPrice: number
  isFavorite?: boolean
}

interface LensCustomizerModalProps {
  product: EyewearProduct | null
  colorId: ColorFinishId
  onClose: () => void
  onSaveToBag: (item: SavedBagItem) => void
}

const USAGE_OPTIONS = [
  {
    id: 'single-vision',
    title: 'Single-Vision Prescription',
    desc: 'Distance or reading power — eye test free at store',
    addPrice: 0,
  },
  {
    id: 'zero-power',
    title: 'Zero-Power Screen & Study Protection',
    desc: 'Ideal for non-prescription laptop, tablet & coaching hours',
    addPrice: 0,
  },
  {
    id: 'progressive',
    title: 'Progressive Multifocal (Near + Far)',
    desc: 'Seamless corridor with zero visible dividing line',
    addPrice: 1800,
  },
  {
    id: 'frame-only',
    title: 'Frame Only',
    desc: 'Genuine frame with original brand case & cloth',
    addPrice: 0,
  },
]

const COATING_PACKAGES = [
  {
    id: 'standard-hc',
    title: 'Standard Anti-Glare UV400 Lens',
    desc: 'Scratch-resistant optical polycarbonate',
    addPrice: 0,
  },
  {
    id: 'crizal-blue',
    title: 'Crizal Blue-Cut Zero-Strain Coating',
    desc: 'Blocks harmful digital blue light + smudge & dust shield',
    addPrice: 850,
  },
  {
    id: 'photochromic-sun',
    title: 'Photochromic Transitions (Clear-to-Dark)',
    desc: 'Automatically darkens outdoors in bright Rajasthan sun',
    addPrice: 1450,
  },
]

export const LensCustomizerModal: React.FC<LensCustomizerModalProps> = ({
  product,
  colorId,
  onClose,
  onSaveToBag,
}) => {
  const [usageIdx, setUsageIdx] = useState(0)
  const [coatingIdx, setCoatingIdx] = useState(1)
  const [branchId, setBranchId] = useState<KotaBranch['id']>('teachers-colony')
  const [savedToast, setSavedToast] = useState(false)

  if (!product) return null

  const usage = USAGE_OPTIONS[usageIdx]
  const coating =
    usage.id === 'frame-only' || product.isContactLensPack
      ? COATING_PACKAGES[0]
      : COATING_PACKAGES[coatingIdx]

  const totalPrice = product.price + usage.addPrice + coating.addPrice
  const chosenBranch =
    KOTA_BRANCHES.find((b) => b.id === branchId) || KOTA_BRANCHES[0]

  const buildItem = (): SavedBagItem => ({
    id: `${product.id}-${colorId}-${usage.id}-${coating.id}`,
    product,
    colorId,
    usageLabel: product.isContactLensPack ? 'Contact Lens Pack' : usage.title,
    lensPackageLabel: product.isContactLensPack
      ? 'Includes Free Trial Check'
      : coating.title,
    branchId,
    totalPrice,
  })

  const handleSave = () => {
    onSaveToBag(buildItem())
    setSavedToast(true)
    setTimeout(() => {
      setSavedToast(false)
      onClose()
    }, 900)
  }

  const handleWhatsAppReserve = () => {
    const item = buildItem()
    onSaveToBag(item)
    const msg = encodeURIComponent(
      `Namaste Goswami Optics Kota! 👋\nI'd like to check availability / reserve:\n• Frame: ${product.brand} ${product.name}\n• Color: ${COLOR_FINISHES[colorId]?.name}\n• Vision Type: ${item.usageLabel}\n• Lens Coating: ${item.lensPackageLabel}\n• Estimated Total: ₹${totalPrice.toLocaleString('en-IN')}\n• Preferred Showroom: ${chosenBranch.officialName} (${chosenBranch.shortTitle})`
    )
    window.open(
      `https://wa.me/${chosenBranch.phoneRaw}?text=${msg}`,
      '_blank',
      'noopener'
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-4xl rounded-t-3xl sm:rounded-3xl overflow-y-auto md:overflow-hidden border border-stone-200 shadow-2xl grid grid-cols-1 md:grid-cols-12 max-h-[92dvh]">
        {/* Left Summary Preview */}
        <div className="md:col-span-5 bg-[#eee6da] p-5 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-200">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#90664a]">
                  {product.brand}
                </span>
                <h3 className="text-xl sm:text-2xl font-editorial text-[#30271f] mt-0.5">
                  {product.name}
                </h3>
                <p className="text-xs text-[#75695e] mt-0.5">
                  {COLOR_FINISHES[colorId]?.name} · {product.measurements}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close customizer"
                className="md:hidden p-1.5 rounded-full bg-white text-[#75695e] shadow-2xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-3 aspect-[4/3] overflow-hidden rounded-2xl border border-stone-200 bg-white sm:my-4">
              <img
                src={getPrimaryProductPhoto(product).src}
                alt={getPrimaryProductPhoto(product).alt}
                className="image-grade-warm h-full w-full object-cover"
                style={{ objectPosition: getPrimaryProductPhoto(product).position ?? 'center' }}
              />
            </div>
            <p className="text-[10px] text-[#8a7d70]">Editorial styling photo · exact product finish confirmed in-store</p>

            <ul className="hidden sm:block space-y-2 text-xs text-[#75695e]">
              {product.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden sm:flex pt-4 mt-4 border-t border-stone-200/80 items-center gap-2 text-xs text-[#75695e]">
            <ShieldCheck className="w-4 h-4 text-[#90664a] shrink-0" />
            <span>No online payment or sign-up needed — pay after trying in-store.</span>
          </div>
        </div>

        {/* Right Customizer Options */}
        <div className="md:col-span-7 p-5 sm:p-7 pb-safe md:overflow-y-auto md:max-h-[92dvh] flex flex-col justify-between space-y-5">
          <div className="space-y-5">
            <div className="hidden md:flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#75695e]">
                Customize Your Pair
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-stone-100 text-[#75695e] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!product.isContactLensPack && (
              <>
                {/* 1. Prescription Type */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#30271f] block">
                    1. Select Vision Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {USAGE_OPTIONS.map((opt, idx) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setUsageIdx(idx)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                          usageIdx === idx
                            ? 'border-[#90664a] bg-[#90664a]/6'
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-[#30271f]">
                          <span>{opt.title}</span>
                          <span>
                            {opt.addPrice === 0 ? 'Included' : `+₹${opt.addPrice}`}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#75695e] mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Lens Coating */}
                {usage.id !== 'frame-only' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#30271f] block">
                      2. Choose Optical Lens Coating
                    </label>
                    <div className="space-y-2">
                      {COATING_PACKAGES.map((pkg, idx) => (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setCoatingIdx(idx)}
                          className={`w-full p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between gap-3 ${
                            coatingIdx === idx
                              ? 'border-[#90664a] bg-[#90664a]/6'
                              : 'border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-semibold text-[#30271f]">
                              {pkg.title}
                            </div>
                            <p className="text-[11px] text-[#75695e]">{pkg.desc}</p>
                          </div>
                          <span className="text-xs font-bold text-[#90664a] shrink-0">
                            {pkg.addPrice === 0 ? '₹0' : `+₹${pkg.addPrice}`}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 3. Select Kota Showroom */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#30271f] flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-[#90664a]" /> Preferred Kota Showroom
                for Pickup &amp; Free Fitting
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {KOTA_BRANCHES.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBranchId(b.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      branchId === b.id
                        ? 'border-[#90664a] bg-[#90664a]/6'
                        : 'border-stone-200'
                    }`}
                  >
                    <div className="text-xs font-semibold text-[#30271f]">
                      {b.shortTitle}
                    </div>
                    <div className="text-[11px] text-[#75695e] truncate">{b.landmark}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Total & Actions */}
          <div className="pt-4 border-t border-stone-200 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium text-[#75695e]">
                Estimated In-Store Package Total
              </span>
              <span className="text-2xl font-bold text-[#30271f]">
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleWhatsAppReserve}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#90664a] hover:bg-[#6e4c36] text-white text-xs sm:text-sm font-semibold transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                Reserve at Store via WhatsApp
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-full border border-[#30271f] text-[#30271f] hover:bg-stone-50 text-xs sm:text-sm font-semibold transition cursor-pointer"
              >
                <Heart className="w-4 h-4" />
                {savedToast ? 'Saved to Shortlist!' : 'Save Shortlist'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
