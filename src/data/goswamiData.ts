export type FrameShape =
  | 'wayfarer'
  | 'round'
  | 'aviator'
  | 'cateye'
  | 'clubmaster'
  | 'hexagon'

export type LensTintId =
  | 'clear'
  | 'bluecut'
  | 'green-g15'
  | 'smoke'
  | 'amber-grad'
  | 'rose-tint'
  | 'photochromic'

export type ColorFinishId =
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
  // Normalized coordinates [0..1] in image space
  leftEye: { x: number; y: number }
  rightEye: { x: number; y: number }
}

export const COLOR_FINISHES: Record<ColorFinishId, ColorFinish> = {
  'jet-black': {
    id: 'jet-black',
    name: 'Jet Black',
    swatchHex: '#17191C',
    frameHex: '#181A1E',
    secondaryHex: '#2C3038',
    metalHex: '#D4D8DF',
  },
  'ristretto-tortoise': {
    id: 'ristretto-tortoise',
    name: 'Ristretto Tortoise',
    swatchHex: '#5C3419',
    swatchSecondaryHex: '#B67B43',
    frameHex: '#4F2D15',
    secondaryHex: '#BA7E41',
    metalHex: '#D9B36C',
    isTortoise: true,
  },
  'crystal-clear': {
    id: 'crystal-clear',
    name: 'Crystal Clear',
    swatchHex: '#E5E8EC',
    swatchSecondaryHex: '#FFFFFF',
    frameHex: '#DCE2E9',
    secondaryHex: '#F5F7FA',
    metalHex: '#C8CDD5',
    isTranslucent: true,
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
    name: 'Olive Matte',
    swatchHex: '#495844',
    frameHex: '#43523E',
    secondaryHex: '#63765C',
    metalHex: '#C5C9C2',
  },
  'silver-titanium': {
    id: 'silver-titanium',
    name: 'Polished Silver',
    swatchHex: '#A7B0BA',
    swatchSecondaryHex: '#E3E7EC',
    frameHex: '#9BA5B0',
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
  },
  'midnight-blue': {
    id: 'midnight-blue',
    name: 'Midnight Sapphire',
    swatchHex: '#1D3557',
    frameHex: '#1C3454',
    secondaryHex: '#335785',
    metalHex: '#CFD6DF',
  },
  'two-tone': {
    id: 'two-tone',
    name: 'Two-Tone Espresso & Gold',
    swatchHex: '#2C221E',
    swatchSecondaryHex: '#D4AF61',
    frameHex: '#2A201C',
    secondaryHex: '#D5B062',
    metalHex: '#D5B062',
  },
}

export const LENS_OPTIONS: Record<LensTintId, LensOption> = {
  clear: {
    id: 'clear',
    name: 'Clear Crizal Anti-Glare',
    shortLabel: 'Clear HD',
    colorHex: '#EBF5FB',
    opacity: 0.14,
    sheenHex: '#88D4AB',
    description: 'Scratch-resistant, dust & smudge-repellent HD optical clarity.',
  },
  bluecut: {
    id: 'bluecut',
    name: 'Zero-Strain Study Blue-Cut',
    shortLabel: 'Blue-Cut',
    colorHex: '#CFE7FF',
    opacity: 0.24,
    sheenHex: '#60A5FA',
    description: 'Blocks harmful digital blue light for 10+ hr Kota study & laptop sessions.',
  },
  'green-g15': {
    id: 'green-g15',
    name: 'Classic G-15 Polarized Green',
    shortLabel: 'G-15 Sun',
    colorHex: '#213628',
    opacity: 0.82,
    sheenHex: '#A7F3D0',
    description: '100% UV400 protection built for bright Rajasthan afternoon sun.',
  },
  smoke: {
    id: 'smoke',
    name: 'Charcoal Polarized Smoke',
    shortLabel: 'Polarized Grey',
    colorHex: '#1F242D',
    opacity: 0.84,
    sheenHex: '#CBD5E1',
    description: 'Eliminates highway & water glare with true-to-life color balance.',
  },
  'amber-grad': {
    id: 'amber-grad',
    name: 'Warm Ristretto Gradient',
    shortLabel: 'Amber Tint',
    colorHex: '#59371E',
    opacity: 0.74,
    sheenHex: '#FDE68A',
    description: 'Soft warm amber sun tint with effortless indoor-to-outdoor comfort.',
  },
  'rose-tint': {
    id: 'rose-tint',
    name: ' editorial Rose Dusk',
    shortLabel: 'Rose Sun',
    colorHex: '#6D3B47',
    opacity: 0.68,
    sheenHex: '#FBCFE8',
    description: 'High-contrast fashion tint styled for golden-hour outings.',
  },
  photochromic: {
    id: 'photochromic',
    name: 'Transitions Sun-Adaptive',
    shortLabel: 'Photochromic',
    colorHex: '#2F3640',
    opacity: 0.56,
    sheenHex: '#93C5FD',
    description: 'Crystal clear indoors, automatically darkens outdoors under Kota sunlight.',
  },
}

export const EYEWEAR_CATALOG: EyewearProduct[] = [
  {
    id: 'rayban-rb7211',
    name: 'RB 7211 Architectural',
    brand: 'Ray-Ban',
    category: 'eyeglasses',
    shape: 'wayfarer',
    price: 7590,
    badge: 'Authorised Dealer Pick',
    fitWidth: 'Medium',
    measurements: '51–19–145 mm',
    recommendedFaces: ['Oval', 'Round', 'Heart'],
    colors: ['jet-black', 'ristretto-tortoise', 'midnight-blue', 'crystal-clear'],
    defaultLens: 'clear',
    description:
      'Authentic Ray-Ban lightweight sculpted frame available directly at Goswami Optics Kota. Engineered for featherlight all-day comfort and timeless authority.',
    highlights: [
      '100% Genuine Ray-Ban warranty card & case',
      'Custom prescription or Crizal Blue-Cut fitting',
      'Flexible micro-spring temple hinges',
    ],
  },
  {
    id: 'greyjack-trio-clip',
    name: 'Trio 3-Clip Magnetic',
    brand: 'Greyjack',
    category: 'clip-on',
    shape: 'wayfarer',
    price: 2490,
    mrp: 3290,
    badge: '3 Magnetic Clips Included',
    fitWidth: 'Medium',
    measurements: '52–18–142 mm',
    recommendedFaces: ['Oval', 'Round', 'Square', 'Heart'],
    colors: ['jet-black', 'olive-matte', 'midnight-blue', 'ristretto-tortoise'],
    defaultLens: 'clear',
    hasMagneticClip: true,
    description:
      'Kota’s #1 trending attachment eyewear on @goswamioptics2018. One featherlight TR-90 prescription frame with 3 snap-on magnetic clips: Polarized Black Sun, Night-Drive Yellow & Blue-Cut.',
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
    measurements: '49–20–140 mm',
    recommendedFaces: ['Square', 'Oval', 'Heart'],
    colors: ['ristretto-tortoise', 'crystal-clear', 'jet-black', 'sesame-tortoise', 'rose-water'],
    defaultLens: 'bluecut',
    description:
      'Available at our Indra Vihar Titan Showroom & Teachers Colony Flagship. Balanced vintage round Panto silhouette paired with zero-strain study lenses.',
    highlights: [
      'Weighs just 11 grams for 12-hour study comfort',
      'Keyhole bridge distributes weight evenly',
      'Ideal for single-vision & anti-fatigue powers',
    ],
  },
  {
    id: 'vogue-monica-cateye',
    name: 'Vo-5412 Upswept Edit',
    brand: 'Vogue Eyewear',
    category: 'sunglasses',
    shape: 'cateye',
    price: 3690,
    mrp: 4490,
    badge: 'New Arrival',
    fitWidth: 'Medium',
    measurements: '53–17–140 mm',
    recommendedFaces: ['Oval', 'Round', 'Square'],
    colors: ['ristretto-tortoise', 'jet-black', 'rose-water', 'sesame-tortoise'],
    defaultLens: 'amber-grad',
    description:
      'Sculpted hand-polished upswept cat-eye silhouette with UV400 gradient lenses. Can also be fitted with custom prescription sun tints in-store.',
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
    badge: 'Iconic UV400',
    fitWidth: 'Wide',
    measurements: '58–14–140 mm',
    recommendedFaces: ['Oval', 'Square', 'Heart'],
    colors: ['polished-gold', 'silver-titanium', 'jet-black', 'two-tone'],
    defaultLens: 'green-g15',
    description:
      'Crisp double-bridge surgical stainless metal aviator paired with crystal G-15 green lenses crafted for high-glare Rajasthan afternoons.',
    highlights: [
      'Soft adjustable medical-grade silicone nose pads',
      'G-15 optical tint maintains true natural color',
      'Available in Standard (55mm) & Large (58mm)',
    ],
  },
  {
    id: 'azzaro-clubmaster-brow',
    name: 'Heritage Browline 51',
    brand: 'Azzaro',
    category: 'eyeglasses',
    shape: 'clubmaster',
    price: 3190,
    mrp: 3890,
    badge: 'Doctors & Faculty Pick',
    fitWidth: 'Medium',
    measurements: '51–21–145 mm',
    recommendedFaces: ['Oval', 'Round', 'Oblong'],
    colors: ['two-tone', 'ristretto-tortoise', 'jet-black', 'olive-matte'],
    defaultLens: 'clear',
    description:
      'Favoured by GMC Kota doctors and senior educators. Rich acetate upper browline meets a refined gold/silver lower wire rim.',
    highlights: [
      'Progressive & bifocal lens friendly depth',
      'Custom nose-pad adjustability for zero slip',
      'Classic 1950s architectural poise',
    ],
  },
  {
    id: 'hashtag-hex-titanium',
    name: 'Hexa Minimalist Wire',
    brand: 'Hashtag',
    category: 'eyeglasses',
    shape: 'hexagon',
    price: 1590,
    mrp: 2100,
    badge: 'Trending in Talwandi',
    fitWidth: 'Narrow',
    measurements: '48–20–138 mm',
    recommendedFaces: ['Round', 'Oval', 'Heart'],
    colors: ['polished-gold', 'silver-titanium', 'rose-water', 'jet-black'],
    defaultLens: 'bluecut',
    description:
      'Crisp six-sided geometric rim in ultra-slim electroplated metal. Effortless modern minimalism that flatters softer facial contours.',
    highlights: [
      'Hypoallergenic nickel-free metal finish',
      'Includes Blue-Cut zero-glare coating package',
      'Featherweight feel with zero red nose marks',
    ],
  },
  {
    id: 'fastrack-cruiser-sun',
    name: 'Urban Polarized Square',
    brand: 'Fastrack',
    category: 'sunglasses',
    shape: 'wayfarer',
    price: 1890,
    mrp: 2299,
    badge: 'Daily Value Hit',
    fitWidth: 'Wide',
    measurements: '54–18–144 mm',
    recommendedFaces: ['Round', 'Oval', 'Oblong'],
    colors: ['olive-matte', 'jet-black', 'midnight-blue', 'sesame-tortoise'],
    defaultLens: 'smoke',
    description:
      'High-contrast polarized square sunglasses built for daily two-wheeler & highway commutes across Kota without harsh road glare.',
    highlights: [
      'True glare-cutting polarized TAC film',
      'Matte sweat-resistant sport temple tips',
      '1-year Fastrack manufacturer warranty',
    ],
  },
  {
    id: 'wolfeye-crystal-round',
    name: 'Lucent Crystal Round',
    brand: 'Wolf Eye',
    category: 'eyeglasses',
    shape: 'round',
    price: 1390,
    mrp: 1890,
    fitWidth: 'Medium',
    measurements: '50–19–142 mm',
    recommendedFaces: ['Square', 'Heart', 'Oval'],
    colors: ['crystal-clear', 'rose-water', 'olive-matte', 'sesame-tortoise'],
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
    name: 'Ranthambore Sun Clip',
    brand: 'X-Ford',
    category: 'clip-on',
    shape: 'clubmaster',
    price: 2190,
    mrp: 2790,
    badge: '2-in-1 Optical + Sun',
    fitWidth: 'Medium',
    measurements: '51–20–143 mm',
    recommendedFaces: ['Oval', 'Round', 'Heart'],
    colors: ['ristretto-tortoise', 'two-tone', 'jet-black'],
    defaultLens: 'clear',
    hasMagneticClip: true,
    description:
      'Switch from classroom or clinic indoor optical clarity to full polarized sunglasses outdoors in one snap with X-Ford’s browline clip system.',
    highlights: [
      'Custom magnetic sun shield matched to browline',
      'Saves cost of buying a second prescription sunglass',
      'Includes protective dual-compartment pouch',
    ],
  },
  {
    id: 'titan-hexa-sun',
    name: 'Solitaire Geometric Tint',
    brand: 'Titan',
    category: 'sunglasses',
    shape: 'hexagon',
    price: 2890,
    fitWidth: 'Narrow',
    measurements: '50–19–140 mm',
    recommendedFaces: ['Oval', 'Heart', 'Round'],
    colors: ['polished-gold', 'rose-water', 'silver-titanium'],
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
    measurements: 'BC 8.6 · DIA 14.2 mm',
    recommendedFaces: ['Oval', 'Round', 'Square', 'Heart'],
    colors: ['crystal-clear', 'sesame-tortoise', 'midnight-blue', 'olive-matte'],
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
    rightEye: { x: 0.580, y: 0.336 },
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
    leftEye: { x: 0.425, y: 0.290 },
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
