import React from 'react'
import { Camera, MessageCircle, ShoppingBag, Trash2, X } from 'lucide-react'
import { COLOR_FINISHES, ColorFinishId, EyewearProduct, KOTA_BRANCHES } from '../data/goswamiData'
import { FrameCardVisual } from './FrameCardVisual'
import { SavedBagItem } from './LensCustomizerModal'

interface ShortlistDrawerProps {
  isOpen: boolean
  items: SavedBagItem[]
  onClose: () => void
  onRemove: (id: string) => void
  onTryOn: (product: EyewearProduct, color: ColorFinishId) => void
}

export const ShortlistDrawer: React.FC<ShortlistDrawerProps> = ({
  isOpen,
  items,
  onClose,
  onRemove,
  onTryOn,
}) => {
  if (!isOpen) return null

  const grandTotal = items.reduce((sum, i) => sum + i.totalPrice, 0)

  const sendAllToWhatsApp = () => {
    const lines = items
      .map(
        (item, idx) =>
          `${idx + 1}. ${item.product.brand} ${item.product.name} (${
            COLOR_FINISHES[item.colorId]?.name
          }) — ${item.usageLabel}, ${item.lensPackageLabel} — ₹${item.totalPrice.toLocaleString(
            'en-IN'
          )}`
      )
      .join('\n')

    const msg = encodeURIComponent(
      `Namaste Goswami Optics Kota! 👋\nHere is my shortlisted eyewear tray from the website:\n\n${lines}\n\nEstimated Total: ₹${grandTotal.toLocaleString(
        'en-IN'
      )}\nPlease confirm availability for trying in-store!`
    )
    window.open(`https://wa.me/${KOTA_BRANCHES[0].phoneRaw}?text=${msg}`, '_blank', 'noopener')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-md h-[100dvh] flex flex-col justify-between p-5 sm:p-6 pb-safe shadow-2xl">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#0064B5]" />
              <h3 className="text-xl font-editorial text-[#182232]">
                Your Shortlist Tray ({items.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-[#526071] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-[#526071] mt-3">
            Saved locally in your browser — no account or sign-in required. Try them at
            either Kota showroom before paying a rupee!
          </p>
        </div>

        <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-1">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <p className="text-base font-editorial text-[#182232]">
                No frames saved yet
              </p>
              <p className="text-xs text-[#526071]">
                Explore our collection, test frames in 3D or AR, and shortlist your
                favourites to try in-store in Kota.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-[#F9FAFB] flex items-center gap-3.5"
              >
                <div className="w-24 h-16 shrink-0 bg-white rounded-xl p-1 border border-slate-100">
                  <FrameCardVisual
                    shape={item.product.shape}
                    colorId={item.colorId}
                    lensId={item.product.defaultLens}
                    hasMagneticClip={item.product.hasMagneticClip}
                    isContactLensPack={item.product.isContactLensPack}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold uppercase text-[#0064B5]">
                    {item.product.brand}
                  </div>
                  <div className="text-sm font-semibold text-[#182232] truncate">
                    {item.product.name}
                  </div>
                  <div className="text-[11px] text-[#526071] truncate">
                    {COLOR_FINISHES[item.colorId]?.name} · {item.lensPackageLabel}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs font-bold text-[#182232]">
                      ₹{item.totalPrice.toLocaleString('en-IN')}
                    </span>
                    {!item.product.isContactLensPack && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose()
                          onTryOn(item.product, item.colorId)
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0064B5] hover:underline cursor-pointer"
                      >
                        <Camera className="w-3 h-3" /> Try On
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  aria-label="Remove item"
                  className="p-2 text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium text-[#526071]">
                Shortlist Package Total
              </span>
              <span className="text-2xl font-bold text-[#182232]">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              type="button"
              onClick={sendAllToWhatsApp}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-full bg-[#0064B5] hover:bg-[#004E8F] text-white text-sm font-semibold transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              Send Shortlist to Goswami Optics WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
