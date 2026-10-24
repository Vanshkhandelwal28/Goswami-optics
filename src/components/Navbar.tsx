import React, { useState } from 'react'
import { Camera, Cuboid, Heart, MapPin, Menu, Phone, Sparkles, Star, X } from 'lucide-react'

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
      {/* Slim Responsive Top Announcement Bar */}
      <div className="bg-[#182232] text-white text-[10.5px] sm:text-xs py-1.5 sm:py-2 px-3 sm:px-4 text-center font-medium tracking-wide">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-0.5">
          <span className="truncate">
            4.8★ Rated Optician in Kota (416+ Reviews)
            <span className="hidden md:inline"> · Free Computerized Eye Testing</span>
          </span>
          <a
            href="#stores"
            className="underline decoration-sky-400 underline-offset-4 text-sky-200 hover:text-white transition whitespace-nowrap"
          >
            2 Kota Showrooms →
          </a>
        </div>
      </div>

      {/* Main Responsive Header (360px Mobile -> 768px Tablet -> 1024px+ Laptop) */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-15 sm:h-[68px] flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Wordmark */}
          <a href="#" className="flex items-center gap-2 sm:gap-2.5 group shrink-0 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#182232] text-white flex items-center justify-center font-editorial italic text-lg leading-none shrink-0">
              G
            </div>
            <div className="min-w-0">
              <div className="text-[13px] sm:text-[15px] xl:text-base font-bold tracking-[0.09em] sm:tracking-[0.14em] text-[#182232] leading-none whitespace-nowrap">
                GOSWAMI OPTICS
              </div>
              <div className="text-[9px] sm:text-[10px] font-semibold tracking-[0.16em] sm:tracking-[0.2em] text-[#0064B5] uppercase mt-0.5 whitespace-nowrap">
                Kota · Optical Studio
              </div>
            </div>
          </a>

          {/* Center Laptop & Desktop Navigation (Clean single-line fit from 1024px upward) */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-4 xl:gap-7 text-[13px] xl:text-[13.5px] font-medium text-[#182232] whitespace-nowrap"
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
              Kota Stores
            </a>
            <a href="#reviews" className="hover:text-[#0064B5] transition">
              Reviews (4.8★)
            </a>
          </nav>

          {/* Right Quick Actions (Zero Auth, Comfortable Touch Targets) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenShortlist}
              aria-label="Open saved frames and favorites"
              className="relative inline-flex items-center justify-center gap-1.5 h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-full border border-slate-200 hover:border-slate-300 text-xs font-semibold text-[#182232] transition cursor-pointer"
            >
              <Heart className="w-4 h-4 text-[#0064B5]" />
              <span className="hidden md:inline">Shortlist</span>
              {shortlistCount > 0 && (
                <span className="w-4.5 h-4.5 rounded-full bg-[#0064B5] text-white text-[10px] font-bold flex items-center justify-center">
                  {shortlistCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenTryOn}
              className="inline-flex items-center justify-center gap-1.5 h-9 sm:h-10 px-3 sm:px-4 rounded-full bg-[#0064B5] hover:bg-[#004E8F] text-white text-xs sm:text-[13px] font-semibold transition cursor-pointer shadow-2xs whitespace-nowrap"
            >
              <Camera className="w-3.5 h-3.5 shrink-0" />
              <span className="sm:hidden">Try-On</span>
              <span className="hidden sm:inline">Virtual Try-On</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((m) => !m)}
              aria-label="Toggle Menu"
              aria-expanded={mobileOpen}
              className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-slate-100 text-[#182232] cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Slide-Down Menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-4 sm:px-6 py-4 space-y-1.5 shadow-xl">
            <a
              href="#collection"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 text-sm font-semibold text-[#182232]"
            >
              <span>Eyeglasses, Sunglasses &amp; Contact Lenses</span>
              <span className="text-xs text-[#0064B5]">Shop →</span>
            </a>
            <a
              href="#studio-3d"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 text-sm font-semibold text-[#0064B5]"
            >
              <span className="inline-flex items-center gap-2">
                <Cuboid className="w-4 h-4" /> Interactive 360° 3D Studio
              </span>
              <span className="text-xs">Explore →</span>
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false)
                onOpenQuiz()
              }}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 text-sm font-semibold text-[#182232] w-full text-left cursor-pointer"
            >
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0064B5]" /> 30-Second Frame Style Quiz
              </span>
              <span className="text-xs text-[#526071]">Start →</span>
            </button>
            <a
              href="#stores"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 text-sm font-semibold text-[#182232]"
            >
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0064B5]" /> Two Kota Showrooms &amp; Directions
              </span>
              <span className="text-xs text-[#526071]">Maps →</span>
            </a>
            <a
              href="#reviews"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 text-sm font-semibold text-[#182232]"
            >
              <span className="inline-flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> Verified Reviews (4.8★)
              </span>
              <span className="text-xs text-[#526071]">416+ →</span>
            </a>

            <div className="pt-2.5 mt-1 border-t border-slate-100 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false)
                  onOpenTryOn()
                }}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-[#0064B5] text-white text-xs font-semibold cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" /> Live 3D Try-On
              </button>
              <a
                href="tel:+919782792323"
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full border border-slate-300 text-xs font-semibold text-[#182232]"
              >
                <Phone className="w-3.5 h-3.5 text-[#0064B5]" /> Call Store
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
