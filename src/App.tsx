import { useEffect, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Eye,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import {
  ColorFinishId,
  EYEWEAR_CATALOG,
  EyewearProduct,
  KOTA_BRANCHES,
} from './data/goswamiData'
import { Navbar } from './components/Navbar'
import { BrandsMarquee } from './components/BrandsMarquee'
import { CatalogSection } from './components/CatalogSection'
import { KotaBranchesSection } from './components/KotaBranchesSection'
import { LensCustomizerModal, SavedBagItem } from './components/LensCustomizerModal'
import { LookbookSection } from './components/LookbookSection'
import { ProductMediaModal } from './components/ProductMediaModal'
import { ReviewsSection } from './components/ReviewsSection'
import { ShortlistDrawer } from './components/ShortlistDrawer'
import { StyleQuizModal } from './components/StyleQuizModal'

const BAG_STORAGE_KEY = 'goswami_optics_shortlist_v1'
const CURRENT_YEAR = new Date().getFullYear()

type ProductTarget = {
  product: EyewearProduct
  color: ColorFinishId
}

export function App() {
  const [mediaTarget, setMediaTarget] = useState<ProductTarget | null>(null)
  const [customizerTarget, setCustomizerTarget] = useState<ProductTarget | null>(null)
  const [quizOpen, setQuizOpen] = useState(false)
  const [shortlistOpen, setShortlistOpen] = useState(false)

  const [shortlist, setShortlist] = useState<SavedBagItem[]>(() => {
    try {
      const raw = localStorage.getItem(BAG_STORAGE_KEY)
      return raw ? (JSON.parse(raw) as SavedBagItem[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(shortlist))
    } catch {
      // Keep the storefront usable when browser storage is unavailable.
    }
  }, [shortlist])

  useEffect(() => {
    const revealItems = document.querySelectorAll('.reveal-up')
    if (!('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08 }
    )
    revealItems.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  const openProductMedia = (product: EyewearProduct, color: ColorFinishId) => {
    setMediaTarget({ product, color })
  }

  const openLensCustomizer = (product: EyewearProduct, color: ColorFinishId) => {
    setCustomizerTarget({ product, color })
  }

  const handleSaveToBag = (newItem: SavedBagItem) => {
    setShortlist((previous) => {
      if (previous.some((item) => item.id === newItem.id)) return previous
      return [newItem, ...previous]
    })
  }

  const handleToggleFavorite = (product: EyewearProduct, colorId: ColorFinishId) => {
    const favoriteId = `favorite-${product.id}`
    setShortlist((previous) => {
      if (previous.some((item) => item.id === favoriteId)) {
        return previous.filter((item) => item.id !== favoriteId)
      }

      const favorite: SavedBagItem = {
        id: favoriteId,
        product,
        colorId,
        usageLabel: 'Saved favorite',
        lensPackageLabel: 'Saved for later',
        branchId: 'teachers-colony',
        totalPrice: product.price,
        isFavorite: true,
      }
      return [favorite, ...previous]
    })
  }

  const favoriteProductIds = shortlist
    .filter((item) => item.isFavorite)
    .map((item) => item.product.id)

  const openCustomizerFromMedia = (product: EyewearProduct, color: ColorFinishId) => {
    setMediaTarget(null)
    setCustomizerTarget({ product, color })
  }

  const modalOpen = Boolean(mediaTarget || customizerTarget || shortlistOpen || quizOpen)

  return (
    <div className="min-h-screen bg-[#fbf8f2] text-[#30271f]">
      <Navbar
        shortlistCount={shortlist.length}
        onOpenShortlist={() => setShortlistOpen(true)}
        onOpenQuiz={() => setQuizOpen(true)}
      />

      <main>
        <section id="top" className="overflow-hidden bg-[#f4eee5]">
          <div className="mx-auto max-w-7xl px-4 pb-11 pt-8 sm:px-6 sm:pb-14 sm:pt-12 lg:px-8 lg:pb-16 lg:pt-16">
            <div className="grid items-center gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:gap-12">
              <div className="relative z-10">
                <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8d684c] sm:text-[11px]">
                  <span className="h-px w-7 bg-[#b28f6c]" />
                  Goswami Optics · Kota, Rajasthan
                </p>
                <h1 className="mt-5 max-w-xl font-editorial text-[46px] leading-[0.91] text-[#30271f] sm:text-6xl lg:text-[70px] xl:text-[78px]">
                  A clearer point <span className="italic text-[#89664d]">of view.</span>
                </h1>
                <p className="mt-5 max-w-lg text-sm leading-[1.85] text-[#6e6257] sm:text-base">
                  Considered eyewear, thoughtful lens care and a little more attention to fit.
                  Discover genuine optical and sun frames, then meet us at either of our Kota
                  showrooms for a personal fitting.
                </p>

                <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row">
                  <a
                    href="#collection"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#30271f] px-6 text-xs font-semibold text-white transition hover:bg-[#594332]"
                  >
                    Explore eyewear <ArrowRight className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setQuizOpen(true)}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#cbb9a4] bg-[#fbf8f2]/70 px-6 text-xs font-semibold text-[#4c3e32] transition hover:border-[#967052] hover:bg-white"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#9a7155]" />
                    Find your frame
                  </button>
                </div>

                <div className="mt-9 grid max-w-lg grid-cols-3 border-t border-[#dfd3c4] pt-4">
                  <div className="pr-3">
                    <span className="block font-editorial text-2xl leading-none text-[#30271f] sm:text-3xl">4.8<span className="text-[#b38d55]">★</span></span>
                    <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.12em] text-[#847568] sm:text-[10px]">Rated in Kota</span>
                  </div>
                  <div className="border-l border-[#dfd3c4] px-3 sm:px-4">
                    <span className="block font-editorial text-2xl leading-none text-[#30271f] sm:text-3xl">02</span>
                    <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.12em] text-[#847568] sm:text-[10px]">Local showrooms</span>
                  </div>
                  <div className="border-l border-[#dfd3c4] pl-3 sm:pl-4">
                    <span className="block font-editorial text-2xl leading-none text-[#30271f] sm:text-3xl">416+</span>
                    <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.12em] text-[#847568] sm:text-[10px]">Google reviews</span>
                  </div>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-3xl lg:max-w-none">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#d5c0a7] sm:aspect-[1.16/1] lg:aspect-[1.16/1]">
                  <img
                    src="/images/hero-editorial.jpg"
                    alt="Two models wearing tortoiseshell sunglasses and dark optical frames in golden-hour light"
                    fetchPriority="high"
                    className="image-grade-warm h-full w-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#211a14]/45 via-transparent to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full border border-white/55 bg-[#fbf8f2]/85 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#4b3c30] backdrop-blur sm:left-5 sm:top-5 sm:text-[10px]">
                    The everyday edit · 2026
                  </div>
                  <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-end justify-between gap-3 sm:inset-x-5 sm:bottom-5">
                    <div className="text-white drop-shadow-sm">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/80">Frames with a point of view</p>
                      <p className="mt-1 font-editorial text-2xl leading-none sm:text-3xl">Made for your everyday.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openProductMedia(EYEWEAR_CATALOG[3], 'ristretto-tortoise')}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/55 bg-[#211a14]/25 px-3 text-[9px] font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-[#30271f] sm:text-[10px]"
                      >
                        Vogue · photos <ArrowUpRight className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openProductMedia(EYEWEAR_CATALOG[0], 'jet-black')}
                        className="hidden min-h-9 items-center gap-1.5 rounded-full border border-white/55 bg-[#211a14]/25 px-3 text-[9px] font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-[#30271f] min-[460px]:inline-flex sm:text-[10px]"
                      >
                        Ray-Ban · photos <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-[9px] font-medium uppercase tracking-[0.16em] text-[#8a7b6c]">
                  <span>Editorial eyewear photography</span>
                  <span>01 / Kota collection</span>
                </div>
              </div>
            </div>
          </div>

          <BrandsMarquee
            onSelectBrandProduct={openProductMedia}
            onOpenContactsCustomizer={openLensCustomizer}
          />
        </section>

        <section id="experience" className="scroll-mt-28 bg-[#fbf8f2] py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end lg:gap-14">
              <div className="max-w-lg">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#90664a] sm:text-[11px]">A little more than a good pair</p>
                <h2 className="mt-3 font-editorial text-4xl leading-[0.98] text-[#30271f] sm:text-5xl">
                  Care you can feel. <span className="italic text-[#89664d]">Clarity you can trust.</span>
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-[#75695e]">
                  From a magnetic clip that moves between sun and shade to lenses made for long
                  study days, our team helps you make the details work for your life.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <article className="flex min-h-[280px] flex-col justify-between border border-[#e5dbcf] bg-[#f6efe5] p-5 sm:p-6">
                  <div>
                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9a7255]">One frame, more possibilities</span>
                    <h3 className="mt-2 font-editorial text-2xl leading-tight text-[#30271f] sm:text-3xl">A magnetic switch for Kota’s sun.</h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#75695e]">
                      Explore Greyjack and X-Ford clip-on frames with polarized sun, night-vision
                      and mirror attachments.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openProductMedia(EYEWEAR_CATALOG[1], 'jet-black')}
                    className="mt-5 inline-flex w-fit items-center gap-2 text-[11px] font-semibold text-[#76563e] transition hover:text-[#30271f]"
                  >
                    Explore 3-Clip photos <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </article>

                <article className="flex min-h-[280px] flex-col justify-between border border-[#e5dbcf] bg-white p-5 sm:p-6">
                  <div>
                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9a7255]">A clearer daily ritual</span>
                    <h3 className="mt-2 font-editorial text-2xl leading-tight text-[#30271f] sm:text-3xl">The right lens changes everything.</h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#75695e]">
                      Ask about Crizal anti-glare, blue-cut study lenses, progressives and
                      photochromic transitions, fitted by our Kota team.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openLensCustomizer(EYEWEAR_CATALOG[2], 'ristretto-tortoise')}
                    className="mt-5 inline-flex w-fit items-center gap-2 text-[11px] font-semibold text-[#76563e] transition hover:text-[#30271f]"
                  >
                    Choose study lenses <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </article>
              </div>
            </div>
          </div>
        </section>

        <CatalogSection
          onViewPhotos={openProductMedia}
          onOpenCustomizer={openLensCustomizer}
          favoriteProductIds={favoriteProductIds}
          onToggleFavorite={handleToggleFavorite}
        />

        <LookbookSection onViewPhotos={openProductMedia} />

        <section className="bg-[#e9efe7] py-12 sm:py-14">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-7 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {[
              {
                icon: Eye,
                title: 'Precision eye testing',
                detail: 'Computerized refraction and optometrist-led eye checks, daily.',
              },
              {
                icon: ShieldCheck,
                title: 'Genuine brands',
                detail: 'Authorised eyewear, Crizal lenses and trusted contact lens care.',
              },
              {
                icon: Sparkles,
                title: 'Express fitting',
                detail: 'Same-day prescription fitting available for urgent student and travel needs.',
              },
              {
                icon: Award,
                title: 'Lifetime adjustments',
                detail: 'Complimentary nose-pad, screw and frame tuning at either showroom.',
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/75 text-[#637055]">
                  <item.icon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h3 className="text-xs font-semibold text-[#3b4635]">{item.title}</h3>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-[#68715f]">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <KotaBranchesSection />
        <ReviewsSection />
      </main>

      <footer className="bg-[#f4eee5] pb-24 text-[#30271f] md:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid gap-9 border-b border-[#dfd3c4] pb-9 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_0.8fr]">
            <div>
              <a href="#top" className="inline-flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c8b69e] bg-[#eee5d8] font-editorial text-[26px] italic leading-none text-[#5a4533]">G</span>
                <span>
                  <span className="block text-[12px] font-semibold uppercase tracking-[0.17em]">Goswami Optics</span>
                  <span className="mt-0.5 block text-[9px] font-medium uppercase tracking-[0.2em] text-[#8b6c50]">Kota · Rajasthan</span>
                </span>
              </a>
              <p className="mt-4 max-w-sm text-xs leading-relaxed text-[#75695e]">
                Your local destination for genuine eyeglasses, polarized sunglasses, Greyjack
                magnetic frames, Bausch + Lomb contact lenses and professional eye care.
              </p>
              <a href="tel:+919782792323" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#74553d] transition hover:text-[#30271f]">
                <Phone className="h-3.5 w-3.5" /> +91 97827 92323 · Open daily 10 AM–9 PM
              </a>
              <a
                href="https://wa.me/919782792323?text=Namaste%20Goswami%20Optics%20Kota!%20I%20am%20visiting%20from%20your%20website."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-[#536449] transition hover:text-[#35442e]"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp the store
              </a>
            </div>

            {KOTA_BRANCHES.map((branch, index) => (
              <div key={branch.id} className="space-y-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9a7255]">
                  Kota showroom 0{index + 1}
                </p>
                <h3 className="font-editorial text-xl text-[#30271f]">{branch.officialName}</h3>
                <p className="text-[11px] font-medium text-[#796a5c]">{branch.shortTitle}</p>
                <p className="flex items-start gap-2 text-[11px] leading-relaxed text-[#75695e]">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#916b4f]" />
                  {branch.address}
                </p>
                <a
                  href={branch.googleDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#76563e] underline underline-offset-4 transition hover:text-[#30271f]"
                >
                  Directions <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}

            <div className="space-y-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9a7255]">Explore</p>
              <a href="#collection" className="block text-xs text-[#66594d] transition hover:text-[#30271f]">Eyewear collection</a>
              <button type="button" onClick={() => setQuizOpen(true)} className="block text-left text-xs text-[#66594d] transition hover:text-[#30271f]">Frame finder quiz</button>
              <a href="#lookbook" className="block text-xs text-[#66594d] transition hover:text-[#30271f]">Photo & film lookbook</a>
              <a href="#reviews" className="block text-xs text-[#66594d] transition hover:text-[#30271f]">Customer reviews</a>
              <a href="#stores" className="inline-flex items-center gap-1 text-xs text-[#66594d] transition hover:text-[#30271f]">Find a showroom <ArrowUpRight className="h-3 w-3" /></a>
            </div>
          </div>

          <div className="py-7">
            <a
              href="https://kotalabs.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Designed and engineered by KotaLabs — visit kotalabs.vercel.app"
              className="group relative block overflow-hidden rounded-[22px] border border-[#544635] bg-[#30271f] p-5 transition hover:border-[#9b7955] sm:p-6"
            >
              <span className="pointer-events-none absolute -right-12 -top-20 h-52 w-52 rounded-full bg-[#c09a67]/10 blur-3xl transition group-hover:bg-[#c09a67]/20" />
              <span className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#cfb587]/40 bg-[#8b6847]/20 font-editorial text-lg font-semibold text-[#e3c895]">K<span className="italic">L</span></span>
                  <span>
                    <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-[#d0ad7a]">Digital craft for thoughtful brands</span>
                    <span className="mt-1 block font-editorial text-2xl text-[#fbf8f2] sm:text-3xl">Kota<span className="italic text-[#d8bd94]">Labs</span></span>
                  </span>
                </span>
                <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#e3c895] px-5 text-xs font-semibold text-[#30271f] transition group-hover:bg-[#f0dfbd]">
                  Explore KotaLabs <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </span>
            </a>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-[#dfd3c4] pt-5 text-center sm:flex-row sm:text-left">
            <p className="text-[10px] text-[#85776a]">
              © {CURRENT_YEAR} Goswami Optics Kota, Rajasthan. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] text-[#85776a]">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#66745b]" /> No account or sign-in required</span>
              <span className="hidden text-[#c3b6a7] sm:inline">·</span>
              <a
                href="https://kotalabs.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#5b4736] transition hover:text-[#30271f]"
              >
                Designed &amp; Engineered by KotaLabs <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {!modalOpen && (
        <nav
          aria-label="Quick navigation"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e4dacf] bg-[#fbf8f2]/95 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(48,39,31,0.09)] backdrop-blur-xl md:hidden"
        >
          <div className="mx-auto grid max-w-md grid-cols-4 gap-1 text-[9px] font-semibold text-[#685b4f]">
            <a href="#collection" className="flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 transition hover:bg-[#eee7dc]">
              <ShoppingBag className="h-4 w-4 text-[#6b513d]" />
              Frames
            </a>
            <button type="button" onClick={() => setQuizOpen(true)} className="flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[#6b513d] transition hover:bg-[#eee7dc]">
              <Sparkles className="h-4 w-4" />
              Find my fit
            </button>
            <a href="#stores" className="flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 transition hover:bg-[#eee7dc]">
              <MapPin className="h-4 w-4 text-[#6b513d]" />
              Showrooms
            </a>
            <a
              href="https://wa.me/919782792323?text=Namaste%20Goswami%20Optics%20Kota!%20I%20am%20visiting%20from%20your%20website."
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[#536449] transition hover:bg-[#e9efe7]"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </nav>
      )}

      <ProductMediaModal
        key={mediaTarget ? `${mediaTarget.product.id}-${mediaTarget.color}` : 'closed'}
        product={mediaTarget?.product ?? null}
        colorId={mediaTarget?.color ?? 'jet-black'}
        onClose={() => setMediaTarget(null)}
        onSelectLenses={openCustomizerFromMedia}
      />

      <LensCustomizerModal
        product={customizerTarget?.product ?? null}
        colorId={customizerTarget?.color ?? 'jet-black'}
        onClose={() => setCustomizerTarget(null)}
        onSaveToBag={handleSaveToBag}
      />

      <ShortlistDrawer
        isOpen={shortlistOpen}
        items={shortlist}
        onClose={() => setShortlistOpen(false)}
        onRemove={(id) => setShortlist((previous) => previous.filter((item) => item.id !== id))}
        onViewPhotos={openProductMedia}
      />

      <StyleQuizModal
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
        onViewPhotos={openProductMedia}
        onOpenCustomizer={openLensCustomizer}
      />
    </div>
  )
}

export default App
