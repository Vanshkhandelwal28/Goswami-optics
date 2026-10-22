import * as THREE from 'three'
import {
  COLOR_FINISHES,
  ColorFinishId,
  FrameShape,
  LENS_OPTIONS,
  LensTintId,
} from '../data/goswamiData'

export type MagneticClipStyle = 'none' | 'polarized-smoke' | 'night-yellow' | 'cobalt-mirror'

export interface EyewearRigOptions {
  shape: FrameShape
  colorId: ColorFinishId
  lensId: LensTintId
  sunlightAmount?: number
  clipStyle?: MagneticClipStyle
  includeHeadOccluder?: boolean
  includeFaceShadow?: boolean
}

export interface EyewearRig {
  root: THREE.Group
  leftTemplePivot: THREE.Group
  rightTemplePivot: THREE.Group
  clipGroup: THREE.Group
  dispose: () => void
}

type Pt2 = [number, number]

interface SilhouetteSpec {
  isWire: boolean
  isHalfRim: boolean
  hasDoubleBar: boolean
  hingeX: number
  hingeY: number
  lensCtrl: Pt2[] // Right-side inner lens aperture control points (CCW), outer span normalized so 2*hingeX = 1.344
  topBrowCtrl: Pt2[] // Right-side CW upper saddle -> flush outer lug top
  lugCheekCtrl: Pt2[] // Right-side CW lug face -> bottom cheek -> inner nasal wall -> saddle arch
}

/** Smooth closed Catmull-Rom spline with C1 continuity everywhere */
function catmullRomClosed(ctrl: Pt2[], samplesPerSeg = 10): THREE.Vector2[] {
  const n = ctrl.length
  const out: THREE.Vector2[] = []
  for (let i = 0; i < n; i++) {
    const p0 = ctrl[(i - 1 + n) % n]
    const p1 = ctrl[i]
    const p2 = ctrl[(i + 1) % n]
    const p3 = ctrl[(i + 2) % n]
    for (let j = 0; j < samplesPerSeg; j++) {
      const t = j / samplesPerSeg
      const t2 = t * t
      const t3 = t2 * t
      const x =
        0.5 *
        (2 * p1[0] +
          (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
      const y =
        0.5 *
        (2 * p1[1] +
          (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
      out.push(new THREE.Vector2(x, y))
    }
  }
  return out
}

/** Smooth open Catmull-Rom spline with exact endpoint interpolation */
function catmullRomOpen(ctrl: Pt2[], samplesPerSeg = 8): Pt2[] {
  const pts: Pt2[] = [ctrl[0], ...ctrl, ctrl[ctrl.length - 1]]
  const out: Pt2[] = []
  for (let i = 1; i < pts.length - 2; i++) {
    const p0 = pts[i - 1]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2]
    for (let j = 0; j < samplesPerSeg; j++) {
      const t = j / samplesPerSeg
      const t2 = t * t
      const t3 = t2 * t
      const x =
        0.5 *
        (2 * p1[0] +
          (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
      const y =
        0.5 *
        (2 * p1[1] +
          (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
      out.push([x, y])
    }
  }
  out.push(ctrl[ctrl.length - 1])
  return out
}

/**
 * 10 distinct millimeter-calibrated optical silhouettes (`y = 0` = pupil line, total width = `1.344` units).
 * Every silhouette has angled nasal walls hugging the human nose bridge and flush top-corner endpiece lugs.
 */
const SILHOUETTES: Record<FrameShape, SilhouetteSpec> = {
  // Warby Parker Brady signature slim architectural rectangle
  brady: {
    isWire: false,
    isHalfRim: false,
    hasDoubleBar: false,
    hingeX: 0.658,
    hingeY: 0.098,
    lensCtrl: [
      [0.086, 0.048],
      [0.22, 0.088],
      [0.43, 0.104],
      [0.576, 0.092],
      [0.59, 0.008],
      [0.566, -0.135],
      [0.478, -0.214],
      [0.32, -0.23],
      [0.172, -0.196],
      [0.114, -0.082],
    ],
    topBrowCtrl: [
      [0.0, 0.07],
      [0.078, 0.082],
      [0.235, 0.118],
      [0.45, 0.132],
      [0.608, 0.126],
      [0.668, 0.12],
    ],
    lugCheekCtrl: [
      [0.672, 0.114],
      [0.672, 0.072],
      [0.63, 0.052],
      [0.616, -0.005],
      [0.592, -0.146],
      [0.498, -0.238],
      [0.32, -0.256],
      [0.15, -0.216],
      [0.086, -0.086],
      [0.056, 0.022],
      [0.0, 0.038],
    ],
  },

  // Classic bold slanted Ray-Ban / Greyjack Wayfarer trapezoid
  wayfarer: {
    isWire: false,
    isHalfRim: false,
    hasDoubleBar: false,
    hingeX: 0.66,
    hingeY: 0.108,
    lensCtrl: [
      [0.092, 0.055],
      [0.235, 0.098],
      [0.445, 0.114],
      [0.582, 0.104],
      [0.584, 0.012],
      [0.542, -0.142],
      [0.452, -0.222],
      [0.312, -0.236],
      [0.18, -0.198],
      [0.122, -0.08],
    ],
    topBrowCtrl: [
      [0.0, 0.084],
      [0.086, 0.098],
      [0.245, 0.134],
      [0.46, 0.148],
      [0.615, 0.144],
      [0.672, 0.136],
    ],
    lugCheekCtrl: [
      [0.674, 0.128],
      [0.67, 0.076],
      [0.626, 0.054],
      [0.612, 0.004],
      [0.57, -0.156],
      [0.474, -0.248],
      [0.31, -0.266],
      [0.156, -0.222],
      [0.09, -0.084],
      [0.06, 0.028],
      [0.0, 0.044],
    ],
  },

  // Vintage Keyhole Scholar Round Panto (Titan Eye+ / Wolf Eye Crystal)
  round: {
    isWire: false,
    isHalfRim: false,
    hasDoubleBar: false,
    hingeX: 0.654,
    hingeY: 0.076,
    lensCtrl: [
      [0.118, 0.048],
      [0.232, 0.108],
      [0.388, 0.118],
      [0.528, 0.074],
      [0.568, -0.032],
      [0.54, -0.148],
      [0.442, -0.226],
      [0.318, -0.244],
      [0.198, -0.204],
      [0.132, -0.088],
    ],
    topBrowCtrl: [
      [0.0, 0.078],
      [0.082, 0.092],
      [0.232, 0.136],
      [0.395, 0.146],
      [0.556, 0.104],
      [0.668, 0.096],
    ],
    lugCheekCtrl: [
      [0.672, 0.09],
      [0.672, 0.052],
      [0.598, 0.038],
      [0.594, -0.038],
      [0.566, -0.16],
      [0.462, -0.25],
      [0.318, -0.27],
      [0.178, -0.224],
      [0.106, -0.092],
      [0.072, 0.02],
      [0.0, 0.044],
    ],
  },

  // Upswept Luxury Cat-Eye (Vogue VO-5412)
  cateye: {
    isWire: false,
    isHalfRim: false,
    hasDoubleBar: false,
    hingeX: 0.664,
    hingeY: 0.136,
    lensCtrl: [
      [0.096, 0.042],
      [0.225, 0.088],
      [0.435, 0.122],
      [0.586, 0.132],
      [0.582, 0.018],
      [0.532, -0.128],
      [0.438, -0.204],
      [0.308, -0.218],
      [0.184, -0.184],
      [0.122, -0.072],
    ],
    topBrowCtrl: [
      [0.0, 0.068],
      [0.084, 0.082],
      [0.24, 0.122],
      [0.465, 0.162],
      [0.625, 0.178],
      [0.682, 0.168],
    ],
    lugCheekCtrl: [
      [0.684, 0.156],
      [0.668, 0.098],
      [0.618, 0.056],
      [0.606, 0.006],
      [0.558, -0.144],
      [0.458, -0.23],
      [0.308, -0.246],
      [0.164, -0.206],
      [0.096, -0.078],
      [0.064, 0.02],
      [0.0, 0.036],
    ],
  },

  // Mid-Century Browline Clubmaster (Acetate Upper Brow + Slim Gold Wire Lower Rim!)
  clubmaster: {
    isWire: false,
    isHalfRim: true,
    hasDoubleBar: false,
    hingeX: 0.658,
    hingeY: 0.106,
    lensCtrl: [
      [0.094, 0.05],
      [0.228, 0.092],
      [0.438, 0.106],
      [0.576, 0.094],
      [0.584, 0.004],
      [0.554, -0.138],
      [0.466, -0.216],
      [0.318, -0.232],
      [0.178, -0.194],
      [0.118, -0.078],
    ],
    topBrowCtrl: [
      [0.0, 0.076],
      [0.084, 0.092],
      [0.24, 0.132],
      [0.455, 0.144],
      [0.612, 0.136],
      [0.672, 0.126],
    ],
    lugCheekCtrl: [
      [0.674, 0.118],
      [0.672, 0.078],
      [0.615, 0.062],
      [0.574, 0.088],
      [0.435, 0.1],
      [0.225, 0.086],
      [0.094, 0.046],
      [0.058, 0.036],
      [0.0, 0.046],
    ],
  },

  // Ray-Ban Teardrop Pilot Aviator (Double Metal Bridge + Silicone Pads)
  aviator: {
    isWire: true,
    isHalfRim: false,
    hasDoubleBar: true,
    hingeX: 0.662,
    hingeY: 0.096,
    lensCtrl: [
      [0.086, 0.066],
      [0.235, 0.104],
      [0.455, 0.108],
      [0.592, 0.088],
      [0.608, -0.012],
      [0.572, -0.156],
      [0.468, -0.248],
      [0.318, -0.262],
      [0.184, -0.204],
      [0.112, -0.068],
    ],
    topBrowCtrl: [],
    lugCheekCtrl: [],
  },

  // Azzaro Feather Beta-Titanium Round Wire
  'wire-round': {
    isWire: true,
    isHalfRim: false,
    hasDoubleBar: false,
    hingeX: 0.652,
    hingeY: 0.062,
    lensCtrl: [
      [0.122, 0.052],
      [0.242, 0.112],
      [0.402, 0.116],
      [0.538, 0.068],
      [0.576, -0.042],
      [0.544, -0.156],
      [0.442, -0.228],
      [0.322, -0.242],
      [0.204, -0.198],
      [0.138, -0.082],
    ],
    topBrowCtrl: [],
    lugCheekCtrl: [],
  },

  // Titan Solitaire Geometric Hexagon Wire
  hexagon: {
    isWire: true,
    isHalfRim: false,
    hasDoubleBar: false,
    hingeX: 0.654,
    hingeY: 0.072,
    lensCtrl: [
      [0.112, 0.054],
      [0.245, 0.104],
      [0.445, 0.106],
      [0.578, 0.052],
      [0.578, -0.072],
      [0.468, -0.208],
      [0.335, -0.224],
      [0.205, -0.204],
      [0.118, -0.082],
    ],
    topBrowCtrl: [],
    lugCheekCtrl: [],
  },

  // Fastrack Double-Bar Squared Navigator Wire
  navigator: {
    isWire: true,
    isHalfRim: false,
    hasDoubleBar: true,
    hingeX: 0.662,
    hingeY: 0.102,
    lensCtrl: [
      [0.092, 0.072],
      [0.245, 0.106],
      [0.465, 0.108],
      [0.594, 0.094],
      [0.596, -0.025],
      [0.572, -0.155],
      [0.482, -0.228],
      [0.322, -0.236],
      [0.172, -0.204],
      [0.108, -0.072],
    ],
    topBrowCtrl: [],
    lugCheekCtrl: [],
  },

  // Hashtag Campus Architectural Octagon Wire
  octagon: {
    isWire: true,
    isHalfRim: false,
    hasDoubleBar: false,
    hingeX: 0.65,
    hingeY: 0.068,
    lensCtrl: [
      [0.126, 0.048],
      [0.228, 0.106],
      [0.432, 0.106],
      [0.556, 0.048],
      [0.556, -0.086],
      [0.448, -0.208],
      [0.242, -0.208],
      [0.126, -0.086],
    ],
    topBrowCtrl: [],
    lugCheekCtrl: [],
  },
}

const tortoiseCache = new Map<string, THREE.CanvasTexture>()

function getTortoiseTexture(primaryHex: string, secondaryHex: string): THREE.CanvasTexture {
  const key = `${primaryHex}_${secondaryHex}`
  const cached = tortoiseCache.get(key)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = primaryHex
  ctx.fillRect(0, 0, 256, 256)

  let seed = 9187
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }

  for (let i = 0; i < 68; i++) {
    const x = rand() * 256
    const y = rand() * 256
    const rx = 12 + rand() * 34
    const ry = 7 + rand() * 20
    const grad = ctx.createRadialGradient(x, y, 1, x, y, rx)
    grad.addColorStop(0, secondaryHex)
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rand() * Math.PI)
    ctx.translate(-x, -y)
    ctx.globalAlpha = 0.42 + rand() * 0.36
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2.4, 2.4)
  tex.colorSpace = THREE.SRGBColorSpace
  tortoiseCache.set(key, tex)
  return tex
}

let cachedReflectionTex: THREE.CanvasTexture | null = null
function getLensReflectionTexture(): THREE.CanvasTexture {
  if (cachedReflectionTex) return cachedReflectionTex
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, 256, 256)

  ctx.save()
  ctx.translate(128, 128)
  ctx.rotate(-0.56)

  const g1 = ctx.createLinearGradient(-128, -95, 128, 95)
  g1.addColorStop(0.0, 'rgba(255,255,255,0)')
  g1.addColorStop(0.28, 'rgba(255,255,255,0)')
  g1.addColorStop(0.35, 'rgba(224,246,255,0.22)')
  g1.addColorStop(0.41, 'rgba(255,255,255,0.03)')
  g1.addColorStop(0.51, 'rgba(205,245,232,0.12)')
  g1.addColorStop(0.57, 'rgba(255,255,255,0)')
  g1.addColorStop(1.0, 'rgba(255,255,255,0)')

  ctx.fillStyle = g1
  ctx.fillRect(-180, -180, 360, 360)
  ctx.restore()

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  cachedReflectionTex = tex
  return tex
}

export function createStudioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envScene = new THREE.Scene()
  envScene.background = new THREE.Color('#DCE3EC')

  const topSoftbox = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 9),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
  )
  topSoftbox.position.set(0, 6.2, 2.2)
  topSoftbox.lookAt(0, 0, 0)
  envScene.add(topSoftbox)

  const warmSide = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshBasicMaterial({ color: 0xfff5e6, side: THREE.DoubleSide })
  )
  warmSide.position.set(-6.5, 2.2, 3.2)
  warmSide.lookAt(0, 0, 0)
  envScene.add(warmSide)

  const coolSide = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshBasicMaterial({ color: 0xe6f2ff, side: THREE.DoubleSide })
  )
  coolSide.position.set(6.5, 2.5, 2.8)
  coolSide.lookAt(0, 0, 0)
  envScene.add(coolSide)

  const darkFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24),
    new THREE.MeshBasicMaterial({ color: 0x1e2530, side: THREE.DoubleSide })
  )
  darkFloor.position.set(0, -5.5, 0)
  darkFloor.rotation.x = -Math.PI / 2
  envScene.add(darkFloor)

  const rt = pmrem.fromScene(envScene, 0.035)
  pmrem.dispose()
  topSoftbox.geometry.dispose()
  ;(topSoftbox.material as THREE.Material).dispose()
  warmSide.geometry.dispose()
  ;(warmSide.material as THREE.Material).dispose()
  coolSide.geometry.dispose()
  ;(coolSide.material as THREE.Material).dispose()
  darkFloor.geometry.dispose()
  ;(darkFloor.material as THREE.Material).dispose()
  return rt.texture
}

function getLensPoints(spec: SilhouetteSpec, side: 1 | -1): THREE.Vector2[] {
  const rightPts = catmullRomClosed(spec.lensCtrl, 10)
  if (side === 1) return rightPts
  return [...rightPts].reverse().map((p) => new THREE.Vector2(-p.x, p.y))
}

function buildUnifiedAcetateFrontShape(spec: SilhouetteSpec): THREE.Shape {
  const topBrow = catmullRomOpen(spec.topBrowCtrl, 8)
  const lugCheek = catmullRomOpen(spec.lugCheekCtrl, 8)
  const rightCW: Pt2[] = [...topBrow, ...lugCheek]

  const fullCW: THREE.Vector2[] = rightCW.map(([x, y]) => new THREE.Vector2(x, y))
  for (let i = rightCW.length - 2; i >= 1; i--) {
    fullCW.push(new THREE.Vector2(-rightCW[i][0], rightCW[i][1]))
  }

  const fullCCW = fullCW.reverse()
  const shape = new THREE.Shape(fullCCW)

  if (!spec.isHalfRim) {
    shape.holes.push(new THREE.Path(getLensPoints(spec, 1)))
    shape.holes.push(new THREE.Path(getLensPoints(spec, -1)))
  }

  return shape
}

function buildSoftFaceShadowTexture(spec: SilhouetteSpec): THREE.CanvasTexture {
  const W = 512
  const H = 256
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, W, H)

  const scale = 330
  const cx = W * 0.5
  const cy = H * 0.44

  ctx.save()
  ctx.filter = 'blur(8px)'
  ctx.strokeStyle = 'rgba(12, 17, 26, 0.34)'
  ctx.lineWidth = 8.5

  for (const side of [-1, 1] as const) {
    const pts = getLensPoints(spec, side)
    ctx.beginPath()
    pts.forEach((p, idx) => {
      const px = cx + p.x * scale
      const py = cy - p.y * scale + 5
      if (idx === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    })
    ctx.closePath()
    ctx.stroke()
  }

  // Soft nose saddle contact shadow
  ctx.beginPath()
  ctx.moveTo(cx - 28, cy - 12)
  ctx.quadraticCurveTo(cx, cy - 22, cx + 28, cy - 12)
  ctx.stroke()
  ctx.restore()

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export function buildEyewearMesh(options: EyewearRigOptions): EyewearRig {
  const {
    shape,
    colorId,
    lensId,
    sunlightAmount = 0.78,
    clipStyle = 'none',
    includeHeadOccluder = false,
    includeFaceShadow = false,
  } = options

  const spec = SILHOUETTES[shape] || SILHOUETTES.brady
  const finish = COLOR_FINISHES[colorId] || COLOR_FINISHES['sea-glass-grey']
  const lensCfg = LENS_OPTIONS[lensId] || LENS_OPTIONS.clear

  const disposables: { dispose: () => void }[] = []
  const track = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item)
    return item
  }

  const root = new THREE.Group()

  // 1. Optional invisible 3D cranial head occluder (clips rear temple arms naturally behind ears)
  if (includeHeadOccluder) {
    const occMat = track(
      new THREE.MeshBasicMaterial({
        colorWrite: false,
        depthWrite: true,
      })
    )
    const headGeo = track(new THREE.SphereGeometry(0.635, 32, 24))
    headGeo.scale(1.0, 1.24, 1.15)
    const headMesh = new THREE.Mesh(headGeo, occMat)
    headMesh.position.set(0, -0.02, -0.71)
    headMesh.renderOrder = -2
    root.add(headMesh)
  }

  // 2. Soft physical skin contact drop shadow right behind frame rims & nose bridge
  if (includeFaceShadow) {
    const shTex = track(buildSoftFaceShadowTexture(spec))
    const shGeo = track(new THREE.PlaneGeometry(512 / 330, 256 / 330))
    const shMat = track(
      new THREE.MeshBasicMaterial({
        map: shTex,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
      })
    )
    const shMesh = new THREE.Mesh(shGeo, shMat)
    shMesh.position.set(0, -0.045, -0.045)
    shMesh.renderOrder = 0
    root.add(shMesh)
  }

  // 3. Hand-tuned PBR Cellulose Acetate & Surgical Titanium Materials
  const tortoiseMap = finish.isTortoise
    ? getTortoiseTexture(finish.frameHex, finish.secondaryHex)
    : null

  const frameMat = track(
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(finish.isTortoise ? '#ffffff' : finish.frameHex),
      map: tortoiseMap,
      roughness: finish.isMetallic ? 0.24 : finish.isTranslucent ? 0.14 : 0.2,
      metalness: finish.isMetallic ? 0.88 : 0.02,
      clearcoat: finish.isMetallic ? 0.35 : 0.92,
      clearcoatRoughness: 0.1,
      transparent: Boolean(finish.isTranslucent),
      opacity: finish.isTranslucent ? finish.translucentOpacity ?? 0.56 : 1.0,
      ior: 1.5,
      envMapIntensity: finish.id === 'jet-black' ? 0.85 : 1.15,
    })
  )

  const metalMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(finish.isMetallic ? finish.frameHex : finish.metalHex),
      metalness: 0.9,
      roughness: 0.22,
      envMapIntensity: 1.25,
    })
  )

  // Ground crystal inner bevel highlight ring (authentic Warby Parker sea-glass / optical cut groove!)
  const bevelMat = track(
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(finish.isTranslucent ? '#F0F6FA' : finish.secondaryHex),
      roughness: 0.15,
      metalness: finish.isMetallic ? 0.75 : 0.05,
      transparent: true,
      opacity: finish.isTranslucent ? 0.62 : 0.45,
    })
  )

  // Compute optical / sunglass tint opacity accurately
  const isClearOptical = lensId === 'clear' || lensId === 'bluecut'
  const effectiveOpacity =
    lensId === 'photochromic'
      ? THREE.MathUtils.lerp(0.08, 0.8, sunlightAmount)
      : lensCfg.opacity

  const lensMat = track(
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(lensCfg.colorHex),
      transparent: true,
      opacity: effectiveOpacity,
      roughness: 0.05,
      metalness: lensCfg.isMirrored ? 0.55 : 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      envMapIntensity: isClearOptical ? 0.55 : lensCfg.isMirrored ? 1.85 : 1.05,
      depthWrite: !isClearOptical,
      side: THREE.DoubleSide,
    })
  )

  const sheenMat = track(
    new THREE.MeshBasicMaterial({
      map: getLensReflectionTexture(),
      transparent: true,
      opacity: isClearOptical ? 0.55 : 0.75,
      depthWrite: false,
    })
  )

  // 4. Sculpted Front Faceplate OR Delicate Titanium Wire Front
  if (!spec.isWire) {
    const frontShape = buildUnifiedAcetateFrontShape(spec)
    const frontGeo = track(
      new THREE.ExtrudeGeometry(frontShape, {
        depth: 0.036,
        bevelEnabled: true,
        bevelThickness: 0.0055,
        bevelSize: 0.0045,
        bevelSegments: 3,
        curveSegments: 24,
      })
    )
    frontGeo.translate(0, 0, -0.018)
    const frontMesh = new THREE.Mesh(frontGeo, frameMat)
    frontMesh.renderOrder = 2
    root.add(frontMesh)

    // Clubmaster lower thin metallic wire rims + silicone nose pads
    if (spec.isHalfRim) {
      for (const side of [-1, 1] as const) {
        const pts3 = getLensPoints(spec, side).map((p) => new THREE.Vector3(p.x, p.y, 0.0))
        const curve = new THREE.CatmullRomCurve3(pts3, true)
        const wireGeo = track(new THREE.TubeGeometry(curve, 72, 0.0075, 10, true))
        const wireMesh = new THREE.Mesh(wireGeo, metalMat)
        wireMesh.renderOrder = 2
        root.add(wireMesh)
      }
    }
  } else {
    // Ultra-delicate 1.5mm surgical wire rims + arched bridge + optional top aviator bar + silicone nose pads
    for (const side of [-1, 1] as const) {
      const pts3 = getLensPoints(spec, side).map((p) => new THREE.Vector3(p.x, p.y, 0.0))
      const curve = new THREE.CatmullRomCurve3(pts3, true)
      const wireGeo = track(new THREE.TubeGeometry(curve, 84, 0.0085, 10, true))
      const wireMesh = new THREE.Mesh(wireGeo, metalMat)
      wireMesh.renderOrder = 2
      root.add(wireMesh)

      // Delicate outer endpiece lug block flush at hinge
      const lugGeo = track(new THREE.BoxGeometry(0.055, 0.018, 0.022))
      const lugMesh = new THREE.Mesh(lugGeo, metalMat)
      lugMesh.position.set(side * (spec.hingeX - 0.018), spec.hingeY, -0.004)
      root.add(lugMesh)

      // Realistic translucent silicone nose pads on delicate S-wire arms
      const padGeo = track(new THREE.SphereGeometry(0.024, 14, 12))
      padGeo.scale(0.52, 1.0, 0.35)
      const padMat = track(
        new THREE.MeshPhysicalMaterial({
          color: 0xf4f7fa,
          transparent: true,
          opacity: 0.68,
          roughness: 0.15,
        })
      )
      const pad = new THREE.Mesh(padGeo, padMat)
      pad.position.set(side * 0.088, -0.015, -0.024)
      pad.rotation.z = side * 0.28
      root.add(pad)
    }

    // Main curved nasal bridge bar
    const bridgeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.098, 0.056, 0.004),
      new THREE.Vector3(0, 0.072, 0.014),
      new THREE.Vector3(0.098, 0.056, 0.004),
    ])
    root.add(new THREE.Mesh(track(new THREE.TubeGeometry(bridgeCurve, 24, 0.0085, 10, false)), metalMat))

    if (spec.hasDoubleBar) {
      const topBarCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.185, 0.106, 0.004),
        new THREE.Vector3(0, 0.112, 0.01),
        new THREE.Vector3(0.185, 0.106, 0.004),
      ])
      root.add(
        new THREE.Mesh(track(new THREE.TubeGeometry(topBarCurve, 24, 0.0075, 10, false)), metalMat)
      )
    }
  }

  // 5. Left & Right Meniscus Optical Lenses + Ground Crystal Inner Bevel + Soft Studio Diagonal Glint
  for (const side of [-1, 1] as const) {
    const contour = getLensPoints(spec, side)
    const lensShape = new THREE.Shape(contour)
    const lensGeo = track(new THREE.ShapeGeometry(lensShape, 24))

    // Bounding box UV normalization so diagonal AR reflection streak aligns cleanly across every lens shape
    lensGeo.computeBoundingBox()
    const bb = lensGeo.boundingBox!
    const uvAttr = lensGeo.attributes.uv
    for (let i = 0; i < uvAttr.count; i++) {
      const u = (uvAttr.getX(i) - bb.min.x) / Math.max(bb.max.x - bb.min.x, 0.001)
      const v = (uvAttr.getY(i) - bb.min.y) / Math.max(bb.max.y - bb.min.y, 0.001)
      uvAttr.setXY(i, u, v)
    }

    const lensMesh = new THREE.Mesh(lensGeo, lensMat)
    lensMesh.position.z = 0.002
    lensMesh.renderOrder = 3
    root.add(lensMesh)

    const sheenMesh = new THREE.Mesh(lensGeo, sheenMat)
    sheenMesh.position.z = 0.006
    sheenMesh.renderOrder = 4
    root.add(sheenMesh)

    // Subtle ground inner bevel ring
    const bevelPts = contour.map((p) => new THREE.Vector3(p.x, p.y, 0.008))
    const bevelCurve = new THREE.CatmullRomCurve3(bevelPts, true)
    const bevelGeo = track(new THREE.TubeGeometry(bevelCurve, 72, 0.0038, 8, true))
    const bevelMesh = new THREE.Mesh(bevelGeo, bevelMat)
    bevelMesh.renderOrder = 3
    root.add(bevelMesh)

    // Subtle signature micro rivet pins on acetate endpieces
    if (!spec.isWire) {
      const pinGeo = track(new THREE.SphereGeometry(0.0055, 10, 8))
      pinGeo.scale(1.6, 0.7, 0.5)
      const pin = new THREE.Mesh(pinGeo, metalMat)
      pin.position.set(side * (spec.hingeX - 0.026), spec.hingeY - 0.004, 0.023)
      pin.renderOrder = 3
      root.add(pin)
    }
  }

  // 6. Recessed Hinges & Anatomically Angled Temple Arms (extending slightly UP onto ear helix + wrapped behind ears!)
  const createTemplePivot = (side: -1 | 1): THREE.Group => {
    const pivot = new THREE.Group()
    pivot.position.set(side * (spec.hingeX - 0.012), spec.hingeY - 0.006, -0.022)

    // Compact 5-barrel metal hinge strictly recessed behind front lug
    const hingeGeo = track(new THREE.BoxGeometry(0.016, 0.024, 0.024))
    const hingeMesh = new THREE.Mesh(hingeGeo, metalMat)
    hingeMesh.position.set(0, 0, -0.01)
    pivot.add(hingeMesh)

    // Anatomically true temple curve: rises gently onto ear crest (-Z = -0.95) then curves cleanly behind ear (-Z = -1.36)
    const templeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, -0.012),
      new THREE.Vector3(side * 0.012, 0.014, -0.45),
      new THREE.Vector3(side * 0.014, 0.024, -0.94),
      new THREE.Vector3(side * 0.004, -0.022, -1.18),
      new THREE.Vector3(-side * 0.018, -0.105, -1.36),
    ])

    const radius = spec.isWire ? 0.0075 : 0.0145
    const templeGeo = track(new THREE.TubeGeometry(templeCurve, 44, radius, 10, false))
    if (!spec.isWire) {
      // Flatten cross-section horizontally into authentic flat-slab hand-carved acetate temple arm!
      templeGeo.scale(0.42, 1.28, 1.0)
    }
    const templeMesh = new THREE.Mesh(templeGeo, spec.isWire ? metalMat : frameMat)
    templeMesh.renderOrder = 1
    pivot.add(templeMesh)

    // Visible internal engraved steel corewire inside translucent Sea Glass Grey / Crystal Clear / Rose Water temples!
    if (!spec.isWire && finish.isTranslucent) {
      const coreCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, -0.02),
        new THREE.Vector3(side * 0.005, 0.006, -0.45),
        new THREE.Vector3(side * 0.006, 0.01, -0.96),
      ])
      const coreGeo = track(new THREE.TubeGeometry(coreCurve, 24, 0.0042, 8, false))
      const coreMesh = new THREE.Mesh(coreGeo, metalMat)
      coreMesh.renderOrder = 1
      pivot.add(coreMesh)
    }

    root.add(pivot)
    return pivot
  }

  const leftTemplePivot = createTemplePivot(-1)
  const rightTemplePivot = createTemplePivot(1)

  // 7. Greyjack / X-Ford Magnetic Snap-On Polarized Sun Clip
  const clipGroup = new THREE.Group()
  clipGroup.position.z = 0.048
  if (clipStyle !== 'none') {
    const clipColors: Record<
      Exclude<MagneticClipStyle, 'none'>,
      { hex: string; opacity: number; mirror: boolean }
    > = {
      'polarized-smoke': { hex: '#141920', opacity: 0.86, mirror: false },
      'night-yellow': { hex: '#D9A726', opacity: 0.58, mirror: false },
      'cobalt-mirror': { hex: '#164B96', opacity: 0.88, mirror: true },
    }
    const cc = clipColors[clipStyle]

    const clipRimMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x16191e,
        roughness: 0.28,
        metalness: 0.35,
      })
    )
    const clipLensMat = track(
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(cc.hex),
        transparent: true,
        opacity: cc.opacity,
        roughness: 0.05,
        metalness: cc.mirror ? 0.62 : 0.05,
        clearcoat: 1.0,
        side: THREE.DoubleSide,
      })
    )

    for (const side of [-1, 1] as const) {
      const contour = getLensPoints(spec, side)
      const cLensGeo = track(new THREE.ShapeGeometry(new THREE.Shape(contour), 20))
      const cLens = new THREE.Mesh(cLensGeo, clipLensMat)
      cLens.renderOrder = 5
      clipGroup.add(cLens)

      const rimPts = contour.map((p) => new THREE.Vector3(p.x, p.y, 0.004))
      const cRimGeo = track(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rimPts, true), 64, 0.0085, 8, true)
      )
      clipGroup.add(new THREE.Mesh(cRimGeo, clipRimMat))
    }

    const clipBridge = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.095, 0.066, 0.008),
      new THREE.Vector3(0, 0.08, 0.016),
      new THREE.Vector3(0.095, 0.066, 0.008),
    ])
    clipGroup.add(
      new THREE.Mesh(track(new THREE.TubeGeometry(clipBridge, 16, 0.009, 8, false)), clipRimMat)
    )
    root.add(clipGroup)
  }

  return {
    root,
    leftTemplePivot,
    rightTemplePivot,
    clipGroup,
    dispose: () => {
      for (const item of disposables) {
        item.dispose()
      }
    },
  }
}
