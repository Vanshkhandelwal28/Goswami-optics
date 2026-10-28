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
  caption = 'Studio product photograph · style reference',
  position = 'center'
): ProductPhoto => ({ id, type: 'photo', src, alt, caption, position })

/**
 * Each catalogue style now has its own locally hosted image. Generated studio
 * photographs are illustrative references, not manufacturer SKU imagery.
 */
const PRODUCT_MEDIA: Record<string, ProductMediaItem[]> = {
  'rayban-rb7211': [
    photo(
      'rb7211-studio',
      '/images/products/rayban-rb7211.jpg',
      'Dark espresso rectangular acetate eyeglasses with clear lenses on warm limestone'
    ),
  ],
  'greyjack-trio-clip': [
    photo(
      'trio-clip-studio',
      '/images/products/greyjack-trio-clip.jpg',
      'Black optical frame with three magnetic clip-on lenses arranged on pale sandstone',
      'Magnetic clip-on set · studio photograph'
    ),
  ],
  'titan-airflex-panto': [
    photo(
      'airflex-panto-studio',
      '/images/products/titan-airflex-panto.jpg',
      'Tortoiseshell panto eyeglasses with clear lenses beside a linen notebook',
      'Panto optical frame · studio photograph'
    ),
  ],
  'vogue-monica-cateye': [
    photo(
      'monica-cateye-studio',
      '/images/products/vogue-monica-cateye.jpg',
      'Glossy tortoiseshell upswept cat-eye sunglasses on muted terracotta silk',
      'Cat-eye sun frame · studio photograph'
    ),
  ],
  'rayban-desert-aviator': [
    photo(
      'desert-aviator-studio',
      '/images/products/rayban-desert-aviator.jpg',
      'Gold-tone double-bridge aviator sunglasses with deep green lenses on limestone',
      'Aviator sun frame · studio photograph'
    ),
  ],
  'azzaro-titanium-wire': [
    photo(
      'titanium-wire-studio',
      '/images/products/azzaro-titanium-wire.jpg',
      'Fine champagne-gold round titanium eyeglasses on ivory linen',
      'Lightweight metal frame · studio photograph'
    ),
  ],
  'fastrack-highway-navigator': [
    photo(
      'highway-navigator-studio',
      '/images/products/fastrack-highway-navigator.jpg',
      'Squared gunmetal navigator sunglasses with smoke lenses on dark olive slate',
      'Navigator sun frame · studio photograph'
    ),
  ],
  'hashtag-octagon-metal': [
    photo(
      'octagon-metal-studio',
      '/images/products/hashtag-octagon-metal.jpg',
      'Polished gold octagonal wire eyeglasses on warm pale stone',
      'Geometric wire frame · studio photograph'
    ),
  ],
  'wolfeye-crystal-clear': [
    photo(
      'crystal-round-studio',
      '/images/products/wolfeye-crystal-clear.jpg',
      'Transparent crystal round eyeglasses with visible core wire on creamy limestone',
      'Crystal optical frame · studio photograph'
    ),
  ],
  'xford-safari-sun': [
    photo(
      'safari-browline-studio',
      '/images/products/xford-safari-sun.jpg',
      'Tortoiseshell browline eyeglasses with a coordinating magnetic sun clip on sandstone',
      'Browline clip-on · studio photograph'
    ),
  ],
  'titan-hexa-sun': [
    photo(
      'hexa-sun-editorial',
      '/images/editorial-craft.jpg',
      'Gold-tone and acetate eyewear arranged on warm sandstone',
      'Geometric sun frame · editorial styling reference',
      '50% 78%'
    ),
  ],
  'bausch-lomb-lacelle': [
    photo(
      'contact-care-editorial',
      '/images/store-showroom.jpg',
      'Warm optical showroom with eyewear displays and an eye-care service counter',
      'Contact lens care · in-store styling reference'
    ),
  ],
}

export function getProductMedia(product: EyewearProduct): ProductMediaItem[] {
  return (
    PRODUCT_MEDIA[product.id] ?? [
      photo(
        'editorial-frame',
        '/images/editorial-craft.jpg',
        'A warm editorial still life of acetate and metal eyewear'
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
