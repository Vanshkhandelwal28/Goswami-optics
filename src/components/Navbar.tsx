import React, { useState } from 'react'
import { ArrowUpRight, Heart, MapPin, Menu, Phone, Sparkles, Star, X } from 'lucide-react'

interface NavbarProps {
  shortlistCount: number
  onOpenShortlist: () => void
  onOpenQuiz: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  shortlistCount,
  onOpenShortlist,
  onOpenQuiz,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMenu = () => setMobileOpen(false)

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="bg-[#30271f] px-3 py-2 text-center text-[10px] font-medium tracking-[0.08em] text-[#fbf6ee] sm:text-[11px]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-3 w-3 fill-[#d5b77e] text-[#d5b77e]" />
            <span>Kota’s trusted optical house · Rated 4.8★ across 416+ reviews</span>
          </span>
          <a
            href="#stores"
            className="inline-flex items-center gap-1 text-[#e0c99e] underline decoration-[#a98b62]/70 underline-offset-4 transition hover:text-white"
          >
            Visit our two showrooms <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="border-b border-[#e6ded3] bg-[#fbf8f2]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:h-[76px] lg:px-8">
          <a href="#top" className="group flex min-w-0 items-center gap-2.5" aria-label="Goswami Optics home">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#c8b69e] bg-[#eee5d8] font-editorial text-[26px] italic leading-none text-[#5a4533] transition group-hover:bg-[#e5dac9]">
              G
            </span>
            <span className="min-w-0">
              <span className="block whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.17em] text-[#30271f] sm:text-[14px] sm:tracking-[0.2em]">
                Goswami Optics
              </span>
              <span className="mt-0.5 block whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.22em] text-[#8b6c50] sm:text-[10px]">
                Kota · Optical House
              </span>
            </span>
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-5 text-[12px] font-medium text-[#55493d] lg:flex xl:gap-7 xl:text-[13px]"
          >
            <a href="#collection" className="transition hover:text-[#94694c]">Eyewear</a>
            <a href="#experience" className="transition hover:text-[#94694c]">Our approach</a>
            <a href="#lookbook" className="transition hover:text-[#94694c]">Lookbook</a>
            <a href="#reviews" className="transition hover:text-[#94694c]">Reviews</a>
            <a href="#stores" className="transition hover:text-[#94694c]">Kota stores</a>
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onOpenShortlist}
              aria-label={`Open saved frames${shortlistCount ? `, ${shortlistCount} saved` : ''}`}
              className="relative inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-[#ded4c8] px-2.5 text-xs font-semibold text-[#44382e] transition hover:border-[#b79d80] hover:bg-white sm:px-3.5"
            >
              <Heart className="h-4 w-4 text-[#93684d]" />
              <span className="hidden md:inline">Saved</span>
              {shortlistCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#76563e] px-1 text-[9px] font-bold text-white">
                  {shortlistCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={onOpenQuiz}
              className="hidden h-10 items-center justify-center gap-1.5 rounded-full bg-[#30271f] px-4 text-xs font-semibold text-[#fffaf3] transition hover:bg-[#594332] sm:inline-flex"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#d5b77e]" />
              Find my frames
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#30271f] transition hover:bg-[#eee7dc] lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#e7ded2] bg-[#fbf8f2] px-4 pb-5 pt-3 shadow-[0_18px_28px_rgba(48,39,31,0.12)] sm:px-6 lg:hidden">
            <nav aria-label="Mobile navigation" className="mx-auto max-w-7xl space-y-1">
              {[
                ['#collection', 'Explore the collection'],
                ['#experience', 'Our approach'],
                ['#lookbook', 'Photo & film lookbook'],
                ['#reviews', 'Customer reviews'],
                ['#stores', 'Kota showrooms & directions'],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-[#43382e] transition hover:bg-[#f1e9de]"
                >
                  {label}
                  <ArrowUpRight className="h-4 w-4 text-[#9a7155]" />
                </a>
              ))}
              <div className="grid grid-cols-2 gap-2 border-t border-[#e7ded2] pt-3">
                <button
                  type="button"
                  onClick={() => {
                    closeMenu()
                    onOpenQuiz()
                  }}
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-[#30271f] px-3 text-xs font-semibold text-white"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#d5b77e]" />
                  Find my frames
                </button>
                <a
                  href="tel:+919782792323"
                  onClick={closeMenu}
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-[#d9ccbc] px-3 text-xs font-semibold text-[#43382e]"
                >
                  <Phone className="h-3.5 w-3.5 text-[#8f684d]" />
                  Call the store
                </a>
                <a
                  href="https://wa.me/919782792323?text=Namaste%20Goswami%20Optics%20Kota!%20I%20am%20visiting%20from%20your%20website."
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className="col-span-2 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-[#e9efe7] px-3 text-xs font-semibold text-[#435440]"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Ask us on WhatsApp
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
