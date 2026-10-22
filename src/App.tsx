import { Suspense, lazy, useEffect, useState } from 'react'
import {
  ArrowRight,
  Award,
  Camera,
  CheckCircle2,
  Cuboid,
  ExternalLink,
  Eye,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react'
import {
  ColorFinishId,
  EYEWEAR_CATALOG,
  EyewearProduct,
  KOTA_BRANCHES,
  PARTNER_BRANDS,
} from './data/goswamiData'
import { Navbar } from './components/Navbar'
import { CatalogSection } from './components/CatalogSection'
const ThreeStudioSection = lazy(() =>
  import('./components/ThreeStudioSection').then((m) => ({
    default: m.ThreeStudioSection,
  }))
)
import { KotaBranchesSection } from './components/KotaBranchesSection'
import { ReviewsSection } from './components/ReviewsSection'
import { LensCustomizerModal, SavedBagItem } from './components/LensCustomizerModal'
import { ShortlistDrawer } from './components/ShortlistDrawer'
import { StyleQuizModal } from './components/StyleQuizModal'

const VirtualTryOnModal = lazy(() =>
  import('./components/VirtualTryOnModal').then((m) => ({
    default: m.VirtualTryOnModal,
  }))
)

const BAG_STORAGE_KEY = 'goswami_optics_shortlist_v1'

export function App() {
  const [studioProduct, setStudioProduct] = useState<EyewearProduct>(EYEWEAR_CATALOG[1])
  const [studioColor, setStudioColor] = useState<ColorFinishId>(
    EYEWEAR_CATALOG[1].colors[0]
  )

  const [tryOnOpen, setTryOnOpen] = useState(false)
  const [tryOnTarget, setTryOnTarget] = useState<{
    product: EyewearProduct
    color: ColorFinishId
  }>({
    product: EYEWEAR_CATALOG[0],
    color: EYEWEAR_CATALOG[0].colors[0],
  })

  const [customizerTarget, setCustomizerTarget] = useState<{
    product: EyewearProduct
    color: ColorFinishId
  } | null>(null)

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
      // ignore storage errors
    }
  }, [shortlist])

  // Smooth GPU scroll reveal observer
  useEffect(() => {
    const els = document.querySelectorAll('.reveal-up')
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08 }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const openTryOnWith = (product: EyewearProduct, color: ColorFinishId) => {
    setTryOnTarget({ product, color })
    setTryOnOpen(true)
  }

  const inspectIn3DStudio = (product: EyewearProduct, color: ColorFinishId) => {
    setStudioProduct(product)
    setStudioColor(color)
    const el = document.getElementById('studio-3d')
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSaveToBag = (newItem: SavedBagItem) => {
    setShortlist((prev) => {
      const exists = prev.find((i) => i.id === newItem.id)
      if (exists) return prev
      return [newItem, ...prev]
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#182232]">
      <Navbar
        shortlistCount={shortlist.length}
        onOpenShortlist={() => setShortlistOpen(true)}
        onOpenQuiz={() => setQuizOpen(true)}
        onOpenTryOn={() => openTryOnWith(EYEWEAR_CATALOG[0], 'sea-glass-grey')}
      />

      <main className="flex-1">
        {/* WARBY PARKER EDITORIAL HERO */}
        <section className="relative bg-[#F7F5F0] overflow-hidden border-b border-stone-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Editorial Copy */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-200/90 text-xs font-semibold text-[#182232] shadow-2xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Kota’s 4.8★ Rated Optical Studio · 2 Showrooms</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-normal text-[#182232] leading-[1.06]">
                  Frames crafted for clarity, <span className="italic">styled for Kota</span>
                </h1>

                <p className="text-base sm:text-lg text-[#526071] leading-relaxed">
                  Explore genuine Ray-Ban, Titan, Vogue, Fastrack &amp; 3-Clip magnetic
                  eyewear. Try frames on your face in 3D AR, or step into our Teachers
                  Colony &amp; Indra Vihar showrooms for a free eye exam.
                </p>

                {/* Signature Warby Pill Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href="#collection"
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-[#0064B5] hover:bg-[#004E8F] text-white text-sm font-semibold transition shadow-xs"
                  >
                    Shop Eyeglasses &amp; Sun
                  </a>

                  <button
                    type="button"
                    onClick={() => openTryOnWith(EYEWEAR_CATALOG[0], 'sea-glass-grey')}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-[#182232] border border-[#182232] text-sm font-semibold transition cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-[#0064B5]" />
                    Virtual Try-On
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuizOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-[#0064B5] hover:underline cursor-pointer"
                  >
                    Start with a style quiz <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Trust Highlights */}
                <div className="pt-4 border-t border-stone-200/90 grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="font-bold text-sm text-[#182232]">100% Genuine</div>
                    <div className="text-[#526071]">Ray-Ban, Titan, Vogue &amp; Crizal</div>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#182232]">Free Eye Test</div>
                    <div className="text-[#526071]">Daily 10 AM – 9 PM in Kota</div>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#182232]">No Sign-Up</div>
                    <div className="text-[#526071]">Instant 3D check &amp; store pickup</div>
                  </div>
                </div>
              </div>

              {/* Right Full-Bleed Sunlit Campaign Image + Floating Interactive Hotspot */}
              <div className="lg:col-span-7 relative">
                <div className="relative rounded-3xl overflow-hidden shadow-lg border border-stone-200 aspect-16/10 bg-stone-200">
                  <img
                    src="/images/hero-editorial.jpg"
                    alt="Stylish pair wearing Goswami Optics tortoiseshell cat-eye sunglasses and jet-black eyeglasses"
                    fetchPriority="high"
                    className="w-full h-full object-cover object-center"
                  />

                  {/* Interactive Frame Callout Tags on Hero Photo */}
                  <div className="hidden sm:flex items-center gap-2.5 absolute bottom-4 left-4 right-4 justify-between pointer-events-none">
                    <button
                      type="button"
                      onClick={() =>
                        openTryOnWith(EYEWEAR_CATALOG[3], 'ristretto-tortoise')
                      }
                      className="pointer-events-auto bg-white/94 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-[#182232] hover:bg-white shadow-sm flex items-center gap-2 transition cursor-pointer"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#7A441F]" />
                      <span>Left: Vogue Upswept Tortoise · Try On →</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => inspectIn3DStudio(EYEWEAR_CATALOG[0], 'jet-black')}
                      className="pointer-events-auto bg-white/94 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-[#182232] hover:bg-white shadow-sm flex items-center gap-2 transition cursor-pointer"
                    >
                      <Cuboid className="w-3.5 h-3.5 text-[#0064B5]" />
                      <span>Right: Ray-Ban RB 7211 · Inspect 3D →</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Authorised Brands Strip */}
          <div className="bg-white border-t border-stone-200/80 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[11px] sm:text-xs font-bold tracking-[0.18em] text-slate-400">
              {PARTNER_BRANDS.map((brand) => (
                <span
                  key={brand}
                  className="hover:text-[#182232] transition-colors select-none"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* WARBY PARKER DUAL EDITORIAL FEATURE CARDS */}
        <section className="py-16 md:py-20 bg-white reveal-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Editorial Story */}
              <div className="group rounded-3xl overflow-hidden border border-slate-200/80 bg-[#F7F5F0] flex flex-col justify-between">
                <div className="aspect-4/3 overflow-hidden bg-stone-200">
                  <img
                    src="/images/editorial-craft.jpg"
                    alt="Handcrafted tortoiseshell, crystal and brushed gold optical frames"
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-editorial text-[#182232]">
                      Handcrafted details &amp; <span className="italic">3-clip versatility</span>
                    </h3>
                    <p className="text-sm text-[#526071] mt-1.5 max-w-md">
                      Switch from indoor study clarity to polarized outdoor sun shield in a
                      single magnetic snap with Greyjack &amp; X-Ford editions.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => inspectIn3DStudio(EYEWEAR_CATALOG[1], 'jet-black')}
                    className="shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white border border-[#182232] text-xs font-semibold text-[#182232] hover:bg-[#182232] hover:text-white transition cursor-pointer"
                  >
                    Test 3-Clip in 3D →
                  </button>
                </div>
              </div>

              {/* Right Editorial Story */}
              <div className="group rounded-3xl overflow-hidden border border-slate-200/80 bg-[#F7F5F0] flex flex-col justify-between">
                <div className="aspect-4/3 overflow-hidden bg-stone-200">
                  <img
                    src="/images/editorial-bluecut.jpg"
                    alt="Young doctor scholar wearing lightweight anti-glare study glasses"
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-editorial text-[#182232]">
                      Turn any frame into <span className="italic">Blue-Cut or Progressives</span>
                    </h3>
                    <p className="text-sm text-[#526071] mt-1.5 max-w-md">
                      Trusted by GMC Kota doctors, faculty &amp; NEET/JEE aspirants for
                      headache-free Crizal anti-glare &amp; progressive lenses.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      openTryOnWith(EYEWEAR_CATALOG[2], 'ristretto-tortoise')
                    }
                    className="shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white border border-[#182232] text-xs font-semibold text-[#182232] hover:bg-[#182232] hover:text-white transition cursor-pointer"
                  >
                    Try Scholar Frame →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FULL FILTERABLE EYEWEAR & SUNGLASS CATALOG + SHOP BY COLOR */}
        <CatalogSection
          onOpenTryOn={openTryOnWith}
          onInspectIn3D={inspectIn3DStudio}
          onOpenCustomizer={(product, color) => setCustomizerTarget({ product, color })}
        />

        {/* INTERACTIVE 360° 3D EYEWEAR & SUNGLASS STUDIO */}
        <Suspense
          fallback={
            <div className="py-24 bg-[#F7F5F0] text-center text-sm text-[#526071]">
              Loading 360° 3D Optical Studio…
            </div>
          }
        >
          <ThreeStudioSection
            selectedProduct={studioProduct}
            selectedColor={studioColor}
            onSelectProduct={(prod, col) => {
              setStudioProduct(prod)
              setStudioColor(col || prod.colors[0])
            }}
            onSelectColor={(col) => setStudioColor(col)}
            onOpenTryOn={openTryOnWith}
            onOpenCustomizer={(product, color) =>
              setCustomizerTarget({ product, color })
            }
          />
        </Suspense>

        {/* WARBY "IN THE WILD" — SPOTTED IN KOTA LOOKBOOK */}
        <section className="py-16 md:py-24 bg-white border-b border-slate-200/80 reveal-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#0064B5] block mb-2">
                  @goswamioptics2018 · Everyday Kota Style
                </span>
                <h2 className="text-3xl sm:text-4xl text-[#182232] font-normal">
                  Goswami frames <span className="italic">in the wild</span>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => openTryOnWith(EYEWEAR_CATALOG[8], 'crystal-clear')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0064B5] hover:underline cursor-pointer"
              >
                Open Live Camera AR Mirror <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  img: '/images/wild-1.jpg',
                  title: 'Lucent Crystal Round',
                  sub: 'Wolf Eye · ₹1,390',
                  prod: EYEWEAR_CATALOG[8],
                  col: 'crystal-clear' as ColorFinishId,
                },
                {
                  img: '/images/wild-2.jpg',
                  title: 'Chambal Classic Aviator',
                  sub: 'Ray-Ban G-15 · ₹5,490',
                  prod: EYEWEAR_CATALOG[4],
                  col: 'polished-gold' as ColorFinishId,
                },
                {
                  img: '/images/model-female-2.jpg',
                  title: 'Vo-5412 Upswept Edit',
                  sub: 'Vogue Eyewear · ₹3,690',
                  prod: EYEWEAR_CATALOG[3],
                  col: 'ristretto-tortoise' as ColorFinishId,
                },
                {
                  img: '/images/model-male-1.jpg',
                  title: 'Trio 3-Clip Magnetic',
                  sub: 'Greyjack · ₹2,490',
                  prod: EYEWEAR_CATALOG[1],
                  col: 'jet-black' as ColorFinishId,
                },
              ].map((card) => (
                <div
                  key={card.title}
                  onClick={() => openTryOnWith(card.prod, card.col)}
                  className="group relative rounded-2xl overflow-hidden aspect-3/4 bg-stone-100 border border-slate-200 cursor-pointer"
                >
                  <img
                    src={card.img}
                    alt={card.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent p-4 text-white flex items-end justify-between">
                    <div>
                      <div className="font-editorial text-lg leading-tight">
                        {card.title}
                      </div>
                      <div className="text-xs text-slate-200 mt-0.5">{card.sub}</div>
                    </div>
                    <span className="px-3 py-1.5 rounded-full bg-white text-[#182232] text-[11px] font-semibold shrink-0">
                      Try On
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EYE CARE PROMISE STRIP */}
        <section className="py-12 bg-[#182232] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Eye,
                title: 'Precision Eye Testing',
                desc: 'Computerized auto-refractometer & subjective optometrist testing daily.',
              },
              {
                icon: ShieldCheck,
                title: '100% Genuine Brands',
                desc: 'Authorised dealer for Ray-Ban, Titan, Vogue, Crizal & Bausch + Lomb.',
              },
              {
                icon: Sparkles,
                title: 'Express Kota Delivery',
                desc: 'Same-day prescription fitting available for urgent student & travel needs.',
              },
              {
                icon: Award,
                title: 'Free Lifetime Adjustments',
                desc: 'Walk into either Kota showroom anytime for free nose-pad & screw tuning.',
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-sky-300">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white">{item.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TWO KOTA SHOWROOMS + LIVE GOOGLE MAPS REDIRECT SECTION */}
        <KotaBranchesSection />

        {/* GOOGLE & VISITOR REVIEWS + WRITE A REVIEW SECTION */}
        <ReviewsSection />
      </main>

      {/* CLEAN EDITORIAL FOOTER */}
      <footer className="bg-white border-t border-slate-200 text-[#182232]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-slate-200">
            <div className="lg:col-span-4 space-y-3">
              <div className="text-base font-bold tracking-[0.14em] text-[#182232]">
                GOSWAMI OPTICS · KOTA
              </div>
              <p className="text-xs text-[#526071] leading-relaxed max-w-sm">
                Kota’s trusted destination for prescription eyeglasses, polarized sunglasses,
                Greyjack 3-Clip magnetic frames, Bausch + Lomb contact lenses, and
                professional eye care across two convenient locations.
              </p>
              <a
                href="tel:+919782792323"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#0064B5] pt-1"
              >
                <Phone className="w-4 h-4" /> +91 97827 92323 (Open 10 AM – 9 PM)
              </a>
            </div>

            {KOTA_BRANCHES.map((branch, idx) => (
              <div key={branch.id} className="lg:col-span-3 space-y-2.5 text-xs">
                <div className="font-bold uppercase tracking-wider text-[#0064B5]">
                  Kota Branch 0{idx + 1} · {branch.rating}★ ({branch.reviewCount})
                </div>
                <div className="font-semibold text-sm text-[#182232]">
                  {branch.officialName}
                </div>
                <p className="text-[#526071] leading-relaxed flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#0064B5]" />
                  <span>{branch.address}</span>
                </p>
                <div className="flex flex-wrap gap-3 pt-1 font-semibold text-[#0064B5]">
                  <a
                    href={branch.googleDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:underline"
                  >
                    Google Maps Directions <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={branch.shareGoogleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:underline"
                  >
                    Google Page <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}

            <div className="lg:col-span-2 space-y-2.5 text-xs">
              <div className="font-bold uppercase tracking-wider text-[#182232]">
                Quick Experience
              </div>
              <ul className="space-y-2 text-[#526071] font-medium">
                <li>
                  <button
                    type="button"
                    onClick={() => openTryOnWith(EYEWEAR_CATALOG[0], 'jet-black')}
                    className="hover:text-[#0064B5] cursor-pointer"
                  >
                    3D Virtual Try-On
                  </button>
                </li>
                <li>
                  <a href="#studio-3d" className="hover:text-[#0064B5]">
                    360° 3D Frame Check
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setQuizOpen(true)}
                    className="hover:text-[#0064B5] cursor-pointer"
                  >
                    Frame Style Quiz
                  </button>
                </li>
                <li>
                  <a href="#reviews" className="hover:text-[#0064B5]">
                    Write a Review
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* PREMIUM KOTALABS SIGNATURE STUDIO BANNER */}
          <div className="pt-8">
            <a
              href="https://kotalabs.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Designed and engineered by KotaLabs — Visit kotalabs.vercel.app"
              className="group relative block rounded-2xl overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#162238] to-[#0D1524] border border-slate-800/90 p-5 sm:p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:border-sky-500/50"
            >
              {/* Subtle top hairline highlight */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />

              {/* Ambient corner glow */}
              <div className="pointer-events-none absolute -right-16 -top-16 w-64 h-64 rounded-full bg-sky-500/12 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-70" />

              {/* GPU-only periodic light sweep */}
              <div className="pointer-events-none kotalabs-card-sheen absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-start sm:items-center gap-4">
                  {/* Bespoke KotaLabs Monogram Emblem */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400/20 via-blue-600/20 to-indigo-500/20 border border-white/15 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 group-hover:border-sky-400/50 transition-all duration-300">
                    <span className="font-sans text-sm font-extrabold tracking-tight text-white">
                      K<span className="text-sky-400">L</span>
                    </span>
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300/95">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Designed &amp; Engineered by
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                      <span className="font-editorial text-2xl sm:text-[26px] text-white tracking-tight">
                        Kota<span className="italic text-sky-300">Labs</span>
                      </span>
                      <span className="text-xs text-slate-300/90 font-medium">
                        — Next-Gen 3D Web, AR Experiences &amp; Digital Flagships
                      </span>
                    </div>
                  </div>
                </div>

                {/* High-Contrast CTA Pill */}
                <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                  <span className="text-xs text-slate-300 md:hidden">
                    Want a website like this for your brand?
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-white text-[#0F172A] text-xs font-bold tracking-wide shadow-sm group-hover:bg-sky-400 group-hover:text-slate-950 transition-colors shrink-0">
                    <span>Explore KotaLabs</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </a>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#526071]">
            <p>© {new Date().getFullYear()} Goswami Optics Kota, Rajasthan. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
              <p className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Pure fast client experience · No sign-in required
              </p>
              <span className="hidden sm:inline text-slate-300">·</span>
              <a
                href="https://kotalabs.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#182232] hover:text-[#0064B5] transition-colors"
              >
                Crafted by <span className="underline decoration-sky-500/60 underline-offset-3">KotaLabs</span>
                <ExternalLink className="w-3 h-3 text-[#0064B5]" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* MODALS & DRAWERS */}
      <Suspense fallback={null}>
        <VirtualTryOnModal
          isOpen={tryOnOpen}
          initialProduct={tryOnTarget.product}
          initialColor={tryOnTarget.color}
          onClose={() => setTryOnOpen(false)}
          onSelectForPurchase={(prod, col) =>
            setCustomizerTarget({ product: prod, color: col })
          }
        />
      </Suspense>

      <LensCustomizerModal
        product={customizerTarget?.product || null}
        colorId={customizerTarget?.color || 'jet-black'}
        onClose={() => setCustomizerTarget(null)}
        onSaveToBag={handleSaveToBag}
      />

      <ShortlistDrawer
        isOpen={shortlistOpen}
        items={shortlist}
        onClose={() => setShortlistOpen(false)}
        onRemove={(id) =>
          setShortlist((prev) => prev.filter((item) => item.id !== id))
        }
        onTryOn={openTryOnWith}
      />

      <StyleQuizModal
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
        onTryOn={openTryOnWith}
        onInspect3D={inspectIn3DStudio}
      />
    </div>
  )
}

export default App
