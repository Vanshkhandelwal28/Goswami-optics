import React from 'react'
import { ArrowUpRight, Heart, MessageCircle, ShoppingBag, Trash2, X } from 'lucide-react'
import { COLOR_FINISHES, ColorFinishId, EyewearProduct, KOTA_BRANCHES } from '../data/goswamiData'
import { getPrimaryProductPhoto } from '../data/productMedia'
import { SavedBagItem } from './LensCustomizerModal'

interface ShortlistDrawerProps {
  isOpen: boolean
  items: SavedBagItem[]
  onClose: () => void
  onRemove: (id: string) => void
  onViewPhotos: (product: EyewearProduct, color: ColorFinishId) => void
}

export const ShortlistDrawer: React.FC<ShortlistDrawerProps> = ({
  isOpen,
  items,
  onClose,
  onRemove,
  onViewPhotos,
}) => {
  if (!isOpen) return null

  const grandTotal = items.reduce((sum, item) => sum + item.totalPrice, 0)

  const sendAllToWhatsApp = () => {
    const lines = items
      .map(
        (item, index) =>
          `${index + 1}. ${item.product.brand} ${item.product.name} (${COLOR_FINISHES[item.colorId]?.name}) — ${
            item.isFavorite
              ? 'Saved favorite — frame price'
              : `${item.usageLabel}, ${item.lensPackageLabel}`
          } — ₹${item.totalPrice.toLocaleString('en-IN')}`
      )
      .join('\n')
    const message = encodeURIComponent(
      `Namaste Goswami Optics Kota! 👋\nHere is my saved eyewear shortlist from the website:\n\n${lines}\n\nEstimated total: ₹${grandTotal.toLocaleString(
        'en-IN'
      )}\nPlease confirm availability at either showroom.`
    )
    window.open(`https://wa.me/${KOTA_BRANCHES[0].phoneRaw}?text=${message}`, '_blank', 'noopener')
  }

  return (
    <div
      className="fixed inset-0 z-[65] flex justify-end bg-[#211b16]/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortlist-title"
    >
      <div className="flex h-[100dvh] w-full max-w-lg flex-col bg-[#fbf8f2] shadow-2xl">
        <div className="border-b border-[#e4dacf] px-5 pb-4 pt-6 sm:px-7">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eee5d8] text-[#8a6448]">
                <Heart className="h-4 w-4" />
              </span>
              <div>
                <h2 id="shortlist-title" className="font-editorial text-2xl leading-none text-[#30271f]">
                  Your saved edit
                </h2>
                <p className="mt-1 text-[11px] text-[#807468]">{items.length} {items.length === 1 ? 'frame' : 'frames'} kept close</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close saved frames"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e0d5c8] text-[#6e6257] transition hover:bg-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-[#75695e]">
            Saved privately in this browser — no account or sign-in needed. Send your picks to our
            Kota team or compare them in-store.
          </p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5 sm:px-7">
          {items.length === 0 ? (
            <div className="flex h-full min-h-64 flex-col items-center justify-center px-5 text-center">
              <Heart className="h-7 w-7 text-[#b59a7d]" />
              <h3 className="mt-4 font-editorial text-2xl text-[#30271f]">Nothing saved just yet.</h3>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-[#807468]">
                Tap the heart on any frame to keep it here while you explore.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const primaryPhoto = getPrimaryProductPhoto(item.product)
              return (
                <article key={item.id} className="flex gap-3 border border-[#e4dacf] bg-white p-3">
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onViewPhotos(item.product, item.colorId)
                    }}
                    aria-label={`View ${item.product.brand} ${item.product.name} photos`}
                    className="h-[88px] w-[104px] shrink-0 overflow-hidden bg-[#eee6da]"
                  >
                    <img
                      src={primaryPhoto.src}
                      alt={primaryPhoto.alt}
                      className="image-grade-warm h-full w-full object-cover"
                      style={{ objectPosition: primaryPhoto.position ?? 'center' }}
                    />
                  </button>

                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#9a7255]">
                          {item.product.brand}
                        </p>
                        <h3 className="mt-0.5 truncate font-editorial text-lg leading-tight text-[#30271f]">
                          {item.product.name}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        aria-label={`Remove ${item.product.brand} ${item.product.name} from saved frames`}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#a69a8e] transition hover:bg-[#fbefed] hover:text-[#a35349]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 truncate text-[10px] text-[#817468]">
                      {item.isFavorite ? 'Favorite' : item.usageLabel} · {COLOR_FINISHES[item.colorId]?.name}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#30271f]">
                        ₹{item.totalPrice.toLocaleString('en-IN')}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onClose()
                          onViewPhotos(item.product, item.colorId)
                        }}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#8b6347] transition hover:text-[#594332]"
                      >
                        Photos <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#e4dacf] bg-[#f5efe6] px-5 pb-safe pt-4 sm:px-7">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <span className="text-xs text-[#75695e]">Estimated saved-picks total</span>
              <span className="font-editorial text-3xl leading-none text-[#30271f]">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <button
              type="button"
              onClick={sendAllToWhatsApp}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#44543f] px-4 text-sm font-semibold text-white transition hover:bg-[#33432f]"
            >
              <MessageCircle className="h-4 w-4" />
              Send shortlist to WhatsApp
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 pb-4 text-[10px] text-[#85786b]">
              <ShoppingBag className="h-3 w-3" /> No online payment — confirm and try in-store.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
