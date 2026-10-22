import React, { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  ExternalLink,
  MessageSquarePlus,
  Star,
  ThumbsUp,
  X,
} from 'lucide-react'
import {
  CustomerReview,
  INITIAL_GOOGLE_REVIEWS,
  KOTA_BRANCHES,
  KotaBranch,
} from '../data/goswamiData'

const REVIEWS_STORAGE_KEY = 'goswami_optics_kota_reviews_v1'
const HELPFUL_STORAGE_KEY = 'goswami_optics_helpful_votes_v1'

export const ReviewsSection: React.FC = () => {
  const [customReviews, setCustomReviews] = useState<CustomerReview[]>(() => {
    try {
      const saved = localStorage.getItem(REVIEWS_STORAGE_KEY)
      return saved ? (JSON.parse(saved) as CustomerReview[]) : []
    } catch {
      return []
    }
  })

  const [helpfulIds, setHelpfulIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(HELPFUL_STORAGE_KEY)
      return saved ? (JSON.parse(saved) as Record<string, boolean>) : {}
    } catch {
      return {}
    }
  })

  const [branchFilter, setBranchFilter] = useState<'all' | KotaBranch['id']>('all')
  const [isWriteOpen, setIsWriteOpen] = useState(false)

  // New Review Form State
  const [authorName, setAuthorName] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [selectedBranch, setSelectedBranch] =
    useState<KotaBranch['id']>('teachers-colony')
  const [purchasedTag, setPurchasedTag] = useState('Prescription Eyeglasses')
  const [comment, setComment] = useState('')
  const [justSubmittedBranch, setJustSubmittedBranch] =
    useState<KotaBranch | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(customReviews))
    } catch {
      // ignore storage quota errors
    }
  }, [customReviews])

  useEffect(() => {
    try {
      localStorage.setItem(HELPFUL_STORAGE_KEY, JSON.stringify(helpfulIds))
    } catch {
      // ignore
    }
  }, [helpfulIds])

  const allReviews = useMemo(
    () => [...customReviews, ...INITIAL_GOOGLE_REVIEWS],
    [customReviews]
  )

  const filteredReviews = useMemo(() => {
    if (branchFilter === 'all') return allReviews
    return allReviews.filter((r) => r.branchId === branchFilter)
  }, [allReviews, branchFilter])

  const totalGoogleBaseCount = 290 + 126 + customReviews.length

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!authorName.trim() || !comment.trim()) return

    const branchObj =
      KOTA_BRANCHES.find((b) => b.id === selectedBranch) || KOTA_BRANCHES[0]
    const cleanName = authorName.trim()
    const initials = cleanName
      .split(/\s+/)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('')
      .slice(0, 2)

    const newRev: CustomerReview = {
      id: `rev-local-${Date.now()}`,
      author: cleanName,
      initials: initials || 'GO',
      rating,
      branchId: branchObj.id,
      branchLabel:
        branchObj.id === 'teachers-colony'
          ? 'Teachers Colony · Rangbari Rd'
          : 'Indra Vihar · Titan Eyewear Store',
      purchasedTag,
      comment: comment.trim(),
      dateLabel: 'Just now · Kota Visitor',
      source: 'Website Visitor',
      helpfulCount: 1,
    }

    setCustomReviews((prev) => [newRev, ...prev])
    setJustSubmittedBranch(branchObj)
    setAuthorName('')
    setComment('')
    setRating(5)
  }

  const toggleHelpful = (id: string) => {
    setHelpfulIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <section
      id="reviews"
      className="py-20 md:py-28 bg-[#F7F5F0] border-t border-stone-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Rating Summary Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-9 border border-stone-200/90 shadow-xs mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Score Left */}
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#0064B5]">
                Trusted Across Kota Since Years
              </span>
              <h2 className="text-3xl sm:text-4xl text-[#182232] font-normal leading-tight">
                Rated <span className="italic font-medium">4.8 out of 5</span> by Kota
                families, doctors &amp; students
              </h2>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-[#182232]">
                  {totalGoogleBaseCount}+ Verified Reviews
                </span>
                <span className="text-xs text-[#526071]">
                  (290 Teachers Colony · 126 Indra Vihar)
                </span>
              </div>
            </div>

            {/* Histogram Middle */}
            <div className="lg:col-span-4 space-y-2">
              {[
                { stars: 5, pct: 86 },
                { stars: 4, pct: 10 },
                { stars: 3, pct: 3 },
                { stars: 2, pct: 1 },
              ].map((row) => (
                <div key={row.stars} className="flex items-center gap-3 text-xs">
                  <span className="w-11 font-semibold text-[#182232]">
                    {row.stars} stars
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[#526071]">{row.pct}%</span>
                </div>
              ))}
            </div>

            {/* Write Review & Google Redirect Right */}
            <div className="lg:col-span-3 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setJustSubmittedBranch(null)
                  setIsWriteOpen(true)
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#0064B5] hover:bg-[#004E8F] text-white text-sm font-semibold transition cursor-pointer"
              >
                <MessageSquarePlus className="w-4 h-4" />
                Write a Review on Site
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={KOTA_BRANCHES[0].shareGoogleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-full border border-slate-200 hover:border-slate-300 text-[11px] font-semibold text-[#182232] transition text-center"
                >
                  Google · Branch 1 <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={KOTA_BRANCHES[1].shareGoogleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-full border border-slate-200 hover:border-slate-300 text-[11px] font-semibold text-[#182232] transition text-center"
                >
                  Google · Branch 2 <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Showroom Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
          <div className="inline-flex bg-white p-1 rounded-full border border-stone-200/90">
            {(
              [
                ['all', `All Reviews (${allReviews.length})`],
                ['teachers-colony', 'Teachers Colony Flagship'],
                ['indra-vihar', 'Indra Vihar Titan Store'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setBranchFilter(id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  branchFilter === id
                    ? 'bg-[#182232] text-white'
                    : 'text-[#526071] hover:text-[#182232]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="text-xs text-[#526071]">
            Showing real Google customer reviews &amp; instant visitor reviews
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReviews.map((rev) => {
            const voted = Boolean(helpfulIds[rev.id])
            return (
              <article
                key={rev.id}
                className="bg-white rounded-2xl p-6 border border-stone-200/80 flex flex-col justify-between gap-4 hover:shadow-sm transition"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0064B5]/10 text-[#0064B5] font-bold text-xs flex items-center justify-center shrink-0">
                        {rev.initials}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#182232]">
                          {rev.author}
                        </h4>
                        <div className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          {rev.dateLabel}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-[#182232] leading-relaxed">
                    “{rev.comment}”
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-[#F7F5F0] text-[#526071] font-medium truncate">
                    {rev.branchLabel} · {rev.purchasedTag}
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleHelpful(rev.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full transition cursor-pointer shrink-0 ${
                      voted
                        ? 'bg-[#0064B5]/10 text-[#0064B5] font-semibold'
                        : 'text-[#526071] hover:bg-slate-100'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    {rev.helpfulCount + (voted ? 1 : 0)}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      {/* Write a Review Modal */}
      {isWriteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsWriteOpen(false)}
              aria-label="Close review modal"
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-[#526071] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {justSubmittedBranch ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-editorial text-[#182232]">
                  Thank you for reviewing Goswami Optics!
                </h3>
                <p className="text-sm text-[#526071]">
                  Your review is now live on the website. Want to also share it on our
                  official Google Business page for{' '}
                  <strong>{justSubmittedBranch.shortTitle}</strong>?
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <a
                    href={justSubmittedBranch.shareGoogleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-full bg-[#0064B5] text-white text-sm font-semibold"
                  >
                    Also Post on Google Maps <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsWriteOpen(false)}
                    className="py-3 px-5 rounded-full border border-slate-300 text-sm font-semibold text-[#182232] cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#0064B5]">
                    Share Your Experience
                  </span>
                  <h3 className="text-2xl font-editorial text-[#182232] mt-0.5">
                    Review Goswami Optics Kota
                  </h3>
                </div>

                {/* Star Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#182232] mb-1.5">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onMouseEnter={() => setHoverRating(num)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(num)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            num <= (hoverRating || rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#182232] mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Priya Khandelwal"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0064B5]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#182232] mb-1">
                      Kota Branch Visited
                    </label>
                    <select
                      value={selectedBranch}
                      onChange={(e) =>
                        setSelectedBranch(e.target.value as KotaBranch['id'])
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      <option value="teachers-colony">
                        Teachers Colony (Rangbari Rd)
                      </option>
                      <option value="indra-vihar">
                        Indra Vihar (New Titan Store)
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#182232] mb-1">
                    What did you shop for?
                  </label>
                  <select
                    value={purchasedTag}
                    onChange={(e) => setPurchasedTag(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option>Prescription Eyeglasses</option>
                    <option>Sunglasses (Ray-Ban / Titan / Vogue)</option>
                    <option>Greyjack 3-Clip Magnetic Eyewear</option>
                    <option>Computerized Eye Testing</option>
                    <option>Bausch + Lomb Contact Lenses</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#182232] mb-1">
                    Your Review
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tell fellow Kota shoppers about frame quality, eye checkup accuracy, or staff service..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0064B5]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#0064B5] hover:bg-[#004E8F] text-white text-sm font-semibold transition cursor-pointer"
                >
                  Publish Review Instantly
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
