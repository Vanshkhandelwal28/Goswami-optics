import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  Camera,
  Check,
  Columns2,
  Download,
  Magnet,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Upload,
  UserCheck,
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
  StudioModelProfile,
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

interface PoseTarget {
  midX: number // normalized [0..1] across container width
  midY: number // normalized [0..1] across container height
  ipdNorm: number // eye-to-eye distance divided by container width
  yaw: number // radians
  pitch: number // radians
  roll: number // radians
}

type FaceApiModule = typeof import('@vladmandic/face-api')

let faceApiPromise: Promise<FaceApiModule> | null = null
async function ensureFaceApiLoaded(): Promise<FaceApiModule> {
  if (!faceApiPromise) {
    faceApiPromise = (async () => {
      const faceapi = await import('@vladmandic/face-api')
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
      ])
      return faceapi
    })()
  }
  return faceApiPromise
}

export const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({
  isOpen,
  initialProduct,
  initialColor,
  onClose,
  onSelectForPurchase,
}) => {
  const [mode, setMode] = useState<'studio' | 'camera' | 'upload'>('studio')
  const [product, setProduct] = useState<EyewearProduct>(
    initialProduct.isContactLensPack ? EYEWEAR_CATALOG[0] : initialProduct
  )
  const [colorId, setColorId] = useState<ColorFinishId>(initialColor)
  const [lensId, setLensId] = useState<LensTintId>(initialProduct.defaultLens)
  const [clipStyle, setClipStyle] = useState<MagneticClipStyle>(
    initialProduct.hasMagneticClip ? 'polarized-smoke' : 'none'
  )

  const [selectedModel, setSelectedModel] = useState<StudioModelProfile>(STUDIO_MODELS[0])
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null)
  const [uploadedEyes, setUploadedEyes] = useState<{
    left: { x: number; y: number }
    right: { x: number; y: number }
  }>({
    left: { x: 0.41, y: 0.38 },
    right: { x: 0.59, y: 0.38 },
  })

  // Manual fine-tune & interactive 3D head turn controls
  const [manualYawDeg, setManualYawDeg] = useState<number>(0)
  const [fitScale, setFitScale] = useState<number>(1.0)
  const [offsetY, setOffsetY] = useState<number>(0)
  const [showFineTune, setShowFineTune] = useState<boolean>(false)
  const [compareBeforeAfter, setCompareBeforeAfter] = useState<boolean>(false)
  const [compareSplitPct, setCompareSplitPct] = useState<number>(50)

  // Live Camera States
  const [cameraStatus, setCameraStatus] = useState<
    'idle' | 'starting' | 'tracking' | 'searching' | 'error'
  >('idle')
  const [cameraErrorMsg, setCameraErrorMsg] = useState<string>('')
  const [detectedFaceShape, setDetectedFaceShape] = useState<string>('Oval')
  const [detectedFitWidth, setDetectedFitWidth] = useState<string>('Medium (138mm)')
  const [snapshots, setSnapshots] = useState<
    { id: string; url: string; label: string }[]
  >([])

  const viewportRef = useRef<HTMLDivElement | null>(null)
  const threeMountRef = useRef<HTMLDivElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneHolderRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    rig: EyewearRig | null
  } | null>(null)

  const poseRef = useRef<{
    target: PoseTarget
    current: PoseTarget
  }>({
    target: { midX: 0.5, midY: 0.37, ipdNorm: 0.16, yaw: 0, pitch: 0, roll: 0 },
    current: { midX: 0.5, midY: 0.37, ipdNorm: 0.16, yaw: 0, pitch: 0, roll: 0 },
  })

  // Sync product when modal opens with a newly clicked product card
  useEffect(() => {
    if (!isOpen) return
    const validProd = initialProduct.isContactLensPack ? EYEWEAR_CATALOG[0] : initialProduct
    setProduct(validProd)
    setColorId(initialColor)
    setLensId(validProd.defaultLens)
    setClipStyle(validProd.hasMagneticClip ? 'polarized-smoke' : 'none')
  }, [isOpen, initialProduct, initialColor])

  // Compute target pose in viewport coordinates for static image modes (Studio Model / Uploaded Photo)
  const syncStaticImagePose = useCallback(() => {
    const vp = viewportRef.current
    const img = imgRef.current
    if (!vp || !img || !img.naturalWidth || !img.naturalHeight) return

    const vpW = vp.clientWidth || 1
    const vpH = vp.clientHeight || 1
    const imgAspect = img.naturalWidth / img.naturalHeight
    const vpAspect = vpW / vpH

    // Because portrait uses object-cover centered inside viewport:
    let renderW = vpW
    let renderH = vpH
    let padX = 0
    let padY = 0

    if (imgAspect > vpAspect) {
      renderH = vpH
      renderW = vpH * imgAspect
      padX = (vpW - renderW) / 2
    } else {
      renderW = vpW
      renderH = vpW / imgAspect
      padY = (vpH - renderH) / 2
    }

    const eyes =
      mode === 'upload'
        ? uploadedEyes
        : { left: selectedModel.leftEye, right: selectedModel.rightEye }

    const lx = padX + eyes.left.x * renderW
    const ly = padY + eyes.left.y * renderH
    const rx = padX + eyes.right.x * renderW
    const ry = padY + eyes.right.y * renderH

    const ipdPx = Math.hypot(rx - lx, ry - ly)
    const roll = -Math.atan2(ry - ly, rx - lx)
    const yawRad = THREE.MathUtils.degToRad(manualYawDeg)

    poseRef.current.target = {
      midX: (lx + rx) / 2 / vpW,
      midY: (ly + ry) / 2 / vpH + offsetY * 0.0015,
      ipdNorm: (ipdPx / vpW) * fitScale,
      yaw: yawRad,
      pitch: 0.03,
      roll,
    }
  }, [mode, selectedModel, uploadedEyes, manualYawDeg, fitScale, offsetY])

  useEffect(() => {
    if (isOpen && (mode === 'studio' || mode === 'upload')) {
      syncStaticImagePose()
    }
  }, [isOpen, mode, syncStaticImagePose])

  // Auto-refine landmarks on studio portraits or uploaded photos with local @vladmandic/face-api
  const detectImageLandmarks = useCallback(
    async (imgEl: HTMLImageElement, isCustomUpload: boolean) => {
      try {
        const faceapi = await ensureFaceApiLoaded()
        const detection = await faceapi
          .detectSingleFace(
            imgEl,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.3 })
          )
          .withFaceLandmarks(true)

        if (!detection) return
        const leftPts = detection.landmarks.getLeftEye()
        const rightPts = detection.landmarks.getRightEye()
        const jaw = detection.landmarks.getJawOutline()

        const avg = (pts: { x: number; y: number }[]) => ({
          x: pts.reduce((a, p) => a + p.x, 0) / pts.length,
          y: pts.reduce((a, p) => a + p.y, 0) / pts.length,
        })

        const lC = avg(leftPts)
        const rC = avg(rightPts)
        const w = imgEl.naturalWidth || 1
        const h = imgEl.naturalHeight || 1

        if (isCustomUpload) {
          setUploadedEyes({
            left: { x: lC.x / w, y: lC.y / h },
            right: { x: rC.x / w, y: rC.y / h },
          })
          // Estimate face shape for uploaded selfie
          const jawWidth = Math.hypot(jaw[16].x - jaw[0].x, jaw[16].y - jaw[0].y)
          const chinHeight = Math.hypot(
            jaw[8].x - (lC.x + rC.x) / 2,
            jaw[8].y - (lC.y + rC.y) / 2
          )
          const ratio = jawWidth / Math.max(1, chinHeight)
          if (ratio > 1.24) setDetectedFaceShape('Round / Square')
          else if (ratio < 1.05) setDetectedFaceShape('Oblong / Heart')
          else setDetectedFaceShape('Oval')
        }
        requestAnimationFrame(() => syncStaticImagePose())
      } catch {
        // Fallback coordinates remain active smoothly
      }
    },
    [syncStaticImagePose]
  )

  // Manage Live Camera Stream + 60FPS Face Landmark Tracking
  useEffect(() => {
    if (!isOpen || mode !== 'camera') {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      setCameraStatus('idle')
      return
    }

    let cancelled = false
    let trackingTimer: number | null = null

    const startCamera = async () => {
      setCameraStatus('starting')
      setCameraErrorMsg('')
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access is not supported in this browser.')
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: 'user',
            width: { ideal: 960 },
            height: { ideal: 720 },
          },
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          await video.play()
        }

        const faceapi = await ensureFaceApiLoaded()
        if (cancelled) return
        setCameraStatus('searching')

        const trackLoop = async () => {
          if (cancelled) return
          const v = videoRef.current
          const vp = viewportRef.current
          if (v && vp && v.readyState >= 2 && v.videoWidth > 0) {
            try {
              const det = await faceapi
                .detectSingleFace(
                  v,
                  new faceapi.TinyFaceDetectorOptions({
                    inputSize: 224,
                    scoreThreshold: 0.3,
                  })
                )
                .withFaceLandmarks(true)

              if (det && !cancelled) {
                setCameraStatus('tracking')
                const leftPts = det.landmarks.getLeftEye()
                const rightPts = det.landmarks.getRightEye()
                const nose = det.landmarks.getNose()
                const jaw = det.landmarks.getJawOutline()

                const avg = (pts: { x: number; y: number }[]) => ({
                  x: pts.reduce((a, p) => a + p.x, 0) / pts.length,
                  y: pts.reduce((a, p) => a + p.y, 0) / pts.length,
                })

                const lRaw = avg(leftPts)
                const rRaw = avg(rightPts)

                // Video is mirrored horizontally via scaleX(-1)!
                // In mirrored screen coordinates: x' = videoWidth - x
                const vw = v.videoWidth
                const vh = v.videoHeight
                const vpW = vp.clientWidth || 1
                const vpH = vp.clientHeight || 1

                const vidAspect = vw / vh
                const vpAspect = vpW / vpH
                let renderW = vpW
                let renderH = vpH
                let padX = 0
                let padY = 0
                if (vidAspect > vpAspect) {
                  renderH = vpH
                  renderW = vpH * vidAspect
                  padX = (vpW - renderW) / 2
                } else {
                  renderW = vpW
                  renderH = vpW / vidAspect
                  padY = (vpH - renderH) / 2
                }

                // After horizontal mirror, rRaw becomes viewer-left and lRaw becomes viewer-right!
                const leftScreenX = padX + (1 - rRaw.x / vw) * renderW
                const leftScreenY = padY + (rRaw.y / vh) * renderH
                const rightScreenX = padX + (1 - lRaw.x / vw) * renderW
                const rightScreenY = padY + (lRaw.y / vh) * renderH

                const ipdPx = Math.hypot(
                  rightScreenX - leftScreenX,
                  rightScreenY - leftScreenY
                )
                const roll = -Math.atan2(
                  rightScreenY - leftScreenY,
                  rightScreenX - leftScreenX
                )

                // Estimate real 3D Yaw from nose bridge horizontal asymmetry between jaw outer edges
                const jawLeftDist = Math.abs(nose[3].x - jaw[0].x)
                const jawRightDist = Math.abs(jaw[16].x - nose[3].x)
                const totalJaw = Math.max(1, jawLeftDist + jawRightDist)
                // Negated because video is mirrored
                const yawEst = THREE.MathUtils.clamp(
                  -((jawLeftDist - jawRightDist) / totalJaw) * 1.15,
                  -0.65,
                  0.65
                )

                // Estimate subtle 3D Pitch from eye-to-nose vs nose-to-chin vertical ratio
                const eyeMidY = (lRaw.y + rRaw.y) / 2
                const noseTipY = nose[6].y
                const chinY = jaw[8].y
                const pitchRatio =
                  (noseTipY - eyeMidY) / Math.max(1, chinY - eyeMidY)
                const pitchEst = THREE.MathUtils.clamp(
                  (pitchRatio - 0.44) * 1.5,
                  -0.4,
                  0.4
                )

                // Classify face width recommendation
                const jawRatio = totalJaw / Math.max(1, chinY - eyeMidY)
                if (jawRatio > 1.25) {
                  setDetectedFaceShape('Square / Round')
                  setDetectedFitWidth('Wide (143mm)')
                } else if (jawRatio < 1.04) {
                  setDetectedFaceShape('Heart / Narrow')
                  setDetectedFitWidth('Narrow (132mm)')
                } else {
                  setDetectedFaceShape('Oval')
                  setDetectedFitWidth('Medium (138mm)')
                }

                poseRef.current.target = {
                  midX: (leftScreenX + rightScreenX) / 2 / vpW,
                  midY: (leftScreenY + rightScreenY) / 2 / vpH + offsetY * 0.0015,
                  ipdNorm: (ipdPx / vpW) * fitScale,
                  yaw: yawEst + THREE.MathUtils.degToRad(manualYawDeg),
                  pitch: pitchEst,
                  roll,
                }
              }
            } catch {
              // ignore transient frame error
            }
          }
          trackingTimer = window.setTimeout(trackLoop, 32)
        }

        trackLoop()
      } catch (err) {
        if (!cancelled) {
          setCameraStatus('error')
          setCameraErrorMsg(
            err instanceof Error
              ? err.message
              : 'Camera permission was declined or no webcam found.'
          )
        }
      }
    }

    startCamera()

    return () => {
      cancelled = true
      if (trackingTimer !== null) clearTimeout(trackingTimer)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [isOpen, mode, fitScale, offsetY, manualYawDeg])

  // Three.js Transparent 3D AR Overlay Renderer
  useEffect(() => {
    if (!isOpen) return
    const mount = threeMountRef.current
    const vp = viewportRef.current
    if (!mount || !vp) return

    const scene = new THREE.Scene()
    const w = vp.clientWidth || 540
    const h = vp.clientHeight || 640

    const fov = 30
    const camera = new THREE.PerspectiveCamera(fov, w / h, 0.1, 30)
    const Z_CAM = 4.0
    camera.position.set(0, 0, Z_CAM)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(w, h)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    mount.innerHTML = ''
    mount.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const envTex = createStudioEnvironment(renderer)
    scene.environment = envTex

    scene.add(new THREE.AmbientLight(0xffffff, 0.78))
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4)
    dirLight.position.set(1.5, 2.6, 3.8)
    scene.add(dirLight)

    sceneHolderRef.current = { scene, camera, rig: null }

    const resizeObs = new ResizeObserver(() => {
      if (!vp) return
      const nw = vp.clientWidth || 540
      const nh = vp.clientHeight || 640
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
      syncStaticImagePose()
    })
    resizeObs.observe(vp)

    let rafId = 0
    const renderLoop = () => {
      rafId = requestAnimationFrame(renderLoop)
      const cur = poseRef.current.current
      const tgt = poseRef.current.target
      const smooth = 0.28

      cur.midX += (tgt.midX - cur.midX) * smooth
      cur.midY += (tgt.midY - cur.midY) * smooth
      cur.ipdNorm += (tgt.ipdNorm - cur.ipdNorm) * smooth
      cur.yaw += (tgt.yaw - cur.yaw) * smooth
      cur.pitch += (tgt.pitch - cur.pitch) * smooth
      cur.roll += (tgt.roll - cur.roll) * smooth

      const rig = sceneHolderRef.current?.rig
      if (rig) {
        const visH = 2 * Z_CAM * Math.tan((fov * Math.PI) / 360)
        const visW = visH * camera.aspect

        const worldX = (cur.midX - 0.5) * visW
        const worldY = (0.5 - cur.midY) * visH

        // Outer hinge-to-hinge width in 3D rig is ~1.44 units; human outer frame width ~ 2.18 * IPD
        const desiredFrameWorldW = 2.18 * cur.ipdNorm * visW
        const s = Math.max(0.05, desiredFrameWorldW / 1.44)

        rig.root.position.set(worldX, worldY, 0)
        rig.root.scale.setScalar(s)
        rig.root.rotation.set(cur.pitch, cur.yaw, cur.roll)
      }

      renderer.render(scene, camera)
    }
    renderLoop()

    return () => {
      cancelAnimationFrame(rafId)
      resizeObs.disconnect()
      if (sceneHolderRef.current?.rig) {
        sceneHolderRef.current.rig.dispose()
      }
      envTex.dispose()
      renderer.dispose()
      rendererRef.current = null
      sceneHolderRef.current = null
    }
  }, [isOpen, syncStaticImagePose])

  // Rebuild 3D rig inside AR Try-On whenever frame/color/lens/clip changes
  useEffect(() => {
    const holder = sceneHolderRef.current
    if (!holder || !isOpen) return

    if (holder.rig) {
      holder.scene.remove(holder.rig.root)
      holder.rig.dispose()
    }

    const rig = buildEyewearMesh({
      shape: product.shape,
      colorId,
      lensId,
      clipStyle,
      includeHeadOccluder: true,
    })
    holder.scene.add(rig.root)
    holder.rig = rig
  }, [isOpen, product.shape, colorId, lensId, clipStyle])

  // Capture composite snapshot (Portrait/Webcam + 3D Eyewear Overlay + Goswami Watermark Tag)
  const handleCaptureSnapshot = () => {
    const vp = viewportRef.current
    const glCanvas = rendererRef.current?.domElement
    if (!vp || !glCanvas) return

    const out = document.createElement('canvas')
    const w = vp.clientWidth * 2
    const h = vp.clientHeight * 2
    out.width = w
    out.height = h
    const ctx = out.getContext('2d')!
    ctx.fillStyle = '#F4F5F7'
    ctx.fillRect(0, 0, w, h)

    const drawSourceCover = (
      source: HTMLImageElement | HTMLVideoElement,
      srcW: number,
      srcH: number,
      mirror: boolean
    ) => {
      const sAspect = srcW / srcH
      const dAspect = w / h
      let dw = w
      let dh = h
      let dx = 0
      let dy = 0
      if (sAspect > dAspect) {
        dh = h
        dw = h * sAspect
        dx = (w - dw) / 2
      } else {
        dw = w
        dh = w / sAspect
        dy = (h - dh) / 2
      }
      ctx.save()
      if (mirror) {
        ctx.translate(w, 0)
        ctx.scale(-1, 1)
        ctx.drawImage(source, w - dx - dw, dy, dw, dh)
      } else {
        ctx.drawImage(source, dx, dy, dw, dh)
      }
      ctx.restore()
    }

    if (mode === 'camera' && videoRef.current && videoRef.current.videoWidth > 0) {
      drawSourceCover(
        videoRef.current,
        videoRef.current.videoWidth,
        videoRef.current.videoHeight,
        true
      )
    } else if (imgRef.current && imgRef.current.naturalWidth > 0) {
      drawSourceCover(
        imgRef.current,
        imgRef.current.naturalWidth,
        imgRef.current.naturalHeight,
        false
      )
    }

    ctx.drawImage(glCanvas, 0, 0, w, h)

    // Subtle editorial badge on bottom-left of exported try-on photo
    ctx.fillStyle = 'rgba(24, 34, 50, 0.85)'
    ctx.beginPath()
    ctx.roundRect(28, h - 84, 490, 56, 28)
    ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '600 22px Plus Jakarta Sans, sans-serif'
    ctx.fillText(
      `Goswami Optics Kota · ${product.brand} ${product.name}`,
      52,
      h - 49
    )

    const url = out.toDataURL('image/png')
    setSnapshots((prev) => [
      {
        id: `${Date.now()}`,
        url,
        label: `${product.brand} ${product.name} (${COLOR_FINISHES[colorId].name})`,
      },
      ...prev.slice(0, 3),
    ])
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedPhotoUrl(reader.result)
        setMode('upload')
      }
    }
    reader.readAsDataURL(file)
  }

  if (!isOpen) return null

  const wearableProducts = EYEWEAR_CATALOG.filter((p) => !p.isContactLensPack)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Goswami Optics 3D Virtual Try-On Studio"
    >
      <div className="bg-white w-full max-w-6xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col lg:flex-row max-h-[94vh]">
        {/* LEFT SIDE: Interactive Mirror / 3D AR Viewport */}
        <div className="relative lg:w-[56%] bg-[#F4F3EF] flex flex-col justify-between min-h-[410px] sm:min-h-[540px] overflow-hidden select-none">
          {/* Top Mode Tabs Bar */}
          <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 p-3.5 sm:p-4">
            <div className="inline-flex bg-white/92 backdrop-blur-md p-1 rounded-full border border-slate-200/90 shadow-xs">
              <button
                type="button"
                onClick={() => setMode('studio')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  mode === 'studio'
                    ? 'bg-[#182232] text-white'
                    : 'text-[#526071] hover:text-[#182232]'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Studio Models
              </button>
              <button
                type="button"
                onClick={() => setMode('camera')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  mode === 'camera'
                    ? 'bg-[#0064B5] text-white'
                    : 'text-[#526071] hover:text-[#182232]'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Live Camera AR
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  mode === 'upload'
                    ? 'bg-[#182232] text-white'
                    : 'text-[#526071] hover:text-[#182232]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCompareBeforeAfter((c) => !c)}
                title="Before / After Split Comparison"
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  compareBeforeAfter
                    ? 'bg-[#0064B5] text-white'
                    : 'bg-white/90 text-[#182232] border border-slate-200'
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                Split Check
              </button>

              <button
                type="button"
                onClick={() => setShowFineTune((s) => !s)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  showFineTune
                    ? 'bg-[#182232] text-white'
                    : 'bg-white/90 text-[#182232] border border-slate-200'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Fit Adjust
              </button>
            </div>
          </div>

          {/* Core Viewport Layer Stack */}
          <div ref={viewportRef} className="absolute inset-0 overflow-hidden">
            {/* Static Studio Model or User Uploaded Selfie */}
            {(mode === 'studio' || mode === 'upload') && (
              <img
                ref={imgRef}
                src={
                  mode === 'upload' && uploadedPhotoUrl
                    ? uploadedPhotoUrl
                    : selectedModel.image
                }
                alt="Virtual Try-On Portrait"
                onLoad={(e) => {
                  syncStaticImagePose()
                  detectImageLandmarks(e.currentTarget, mode === 'upload')
                }}
                className="w-full h-full object-cover object-center"
              />
            )}

            {/* Live Mirrored Webcam Feed */}
            {mode === 'camera' && (
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover object-center -scale-x-100"
              />
            )}

            {/* 3D WebGL Eyewear Layer (Clipped if Split-Check is active!) */}
            <div
              ref={threeMountRef}
              className="absolute inset-0 pointer-events-none"
              style={
                compareBeforeAfter
                  ? { clipPath: `inset(0 0 0 ${compareSplitPct}%)` }
                  : undefined
              }
            />

            {/* Split-Check Divider Line */}
            {compareBeforeAfter && (
              <div
                className="absolute inset-y-0 z-20 w-0.5 bg-white shadow-md pointer-events-none"
                style={{ left: `${compareSplitPct}%` }}
              >
                <div className="sticky top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-[#182232] shadow-md flex items-center justify-center text-[10px] font-bold">
                  ↔
                </div>
              </div>
            )}

            {/* Camera Error / Fallback Card */}
            {mode === 'camera' && cameraStatus === 'error' && (
              <div className="absolute inset-0 z-15 flex items-center justify-center bg-[#F4F3EF]/95 p-6 text-center">
                <div className="max-w-sm bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="w-11 h-11 rounded-full bg-blue-50 text-[#0064B5] flex items-center justify-center mx-auto">
                    <Camera className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-base text-[#182232]">
                    Camera Unavailable Right Now
                  </h4>
                  <p className="text-xs text-[#526071] leading-relaxed">
                    {cameraErrorMsg} You can still test every frame in 3D on our Studio
                    Models or upload your own selfie immediately!
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setMode('studio')}
                      className="px-4 py-2 rounded-full bg-[#0064B5] text-white text-xs font-semibold cursor-pointer"
                    >
                      Use Studio Models
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-full border border-slate-300 text-[#182232] text-xs font-semibold cursor-pointer"
                    >
                      Upload Selfie
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Viewport Controls: Model Picker / 3D Head Turn / Snapshot */}
          <div className="relative z-20 p-3.5 sm:p-4 space-y-2.5">
            {compareBeforeAfter && (
              <div className="bg-white/92 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 flex items-center gap-3">
                <span className="text-[11px] font-semibold text-[#182232]">
                  Bare Face vs. {product.name}
                </span>
                <input
                  type="range"
                  min={5}
                  max={95}
                  value={compareSplitPct}
                  onChange={(e) => setCompareSplitPct(Number(e.target.value))}
                  className="flex-1 accent-[#0064B5] cursor-pointer"
                />
              </div>
            )}

            {showFineTune && (
              <div className="bg-white/94 backdrop-blur-md p-3 rounded-xl border border-slate-200 grid grid-cols-3 gap-3 text-[11px]">
                <label className="space-y-1">
                  <span className="font-semibold text-[#182232] block">
                    3D Turn ({manualYawDeg > 0 ? `+${manualYawDeg}°` : `${manualYawDeg}°`})
                  </span>
                  <input
                    type="range"
                    min={-28}
                    max={28}
                    value={manualYawDeg}
                    onChange={(e) => setManualYawDeg(Number(e.target.value))}
                    className="w-full accent-[#0064B5]"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-semibold text-[#182232] block">
                    Frame Size ({Math.round(fitScale * 100)}%)
                  </span>
                  <input
                    type="range"
                    min={82}
                    max={118}
                    value={Math.round(fitScale * 100)}
                    onChange={(e) => setFitScale(Number(e.target.value) / 100)}
                    className="w-full accent-[#0064B5]"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-semibold text-[#182232] block">
                    Bridge Height ({offsetY})
                  </span>
                  <input
                    type="range"
                    min={-25}
                    max={25}
                    value={offsetY}
                    onChange={(e) => setOffsetY(Number(e.target.value))}
                    className="w-full accent-[#0064B5]"
                  />
                </label>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 bg-white/92 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-200/90 shadow-xs">
              {mode === 'studio' ? (
                <div className="flex items-center gap-2">
                  {STUDIO_MODELS.map((m) => {
                    const active = m.id === selectedModel.id
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedModel(m)
                          setManualYawDeg(0)
                        }}
                        className={`flex items-center gap-1.5 pr-2.5 pl-1 py-1 rounded-full border text-xs transition cursor-pointer ${
                          active
                            ? 'border-[#0064B5] bg-[#0064B5]/8 font-semibold text-[#182232]'
                            : 'border-slate-200 text-[#526071] hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={m.image}
                          alt={m.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span>{m.name}</span>
                        <span className="text-[10px] text-slate-400 hidden sm:inline">
                          · {m.faceShape}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 text-xs text-[#182232] font-medium px-1">
                  <Sparkles className="w-4 h-4 text-[#0064B5]" />
                  <span>
                    Face Fit Advisor: <strong>{detectedFaceShape}</strong> · Ideal{' '}
                    <strong>{detectedFitWidth}</strong>
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1.5 ml-auto">
                {(manualYawDeg !== 0 || fitScale !== 1 || offsetY !== 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      setManualYawDeg(0)
                      setFitScale(1)
                      setOffsetY(0)
                    }}
                    title="Reset Pose"
                    className="p-2 rounded-full hover:bg-slate-100 text-[#526071] cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCaptureSnapshot}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#182232] text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Save Look
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Frame & Lens Advisor Drawer */}
        <div className="lg:w-[44%] flex flex-col justify-between p-5 sm:p-6 overflow-y-auto max-h-[52vh] lg:max-h-[94vh]">
          <div className="space-y-5">
            {/* Header + Close */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#0064B5]">
                  {product.brand} · {product.fitWidth} Fit ({product.measurements})
                </div>
                <h3 className="text-2xl font-editorial text-[#182232] mt-0.5">
                  {product.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Virtual Try-On"
                className="p-2 rounded-full hover:bg-slate-100 text-[#526071] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instant 3D Head Angle Slider for Realistic Side Temple Check */}
            <div className="p-3 rounded-xl bg-[#F7F5F0] border border-stone-200/80">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-[#182232]">
                  Interactive 3D Head Angle Check
                </span>
                <span className="text-[#0064B5] font-medium">
                  {manualYawDeg === 0
                    ? 'Straight Front'
                    : manualYawDeg > 0
                      ? `Turn Right +${manualYawDeg}°`
                      : `Turn Left ${manualYawDeg}°`}
                </span>
              </div>
              <input
                type="range"
                min={-28}
                max={28}
                value={manualYawDeg}
                onChange={(e) => setManualYawDeg(Number(e.target.value))}
                className="w-full accent-[#0064B5] cursor-pointer"
              />
            </div>

            {/* Switch Frame Instantly */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#526071] mb-2">
                Try Other Goswami Optics Frames
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {wearableProducts.map((item) => {
                  const active = item.id === product.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setProduct(item)
                        setColorId(item.colors[0])
                        setLensId(item.defaultLens)
                        setClipStyle(item.hasMagneticClip ? 'polarized-smoke' : 'none')
                      }}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                        active
                          ? 'border-[#0064B5] bg-[#0064B5]/6'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-[#0064B5] uppercase">
                          {item.brand}
                        </div>
                        <div className="text-xs font-semibold text-[#182232] truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-[#526071]">
                          ₹{item.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                      {active && <Check className="w-4 h-4 text-[#0064B5] shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Frame Color Swatches */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold uppercase tracking-wider text-[#526071]">
                  Colorway
                </span>
                <span className="font-semibold text-[#182232]">
                  {COLOR_FINISHES[colorId]?.name}
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((cid) => {
                  const fin = COLOR_FINISHES[cid]
                  const active = cid === colorId
                  return (
                    <button
                      key={cid}
                      type="button"
                      onClick={() => setColorId(cid)}
                      title={fin.name}
                      className={`w-7 h-7 rounded-full p-0.5 transition cursor-pointer ${
                        active
                          ? 'ring-2 ring-[#0064B5] ring-offset-2'
                          : 'ring-1 ring-slate-300'
                      }`}
                    >
                      <span
                        className="block w-full h-full rounded-full"
                        style={{
                          background: fin.swatchSecondaryHex
                            ? `linear-gradient(135deg, ${fin.swatchHex} 50%, ${fin.swatchSecondaryHex} 50%)`
                            : fin.swatchHex,
                        }}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Lens & Magnetic Clip Switcher */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold uppercase tracking-wider text-[#526071]">
                  Lens Tint &amp; Sun Clip
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setClipStyle((c) =>
                      c === 'none' ? 'polarized-smoke' : 'none'
                    )
                  }
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer transition ${
                    clipStyle !== 'none'
                      ? 'bg-[#182232] text-white'
                      : 'bg-slate-100 text-[#182232] hover:bg-slate-200'
                  }`}
                >
                  <Magnet className="w-3 h-3" />
                  {clipStyle !== 'none' ? '3-Clip Snapped On' : '+ Snap Sun Clip'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {(
                  ['clear', 'bluecut', 'green-g15', 'smoke', 'amber-grad', 'rose-tint'] as LensTintId[]
                ).map((lid) => {
                  const l = LENS_OPTIONS[lid]
                  const active = lid === lensId && clipStyle === 'none'
                  return (
                    <button
                      key={lid}
                      type="button"
                      onClick={() => {
                        setClipStyle('none')
                        setLensId(lid)
                      }}
                      className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 cursor-pointer ${
                        active
                          ? 'border-[#0064B5] bg-[#0064B5]/6 font-semibold text-[#182232]'
                          : 'border-slate-200 text-[#526071]'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0"
                        style={{ backgroundColor: l.colorHex }}
                      />
                      <span className="truncate">{l.shortLabel}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Captured Snapshots Compare Strip */}
            {snapshots.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#526071] mb-2">
                  Saved Try-On Snapshots ({snapshots.length})
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {snapshots.map((snap) => (
                    <a
                      key={snap.id}
                      href={snap.url}
                      download={`goswami-optics-tryon-${snap.id}.png`}
                      title="Click to download PNG"
                      className="group relative aspect-3/4 rounded-lg overflow-hidden border border-slate-200 block"
                    >
                      <img
                        src={snap.url}
                        alt={snap.label}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute inset-0 bg-slate-900/45 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                        <Download className="w-4 h-4" />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Purchase / In-Store Reserve CTA */}
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-[#526071]">Frame Price</div>
              <div className="text-2xl font-bold text-[#182232]">
                ₹{product.price.toLocaleString('en-IN')}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose()
                onSelectForPurchase(product, colorId)
              }}
              className="flex-1 py-3 px-5 rounded-full bg-[#0064B5] hover:bg-[#004E8F] text-white text-sm font-semibold transition cursor-pointer text-center"
            >
              Select Lenses &amp; Reserve in Kota
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
