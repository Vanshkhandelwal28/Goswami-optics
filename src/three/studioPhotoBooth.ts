import * as THREE from 'three'
import { ColorFinishId, FrameShape, LensTintId } from '../data/goswamiData'
import {
  buildEyewearMesh,
  createStudioEnvironment,
  MagneticClipStyle,
} from './buildEyewearMesh'

export interface StudioShotPair {
  front: string
  angle: string
}

const shotCache = new Map<string, StudioShotPair>()
let boothInstance: {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  shadowPlane: THREE.Mesh
} | null = null

function getOrCreateBooth() {
  if (boothInstance) return boothInstance

  const W = 680
  const H = 390
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(1)
  renderer.setSize(W, H)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.12

  const scene = new THREE.Scene()
  scene.environment = createStudioEnvironment(renderer)

  scene.add(new THREE.AmbientLight(0xffffff, 0.72))
  const key = new THREE.DirectionalLight(0xffffff, 1.65)
  key.position.set(2.2, 3.6, 4.0)
  scene.add(key)

  const rim = new THREE.DirectionalLight(0xfff2df, 0.85)
  rim.position.set(-2.8, 2.0, -1.8)
  scene.add(rim)

  // Soft studio ground sweep shadow
  const sc = document.createElement('canvas')
  sc.width = 256
  sc.height = 128
  const ctx = sc.getContext('2d')!
  const g = ctx.createRadialGradient(128, 64, 6, 128, 64, 118)
  g.addColorStop(0, 'rgba(15, 23, 42, 0.20)')
  g.addColorStop(0.55, 'rgba(15, 23, 42, 0.06)')
  g.addColorStop(1, 'rgba(15, 23, 42, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 128)

  const shadowTex = new THREE.CanvasTexture(sc)
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.65, 0.55),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    })
  )
  shadowPlane.rotation.x = -Math.PI / 2
  shadowPlane.position.set(0, -0.255, -0.1)
  scene.add(shadowPlane)

  const camera = new THREE.PerspectiveCamera(26, W / H, 0.1, 20)

  boothInstance = { renderer, scene, camera, shadowPlane }
  return boothInstance
}

export function renderStudioShots(params: {
  shape: FrameShape
  colorId: ColorFinishId
  lensId: LensTintId
  clipStyle?: MagneticClipStyle
}): StudioShotPair {
  const clip = params.clipStyle || 'none'
  const key = `${params.shape}::${params.colorId}::${params.lensId}::${clip}`
  const hit = shotCache.get(key)
  if (hit) return hit

  const { renderer, scene, camera } = getOrCreateBooth()
  const rig = buildEyewearMesh({
    shape: params.shape,
    colorId: params.colorId,
    lensId: params.lensId,
    clipStyle: clip,
  })
  scene.add(rig.root)

  // Shot 1: Crisp Warby Parker straight-on catalog studio shot (with realistic inward temple taper)
  rig.leftTemplePivot.rotation.y = -0.10
  rig.rightTemplePivot.rotation.y = 0.10
  rig.root.position.set(0, 0.028, 0)
  rig.root.rotation.set(0.055, -0.045, 0)
  camera.position.set(0, 0.0, 2.02)
  camera.lookAt(0, -0.015, 0)
  renderer.render(scene, camera)
  const front = renderer.domElement.toDataURL('image/png')

  // Shot 2: Warby Parker / Lenskart signature 3/4 side-temple hover photograph
  rig.leftTemplePivot.rotation.y = -0.03
  rig.rightTemplePivot.rotation.y = 0.03
  rig.root.position.set(0.06, 0.02, 0.24)
  rig.root.rotation.set(0.15, -0.56, 0.015)
  camera.position.set(0, 0.02, 2.38)
  camera.lookAt(0, -0.02, -0.18)
  renderer.render(scene, camera)
  const angle = renderer.domElement.toDataURL('image/png')

  scene.remove(rig.root)
  rig.dispose()

  const pair = { front, angle }
  shotCache.set(key, pair)
  return pair
}
