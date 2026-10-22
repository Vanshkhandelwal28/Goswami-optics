import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  Camera,
  Check,
  Download,
  Eye,
  MessageCircle,
  ScanFace,
  Sparkles,
  SplitSquareHorizontal,
  Sun,
  Upload,
  User,
  X,
} from 'lucide-react'
import {
  COLOR_FINISHES,
  ColorFinishId,
  EYEWEAR_CATALOG,
  EyewearProduct,
  LENS_OPTIONS,
  LensTintId,
  STUDIO_MODELS,
  WHATSAPP_BASE_URL,
} from '../data/goswamiData'
import {
  buildEyewearMesh,
  createStudioEnvironment,
  EyewearRig,
  MagneticClipStyle,
} from '../three/buildEyewearMesh'

interface VirtualTryOnModalProps {
  isOpen: boolean
  initialProduct: EyewearProduct
  initialColor: ColorFinishId
  onClose: () => void
  onSelectForPurchase: (product: EyewearProduct, color: ColorFinishId) => void
}

type TryOnMode = 'camera' | 'model' | 'upload'
type FitSize = 'narrow' | 'medium' | 'wide'

interface NormalizedLandmark {
  x: number
  y: number
  z: number
}

interface FaceMeshResults {
  multiFaceLandmarks?: NormalizedLandmark[][]
}

interface FaceMeshInstance {
  setOptions: (opts: {
    maxNumFaces?: number
    refineLandmarks?: boolean
    minDetectionConfidence?: number
    minTrackingConfidence?: number
  }) => void
  onResults: (cb: (results: FaceMeshResults) => void) => void
  send: (input: { image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement }) => Promise<void>
}

declare global {
  interface Window {
    FaceMesh?: new (config: { locateFile: (file: string) => string }) => FaceMeshInstance
  }
}

let sharedFaceMeshPromise: Promise<FaceMeshInstance> | null = null

function getSharedFaceMesh(): Promise<FaceMeshInstance> {
  if (sharedFaceMeshPromise) return sharedFaceMeshPromise

  sharedFaceMeshPromise = new Promise<FaceMeshInstance>((resolve, reject) => {
    const boot = () => {
      if (!window.FaceMesh) {
        reject(new Error('FaceMesh constructor missing'))
        return
      }
      const fm = new window.FaceMesh({
        locateFile: (file: string) => `/mediapipe/${file}`,
      })
      fm.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })
      resolve(fm)
    }

    if (window.FaceMesh) {
      boot()
      return
    }

    const existing = document.querySelector('script[data-mediapipe-facemesh="1"]')
    if (existing) {
      existing.addEventListener('load', boot, { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed loading MediaPipe')), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.src = '/mediapipe/face_mesh.js'
    script.async = true
    script.dataset.mediapipeFacemesh = '1'
    script.onload = boot
    script.onerror = () => reject(new Error('Failed loading /mediapipe/face_mesh.js'))
    document.head.appendChild(script)
  })

  return sharedFaceMeshPromise
}

const FIT_MULTIPLIER: Record<FitSize, { factor: number; label: string; mmDelta: number }> = {
  narrow: { factor: 0.955, label: 'Narrow', mmDelta: -5 },
  medium: { factor: 1.0, label: 'Medium', mmDelta: 0 },
  wide: { factor: 1.045, label: 'Wide', mmDelta: 5 },
}

export const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({
  isOpen,
  initialProduct,
  initialColor,
  onClose,
  onSelectForPurchase,
}) => {
  const [product, setProduct] = useState<EyewearProduct>(initialProduct)
  const [mode, setMode] = useState<TryOnMode>('camera')
  const [selectedModelIndex, setSelectedModelIndex] = useState(0)
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null)
  const [colorId, setColorId] = useState<ColorFinishId>(initialColor)
  const [lensId, setLensId] = useState<LensTintId>(initialProduct.defaultLens)
  const [clipOn, setClipOn] = useState(false)
  const [fitSize, setFitSize] = useState<FitSize>('medium')
  const [compareSplit, setCompareSplit] = useState(false)
  const [showHudGuides, setShowHudGuides] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [trackingState, setTrackingState] = useState<'loading' | 'locked' | 'searching'>('loading')
  const [measuredPdMm, setMeasuredPdMm] = useState<number>(63.0)
  const [hudPoints, setHudPoints] = useState<{
    leftPupil: { x: number; y: number }
    rightPupil: { x: number; y: number }
    bridge: { x: number; y: number }
  } | null>(null)

  const viewportRef = useRef<HTMLDivElement | null>(null)
  const overlayHostRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const photoImgRef = useRef<HTMLImageElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const lightCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    keyLight: THREE.DirectionalLight
    fillLight: THREE.DirectionalLight
    ambientLight: THREE.AmbientLight
    rig: EyewearRig | null
  } | null>(null)

  const poseTargetRef = useRef({
    hasFace: false,
    pos: new THREE.Vector3(0, 0.12, 0),
    quat: new THREE.Quaternion(),
    scale: 1.0,
    exposure: 1.04,
    lightColor: new THREE.Color(0xffffff),
  })

  const poseCurrentRef = useRef({
    initialized: false,
    pos: new THREE.Vector3(0, 0.12, 0),
    quat: new THREE.Quaternion(),
    scale: 1.0,
    exposure: 1.04,
  })

  const activeStudioModel = STUDIO_MODELS[selectedModelIndex] || STUDIO_MODELS[0]
  const activePhotoSrc = mode === 'upload' && uploadedPhoto ? uploadedPhoto : activeStudioModel.image

  // Sync product when opened from catalog card
  useEffect(() => {
    setProduct(initialProduct)
    setColorId(initialColor || initialProduct.colors[0])
    setLensId(initialProduct.defaultLens)
    setClipOn(Boolean(initialProduct.hasMagneticClip && initialProduct.category === 'sunglasses'))
  }, [initialProduct, initialColor])

  const handleSwitchProductInMirror = (nextProd: EyewearProduct) => {
    setProduct(nextProd)
    if (!nextProd.colors.includes(colorId)) {
      setColorId(nextProd.colors[0])
    }
    setLensId(nextProd.defaultLens)
    setClipOn(false)
  }

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setCameraReady(false)
  }, [])

  const startCamera = useCallback(async () => {
    setCameraError(null)
    setCameraReady(false)
    poseCurrentRef.current.initialized = false
    try {
      stopCamera()
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraReady(true)
      }
    } catch {
      setCameraError(
        'Camera permission not granted yet — previewing on Studio Model (click Live Camera or Upload Photo anytime).'
      )
      setMode('model')
    }
  }, [stopCamera])

  useEffect(() => {
    if (!isOpen) {
      stopCamera()
      return
    }
    if (mode === 'camera') {
      startCamera()
    } else {
      stopCamera()
      poseCurrentRef.current.initialized = false
    }
    return () => {
      stopCamera()
    }
  }, [isOpen, mode, startCamera, stopCamera])

  // Map 478-landmark MediaPipe 3D FaceMesh coordinates directly into Three.js camera world space
  const updatePoseFromLandmarks = useCallback(
    (
      landmarks: NormalizedLandmark[],
      srcW: number,
      srcH: number,
      mirrored: boolean,
      currentFit: FitSize
    ) => {
      const vp = viewportRef.current
      const ctx = threeRef.current
      if (!vp || !ctx || vp.clientWidth === 0 || vp.clientHeight === 0) return

      const vpW = vp.clientWidth
      const vpH = vp.clientHeight
      const vpAspect = vpW / vpH
      const srcAspect = srcW / srcH

      let renderW: number
      let renderH: number
      let padX: number
      let padY: number
      if (srcAspect > vpAspect) {
        renderH = vpH
        renderW = vpH * srcAspect
        padX = (vpW - renderW) * 0.5
        padY = 0
      } else {
        renderW = vpW
        renderH = vpW / srcAspect
        padX = 0
        padY = (vpH - renderH) * 0.5
      }

      const toScreen3D = (lm: NormalizedLandmark) => {
        const sx = padX + (mirrored ? 1 - lm.x : lm.x) * renderW
        const sy = padY + lm.y * renderH
        return new THREE.Vector3(sx - vpW * 0.5, vpH * 0.5 - sy, -lm.z * renderW)
      }

      const toScreen2D = (lm: NormalizedLandmark) => ({
        x: padX + (mirrored ? 1 - lm.x : lm.x) * renderW,
        y: padY + lm.y * renderH,
      })

      const eyeCentroid = (a: number, b: number): NormalizedLandmark => ({
        x: (landmarks[a].x + landmarks[b].x) * 0.5,
        y: (landmarks[a].y + landmarks[b].y) * 0.5,
        z: (landmarks[a].z + landmarks[b].z) * 0.5,
      })

      const subjRightIris = landmarks[468] || eyeCentroid(33, 133)
      const subjLeftIris = landmarks[473] || eyeCentroid(362, 263)

      const viewerLeftEye = toScreen3D(mirrored ? subjLeftIris : subjRightIris)
      const viewerRightEye = toScreen3D(mirrored ? subjRightIris : subjLeftIris)

      const viewerLeftTemple = toScreen3D(mirrored ? landmarks[356] : landmarks[127])
      const viewerRightTemple = toScreen3D(mirrored ? landmarks[127] : landmarks[356])

      const forehead = toScreen3D(landmarks[10])
      const chin = toScreen3D(landmarks[152])
      const sellion = toScreen3D(landmarks[168])

      // Exact right-handed 3D face basis (zero gimbal lock at any yaw/pitch/roll)
      const xAxis = new THREE.Vector3().subVectors(viewerRightTemple, viewerLeftTemple).normalize()
      const yApprox = new THREE.Vector3().subVectors(forehead, chin).normalize()
      const zAxis = new THREE.Vector3().crossVectors(xAxis, yApprox).normalize()
      const yAxis = new THREE.Vector3().crossVectors(zAxis, xAxis).normalize()

      const rotMatrix = new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis)
      const quat = new THREE.Quaternion().setFromRotationMatrix(rotMatrix)

      // True 3D focal-length-invariant cranial temple span (matches Warby Parker Brady across both close-up webcams & studio lenses!)
      const templeSpanPx = viewerLeftTemple.distanceTo(viewerRightTemple)
      const ipdPx = viewerLeftEye.distanceTo(viewerRightEye)
      const desiredOuterFramePx = 1.055 * templeSpanPx * FIT_MULTIPLIER[currentFit].factor

      const halfFovRad = (ctx.camera.fov * Math.PI) / 360
      const visibleWorldH = 2 * ctx.camera.position.z * Math.tan(halfFovRad)
      const worldPerPx = visibleWorldH / vpH

      const worldScale = (desiredOuterFramePx * worldPerPx) / 1.344

      // Rigid nose-bridge saddle lock onto landmark[168] + pupil height reference
      const midEyeY = (viewerLeftEye.y + viewerRightEye.y) * 0.5
      const anchorScreenX = 0.72 * sellion.x + 0.28 * ((viewerLeftEye.x + viewerRightEye.x) * 0.5)
      const anchorScreenY = 0.35 * (sellion.y - 0.052 * (worldScale / worldPerPx)) + 0.65 * midEyeY

      const worldPos = new THREE.Vector3(anchorScreenX * worldPerPx, anchorScreenY * worldPerPx, 0)

      poseTargetRef.current.pos.copy(worldPos)
      poseTargetRef.current.quat.copy(quat)
      poseTargetRef.current.scale = worldScale
      poseTargetRef.current.hasFace = true

      const estPd = THREE.MathUtils.clamp((ipdPx / Math.max(templeSpanPx, 1)) * 134.5, 56, 71)
      setMeasuredPdMm(Number(estPd.toFixed(1)))

      setHudPoints({
        leftPupil: toScreen2D(mirrored ? subjLeftIris : subjRightIris),
        rightPupil: toScreen2D(mirrored ? subjRightIris : subjLeftIris),
        bridge: toScreen2D(landmarks[168]),
      })
      setTrackingState('locked')
    },
    []
  )

  // Instant anatomical eye-coordinate fallback for Studio Models before WASM finishes booting
  const applyPresetPhotoAlignment = useCallback(() => {
    const vp = viewportRef.current
    const ctx = threeRef.current
    if (!vp || !ctx || vp.clientWidth === 0 || vp.clientHeight === 0) return

    const vpW = vp.clientWidth
    const vpH = vp.clientHeight
    const halfFovRad = (ctx.camera.fov * Math.PI) / 360
    const visibleWorldH = 2 * ctx.camera.position.z * Math.tan(halfFovRad)
    const worldPerPx = visibleWorldH / vpH

    if (mode === 'model') {
      const le = activeStudioModel.leftEye
      const re = activeStudioModel.rightEye
      const midX = ((le.x + re.x) * 0.5 - 0.5) * vpW
      const midY = (0.5 - (le.y + re.y) * 0.5) * vpH
      const ipdPx = Math.hypot((re.x - le.x) * vpW, (re.y - le.y) * vpH)
      const outerPx = 2.62 * ipdPx * FIT_MULTIPLIER[fitSize].factor
      poseTargetRef.current.pos.set(midX * worldPerPx, midY * worldPerPx, 0)
      poseTargetRef.current.quat.identity()
      poseTargetRef.current.scale = (outerPx * worldPerPx) / 1.344
      poseTargetRef.current.hasFace = true
    } else {
      poseTargetRef.current.pos.set(0, 0.08 * visibleWorldH, 0)
      poseTargetRef.current.quat.identity()
      poseTargetRef.current.scale = (0.36 * vpW * FIT_MULTIPLIER[fitSize].factor * worldPerPx) / 1.344
      poseTargetRef.current.hasFace = true
    }
  }, [mode, activeStudioModel, fitSize])

  // Initialize Three.js AR compositing viewport & 60 FPS velocity-adaptive render loop
  useEffect(() => {
    if (!isOpen || !overlayHostRef.current || !viewportRef.current) return
    const host = overlayHostRef.current
    const vp = viewportRef.current

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(vp.clientWidth, vp.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.04
    renderer.setClearColor(0x000000, 0)
    host.innerHTML = ''
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const envMap = createStudioEnvironment(renderer)
    scene.environment = envMap

    const camera = new THREE.PerspectiveCamera(
      32,
      vp.clientWidth / Math.max(vp.clientHeight, 1),
      0.1,
      30
    )
    camera.position.set(0, 0, 3.6)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.68)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.48)
    keyLight.position.set(1.5, 2.6, 3.8)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xf6f0e8, 0.72)
    fillLight.position.set(-2.2, 1.2, 2.4)
    scene.add(fillLight)

    threeRef.current = {
      renderer,
      scene,
      camera,
      keyLight,
      fillLight,
      ambientLight,
      rig: null,
    }

    const onResize = () => {
      if (!viewportRef.current || !threeRef.current) return
      const w = viewportRef.current.clientWidth
      const h = viewportRef.current.clientHeight
      if (w === 0 || h === 0) return
      threeRef.current.camera.aspect = w / h
      threeRef.current.camera.updateProjectionMatrix()
      threeRef.current.renderer.setSize(w, h)
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(vp)

    let raf = 0
    const renderLoop = () => {
      raf = requestAnimationFrame(renderLoop)
      const current = poseCurrentRef.current
      const target = poseTargetRef.current
      const rig = threeRef.current?.rig

      if (rig && target.hasFace) {
        if (!current.initialized) {
          current.pos.copy(target.pos)
          current.quat.copy(target.quat)
          current.scale = target.scale
          current.exposure = target.exposure
          current.initialized = true
        } else {
          const deltaDist = current.pos.distanceTo(target.pos)
          const alpha = THREE.MathUtils.clamp(0.28 + deltaDist * 7.5, 0.28, 0.78)
          current.pos.lerp(target.pos, alpha)
          current.quat.slerp(target.quat, alpha)
          current.scale = THREE.MathUtils.lerp(current.scale, target.scale, alpha * 0.85)
          current.exposure = THREE.MathUtils.lerp(current.exposure, target.exposure, 0.08)
        }

        rig.root.visible = true
        rig.root.position.copy(current.pos)
        rig.root.quaternion.copy(current.quat)
        rig.root.scale.setScalar(current.scale)
        renderer.toneMappingExposure = current.exposure
        keyLight.color.lerp(target.lightColor, 0.08)
      }

      renderer.render(scene, camera)
    }
    renderLoop()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      if (threeRef.current?.rig) {
        threeRef.current.rig.dispose()
      }
      envMap.dispose()
      renderer.dispose()
      threeRef.current = null
    }
  }, [isOpen])

  // Rebuild millimeter-accurate 3D eyewear rig whenever frame, colorway, lens tint, or magnetic clip changes
  useEffect(() => {
    const ctx = threeRef.current
    if (!isOpen || !ctx || !product) return

    if (ctx.rig) {
      ctx.scene.remove(ctx.rig.root)
      ctx.rig.dispose()
      ctx.rig = null
    }

    if (product.isContactLensPack) return

    const clipStyle: MagneticClipStyle =
      product.hasMagneticClip && clipOn ? 'polarized-smoke' : 'none'

    const rig = buildEyewearMesh({
      shape: product.shape,
      colorId,
      lensId,
      clipStyle,
      includeHeadOccluder: true,
      includeFaceShadow: true,
    })
    rig.leftTemplePivot.rotation.y = -0.025
    rig.rightTemplePivot.rotation.y = 0.025
    rig.root.visible = poseTargetRef.current.hasFace
    ctx.scene.add(rig.root)
    ctx.rig = rig
  }, [isOpen, product, colorId, lensId, clipOn])

  // Real-time 478-point MediaPipe FaceMesh tracking loop + ambient room illumination matching
  useEffect(() => {
    if (!isOpen) return
    let active = true
    let meshBusy = false
    let loopTimer: number | null = null
    let frameCounter = 0

    if (!lightCanvasRef.current) {
      const c = document.createElement('canvas')
      c.width = 24
      c.height = 18
      lightCanvasRef.current = c
    }

    const sampleAmbientRoomLight = (source: HTMLVideoElement | HTMLImageElement) => {
      try {
        const c = lightCanvasRef.current!
        const lctx = c.getContext('2d', { willReadFrequently: true })
        if (!lctx) return
        lctx.drawImage(source, 0, 0, 24, 18)
        const data = lctx.getImageData(6, 3, 12, 12).data
        let rSum = 0
        let gSum = 0
        let bSum = 0
        const count = data.length / 4
        for (let i = 0; i < data.length; i += 4) {
          rSum += data[i]
          gSum += data[i + 1]
          bSum += data[i + 2]
        }
        const avgR = rSum / count / 255
        const avgG = gSum / count / 255
        const avgB = bSum / count / 255
        const luma = 0.299 * avgR + 0.587 * avgG + 0.114 * avgB

        poseTargetRef.current.exposure = THREE.MathUtils.clamp(0.84 + luma * 0.44, 0.86, 1.18)
        const maxCh = Math.max(avgR, avgG, avgB, 0.01)
        poseTargetRef.current.lightColor.setRGB(
          THREE.MathUtils.lerp(1.0, avgR / maxCh, 0.25),
          THREE.MathUtils.lerp(1.0, avgG / maxCh, 0.25),
          THREE.MathUtils.lerp(1.0, avgB / maxCh, 0.25)
        )
      } catch {
        // ignore cross-origin or transient video frame read
      }
    }

    if (mode !== 'camera') {
      applyPresetPhotoAlignment()
    }

    setTrackingState('loading')

    getSharedFaceMesh()
      .then((fm) => {
        if (!active) return

        fm.onResults((results: FaceMeshResults) => {
          if (!active) return
          const face = results.multiFaceLandmarks?.[0]
          if (mode === 'camera') {
            const vid = videoRef.current
            if (face && vid && vid.videoWidth > 0) {
              updatePoseFromLandmarks(face, vid.videoWidth, vid.videoHeight, true, fitSize)
            } else {
              setTrackingState('searching')
            }
          } else {
            const img = photoImgRef.current
            if (face && img && img.naturalWidth > 0) {
              updatePoseFromLandmarks(face, img.naturalWidth, img.naturalHeight, false, fitSize)
            } else {
              applyPresetPhotoAlignment()
              setTrackingState('locked')
            }
          }
        })

        const tick = () => {
          if (!active) return
          if (mode === 'camera') {
            const vid = videoRef.current
            if (vid && cameraReady && vid.readyState >= 2 && !meshBusy) {
              meshBusy = true
              frameCounter++
              if (frameCounter % 18 === 1) {
                sampleAmbientRoomLight(vid)
              }
              fm.send({ image: vid })
                .catch(() => {})
                .finally(() => {
                  meshBusy = false
                })
            }
            loopTimer = window.setTimeout(tick, 30)
          } else {
            const img = photoImgRef.current
            if (img && img.complete && img.naturalWidth > 0) {
              sampleAmbientRoomLight(img)
              fm.send({ image: img }).catch(() => {
                applyPresetPhotoAlignment()
              })
            } else {
              loopTimer = window.setTimeout(tick, 120)
            }
          }
        }

        tick()
      })
      .catch(() => {
        if (mode !== 'camera') {
          applyPresetPhotoAlignment()
          setTrackingState('locked')
        }
      })

    return () => {
      active = false
      if (loopTimer) clearTimeout(loopTimer)
    }
  }, [
    isOpen,
    mode,
    cameraReady,
    activePhotoSrc,
    fitSize,
    updatePoseFromLandmarks,
    applyPresetPhotoAlignment,
  ])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedPhoto(reader.result)
        setMode('upload')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDownloadSnapshot = () => {
    if (!viewportRef.current || !threeRef.current) return
    const vp = viewportRef.current
    const out = document.createElement('canvas')
    const dpr = Math.min(window.devicePixelRatio, 2)
    out.width = vp.clientWidth * dpr
    out.height = vp.clientHeight * dpr
    const octx = out.getContext('2d')
    if (!octx) return

    octx.fillStyle = '#0f172a'
    octx.fillRect(0, 0, out.width, out.height)

    const source = mode === 'camera' ? videoRef.current : photoImgRef.current
    if (source) {
      const sw =
        source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth
      const sh =
        source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight
      if (sw > 0 && sh > 0) {
        const scale = Math.max(out.width / sw, out.height / sh)
        const dw = sw * scale
        const dh = sh * scale
        const dx = (out.width - dw) / 2
        const dy = (out.height - dh) / 2
        octx.save()
        if (mode === 'camera') {
          octx.translate(out.width, 0)
          octx.scale(-1, 1)
        }
        octx.drawImage(source, dx, dy, dw, dh)
        octx.restore()
      }
    }

    const glCanvas = threeRef.current.renderer.domElement
    octx.drawImage(glCanvas, 0, 0, out.width, out.height)

    octx.fillStyle = 'rgba(24, 34, 50, 0.84)'
    octx.beginPath()
    octx.roundRect(24 * dpr, out.height - 64 * dpr, 400 * dpr, 44 * dpr, 22 * dpr)
    octx.fill()
    octx.fillStyle = '#FFFFFF'
    octx.font = `600 ${13 * dpr}px Plus Jakarta Sans, sans-serif`
    octx.fillText(
      `Goswami Optics · ${product.brand} ${product.name} (${COLOR_FINISHES[colorId].name})`,
      42 * dpr,
      out.height - 37 * dpr
    )

    const a = document.createElement('a')
    a.href = out.toDataURL('image/png')
    a.download = `goswami-optics-${product.id}-${colorId}.png`
    a.click()
  }

  if (!isOpen) return null

  const effectiveFrameWidthMm = product.totalWidthMm + FIT_MULTIPLIER[fitSize].mmDelta
  const whatsappText = encodeURIComponent(
    `Namaste Goswami Optics! I just tried on ${product.brand} ${product.name} (${COLOR_FINISHES[colorId].name}, ${FIT_MULTIPLIER[fitSize].label} ${effectiveFrameWidthMm}mm, ${LENS_OPTIONS[lensId].name}) in Virtual Try-On. Please share availability in Kota.`
  )

  const tryableCatalog = EYEWEAR_CATALOG.filter((item) => !item.isContactLensPack)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B111B]/80 backdrop-blur-md p-0 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="3D Virtual Try-On Mirror"
    >
      <div className="relative w-full max-w-6xl bg-white sm:rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[100dvh] sm:min-h-0">
        {/* LEFT: CLEAN FULL-BLEED WARBY PARKER / LENSKART 3D AR MIRROR */}
        <div
          ref={viewportRef}
          className="lg:col-span-7 relative min-h-[430px] sm:min-h-[580px] bg-[#E8ECF0] overflow-hidden select-none"
        >
          {mode === 'camera' ? (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="absolute inset-0 w-full h-full object-cover object-center -scale-x-100 contrast-[1.03] saturate-[1.04]"
            />
          ) : (
            <img
              ref={photoImgRef}
              src={activePhotoSrc}
              alt="Virtual Try-On Portrait"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          )}

          {/* Optional Lenskart-style Optical PD Reticle Overlay (cleanly off by default) */}
          {showHudGuides && hudPoints && (
            <svg
              className="pointer-events-none absolute inset-0 w-full h-full z-10"
              aria-hidden="true"
            >
              <line
                x1={hudPoints.leftPupil.x}
                y1={hudPoints.leftPupil.y}
                x2={hudPoints.rightPupil.x}
                y2={hudPoints.rightPupil.y}
                stroke="#38BDF8"
                strokeWidth="1.25"
                strokeDasharray="4 3"
              />
              {[hudPoints.leftPupil, hudPoints.rightPupil].map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="9"
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="1.4"
                  />
                  <circle cx={pt.x} cy={pt.y} r="2.2" fill="#FFFFFF" />
                </g>
              ))}
              <circle cx={hudPoints.bridge.x} cy={hudPoints.bridge.y} r="3.5" fill="#34D399" />
            </svg>
          )}

          {/* Real-Time PBR + Depth-Occluded 3D Eyewear Layer */}
          <div
            ref={overlayHostRef}
            className="pointer-events-none absolute inset-0 z-10 transition-all duration-200"
            style={compareSplit ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
          />

          {/* Before / After Split Line */}
          {compareSplit && (
            <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/95 shadow z-20 flex items-center justify-center">
              <span className="px-2.5 py-1 rounded-full bg-[#182232]/90 text-white text-[10px] font-semibold tracking-wider uppercase whitespace-nowrap">
                With Frame · Bare Face
              </span>
            </div>
          )}

          {/* Top-Left Minimal Mode Switcher */}
          <div className="absolute top-3.5 left-3.5 right-14 flex flex-wrap items-center gap-1.5 z-20">
            <div className="inline-flex items-center p-1 rounded-full bg-[#182232]/75 backdrop-blur-md text-white shadow-sm">
              <button
                type="button"
                onClick={() => setMode('camera')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  mode === 'camera'
                    ? 'bg-white text-[#182232] shadow-xs'
                    : 'text-white/90 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Live Camera
              </button>
              <button
                type="button"
                onClick={() => setMode('model')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  mode === 'model'
                    ? 'bg-white text-[#182232] shadow-xs'
                    : 'text-white/90 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Models
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  mode === 'upload'
                    ? 'bg-white text-[#182232] shadow-xs'
                    : 'text-white/90 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Photo
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Virtual Try-On"
            className="lg:hidden absolute top-3.5 right-3.5 z-30 p-2 rounded-full bg-[#182232]/75 text-white backdrop-blur-md"
          >
            <X className="w-4 h-4" />
          </button>

          {cameraError && (
            <div className="absolute top-16 left-4 right-4 z-20 px-3.5 py-2 rounded-xl bg-[#182232]/85 backdrop-blur-md text-white text-xs flex items-center justify-between gap-2">
              <span>{cameraError}</span>
              <button
                type="button"
                onClick={() => setCameraError(null)}
                className="text-white/70 hover:text-white cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* WARBY PARKER SIGNATURE BOTTOM HUD */}
          <div className="absolute bottom-3.5 left-3.5 right-3.5 z-20 flex flex-wrap items-end justify-between gap-2.5">
            {mode === 'model' ? (
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#182232]/75 backdrop-blur-md">
                {STUDIO_MODELS.map((m, idx) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModelIndex(idx)}
                    className={`flex items-center gap-1.5 pr-2.5 pl-1 py-0.5 rounded-full text-xs font-medium transition cursor-pointer ${
                      selectedModelIndex === idx
                        ? 'bg-white text-[#182232]'
                        : 'text-white/85 hover:text-white'
                    }`}
                  >
                    <img
                      src={m.image}
                      alt={m.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span>{m.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3.5 py-2 rounded-2xl bg-[#182232]/78 backdrop-blur-md text-white shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      trackingState === 'locked' ? 'bg-emerald-400' : 'bg-amber-300 animate-pulse'
                    }`}
                  />
                  <span>
                    {product.name} ({FIT_MULTIPLIER[fitSize].label.toLowerCase()})
                  </span>
                </div>
                <p className="text-[11px] text-white/75 mt-0.5">
                  {COLOR_FINISHES[colorId].name} · Est. PD {measuredPdMm} mm
                </p>
              </div>
            )}

            <div className="flex items-center gap-1.5 ml-auto">
              <div className="inline-flex items-center p-0.5 rounded-full bg-[#182232]/78 backdrop-blur-md text-white text-[11px] font-semibold">
                {(['narrow', 'medium', 'wide'] as FitSize[]).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setFitSize(sz)}
                    className={`px-2.5 py-1 rounded-full transition cursor-pointer ${
                      fitSize === sz ? 'bg-white text-[#182232]' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {FIT_MULTIPLIER[sz].label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowHudGuides((v) => !v)}
                title="Toggle 3D PD Landmarks"
                className={`p-2 rounded-full backdrop-blur-md transition cursor-pointer ${
                  showHudGuides
                    ? 'bg-sky-500 text-white'
                    : 'bg-[#182232]/75 text-white hover:bg-[#182232]'
                }`}
              >
                <ScanFace className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setCompareSplit((v) => !v)}
                title="Split Compare"
                className={`p-2 rounded-full backdrop-blur-md transition cursor-pointer ${
                  compareSplit
                    ? 'bg-white text-[#182232]'
                    : 'bg-[#182232]/75 text-white hover:bg-[#182232]'
                }`}
              >
                <SplitSquareHorizontal className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleDownloadSnapshot}
                title="Save Try-On Photo"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white text-[#182232] text-xs font-semibold shadow-sm hover:bg-slate-100 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Save
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: CUSTOMIZATION STUDIO */}
        <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between bg-white max-h-[92vh] overflow-y-auto">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0064B5]">
                  {product.brand} · {product.shape.replace('-', ' ')}
                </p>
                <h2 className="font-editorial text-2xl sm:text-[26px] text-[#182232] mt-0.5">
                  {product.name}
                </h2>
                <p className="text-xs text-[#526071] mt-0.5 line-clamp-1">{product.description}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Virtual Try-On"
                className="hidden lg:inline-flex p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price + Exact Millimeter Measurements */}
            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 py-2.5 px-3.5 rounded-2xl bg-[#F6F6F4]">
              <div>
                <span className="text-lg font-bold text-[#182232]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.mrp && (
                  <span className="text-xs text-slate-400 line-through ml-1.5">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-[#182232] bg-white px-2.5 py-1 rounded-full border border-slate-200/80">
                {product.measurements} · {effectiveFrameWidthMm} mm wide
              </span>
            </div>

            {/* 1. Frame Finish Swatches */}
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#526071] mb-2">
                1. Frame Color —{' '}
                <span className="text-[#182232]">{COLOR_FINISHES[colorId].name}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((cid) => {
                  const finish = COLOR_FINISHES[cid]
                  const selected = cid === colorId
                  return (
                    <button
                      key={cid}
                      type="button"
                      onClick={() => setColorId(cid)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer ${
                        selected
                          ? 'border-[#182232] bg-[#182232] text-white shadow-xs'
                          : 'border-slate-200 bg-white text-[#182232] hover:border-slate-400'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/15"
                        style={{ backgroundColor: finish.swatchHex }}
                      />
                      {finish.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. Optical / Sunglass Lens Switcher */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#526071]">
                  2. Lens Mode —{' '}
                  <span className="text-[#182232]">{LENS_OPTIONS[lensId].shortLabel}</span>
                </p>
                <div className="inline-flex rounded-full bg-[#F6F6F4] p-0.5 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setLensId('clear')}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full cursor-pointer ${
                      lensId === 'clear' || lensId === 'bluecut'
                        ? 'bg-white text-[#182232] shadow-2xs'
                        : 'text-[#526071]'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    Eyeglasses
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLensId(lensId === 'clear' || lensId === 'bluecut' ? 'smoke' : lensId)
                    }
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full cursor-pointer ${
                      lensId !== 'clear' && lensId !== 'bluecut'
                        ? 'bg-white text-[#182232] shadow-2xs'
                        : 'text-[#526071]'
                    }`}
                  >
                    <Sun className="w-3 h-3" />
                    Sunglasses
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(LENS_OPTIONS) as LensTintId[]).map((lid) => {
                  const tint = LENS_OPTIONS[lid]
                  const active = lid === lensId
                  return (
                    <button
                      key={lid}
                      type="button"
                      onClick={() => setLensId(lid)}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-xl border text-left text-xs transition cursor-pointer ${
                        active
                          ? 'border-[#0064B5] bg-sky-50/80 text-[#182232] font-semibold'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 border border-slate-300"
                          style={{ backgroundColor: tint.colorHex }}
                        />
                        <span className="truncate">{tint.shortLabel}</span>
                      </span>
                      {active && <Check className="w-3.5 h-3.5 text-[#0064B5] shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Greyjack 3-Clip Magnetic Snap Toggle */}
            {product.hasMagneticClip && (
              <div className="mt-3.5 p-3 rounded-2xl bg-[#F6F6F4] border border-slate-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0064B5] shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#182232]">
                      Magnetic Polarized Sun Clip
                    </p>
                    <p className="text-[11px] text-[#526071]">
                      Snap 2-in-1 outdoor sun clip over prescription frame
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setClipOn((v) => !v)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer shrink-0 ${
                    clipOn
                      ? 'bg-[#0064B5] text-white'
                      : 'bg-white border border-slate-300 text-[#182232]'
                  }`}
                >
                  {clipOn ? 'Clipped On' : 'Snap Clip'}
                </button>
              </div>
            )}

            {/* Instant Live Frame Switcher Carousel */}
            <div className="mt-4 pt-3.5 border-t border-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#526071] mb-2">
                3. Switch Frame Live on Camera ({tryableCatalog.length} styles)
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
                {tryableCatalog.map((item) => {
                  const selected = item.id === product.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSwitchProductInMirror(item)}
                      className={`shrink-0 px-3 py-2 rounded-xl border text-left transition cursor-pointer ${
                        selected
                          ? 'border-[#182232] bg-[#182232] text-white'
                          : 'border-slate-200 bg-[#F9F9F8] text-[#182232] hover:border-slate-400'
                      }`}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                        {item.brand}
                      </p>
                      <p className="text-xs font-semibold whitespace-nowrap">{item.name}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="mt-5 pt-3.5 border-t border-slate-200 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose()
                onSelectForPurchase(product, colorId)
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs font-semibold border border-[#182232] bg-white text-[#182232] hover:bg-slate-50 transition cursor-pointer"
            >
              <Eye className="w-4 h-4 text-[#0064B5]" />
              Select Lenses &amp; Shortlist
            </button>

            <a
              href={`${WHATSAPP_BASE_URL}?text=${whatsappText}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs font-semibold bg-[#0064B5] text-white hover:bg-[#004E8F] transition shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              Reserve in Kota
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
