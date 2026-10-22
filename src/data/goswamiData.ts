export type FrameShape =
  | 'brady'
  | 'wayfarer'
  | 'round'
  | 'wire-round'
  | 'aviator'
  | 'cateye'
  | 'clubmaster'
  | 'hexagon'
  | 'navigator'
  | 'octagon'

export type LensTintId =
  | 'clear'
  | 'bluecut'
  | 'green-g15'
  | 'smoke'
  | 'amber-grad'
  | 'rose-tint'
  | 'cobalt-mirror'
  | 'photochromic'

export type ColorFinishId =
  | 'sea-glass-grey'
  | 'jet-black'
  | 'ristretto-tortoise'
  | 'crystal-clear'
  | 'polished-gold'
  | 'sesame-tortoise'
  | 'olive-matte'
  | 'silver-titanium'
  | 'rose-water'
  | 'midnight-blue'
  | 'two-tone'

export interface ColorFinish {
  id: ColorFinishId
  name: string
  swatchHex: string
  swatchSecondaryHex?: string
  frameHex: string
  secondaryHex: string
  metalHex: string
  isTranslucent?: boolean
  translucentOpacity?: number
  isTortoise?: boolean
  isMetallic?: boolean
}

export interface LensOption {
  id: LensTintId
  name: string
  shortLabel: string
  colorHex: string
  opacity: number
  sheenHex: string
  isMirrored?: boolean
  description: string
}

export interface EyewearProduct {
  id: string
  name: string
  brand: string
  category: 'eyeglasses' | 'sunglasses' | 'clip-on' | 'contacts'
  shape: FrameShape
  price: number
  mrp?: number
  badge?: string
  fitWidth: 'Narrow' | 'Medium' | 'Wide'
  totalWidthMm: number
  measurements: string
  recommendedFaces: string[]
  colors: ColorFinishId[]
  defaultLens: LensTintId
  hasMagneticClip?: boolean
  description: string
  highlights: string[]
  isContactLensPack?: boolean
}

export interface KotaBranch {
  id: 'teachers-colony' | 'indra-vihar'
  officialName: string
  shortTitle: string
  areaTag: string
  address: string
  landmark: string
  postalCode: string
  phone: string
  phoneRaw: string
  hours: string
  rating: number
  reviewCount: number
  shareGoogleUrl: string
  googleMapsPlaceUrl: string
  googleDirectionsUrl: string
  embedMapUrl: string
  businessQuote: string
  specialties: string[]
}

export interface CustomerReview {
  id: string
  author: string
  initials: string
  rating: number
  branchId: 'teachers-colony' | 'indra-vihar'
  branchLabel: string
  purchasedTag: string
  comment: string
  dateLabel: string
  source: 'Google Verified' | 'Website Visitor'
  helpfulCount: number
}

export interface StudioModelProfile {
  id: string
  name: string
  faceShape: 'Oval' | 'Square' | 'Heart' | 'Oblong'
  fitRecommendation: 'Narrow' | 'Medium' | 'Wide'
  image: string
  leftEye: { x: number; y: number }
  rightEye: { x: number; y: number }
}

export const WHATSAPP_BASE_URL = 'https://wa.me/919782792323'

export const COLOR_FINISHES: Record<ColorFinishId, ColorFinish> = {
  'sea-glass-grey': {
    id: 'sea-glass-grey',
    name: 'Sea Glass Grey',
    swatchHex: '#A7B1B7',
    swatchSecondaryHex: '#DDE3E7',
    frameHex: '#B6C0C6',
    secondaryHex: '#DCE3E7',
    metalHex: '#CBD2DA',
    isTranslucent: true,
    translucentOpacity: 0.56,
  },
  'jet-black': {
    id: 'jet-black',
    name: 'Jet Black',
    swatchHex: '#15171A',
    frameHex: '#15171B',
    secondaryHex: '#2B3038',
    metalHex: '#D4D8DF',
  },
  'ristretto-tortoise': {
    id: 'ristretto-tortoise',
    name: 'Ristretto Tortoise',
    swatchHex: '#5C3419',
    swatchSecondaryHex: '#B67B43',
    frameHex: '#4E2C14',
    secondaryHex: '#BA7E41',
    metalHex: '#D9B36C',
    isTortoise: true,
  },
  'crystal-clear': {
    id: 'crystal-clear',
    name: 'Crystal Clear',
    swatchHex: '#E5E8EC',
    swatchSecondaryHex: '#FFFFFF',
    frameHex: '#DDE3EA',
    secondaryHex: '#F5F7FA',
    metalHex: '#C8CDD5',
    isTranslucent: true,
    translucentOpacity: 0.42,
  },
  'polished-gold': {
    id: 'polished-gold',
    name: 'Polished Gold',
    swatchHex: '#C9A456',
    swatchSecondaryHex: '#EAE0B5',
    frameHex: '#C8A24E',
    secondaryHex: '#E6CD86',
    metalHex: '#D4B05E',
    isMetallic: true,
  },
  'sesame-tortoise': {
    id: 'sesame-tortoise',
    name: 'Sesame Tortoise',
    swatchHex: '#846242',
    swatchSecondaryHex: '#D1B38A',
    frameHex: '#7A593A',
    secondaryHex: '#CFAF82',
    metalHex: '#D4B05E',
    isTortoise: true,
  },
  'olive-matte': {
    id: 'olive-matte',
    name: 'Olive Sage Crystal',
    swatchHex: '#4E5E49',
    frameHex: '#4C5C47',
    secondaryHex: '#6B7E64',
    metalHex: '#C5C9C2',
    isTranslucent: true,
  },
  'silver-titanium': {
    id: 'silver-titanium',
    name: 'Brushed Gunmetal Silver',
    swatchHex: '#8F9AA6',
    swatchSecondaryHex: '#E3E7EC',
    frameHex: '#8B96A3',
    secondaryHex: '#DCE2E8',
    metalHex: '#CBD2DA',
    isMetallic: true,
  },
  'rose-water': {
    id: 'rose-water',
    name: 'Rose Water Crystal',
    swatchHex: '#DDA9A5',
    swatchSecondaryHex: '#F4DFDD',
    frameHex: '#D9A19D',
    secondaryHex: '#F3D9D6',
    metalHex: '#DFB895',
    isTranslucent: true,
    translucentOpacity: 0.55,
  },
  'midnight-blue': {
    id: 'midnight-blue',
    name: 'Midnight Sapphire',
    swatchHex: '#1D3557',
    frameHex: '#1B3252',
    secondaryHex: '#335785',
    metalHex: '#CFD6DF',
  },
  'two-tone': {
    id: 'two-tone',
    name: 'Two-Tone Espresso & Gold',
    swatchHex: '#2C221E',
    swatchSecondaryHex: '#D4AF61',
    frameHex: '#251D1A',
    secondaryHex: '#D5B062',
    metalHex: '#D5B062',
  },
}

export const LENS_OPTIONS: Record<LensTintId, LensOption> = {
  clear: {
    id: 'clear',
    name: 'Clear Crizal Anti-Glare',
    shortLabel: 'Clear HD',
    colorHex: '#EEF6FB',
    opacity: 0.055,
    sheenHex: '#9FE7C4',
    description: 'Scratch-resistant, dust & smudge-repellent HD optical clarity.',
  },
  bluecut: {
    id: 'bluecut',
    name: 'Zero-Strain Study Blue-Cut',
    shortLabel: 'Blue-Cut',
    colorHex: '#DCEBFF',
    opacity: 0.095,
    sheenHex: '#7CC0FF',
    description: 'Blocks harmful digital blue light for 10+ hr Kota study & laptop sessions.',
  },
  'green-g15': {
    id: 'green-g15',
    name: 'Classic G-15 Polarized Green',
    shortLabel: 'G-15 Sun',
    colorHex: '#1C2F23',
    opacity: 0.84,
    sheenHex: '#A7F3D0',
    description: '100% UV400 protection built for bright Rajasthan afternoon sun.',
  },
  smoke: {
    id: 'smoke',
    name: 'Charcoal Polarized Smoke',
    shortLabel: 'Polarized Grey',
    colorHex: '#191E26',
    opacity: 0.85,
    sheenHex: '#CBD5E1',
    description: 'Eliminates highway & water glare with true-to-life color balance.',
  },
  'amber-grad': {
    id: 'amber-grad',
    name: 'Warm Ristretto Gradient',
    shortLabel: 'Amber Sun',
    colorHex: '#4E2F18',
    opacity: 0.76,
    sheenHex: '#FDE68A',
    description: 'Soft warm amber sun tint with effortless indoor-to-outdoor comfort.',
  },
  'rose-tint': {
    id: 'rose-tint',
    name: 'Editorial Rose Dusk',
    shortLabel: 'Rose Sun',
    colorHex: '#683642',
    opacity: 0.68,
    sheenHex: '#FBCFE8',
    description: 'High-contrast fashion tint styled for golden-hour outings.',
  },
  'cobalt-mirror': {
    id: 'cobalt-mirror',
    name: 'Cobalt Flash Polarized Mirror',
    shortLabel: 'Cobalt Mirror',
    colorHex: '#16468C',
    opacity: 0.86,
    sheenHex: '#93C5FD',
    isMirrored: true,
    description: 'High-reflectance sapphire mirror sun shield for peak outdoor glare.',
  },
  photochromic: {
    id: 'photochromic',
    name: 'Transitions Sun-Adaptive',
    shortLabel: 'Photochromic',
    colorHex: '#272E38',
    opacity: 0.56,
    sheenHex: '#93C5FD',
    description: 'Crystal clear indoors, automatically darkens outdoors under Kota sunlight.',
  },
}

export const EYEWEAR_CATALOG: EyewearProduct[] = [
  {
    id: 'rayban-rb7211',
    name: 'RB 7211 Brady Edit',
    brand: 'Ray-Ban',
    category: 'eyeglasses',
    shape: 'brady',
    price: 7590,
    badge: 'Authorised Dealer Pick',
    fitWidth: 'Medium',
    totalWidthMm: 137,
    measurements: '53–17–145 mm',
    recommendedFaces: ['Oval', 'Round', 'Heart', 'Square'],
    colors: ['sea-glass-grey', 'jet-black', 'ristretto-tortoise', 'crystal-clear', 'midnight-blue'],
    defaultLens: 'clear',
    description:
      'Hand-polished slim cellulose acetate rectangle with keyhole bridge & steel temple corewire. Available directly at Goswami Optics Kota.',
    highlights: [
      '100% Genuine Ray-Ban warranty card & case',
      'Hand-beveled Sea Glass Grey & Jet Black acetate',
      'Custom prescription or Crizal Blue-Cut fitting',
    ],
  },
  {
    id: 'greyjack-trio-clip',
    name: 'Trio 3-Clip Navigator',
    brand: 'Greyjack',
    category: 'clip-on',
    shape: 'wayfarer',
    price: 2490,
    mrp: 3290,
    badge: '3 Magnetic Clips Included',
    fitWidth: 'Medium',
    totalWidthMm: 138,
    measurements: '52–18–142 mm',
    recommendedFaces: ['Oval', 'Round', 'Square', 'Heart'],
    colors: ['jet-black', 'olive-matte', 'midnight-blue', 'ristretto-tortoise'],
    defaultLens: 'clear',
    hasMagneticClip: true,
    description:
      'Kota’s #1 trending attachment eyewear on @goswamioptics2018. One featherlight TR-90 prescription frame with 3 snap-on magnetic sun & night clips.',
    highlights: [
      'Includes Polarized Sun + Night-Vision + Mirror Clips',
      'Instant 0.2-second invisible neodymium snap',
      'Ultra-flexible unbreakable TR-90 frame',
    ],
  },
  {
    id: 'titan-airflex-panto',
    name: 'Airflex Panto Scholar',
    brand: 'Titan Eye+',
    category: 'eyeglasses',
    shape: 'round',
    price: 2190,
    mrp: 2650,
    badge: 'Kota Student Bestseller',
    fitWidth: 'Medium',
    totalWidthMm: 134,
    measurements: '49–20–140 mm',
    recommendedFaces: ['Square', 'Oval', 'Heart'],
    colors: ['ristretto-tortoise', 'sea-glass-grey', 'crystal-clear', 'jet-black', 'rose-water'],
    defaultLens: 'bluecut',
    description:
      'Available at our Indra Vihar Titan Showroom & Teachers Colony Flagship. Balanced vintage Panto silhouette paired with zero-strain study lenses.',
    highlights: [
      'Weighs just 11 grams for 12-hour study comfort',
      'Keyhole bridge distributes weight evenly',
      'Ideal for single-vision & anti-fatigue powers',
    ],
  },
  {
    id: 'vogue-monica-cateye',
    name: 'Vo-5412 Upswept Cat-Eye',
    brand: 'Vogue Eyewear',
    category: 'sunglasses',
    shape: 'cateye',
    price: 3690,
    mrp: 4490,
    badge: 'New Arrival',
    fitWidth: 'Medium',
    totalWidthMm: 136,
    measurements: '53–17–140 mm',
    recommendedFaces: ['Oval', 'Round', 'Square'],
    colors: ['ristretto-tortoise', 'jet-black', 'rose-water', 'sesame-tortoise'],
    defaultLens: 'amber-grad',
    description:
      'Sculpted hand-polished upswept cat-eye silhouette with UV400 gradient sun lenses. Custom power sun lenses fitted at both Kota showrooms.',
    highlights: [
      '100% UV400 UVA/UVB protection',
      'Power sun-lens compatible at both Kota branches',
      'Hand-beveled Italian-style cellulose acetate',
    ],
  },
  {
    id: 'rayban-desert-aviator',
    name: 'Chambal Classic Aviator',
    brand: 'Ray-Ban',
    category: 'sunglasses',
    shape: 'aviator',
    price: 5490,
    mrp: 6390,
    badge: 'Iconic Polarized G-15',
    fitWidth: 'Wide',
    totalWidthMm: 141,
    measurements: '58–14–140 mm',
    recommendedFaces: ['Oval', 'Square', 'Heart'],
    colors: ['polished-gold', 'silver-titanium', 'jet-black'],
    defaultLens: 'green-g15',
    description:
      'Precision double-bridge metal teardrop pilot sunglasses with silicone gooseneck nose pads and authentic Ray-Ban G-15 crystal sun lenses.',
    highlights: [
      'Double-bar surgical steel & 24K gold-plated wire',
      'Silicone self-adjusting nose pads',
      'Prescription polarized sun lenses available',
    ],
  },
  {
    id: 'azzaro-titanium-wire',
    name: 'AZ-904 Feather Titanium',
    brand: 'Azzaro Paris',
    category: 'eyeglasses',
    shape: 'wire-round',
    price: 3890,
    badge: 'Ultra-Light 8g Titanium',
    fitWidth: 'Medium',
    totalWidthMm: 135,
    measurements: '50–19–142 mm',
    recommendedFaces: ['Square', 'Oval', 'Oblong'],
    colors: ['polished-gold', 'silver-titanium', 'jet-black'],
    defaultLens: 'clear',
    description:
      'Minimalist 1.5 mm Japanese beta-titanium round rim with soft silicone nose pads—preferred by GMC Kota doctors & faculty.',
    highlights: [
      'Hypoallergenic nickel-free beta titanium',
      'Virtually weightless 8-gram feel on nose',
      'Ideal for Crizal Sapphire HR & progressive lenses',
    ],
  },
  {
    id: 'fastrack-highway-navigator',
    name: 'FT-Sport Double-Bar Sun',
    brand: 'Fastrack',
    category: 'sunglasses',
    shape: 'navigator',
    price: 1990,
    mrp: 2490,
    badge: 'Youth Polarized Hit',
    fitWidth: 'Wide',
    totalWidthMm: 140,
    measurements: '56–16–142 mm',
    recommendedFaces: ['Round', 'Oval', 'Heart'],
    colors: ['silver-titanium', 'polished-gold', 'jet-black'],
    defaultLens: 'cobalt-mirror',
    description:
      'Squared double-bridge navigator sunglasses with polarized anti-glare mirror lenses built for highway rides & Kota sunshine.',
    highlights: [
      '100% UV400 polarized polycarbonate shield',
      'Sweat-resistant temple tips & silicone pads',
      'Special student discount at Indra Vihar branch',
    ],
  },
  {
    id: 'hashtag-octagon-metal',
    name: 'HT-418 Octagon Geometric',
    brand: 'Hashtag Eyewear',
    category: 'eyeglasses',
    shape: 'octagon',
    price: 1690,
    mrp: 2190,
    badge: 'Campus Trendsetter',
    fitWidth: 'Narrow',
    totalWidthMm: 132,
    measurements: '49–19–140 mm',
    recommendedFaces: ['Round', 'Oval', 'Heart'],
    colors: ['polished-gold', 'silver-titanium', 'rose-water'],
    defaultLens: 'bluecut',
    description:
      'Crisp faceted eight-sided architectural wire frame with subtle bevel reflections—a standout modern alternative to classic rounds.',
    highlights: [
      'Slim faceted stainless wire rim',
      'Includes zero-glare digital screen protection',
      'Complimentary hard case & microfiber cloth',
    ],
  },
  {
    id: 'wolfeye-crystal-clear',
    name: 'Lucent Crystal Round',
    brand: 'Wolf Eye',
    category: 'eyeglasses',
    shape: 'round',
    price: 1390,
    mrp: 1890,
    badge: 'Crystal Corewire Edit',
    fitWidth: 'Medium',
    totalWidthMm: 135,
    measurements: '50–19–142 mm',
    recommendedFaces: ['Square', 'Heart', 'Oval'],
    colors: ['crystal-clear', 'sea-glass-grey', 'rose-water', 'sesame-tortoise'],
    defaultLens: 'bluecut',
    description:
      'High-clarity non-yellowing crystal acetate frame with visible metallic corewire along the temples—brightens the face effortlessly.',
    highlights: [
      'UV-stabilized non-yellowing crystal polymer',
      'Visible engraved steel temple corewire',
      'Same-day prescription fitting available',
    ],
  },
  {
    id: 'xford-safari-sun',
    name: 'Ranthambore Browline Clip',
    brand: 'X-Ford',
    category: 'clip-on',
    shape: 'clubmaster',
    price: 2190,
    mrp: 2790,
    badge: '2-in-1 Browline + Sun',
    fitWidth: 'Medium',
    totalWidthMm: 137,
    measurements: '51–20–143 mm',
    recommendedFaces: ['Oval', 'Round', 'Heart'],
    colors: ['two-tone', 'ristretto-tortoise', 'jet-black'],
    defaultLens: 'clear',
    hasMagneticClip: true,
    description:
      'Classic mid-century acetate browline paired with gold lower wire rims—plus a custom magnetic polarized sun shield in one snap.',
    highlights: [
      'Custom magnetic sun shield matched to browline',
      'Saves cost of buying a second prescription sunglass',
      'Includes protective dual-compartment pouch',
    ],
  },
  {
    id: 'titan-hexa-sun',
    name: 'Solitaire Hexagonal Sun',
    brand: 'Titan',
    category: 'sunglasses',
    shape: 'hexagon',
    price: 2890,
    fitWidth: 'Narrow',
    totalWidthMm: 133,
    measurements: '50–19–140 mm',
    recommendedFaces: ['Oval', 'Heart', 'Round'],
    colors: ['polished-gold', 'silver-titanium', 'jet-black'],
    defaultLens: 'rose-tint',
    description:
      'Delicate gold geometric sunglasses paired with soft dusk-rose & warm gradient lenses—light enough to wear from morning brunch to sunset.',
    highlights: [
      'Scratch-hardened polycarbonate sun lenses',
      'Ultra-slim sculpted temple tips',
      'Prescription sun tint option available',
    ],
  },
  {
    id: 'bausch-lomb-lacelle',
    name: 'Soft Lens Toric & Lacelle Pack',
    brand: 'Bausch + Lomb',
    category: 'contacts',
    shape: 'round',
    price: 1190,
    mrp: 1450,
    badge: 'In Stock + Free Solution Check',
    fitWidth: 'Medium',
    totalWidthMm: 136,
    measurements: 'BC 8.6 · DIA 14.2 mm',
    recommendedFaces: ['Oval', 'Round', 'Square', 'Heart'],
    colors: ['crystal-clear', 'sea-glass-grey', 'sesame-tortoise', 'olive-matte'],
    defaultLens: 'clear',
    isContactLensPack: true,
    description:
      'Authorised Bausch + Lomb & CooperVision contact lenses stocked across powers (Spherical, Toric Astigmatism & Lacelle Colored Dailies) plus BioTrue & I-MAXX solutions.',
    highlights: [
      'Bausch + Lomb iConnect, Soft Lens Toric & Lacelle Dailies',
      'Free first-time contact lens insertion guidance in-store',
      'BioTrue & I-MAXX multipurpose travel kits available',
    ],
  },
]

export const KOTA_BRANCHES: KotaBranch[] = [
  {
    id: 'teachers-colony',
    officialName: 'GOSWAMI OPTICS',
    shortTitle: 'Teachers Colony · Mahaveer Nagar',
    areaTag: 'Flagship Showroom · Branch 01',
    address: '2-K-4, Rangbari Rd, Teachers Colony, Mahaveer Nagar, Kota, Rajasthan 324009',
    landmark: 'Near Amber Dairy, Main Rangbari Road',
    postalCode: '324009',
    phone: '+91 97827 92323',
    phoneRaw: '919782792323',
    hours: 'Mon – Sun: 10:00 AM – 9:00 PM',
    rating: 4.8,
    reviewCount: 290,
    shareGoogleUrl: 'https://share.google/XlhxSlGqvhXNlhpsT',
    googleMapsPlaceUrl:
      'https://www.google.com/maps/place/GOSWAMI+OPTICS/data=!4m2!3m1!1s0x396f84e9097f349f:0xb31577be274d865a',
    googleDirectionsUrl:
      'https://www.google.com/maps/dir/?api=1&destination=GOSWAMI+OPTICS,+2-K-4,+Rangbari+Rd,+Teachers+Colony,+Mahaveer+Nagar,+Kota,+Rajasthan+324009',
    embedMapUrl:
      'https://maps.google.com/maps?q=GOSWAMI+OPTICS+2-K-4+Rangbari+Rd+Teachers+Colony+Mahaveer+Nagar+Kota+Rajasthan+324009&t=&z=16&ie=UTF8&iwloc=&output=embed',
    businessQuote:
      'Associated with premium brands — Ray-Ban, Vogue, Azzaro, Titan, Fastrack, X-Ford, Wolf Eye, Hashtag, Greyjack (attachment eyewear), Crizal, Bausch & Lomb & CooperVision. Professional computerized eye testing daily.',
    specialties: [
      'Authorised Ray-Ban, Vogue, Azzaro & Crizal Flagship Counter',
      'Computerized Optometry & Precision Eye Power Checkup',
      'Greyjack 3-Clip Magnetic Attachment Collection',
      'Bausch + Lomb, CooperVision & BioTrue Contact Lens Bar',
    ],
  },
  {
    id: 'indra-vihar',
    officialName: 'GOSWAMI OPTICS NEW - TITAN EYEWEAR',
    shortTitle: 'Indra Vihar · Talwandi Showroom',
    areaTag: 'New Titan Eyewear Store · Branch 02',
    address: 'S-7, 8, Opp. Chhabriya Cycle, Indra Vihar, Talwandi, Kota, Rajasthan 324005',
    landmark: 'Opposite Chhabriya Cycle, Indra Vihar Coaching Hub',
    postalCode: '324005',
    phone: '+91 97827 92323',
    phoneRaw: '919782792323',
    hours: 'Mon – Sun: 10:00 AM – 9:00 PM',
    rating: 4.8,
    reviewCount: 126,
    shareGoogleUrl: 'https://share.google/qeTyImoBLn187W1ZF',
    googleMapsPlaceUrl:
      'https://www.google.com/maps/place/GOSWAMI+OPTICS+NEW+-TITAN+EYEWEAR/data=!4m2!3m1!1s0x396f8514d12ede53:0xe8167dd21048a409',
    googleDirectionsUrl:
      'https://www.google.com/maps/dir/?api=1&destination=GOSWAMI+OPTICS+NEW+-TITAN+EYEWEAR,+S-7,8,+Oppo.chhabriya+cycle,+Indra+Vihar,+Talwandi,+Kota,+Rajasthan+324005',
    embedMapUrl:
      'https://maps.google.com/maps?q=GOSWAMI+OPTICS+NEW+TITAN+EYEWEAR+S-7+8+Indra+Vihar+Talwandi+Kota+Rajasthan+324005&t=&z=16&ie=UTF8&iwloc=&output=embed',
    businessQuote:
      'We provide the best eyewear and sunglasses with affordable pricing, fast service, and special daily student & family discounts across Titan, Fastrack, and prescription lenses.',
    specialties: [
      'Exclusive Titan & Fastrack Eyewear Showcase',
      'Express Same-Day Spectacle Delivery for Students',
      'Zero-Strain Blue-Cut Study Lens Packages',
      'Daily Special Discounts & Free Ultrasonic Frame Servicing',
    ],
  },
]

export const INITIAL_GOOGLE_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-google-1',
    author: 'Darshan Yogi',
    initials: 'DY',
    rating: 5,
    branchId: 'teachers-colony',
    branchLabel: 'Teachers Colony · Rangbari Rd',
    purchasedTag: 'Genuine Branded Eyewear',
    comment:
      'Completely satisfied from their genuine products, service and polite staff behaviour. Highly recommended optical store in Kota.',
    dateLabel: 'Verified Google Review',
    source: 'Google Verified',
    helpfulCount: 18,
  },
  {
    id: 'rev-google-2',
    author: 'Social Sardar',
    initials: 'SS',
    rating: 5,
    branchId: 'indra-vihar',
    branchLabel: 'Indra Vihar · Titan Eyewear Store',
    purchasedTag: 'Express Prescription Specs',
    comment:
      'So many options and super fast service with affordable price. Got my prescription glasses ready way faster than expected!',
    dateLabel: 'Verified Google Review',
    source: 'Google Verified',
    helpfulCount: 24,
  },
  {
    id: 'rev-google-3',
    author: 'Deepak Meena',
    initials: 'DM',
    rating: 5,
    branchId: 'teachers-colony',
    branchLabel: 'Teachers Colony · Rangbari Rd',
    purchasedTag: 'Designer Frames',
    comment:
      'The frame designs they offer are extraordinary for a very good price. Huge variety compared to chain stores.',
    dateLabel: 'Verified Google Review',
    source: 'Google Verified',
    helpfulCount: 15,
  },
  {
    id: 'rev-google-4',
    author: 'Shubham Raghuvanshi',
    initials: 'SR',
    rating: 5,
    branchId: 'indra-vihar',
    branchLabel: 'Indra Vihar · Titan Eyewear Store',
    purchasedTag: 'Titan Frame + Blue-Cut',
    comment:
      'Top quality frames at a very reasonable price. Great collection of latest Titan and clip-on styles in Talwandi.',
    dateLabel: 'Verified Google Review',
    source: 'Google Verified',
    helpfulCount: 12,
  },
  {
    id: 'rev-google-5',
    author: 'Daksh Panwar',
    initials: 'DP',
    rating: 5,
    branchId: 'teachers-colony',
    branchLabel: 'Teachers Colony · Rangbari Rd',
    purchasedTag: 'Eyeglasses & Eye Checkup',
    comment:
      'Good quality frames at amazing prices. Eye power testing was thorough and accurate.',
    dateLabel: 'Verified Google Review',
    source: 'Google Verified',
    helpfulCount: 11,
  },
  {
    id: 'rev-google-6',
    author: 'Ankit Gahlyan',
    initials: 'AG',
    rating: 5,
    branchId: 'indra-vihar',
    branchLabel: 'Indra Vihar · Titan Eyewear Store',
    purchasedTag: 'Sunglasses & Fitting',
    comment:
      'Excellent experience and good service. Staff patiently helps you try frames until you find the exact fit for your face.',
    dateLabel: 'Verified Google Review',
    source: 'Google Verified',
    helpfulCount: 9,
  },
]

export const STUDIO_MODELS: StudioModelProfile[] = [
  {
    id: 'model-ananya',
    name: 'Ananya',
    faceShape: 'Oval',
    fitRecommendation: 'Medium',
    image: '/images/model-female-1.jpg',
    leftEye: { x: 0.402, y: 0.372 },
    rightEye: { x: 0.598, y: 0.371 },
  },
  {
    id: 'model-rohan',
    name: 'Rohan',
    faceShape: 'Square',
    fitRecommendation: 'Medium',
    image: '/images/model-male-1.jpg',
    leftEye: { x: 0.415, y: 0.338 },
    rightEye: { x: 0.58, y: 0.336 },
  },
  {
    id: 'model-kavya',
    name: 'Kavya',
    faceShape: 'Heart',
    fitRecommendation: 'Narrow',
    image: '/images/model-female-2.jpg',
    leftEye: { x: 0.417, y: 0.308 },
    rightEye: { x: 0.578, y: 0.306 },
  },
  {
    id: 'model-vikram',
    name: 'Vikram',
    faceShape: 'Oblong',
    fitRecommendation: 'Wide',
    image: '/images/model-male-2.jpg',
    leftEye: { x: 0.425, y: 0.29 },
    rightEye: { x: 0.568, y: 0.288 },
  },
]

export const PARTNER_BRANDS = [
  'RAY-BAN',
  'TITAN EYE+',
  'VOGUE',
  'FASTRACK',
  'GREYJACK 3-CLIP',
  'CRIZAL',
  'AZZARO',
  'BAUSCH + LOMB',
  'COOPERVISION',
  'X-FORD',
  'WOLF EYE',
  'HASHTAG',
]
