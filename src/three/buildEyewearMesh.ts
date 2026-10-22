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
  sunlightAmount?: number // 0..1 for photochromic transition
  clipStyle?: MagneticClipStyle
  includeHeadOccluder?: boolean
}

export interface EyewearRig {
  root: THREE.Group
  leftTemplePivot: THREE.Group
  rightTemplePivot: THREE.Group
  clipGroup: THREE.Group
  dispose: () => void
}

let cachedTortoiseLight: THREE.CanvasTexture | null = null
let cachedTortoiseDark: THREE.CanvasTexture | null = null

function getTortoiseTexture(variant: 'dark' | 'sesame'): THREE.CanvasTexture {
  if (variant === 'dark' && cachedTortoiseLight) return cachedTortoiseLight
  if (variant === 'sesame' && cachedTortoiseDark) return cachedTortoiseDark

  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = variant === 'dark' ? '#2A1508' : '#5B3E24'
  ctx.fillRect(0, 0, 256, 256)

  const patches =
    variant === 'dark'
      ? ['#9B622B', '#C98943', '#49250F', '#DDA059', '#1D0D05']
      : ['#C9A372', '#E2C399', '#7C5836', '#B38856', '#46301B']

  let seed = variant === 'dark' ? 42 : 108
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }

  for (let i = 0; i < 95; i++) {
    const x = rand() * 256
    const y = rand() * 256
    const rx = 10 + rand() * 34
    const ry = 7 + rand() * 22
    const rot = rand() * Math.PI
    const color = patches[Math.floor(rand() * patches.length)]
    const grad = ctx.createRadialGradient(x, y, 1, x, y, rx)
    grad.addColorStop(0, color)
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rot)
    ctx.scale(1, ry / rx)
    ctx.fillStyle = grad
    ctx.globalAlpha = 0.72
    ctx.beginPath()
    ctx.arc(0, 0, rx, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1.4, 1.4)
  tex.colorSpace = THREE.SRGBColorSpace

  if (variant === 'dark') cachedTortoiseLight = tex
  else cachedTortoiseDark = tex
  return tex
}

export function createStudioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envScene = new THREE.Scene()
  envScene.background = new THREE.Color('#E9EEF4')

  const topSoftbox = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )
  topSoftbox.position.set(0, 5, 2)
  topSoftbox.lookAt(0, 0, 0)
  envScene.add(topSoftbox)

  const warmSide = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.MeshBasicMaterial({ color: 0xfff3dd })
  )
  warmSide.position.set(5, 2, 4)
  warmSide.lookAt(0, 0, 0)
  envScene.add(warmSide)

  const coolFill = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.MeshBasicMaterial({ color: 0xdbeafe })
  )
  coolFill.position.set(-5, 1, 3)
  coolFill.lookAt(0, 0, 0)
  envScene.add(coolFill)

  const texture = pmrem.fromScene(envScene, 0.04).texture
  pmrem.dispose()
  topSoftbox.geometry.dispose()
  ;(topSoftbox.material as THREE.Material).dispose()
  warmSide.geometry.dispose()
  ;(warmSide.material as THREE.Material).dispose()
  coolFill.geometry.dispose()
  ;(coolFill.material as THREE.Material).dispose()
  return texture
}

function createContourPoints(
  shape: FrameShape,
  scale: number,
  side: 1 | -1
): THREE.Vector2[] {
  const pts: THREE.Vector2[] = []
  const N = 48

  if (shape === 'hexagon') {
    const raw: [number, number][] = [
      [-0.27, 0.2],
      [-0.32, 0.02],
      [-0.22, -0.2],
      [0.24, -0.2],
      [0.33, 0.03],
      [0.24, 0.2],
    ]
    for (let i = 0; i < raw.length; i++) {
      const a = raw[i]
      const b = raw[(i + 1) % raw.length]
      for (let s = 0; s < 6; s++) {
        const t = s / 6
        const x = THREE.MathUtils.lerp(a[0], b[0], t) * scale * side
        const y = THREE.MathUtils.lerp(a[1], b[1], t) * scale
        pts.push(new THREE.Vector2(x, y))
      }
    }
    return pts
  }

  for (let i = 0; i < N; i++) {
    const theta = (i / N) * Math.PI * 2
    const c = Math.cos(theta)
    const s = Math.sin(theta)
    let x = 0
    let y = 0

    if (shape === 'round') {
      x = 0.258 * c
      y = 0.238 * s + (s > 0 ? 0.012 * s : 0)
    } else if (shape === 'wayfarer') {
      const powC = Math.sign(c) * Math.pow(Math.abs(c), 0.72)
      const powS = Math.sign(s) * Math.pow(Math.abs(s), 0.76)
      x = 0.295 * powC + (s > 0 ? 0.022 * c : -0.02 * Math.abs(c))
      y = 0.225 * powS
    } else if (shape === 'cateye') {
      const powC = Math.sign(c) * Math.pow(Math.abs(c), 0.78)
      const powS = Math.sign(s) * Math.pow(Math.abs(s), 0.82)
      const outerLift =
        c > 0 && s > -0.2 ? 0.085 * Math.pow(c, 1.4) * Math.max(0, s + 0.35) : 0
      const outerFlare = c > 0 && s > 0 ? 0.042 * c * s : 0
      x = 0.29 * powC + outerFlare
      y = 0.215 * powS + outerLift
    } else if (shape === 'aviator') {
      const topFlatten = s > 0 ? 0.76 : 1.08
      const teardrop = s < 0 ? 0.045 * Math.max(0, c + 0.3) * Math.abs(s) : 0
      x = 0.305 * c
      y = 0.245 * s * topFlatten - teardrop
    } else {
      // clubmaster
      const powC = Math.sign(c) * Math.pow(Math.abs(c), 0.78)
      const powS = Math.sign(s) * Math.pow(Math.abs(s), 0.82)
      x = 0.285 * powC
      y = 0.22 * powS
    }

    pts.push(new THREE.Vector2(x * scale * side, y * scale))
  }

  return pts
}

function makeRimShape(shape: FrameShape, side: 1 | -1, rimWidthFactor: number): THREE.Shape {
  const outerPts = createContourPoints(shape, 1 + rimWidthFactor, side)
  if (side === -1) outerPts.reverse()
  const rimShape = new THREE.Shape(outerPts)

  const innerPts = createContourPoints(shape, 1 - rimWidthFactor * 0.42, side)
  if (side === -1) innerPts.reverse()
  const holePath = new THREE.Path(innerPts)
  rimShape.holes.push(holePath)

  return rimShape
}

function makeLensShape(shape: FrameShape, side: 1 | -1): THREE.Shape {
  const pts = createContourPoints(shape, 0.985, side)
  if (side === -1) pts.reverse()
  return new THREE.Shape(pts)
}

export function buildEyewearMesh(options: EyewearRigOptions): EyewearRig {
  const {
    shape,
    colorId,
    lensId,
    sunlightAmount = 0.75,
    clipStyle = 'none',
    includeHeadOccluder = false,
  } = options

  const finish = COLOR_FINISHES[colorId] || COLOR_FINISHES['jet-black']
  const lensDef = LENS_OPTIONS[lensId] || LENS_OPTIONS.clear

  const disposables: { dispose: () => void }[] = []
  const track = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item)
    return item
  }

  const root = new THREE.Group()

  const isThinMetal = shape === 'aviator' || shape === 'hexagon'
  const isClubmaster = shape === 'clubmaster'

  const acetateMat = track(
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(finish.isTortoise ? '#FFFFFF' : finish.frameHex),
      map: finish.isTortoise
        ? getTortoiseTexture(colorId === 'sesame-tortoise' ? 'sesame' : 'dark')
        : null,
      metalness: finish.isMetallic ? 0.86 : 0.06,
      roughness: finish.isMetallic ? 0.22 : finish.isTranslucent ? 0.12 : 0.2,
      clearcoat: finish.isMetallic ? 0.35 : 0.9,
      clearcoatRoughness: 0.14,
      transparent: Boolean(finish.isTranslucent),
      opacity: finish.isTranslucent ? 0.65 : 1.0,
      ior: 1.52,
      side: finish.isTranslucent ? THREE.FrontSide : THREE.DoubleSide,
    })
  )

  const metalAccentMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(finish.metalHex),
      metalness: 0.9,
      roughness: 0.2,
      side: THREE.DoubleSide,
    })
  )

  let finalLensColor = new THREE.Color(lensDef.colorHex)
  let finalLensOpacity = lensDef.opacity

  if (lensId === 'photochromic') {
    const indoor = new THREE.Color('#EAF4FC')
    const outdoor = new THREE.Color('#202630')
    finalLensColor = indoor.lerp(outdoor, THREE.MathUtils.clamp(sunlightAmount, 0, 1))
    finalLensOpacity = THREE.MathUtils.lerp(
      0.14,
      0.85,
      THREE.MathUtils.clamp(sunlightAmount, 0, 1)
    )
  }

  const lensMat = track(
    new THREE.MeshPhysicalMaterial({
      color: finalLensColor,
      metalness: 0.05,
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 0.92,
      transparent: true,
      opacity: finalLensOpacity,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  )

  const sheenColor = new THREE.Color(lensDef.sheenHex)
  const lensEdgeMat = track(
    new THREE.MeshBasicMaterial({
      color: sheenColor,
      transparent: true,
      opacity: lensDef.opacity < 0.4 ? 0.16 : 0.08,
      depthWrite: false,
    })
  )

  const eyeCenterOffset = shape === 'aviator' ? 0.405 : shape === 'round' ? 0.362 : 0.385
  const rimWidth = isThinMetal ? 0.058 : isClubmaster ? 0.052 : 0.118
  const rimDepth = isThinMetal || isClubmaster ? 0.032 : 0.068

  // Exact outer & inner X extents computed directly from shape contour
  const positiveOuterContour = createContourPoints(shape, 1 + rimWidth, 1)
  const maxLocalOuterX = Math.max(...positiveOuterContour.map((p) => p.x))
  const minLocalOuterX = Math.min(...positiveOuterContour.map((p) => p.x))

  // Exact world X where outer hinge & inner nose bridge meet the solid rim
  const hingeMountAbsX = eyeCenterOffset + maxLocalOuterX + (isThinMetal ? 0.006 : 0.01)
  const bridgeAnchorAbsX = Math.max(0.055, eyeCenterOffset + minLocalOuterX + 0.014)

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 1,
    depth: rimDepth,
    bevelEnabled: true,
    bevelThickness: isThinMetal ? 0.011 : 0.022,
    bevelSize: isThinMetal ? 0.009 : 0.017,
    bevelSegments: 4,
    curveSegments: 32,
  }

  const lensExtrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 1,
    depth: 0.016,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.005,
    bevelSegments: 2,
    curveSegments: 32,
  }

  ;([1, -1] as const).forEach((side) => {
    const rimGeo = track(
      new THREE.ExtrudeGeometry(makeRimShape(shape, side, rimWidth), extrudeSettings)
    )
    rimGeo.translate(0, 0, -rimDepth * 0.5)
    const rimMesh = new THREE.Mesh(
      rimGeo,
      isClubmaster ? metalAccentMat : acetateMat
    )
    rimMesh.position.x = side * eyeCenterOffset
    rimMesh.rotation.y = -side * 0.05
    root.add(rimMesh)

    if (isClubmaster) {
      const browCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * (eyeCenterOffset - 0.25), 0.145, 0.012),
        new THREE.Vector3(side * (eyeCenterOffset - 0.06), 0.215, 0.022),
        new THREE.Vector3(side * (eyeCenterOffset + 0.18), 0.212, 0.02),
        new THREE.Vector3(side * hingeMountAbsX, 0.155, 0.005),
      ])
      const browGeo = track(new THREE.TubeGeometry(browCurve, 28, 0.036, 12, false))
      browGeo.scale(1, 0.85, 1.15)
      root.add(new THREE.Mesh(browGeo, acetateMat))
    }

    const lensGeo = track(
      new THREE.ExtrudeGeometry(makeLensShape(shape, side), lensExtrudeSettings)
    )
    lensGeo.translate(0, 0, -0.005)
    const lensMesh = new THREE.Mesh(lensGeo, lensMat)
    lensMesh.position.x = side * eyeCenterOffset
    lensMesh.rotation.y = -side * 0.05
    lensMesh.renderOrder = 2
    root.add(lensMesh)

    const glintGeo = track(new THREE.PlaneGeometry(0.11, 0.36))
    const glintMesh = new THREE.Mesh(glintGeo, lensEdgeMat)
    glintMesh.position.set(side * eyeCenterOffset - 0.06, 0.01, 0.018)
    glintMesh.rotation.z = -0.42
    glintMesh.renderOrder = 3
    root.add(glintMesh)

    // Endpiece double rivets positioned cleanly on outer rim lug
    const rivetGeo = track(new THREE.CylinderGeometry(0.01, 0.01, 0.018, 12))
    rivetGeo.rotateX(Math.PI / 2)
    const r1 = new THREE.Mesh(rivetGeo, metalAccentMat)
    r1.position.set(side * (hingeMountAbsX - 0.032), 0.135, rimDepth * 0.56)
    const r2 = r1.clone()
    r2.position.x = side * (hingeMountAbsX - 0.012)
    root.add(r1, r2)

    if (isThinMetal || isClubmaster) {
      const padArmCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * bridgeAnchorAbsX, 0.04, -0.01),
        new THREE.Vector3(side * 0.085, -0.02, -0.055),
      ])
      const padArmGeo = track(new THREE.TubeGeometry(padArmCurve, 10, 0.008, 8, false))
      root.add(new THREE.Mesh(padArmGeo, metalAccentMat))

      const padGeo = track(new THREE.SphereGeometry(0.025, 12, 12))
      padGeo.scale(0.55, 1.35, 0.45)
      const padMat = track(
        new THREE.MeshPhysicalMaterial({
          color: 0xf8fafc,
          roughness: 0.25,
          transparent: true,
          opacity: 0.78,
        })
      )
      const pad = new THREE.Mesh(padGeo, padMat)
      pad.position.set(side * 0.08, -0.028, -0.062)
      pad.rotation.z = side * 0.28
      root.add(pad)
    }
  })

  // Center Nose Bridge anchored strictly inside left & right solid rim walls
  const bridgeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-bridgeAnchorAbsX, 0.082, 0.004),
    new THREE.Vector3(0, 0.128, 0.026),
    new THREE.Vector3(bridgeAnchorAbsX, 0.082, 0.004),
  ])
  const bridgeRadius = isThinMetal || isClubmaster ? 0.016 : 0.032
  const bridgeGeo = track(new THREE.TubeGeometry(bridgeCurve, 20, bridgeRadius, 12, false))
  root.add(
    new THREE.Mesh(bridgeGeo, isThinMetal || isClubmaster ? metalAccentMat : acetateMat)
  )

  if (shape === 'aviator') {
    const topBarCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.2, 0.192, 0.008),
      new THREE.Vector3(0, 0.202, 0.022),
      new THREE.Vector3(0.2, 0.192, 0.008),
    ])
    const topBarGeo = track(new THREE.TubeGeometry(topBarCurve, 16, 0.012, 10, false))
    root.add(new THREE.Mesh(topBarGeo, metalAccentMat))
  }

  // Hinged Temple Arms
  const createTemplePivot = (side: 1 | -1): THREE.Group => {
    const pivot = new THREE.Group()
    pivot.position.set(side * hingeMountAbsX, 0.132, -0.015)

    const hingeGeo = track(new THREE.BoxGeometry(0.036, 0.05, 0.044))
    const hinge = new THREE.Mesh(hingeGeo, metalAccentMat)
    hinge.position.set(-side * 0.01, 0, -0.012)
    pivot.add(hinge)

    const templeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(side * 0.01, -0.005, -0.45),
      new THREE.Vector3(side * 0.006, -0.012, -0.92),
      new THREE.Vector3(-side * 0.022, -0.075, -1.16),
      new THREE.Vector3(-side * 0.042, -0.175, -1.27),
    ])
    const armRadius = isThinMetal ? 0.014 : 0.025
    const armGeo = track(new THREE.TubeGeometry(templeCurve, 32, armRadius, 10, false))
    armGeo.scale(0.65, 1.25, 1)
    pivot.add(new THREE.Mesh(armGeo, acetateMat))

    if (finish.isTranslucent) {
      const wireCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, -0.02),
        new THREE.Vector3(side * 0.006, -0.005, -0.45),
        new THREE.Vector3(side * 0.004, -0.012, -0.92),
        new THREE.Vector3(-side * 0.014, -0.07, -1.14),
      ])
      const wireGeo = track(new THREE.TubeGeometry(wireCurve, 20, 0.007, 8, false))
      pivot.add(new THREE.Mesh(wireGeo, metalAccentMat))
    }

    return pivot
  }

  const leftTemplePivot = createTemplePivot(1)
  const rightTemplePivot = createTemplePivot(-1)
  root.add(leftTemplePivot, rightTemplePivot)

  // Greyjack Magnetic Clip-On Front Shield
  const clipGroup = new THREE.Group()
  clipGroup.visible = clipStyle !== 'none'
  clipGroup.position.z = 0.052

  if (clipStyle !== 'none') {
    const clipFrameMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x16191f,
        metalness: 0.45,
        roughness: 0.28,
        side: THREE.DoubleSide,
      })
    )

    const clipLensHex =
      clipStyle === 'night-yellow'
        ? '#EAB308'
        : clipStyle === 'cobalt-mirror'
          ? '#0284C7'
          : '#141920'

    const clipLensMat = track(
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(clipLensHex),
        metalness: clipStyle === 'cobalt-mirror' ? 0.55 : 0.08,
        roughness: 0.06,
        clearcoat: 1,
        transparent: true,
        opacity: clipStyle === 'night-yellow' ? 0.66 : 0.86,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    )

    const slimSettings: THREE.ExtrudeGeometryOptions = {
      steps: 1,
      depth: 0.018,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.006,
      bevelSegments: 2,
      curveSegments: 28,
    }

    ;([1, -1] as const).forEach((side) => {
      const cRimGeo = track(
        new THREE.ExtrudeGeometry(makeRimShape(shape, side, 0.065), slimSettings)
      )
      const cRim = new THREE.Mesh(cRimGeo, clipFrameMat)
      cRim.position.x = side * eyeCenterOffset
      cRim.rotation.y = -side * 0.05
      clipGroup.add(cRim)

      const cLensGeo = track(
        new THREE.ExtrudeGeometry(makeLensShape(shape, side), {
          steps: 1,
          depth: 0.008,
          bevelEnabled: false,
          curveSegments: 28,
        })
      )
      const cLens = new THREE.Mesh(cLensGeo, clipLensMat)
      cLens.position.set(side * eyeCenterOffset, 0, 0.008)
      cLens.rotation.y = -side * 0.05
      cLens.renderOrder = 4
      clipGroup.add(cLens)

      const magGeo = track(new THREE.CylinderGeometry(0.015, 0.015, 0.025, 12))
      magGeo.rotateX(Math.PI / 2)
      const mag = new THREE.Mesh(magGeo, metalAccentMat)
      mag.position.set(side * (hingeMountAbsX - 0.02), 0.135, -0.01)
      clipGroup.add(mag)
    })

    const cBridgeGeo = track(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(-bridgeAnchorAbsX, 0.09, 0.012),
          new THREE.Vector3(0, 0.134, 0.03),
          new THREE.Vector3(bridgeAnchorAbsX, 0.09, 0.012),
        ]),
        16,
        0.016,
        8,
        false
      )
    )
    clipGroup.add(new THREE.Mesh(cBridgeGeo, clipFrameMat))
  }

  root.add(clipGroup)

  if (includeHeadOccluder) {
    const headGeo = track(new THREE.CylinderGeometry(0.66, 0.61, 1.5, 24))
    headGeo.scale(1.0, 1.0, 1.18)
    const headMat = track(
      new THREE.MeshBasicMaterial({
        colorWrite: false,
        depthWrite: true,
      })
    )
    const headOccluder = new THREE.Mesh(headGeo, headMat)
    headOccluder.position.set(0, -0.05, -0.78)
    headOccluder.renderOrder = -1
    root.add(headOccluder)
  }

  return {
    root,
    leftTemplePivot,
    rightTemplePivot,
    clipGroup,
    dispose: () => {
      disposables.forEach((d) => d.dispose())
    },
  }
}
