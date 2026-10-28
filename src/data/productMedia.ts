import type { EyewearProduct } from './goswamiData'

export interface ProductPhoto {
  id: string
  type: 'photo'
  src: string
  alt: string
  caption: string
  position?: string
}

export interface ProductVideo {
  id: string
  type: 'video'
  src: string
  poster: string
  alt: string
  caption: string
}

export type ProductMediaItem = ProductPhoto | ProductVideo

const photo = (
  id: string,
  src: string,
  alt: string,
  caption: string,
  position = 'center'
): ProductPhoto => ({ id, type: 'photo', src, alt, caption, position })

/**
 * Curated, locally hosted editorial imagery. These images show frame styling and
 * materials rather than claiming to be exact manufacturer SKU photography.
 */
const PRODUCT_MEDIA: Record<string, ProductMediaItem[]> = {
  'rayban-rb7211': [
    photo(
      'acetate-still-life',
      '/images/editorial-craft.jpg',
      'Tortoiseshell acetate, crystal acetate and gold-tone eyewear arranged on warm stone',
      'Acetate & metal · editorial still life',
      'center'
    ),
    photo(
      'everyday-frames',
      '/images/hero-editorial.jpg',
      'Two models wearing contemporary optical frames in warm afternoon light',
      'Everyday frames · on-model styling',
      '67% 40%'
    ),
  ],
  'greyjack-trio-clip': [
    photo(
      'magnetic-clip-styling',
      '/images/editorial-craft.jpg',
      'Several acetate and metal eyewear silhouettes photographed on sandstone',
      'Frame finishes · editorial still life'
    ),
    photo(
      'showroom-collection',
      '/images/store-showroom.jpg',
      'Warm wood and glass eyewear displays inside a Goswami Optics showroom',
      'The collection · in-store view'
    ),
  ],
  'titan-airflex-panto': [
    photo(
      'study-frame',
      '/images/editorial-bluecut.jpg',
      'A woman wearing slim round optical frames in a warm reading room',
      'Lightweight opticals · on-model styling',
      '35% 36%'
    ),
    photo(
      'crystal-and-acetate',
      '/images/editorial-craft.jpg',
      'Crystal-clear and tortoiseshell frames in a sunlit still life',
      'Materials & finish · editorial still life'
    ),
  ],
  'vogue-monica-cateye': [
    photo(
      'upswept-sun',
      '/images/hero-editorial.jpg',
      'A woman wearing tortoiseshell upswept sunglasses in golden-hour light',
      'Sculpted sun frames · on-model styling',
      '26% 42%'
    ),
    photo(
      'acetate-details',
      '/images/editorial-craft.jpg',
      'Glossy tortoiseshell acetate eyewear resting on warm stone',
      'Acetate details · editorial still life',
      '25% 40%'
    ),
  ],
  'rayban-desert-aviator': [
    photo(
      'aviator-sun',
      '/images/wild-2.jpg',
      'A man wearing classic metal aviator sunglasses in Kota sunlight',
      'Aviator frames · on-model styling',
      '54% 37%'
    ),
    photo(
      'metal-sun-still-life',
      '/images/editorial-craft.jpg',
      'Gold-tone aviator sunglasses arranged with acetate frames on sandstone',
      'Metal & sun lenses · editorial still life',
      '50% 77%'
    ),
  ],
  'azzaro-titanium-wire': [
    photo(
      'titanium-study',
      '/images/editorial-bluecut.jpg',
      'A woman wearing fine round metal optical frames beside a bright window',
      'Fine metal opticals · on-model styling',
      '35% 36%'
    ),
    photo(
      'metal-details',
      '/images/editorial-craft.jpg',
      'Delicate gold-tone eyewear photographed in direct warm light',
      'Metal details · editorial still life',
      '72% 77%'
    ),
  ],
  'fastrack-highway-navigator': [
    photo(
      'navigator-sun',
      '/images/wild-2.jpg',
      'A man wearing metal sun frames beneath the warm Kota sun',
      'Outdoor sun frames · on-model styling',
      '54% 37%'
    ),
    photo(
      'showroom-sun',
      '/images/store-showroom.jpg',
      'Sunlight falling across eyewear displays in a warm optical showroom',
      'Explore in person · showroom view'
    ),
  ],
  'hashtag-octagon-metal': [
    photo(
      'geometric-metal',
      '/images/editorial-bluecut.jpg',
      'A woman wearing slim metal optical frames in a softly lit reading room',
      'Architectural wire frames · on-model styling',
      '35% 36%'
    ),
    photo(
      'wire-frame-still-life',
      '/images/editorial-craft.jpg',
      'Gold-tone and fine-wire eyewear arranged on sunlit stone',
      'Wire details · editorial still life',
      '70% 78%'
    ),
  ],
  'wolfeye-crystal-clear': [
    photo(
      'crystal-frames',
      '/images/wild-1.jpg',
      'A woman wearing transparent crystal optical frames at a cafe',
      'Crystal acetate · on-model styling',
      '39% 34%'
    ),
    photo(
      'crystal-still-life',
      '/images/editorial-craft.jpg',
      'Crystal-clear acetate frames photographed against warm sandstone',
      'Crystal finish · editorial still life',
      '73% 45%'
    ),
  ],
  'xford-safari-sun': [
    photo(
      'browline-details',
      '/images/editorial-craft.jpg',
      'A warm still life of bold acetate and gold-tone eyewear',
      'Browline & metal details · editorial still life',
      '70% 77%'
    ),
    photo(
      'classic-frames',
      '/images/hero-editorial.jpg',
      'Two models wearing classic everyday eyewear in warm afternoon light',
      'Classic silhouettes · on-model styling',
      '70% 40%'
    ),
  ],
  'titan-hexa-sun': [
    photo(
      'geometric-sun',
      '/images/hero-editorial.jpg',
      'A woman wearing warm-toned geometric sunglasses in golden-hour light',
      'Geometric sun frames · on-model styling',
      '27% 43%'
    ),
    photo(
      'gold-still-life',
      '/images/editorial-craft.jpg',
      'Gold-tone sunglasses arranged across warm stone steps',
      'Polished metal · editorial still life',
      '50% 78%'
    ),
  ],
  'bausch-lomb-lacelle': [
    photo(
      'optical-care',
      '/images/store-showroom.jpg',
      'The eyewear and optometry area inside a Goswami Optics showroom',
      'Optical care · showroom view'
    ),
    photo(
      'lens-consultation',
      '/images/editorial-bluecut.jpg',
      'A woman wearing optical frames while reading beside a bright window',
      'Everyday vision · editorial styling',
      '35% 36%'
    ),
  ],
}

export function getProductMedia(product: EyewearProduct): ProductMediaItem[] {
  return (
    PRODUCT_MEDIA[product.id] ?? [
      photo(
        'editorial-frame',
        '/images/editorial-craft.jpg',
        'A warm editorial still life of acetate and metal eyewear',
        'Frame styling · editorial still life'
      ),
    ]
  )
}

export function getPrimaryProductPhoto(product: EyewearProduct): ProductPhoto {
  const media = getProductMedia(product)
  const firstPhoto = media.find((item): item is ProductPhoto => item.type === 'photo')
  return (
    firstPhoto ?? {
      id: 'fallback-frame',
      type: 'photo',
      src: '/images/editorial-craft.jpg',
      alt: 'A warm editorial still life of acetate and metal eyewear',
      caption: 'Frame styling · editorial still life',
    }
  )
}
