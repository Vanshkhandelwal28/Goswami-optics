import React, { useState } from 'react'
import {
  CalendarCheck,
  Check,
  Clock,
  Copy,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
  Star,
} from 'lucide-react'
import { KOTA_BRANCHES, KotaBranch } from '../data/goswamiData'

const KOTA_OPEN_STATUS = (() => {
  try {
    const nowStr = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      hour12: false,
    })
    const hour = Number(nowStr)
    return hour >= 10 && hour < 21
      ? { open: true, text: 'Open Now in Kota · Closes 9:00 PM' }
      : { open: false, text: 'Opens Daily 10:00 AM – 9:00 PM IST' }
  } catch {
    return { open: true, text: 'Open Daily · 10:00 AM – 9:00 PM' }
  }
})()

interface KotaBranchesSectionProps {
  onOpenBookingModal?: (branchId: KotaBranch['id']) => void
}

export const KotaBranchesSection: React.FC<KotaBranchesSectionProps> = () => {
  const [activeBranchId, setActiveBranchId] =
    useState<KotaBranch['id']>('teachers-colony')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [bookingOpen, setBookingOpen] = useState<boolean>(false)
  const [visitorName, setVisitorName] = useState('')
  const [visitDay, setVisitDay] = useState('Today')
  const [visitSlot, setVisitSlot] = useState('5:00 PM – 7:00 PM')
  const [serviceNeed, setServiceNeed] = useState('Free Computerized Eye Checkup + Frames')
  const [bookingConfirmed, setBookingConfirmed] = useState(false)

  const activeBranch =
    KOTA_BRANCHES.find((b) => b.id === activeBranchId) || KOTA_BRANCHES[0]

  const kotaOpenStatus = KOTA_OPEN_STATUS

  const copyAddress = (branch: KotaBranch) => {
    navigator.clipboard?.writeText(`${branch.officialName}, ${branch.address}`)
    setCopiedId(branch.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleBookVisit = (e: React.FormEvent) => {
    e.preventDefault()
    setBookingConfirmed(true)
    const msg = encodeURIComponent(
      `Namaste Goswami Optics Kota! 👋\nI would like to book an in-store visit:\n• Name: ${
        visitorName || 'Walk-in Guest'
      }\n• Showroom: ${activeBranch.officialName} (${activeBranch.shortTitle})\n• Preferred Time: ${visitDay}, ${visitSlot}\n• Service: ${serviceNeed}`
    )
    window.open(`https://wa.me/${activeBranch.phoneRaw}?text=${msg}`, '_blank', 'noopener')
  }

  return (
    <section id="stores" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Editorial Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
              <span
                className={`w-2 h-2 rounded-full ${
                  kotaOpenStatus.open ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {kotaOpenStatus.text}
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] text-[#30271f] font-normal leading-[1.12]">
              Visit our two flagship <span className="italic">Kota showrooms</span>
            </h2>
          </div>

          <p className="text-sm sm:text-base text-[#75695e] max-w-md">
            Step in for a free computerized eye checkup, precision PD measurement, ultrasonic
            lens cleaning, or same-day prescription fitting across Mahaveer Nagar &amp; Talwandi.
          </p>
        </div>

        {/* Two Side-by-Side Showroom Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {KOTA_BRANCHES.map((branch) => {
            const isSelected = branch.id === activeBranch.id
            return (
              <div
                key={branch.id}
                onClick={() => setActiveBranchId(branch.id)}
                className={`rounded-2xl p-6 sm:p-7 border transition-all cursor-pointer flex flex-col justify-between gap-6 ${
                  isSelected
                    ? 'border-[#90664a] bg-[#f7f2ea] ring-1 ring-[#90664a]/25 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#90664a] bg-[#90664a]/8 px-3 py-1 rounded-full">
                      {branch.areaTag}
                    </span>

                    <a
                      href={branch.shareGoogleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-xs font-semibold text-amber-950 hover:bg-amber-100 transition"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {branch.rating} ({branch.reviewCount} Google Reviews)
                      <ExternalLink className="w-3 h-3 text-amber-700" />
                    </a>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-editorial text-[#30271f]">
                      {branch.officialName}
                    </h3>
                    <p className="text-xs font-semibold text-[#90664a] mt-0.5">
                      {branch.shortTitle}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm text-[#75695e]">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#90664a] shrink-0 mt-1" />
                      <div>
                        <p className="text-[#30271f] font-medium">{branch.address}</p>
                        <p className="text-xs text-[#75695e] mt-0.5">{branch.landmark}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-1 text-xs font-medium text-[#30271f]">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        {branch.hours}
                      </span>
                      <a
                        href={`tel:${branch.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-[#90664a] hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {branch.phone}
                      </a>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-[#75695e] bg-white p-3.5 rounded-xl border border-stone-200/70 italic">
                    “{branch.businessQuote}”
                  </p>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {branch.specialties.map((sp) => (
                      <li
                        key={sp}
                        className="flex items-start gap-1.5 text-xs text-[#30271f]"
                      >
                        <Check className="w-3.5 h-3.5 text-[#90664a] shrink-0 mt-0.5" />
                        <span>{sp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Direct Google Maps Redirect & Action Buttons */}
                <div
                  className="pt-4 border-t border-stone-200/80 flex flex-wrap items-center gap-2.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href={branch.googleDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#90664a] hover:bg-[#6e4c36] text-white text-xs font-semibold transition"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Directions in Google Maps
                  </a>

                  <a
                    href={branch.shareGoogleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#30271f] text-[#30271f] hover:bg-stone-100 text-xs font-semibold transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Google Page
                  </a>

                  <button
                    type="button"
                    onClick={() => copyAddress(branch)}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-full border border-stone-200 text-[#75695e] hover:text-[#30271f] text-xs font-medium transition cursor-pointer ml-auto"
                  >
                    {copiedId === branch.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Address
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Live Interactive Embedded Map + Showroom Interior Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-stone-200 shadow-xs bg-[#f4eee5]">
          {/* Interactive Google Map */}
          <div className="lg:col-span-7 relative min-h-[340px] sm:min-h-[410px] bg-stone-100">
            <iframe
              key={activeBranch.id}
              title={`Google Map — ${activeBranch.officialName}`}
              src={activeBranch.embedMapUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full min-h-[340px] sm:min-h-[410px] border-0"
            />
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
              <div className="pointer-events-auto inline-flex bg-white/95 backdrop-blur-md p-1 rounded-full shadow-md border border-stone-200 overflow-x-auto no-scrollbar max-w-full">
                {KOTA_BRANCHES.map((b, i) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setActiveBranchId(b.id)}
                    className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                      activeBranch.id === b.id
                        ? 'bg-[#90664a] text-white'
                        : 'text-[#30271f] hover:bg-stone-100'
                    }`}
                  >
                    <span className="hidden sm:inline">Branch 0{i + 1}: </span>
                    {i === 0 ? 'Teachers Colony' : 'Indra Vihar'}
                  </button>
                ))}
              </div>

              <a
                href={activeBranch.googleMapsPlaceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto shrink-0 inline-flex items-center gap-1 px-3 py-1.5 sm:py-2 rounded-full bg-[#30271f] text-white text-[11px] sm:text-xs font-semibold shadow-md hover:bg-slate-800 transition"
              >
                <span className="hidden sm:inline">Open Full Map</span>
                <span className="sm:hidden">Map</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Showroom Experience & Instant Free Eye Exam Slot Booking */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 bg-[#f4eee5]">
            {!bookingOpen ? (
              <>
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-2xl border border-stone-200 aspect-16/10">
                    <img
                      src="/images/store-showroom.jpg"
                      alt="Goswami Optics Kota Showroom & Computerized Eye Testing Studio"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2 pt-1">
                    <div className="text-xs font-semibold uppercase tracking-wider text-[#90664a]">
                      Zero Sign-Up Needed · Walk In Anytime
                    </div>
                    <h3 className="text-2xl font-editorial text-[#30271f]">
                      Complimentary computerized eye testing at both stores
                    </h3>
                    <p className="text-sm text-[#75695e] leading-relaxed">
                      Whether you are preparing for exams in Indra Vihar &amp; Talwandi or
                      visiting with family on Rangbari Road, our optometrists check your
                      prescription accurately in under 10 minutes.
                    </p>
                  </div>
                </div>

                <div className="pt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setBookingConfirmed(false)
                      setBookingOpen(true)
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#90664a] hover:bg-[#6e4c36] text-white text-sm font-semibold transition cursor-pointer"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    Book Free Eye Checkup
                  </button>
                  <a
                    href={`tel:${activeBranch.phone}`}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-full border border-[#30271f] text-[#30271f] hover:bg-white text-sm font-semibold transition"
                  >
                    <Phone className="w-4 h-4" />
                    Call Store
                  </a>
                </div>
              </>
            ) : (
              <form onSubmit={handleBookVisit} className="space-y-4 my-auto">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-editorial text-[#30271f]">
                    Schedule Free Eye Checkup
                  </h3>
                  <button
                    type="button"
                    onClick={() => setBookingOpen(false)}
                    className="text-xs font-semibold text-[#75695e] hover:text-[#30271f] cursor-pointer"
                  >
                    ← Back
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#30271f] mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Aarav Sharma"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-sm focus:outline-none focus:border-[#90664a]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#30271f] mb-1">
                      Preferred Day
                    </label>
                    <select
                      value={visitDay}
                      onChange={(e) => setVisitDay(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-300 text-sm"
                    >
                      <option>Today</option>
                      <option>Tomorrow</option>
                      <option>This Weekend</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#30271f] mb-1">
                      Time Slot
                    </label>
                    <select
                      value={visitSlot}
                      onChange={(e) => setVisitSlot(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-300 text-sm"
                    >
                      <option>10:30 AM – 1:00 PM</option>
                      <option>1:00 PM – 4:30 PM</option>
                      <option>5:00 PM – 7:00 PM</option>
                      <option>7:00 PM – 9:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#30271f] mb-1">
                    What can we help you with?
                  </label>
                  <select
                    value={serviceNeed}
                    onChange={(e) => setServiceNeed(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-300 text-sm"
                  >
                    <option>Free Computerized Eye Checkup + Frames</option>
                    <option>Student Blue-Cut Study Glasses</option>
                    <option>Ray-Ban / Vogue / Titan Sunglasses</option>
                    <option>Greyjack 3-Clip Magnetic Eyewear</option>
                    <option>Bausch + Lomb Contact Lens Trial</option>
                  </select>
                </div>

                {bookingConfirmed && (
                  <p className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
                    Slot details prepared for {activeBranch.shortTitle}! Confirm via WhatsApp
                    or walk right in between 10 AM – 9 PM.
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#90664a] hover:bg-[#6e4c36] text-white text-sm font-semibold transition cursor-pointer"
                >
                  Confirm Instant Slot on WhatsApp ({activeBranch.shortTitle.split('·')[0].trim()})
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
