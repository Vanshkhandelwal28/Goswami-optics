import React, { useState } from 'react'
import { Camera, Cuboid, Heart, MapPin, Menu, Sparkles, X } from 'lucide-react'

interface NavbarProps {
  shortlistCount: number
  onOpenShortlist: () => void
  onOpenQuiz: () => void
  onOpenTryOn: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  shortlistCount,
  onOpenShortlist,
  onOpenQuiz,
  onOpenTryOn,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Slim Top Announcement Bar */}
      <div className="bg-[#182232] text-white text-[11px] sm:text-xs py-2 px-4 text-center font-medium tracking-wide">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span>
            4.8★ Rated Optician in Kota (416+ Google Reviews) · Free Computerized Eye Testing
          </span>
          <a
            href="#stores"
            className="underline decoration-sky-400 underline-offset-4 text-sky-200 hover:text-white transition"
          >
            Teachers Colony &amp; Indra Vihar Showrooms →
          </a>
        </div>
      </div>

      {/* Main Warby-Inspired Clean Header */}
      <div className="bg-white/94 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[70px] flex items-center justify-between gap-4">
          {/* Brand Wordmark */}
          <a href="#" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#182232] text-white flex items-center justify-center font-editorial italic text-lg leading-none">
              G
            </div>
            <div>
              <div className="text-[15px] sm:text-base font-bold tracking-[0.14em] text-[#182232] leading-none">
                GOSWAMI OPTICS
              </div>
              <div className="text-[10px] font-semibold tracking-[0.2em] text-[#0064B5] uppercase mt-0.5">
                Kota · Est. Optical Studio
              </div>
            </div>
          </a>

          {/* Center Desktop Navigation */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-7 text-[13.5px] font-medium text-[#182232]"
          >
            <a href="#collection" className="hover:text-[#0064B5] transition">
              Eyeglasses &amp; Sun
            </a>
            <a
              href="#studio-3d"
              className="inline-flex items-center gap-1.5 hover:text-[#0064B5] transition"
            >
              <Cuboid className="w-3.5 h-3.5 text-[#0064B5]" />
              3D Studio
            </a>
            <button
              type="button"
              onClick={onOpenQuiz}
              className="inline-flex items-center gap-1 hover:text-[#0064B5] transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0064B5]" />
              Frame Quiz
            </button>
            <a
              href="#stores"
              className="inline-flex items-center gap-1 hover:text-[#0064B5] transition"
            >
              <MapPin className="w-3.5 h-3.5 text-[#0064B5]" />
              Two Kota Branches
            </a>
            <a href="#reviews" className="hover:text-[#0064B5] transition">
              Reviews (4.8★)
            </a>
          </nav>

          {/* Right Quick Actions (Zero Auth, Pure Utility) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={onOpenShortlist}
              aria-label="Open saved frames shortlist"
              className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-200 hover:border-slate-300 text-xs font-semibold text-[#182232] transition cursor-pointer"
            >
              <Heart className="w-4 h-4 text-[#0064B5]" />
              <span className="hidden sm:inline">Shortlist</span>
              {shortlistCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#0064B5] text-white text-[10px] font-bold flex items-center justify-center">
                  {shortlistCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenTryOn}
              className="inline-flex items-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-full bg-[#0064B5] hover:bg-[#004E8F] text-white text-xs sm:text-[13px] font-semibold transition cursor-pointer shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Virtual Try-On</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((m) => !m)}
              aria-label="Toggle Menu"
              className="lg:hidden p-2 rounded-full hover:bg-slate-100 text-[#182232] cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-5 py-4 space-y-3 text-sm font-semibold text-[#182232]">
            <a
              href="#collection"
              onClick={() => setMobileOpen(false)}
              className="block py-1.5"
            >
              Shop Eyeglasses, Sunglasses &amp; Contact Lenses
            </a>
            <a
              href="#studio-3d"
              onClick={() => setMobileOpen(false)}
              className="block py-1.5 text-[#0064B5]"
            >
              Interactive 360° 3D Eyewear Studio
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false)
                onOpenQuiz()
              }}
              className="block py-1.5 text-left w-full"
            >
              Take the 30-Second Frame Style Quiz
            </button>
            <a
              href="#stores"
              onClick={() => setMobileOpen(false)}
              className="block py-1.5"
            >
              Kota Branches &amp; Google Maps (Teachers Colony &amp; Indra Vihar)
            </a>
            <a
              href="#reviews"
              onClick={() => setMobileOpen(false)}
              className="block py-1.5"
            >
              Customer Reviews &amp; Write a Review
            </a>
          </div>
        )}
      </div>
    </header>
  )
}
