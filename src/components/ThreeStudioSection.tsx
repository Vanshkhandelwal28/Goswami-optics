import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  Camera,
  Eye,
  FoldHorizontal,
  Magnet,
  RotateCcw,
  Sparkles,
  Sun,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import {
  COLOR_FINISHES,
  ColorFinishId,
  EYEWEAR_CATALOG,
  EyewearProduct,
  LENS_OPTIONS,
  LensTintId,
} from '../data/goswamiData'
import {
  buildEyewearMesh,
  createStudioEnvironment,
  EyewearRig,
  MagneticClipStyle,
} from '../three/buildEyewearMesh'

interface ThreeStudioSectionProps {
  selectedProduct: EyewearProduct
  selectedColor: ColorFinishId
  onSelectProduct: (product: EyewearProduct, color?: ColorFinishId) => void
  onSelectColor: (color: ColorFinishId) => void
  onOpenTryOn: (product: EyewearProduct, color: ColorFinishId) => void
  onOpenCustomizer: (product: EyewearProduct, color: ColorFinishId) => void
}

const STUDIO_LENSES: LensTintId[] = [
  'clear',
  'bluecut',
  'green-g15',
  'smoke',
  'amber-grad',
  'photochromic',
]

export const ThreeStudioSection: React.FC<ThreeStudioSectionProps> = ({
  selectedProduct,
  selectedColor,
  onSelectProduct,
  onSelectColor,
  onOpenTryOn,
  onOpenCustomizer,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const sectionRef = useRef<HTMLElement | null>(null)

  const [lensId, setLensId] = useState<LensTintId>(selectedProduct.defaultLens)
  const [sunlightAmount, setSunlightAmount] = useState<number>(0.78)
  const [clipStyle, setClipStyle] = useState<MagneticClipStyle>(
    selectedProduct.hasMagneticClip ? 'polarized-smoke' : 'none'
  )
  const [templesFolded, setTemplesFolded] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const [activePreset, setActivePreset] = useState<'quarter' | 'front' | 'side' | 'top'>('quarter')

  // Sync lens & clip defaults when user picks a different product card from catalog
  useEffect(() => {
    setLensId(selectedProduct.defaultLens)
    setClipStyle(selectedProduct.hasMagneticClip ? 'polarized-smoke' : 'none')
  }, [selectedProduct.id, selectedProduct.defaultLens, selectedProduct.hasMagneticClip])

  // Camera orbit state stored in mutable ref for 60fps zero-re-render animation
  const orbitRef = useRef({
    targetRotY: -0.46,
    targetRotX: 0.16,
    currentRotY: -0.46,
    currentRotX: 0.16,
    targetZoom: 2.35,
    currentZoom: 2.35,
    foldTarget: 0,
    foldCurrent: 0,
    clipZCurrent: 0.052,
    clipZTarget: 0.052,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    autoRotate: true,
    isVisible: true,
  })

  orbitRef.current.autoRotate = autoRotate
  orbitRef.current.foldTarget = templesFolded ? 1 : 0

  const rigHolderRef = useRef<{
    scene: THREE.Scene
    rig: EyewearRig | null
  } | null>(null)

  // Initialize Three.js WebGL Studio once
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#F4F5F7')

    const width = container.clientWidth || 640
    const height = container.clientHeight || 460

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 30)
    camera.position.set(0, 0.08, 2.35)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(width, height)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.08
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    const envTex = createStudioEnvironment(renderer)
    scene.environment = envTex

    // Soft studio key + warm rim + fill lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.65)
    scene.add(ambient)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.45)
    keyLight.position.set(2.2, 3.4, 3.2)
    scene.add(keyLight)

    const warmRim = new THREE.DirectionalLight(0xfff1dc, 0.9)
    warmRim.position.set(-2.6, 1.8, -1.6)
    scene.add(warmRim)

    // Soft studio floor shadow disc
    const shadowCanvas = document.createElement('canvas')
    shadowCanvas.width = 256
    shadowCanvas.height = 256
    const sctx = shadowCanvas.getContext('2d')!
    const grad = sctx.createRadialGradient(128, 128, 8, 128, 128, 120)
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.20)')
    grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.06)')
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)')
    sctx.fillStyle = grad
    sctx.fillRect(0, 0, 256, 256)
    const shadowTex = new THREE.CanvasTexture(shadowCanvas)

    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(2.1, 1.5),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
      })
    )
    shadowPlane.rotation.x = -Math.PI / 2
    shadowPlane.position.y = -0.36
    scene.add(shadowPlane)

    rigHolderRef.current = { scene, rig: null }

    // Pointer drag orbit handlers
    const dom = renderer.domElement
    const onPointerDown = (e: PointerEvent) => {
      orbitRef.current.isDragging = true
      orbitRef.current.lastX = e.clientX
      orbitRef.current.lastY = e.clientY
      setAutoRotate(false)
      dom.setPointerCapture(e.pointerId)
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!orbitRef.current.isDragging) return
      const dx = e.clientX - orbitRef.current.lastX
      const dy = e.clientY - orbitRef.current.lastY
      orbitRef.current.lastX = e.clientX
      orbitRef.current.lastY = e.clientY
      orbitRef.current.targetRotY += dx * 0.0085
      orbitRef.current.targetRotX = THREE.MathUtils.clamp(
        orbitRef.current.targetRotX + dy * 0.0065,
        -0.75,
        0.85
      )
    }
    const onPointerUp = (e: PointerEvent) => {
      orbitRef.current.isDragging = false
      try {
        dom.releasePointerCapture(e.pointerId)
      } catch {
        // ignore if not captured
      }
    }

    dom.addEventListener('pointerdown', onPointerDown)
    dom.addEventListener('pointermove', onPointerMove)
    dom.addEventListener('pointerup', onPointerUp)
    dom.addEventListener('pointercancel', onPointerUp)

    const resizeObs = new ResizeObserver(() => {
      if (!container) return
      const w = container.clientWidth || 640
      const h = container.clientHeight || 460
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    resizeObs.observe(container)

    // Pause WebGL render loop when offscreen so page scroll has 0 GPU contention
    const interObs = new IntersectionObserver(
      (entries) => {
        orbitRef.current.isVisible = entries[0]?.isIntersecting ?? true
      },
      { threshold: 0.05 }
    )
    if (sectionRef.current) interObs.observe(sectionRef.current)

    let rafId = 0
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      if (!orbitRef.current.isVisible) return

      const st = orbitRef.current
      if (st.autoRotate && !st.isDragging) {
        st.targetRotY += 0.0045
      }

      st.currentRotY += (st.targetRotY - st.currentRotY) * 0.1
      st.currentRotX += (st.targetRotX - st.currentRotX) * 0.1
      st.currentZoom += (st.targetZoom - st.currentZoom) * 0.12
      st.foldCurrent += (st.foldTarget - st.foldCurrent) * 0.1
      st.clipZCurrent += (st.clipZTarget - st.clipZCurrent) * 0.14

      camera.position.z = st.currentZoom
      camera.lookAt(0, -0.02, -0.22)

      const rig = rigHolderRef.current?.rig
      if (rig) {
        rig.root.rotation.y = st.currentRotY
        rig.root.rotation.x = st.currentRotX
        // Center pivot around mid-frame depth so rotation feels natural
        rig.root.position.z = 0.26

        // Smooth mechanical temple hinge fold!
        rig.leftTemplePivot.rotation.y = -st.foldCurrent * 1.46
        rig.rightTemplePivot.rotation.y = st.foldCurrent * 1.46

        // Smooth magnetic clip snap animation!
        rig.clipGroup.position.z = st.clipZCurrent
      }

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(rafId)
      resizeObs.disconnect()
      interObs.disconnect()
      dom.removeEventListener('pointerdown', onPointerDown)
      dom.removeEventListener('pointermove', onPointerMove)
      dom.removeEventListener('pointerup', onPointerUp)
      dom.removeEventListener('pointercancel', onPointerUp)
      if (rigHolderRef.current?.rig) {
        rigHolderRef.current.rig.dispose()
      }
      envTex.dispose()
      shadowTex.dispose()
      shadowPlane.geometry.dispose()
      ;(shadowPlane.material as THREE.Material).dispose()
      renderer.dispose()
    }
  }, [])

  // Rebuild parametric 3D mesh whenever frame shape, color, lens, UV sunlight, or magnetic clip updates
  useEffect(() => {
    const holder = rigHolderRef.current
    if (!holder) return

    if (holder.rig) {
      holder.scene.remove(holder.rig.root)
      holder.rig.dispose()
    }

    const newRig = buildEyewearMesh({
      shape: selectedProduct.shape,
      colorId: selectedColor,
      lensId,
      sunlightAmount,
      clipStyle,
    })

    // Animate clip snapping in from z = 0.24 -> 0.052 whenever a clip is attached!
    if (clipStyle !== 'none') {
      orbitRef.current.clipZCurrent = 0.24
      orbitRef.current.clipZTarget = 0.052
    }

    holder.scene.add(newRig.root)
    holder.rig = newRig
  }, [selectedProduct.shape, selectedColor, lensId, sunlightAmount, clipStyle])

  const applyCameraPreset = (preset: 'quarter' | 'front' | 'side' | 'top') => {
    setActivePreset(preset)
    setAutoRotate(false)
    if (preset === 'front') {
      orbitRef.current.targetRotY = 0
      orbitRef.current.targetRotX = 0.05
      orbitRef.current.targetZoom = 2.15
    } else if (preset === 'quarter') {
      orbitRef.current.targetRotY = -0.52
      orbitRef.current.targetRotX = 0.16
      orbitRef.current.targetZoom = 2.32
    } else if (preset === 'side') {
      orbitRef.current.targetRotY = -1.38
      orbitRef.current.targetRotX = 0.08
      orbitRef.current.targetZoom = 2.55
    } else {
      orbitRef.current.targetRotY = -0.2
      orbitRef.current.targetRotX = 0.82
      orbitRef.current.targetZoom = 2.48
    }
  }

  const studioProducts = EYEWEAR_CATALOG.filter((p) => !p.isContactLensPack)

  return (
    <section
      id="studio-3d"
      ref={sectionRef}
      className="py-16 md:py-24 bg-[#F7F5F0] border-y border-stone-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#0064B5] mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Interactive 360° Optical Workbench
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] text-[#182232] font-normal leading-[1.12]">
              Inspect every bevel, hinge &amp; <span className="italic">magnetic clip</span> in 3D
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#526071] max-w-md">
            Drag to rotate 360°, fold temple hinges, test Photochromic UV darkening under Kota
            sunlight, or snap on a Greyjack magnetic sun clip.
          </p>
        </div>

        {/* Main Split Studio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Left 7 Cols: Live 60FPS WebGL Canvas */}
          <div className="lg:col-span-7 relative rounded-2xl bg-[#F4F5F7] border border-slate-200/90 overflow-hidden shadow-xs flex flex-col justify-between min-h-[400px] sm:min-h-[490px]">
            {/* Top HUD Pills */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 p-4 pointer-events-none">
              <div className="pointer-events-auto inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-[#182232]">
                  {selectedProduct.brand} {selectedProduct.name}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-[#526071]">
                  {COLOR_FINISHES[selectedColor]?.name}
                </span>
              </div>

              <div className="pointer-events-auto flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTemplesFolded((f) => !f)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                    templesFolded
                      ? 'bg-[#182232] text-white'
                      : 'bg-white/90 text-[#182232] hover:bg-white border border-slate-200/80'
                  }`}
                >
                  <FoldHorizontal className="w-3.5 h-3.5" />
                  {templesFolded ? 'Unfold Arms' : 'Fold Arms'}
                </button>
                <button
                  type="button"
                  onClick={() => setAutoRotate((r) => !r)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                    autoRotate
                      ? 'bg-[#0064B5] text-white'
                      : 'bg-white/90 text-[#182232] hover:bg-white border border-slate-200/80'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  360° Spin
                </button>
              </div>
            </div>

            {/* Three.js Canvas Mount */}
            <div
              ref={containerRef}
              className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
              aria-label="Interactive 3D Eyewear Viewer"
            />

            {/* Bottom Camera Preset & Zoom Controls */}
            <div className="relative z-10 p-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              <div className="pointer-events-auto inline-flex items-center bg-white/92 backdrop-blur-md p-1 rounded-full border border-slate-200/90 shadow-2xs">
                {(
                  [
                    ['quarter', '3/4 View'],
                    ['front', 'Front'],
                    ['side', 'Temple Hinge'],
                    ['top', 'Top Fit'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => applyCameraPreset(id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                      activePreset === id
                        ? 'bg-[#182232] text-white'
                        : 'text-[#526071] hover:text-[#182232]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="pointer-events-auto inline-flex items-center gap-1 bg-white/92 backdrop-blur-md p-1 rounded-full border border-slate-200/90 shadow-2xs">
                <button
                  type="button"
                  aria-label="Zoom out"
                  onClick={() => {
                    orbitRef.current.targetZoom = Math.min(3.3, orbitRef.current.targetZoom + 0.25)
                  }}
                  className="p-1.5 rounded-full text-[#182232] hover:bg-slate-100 cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Zoom in"
                  onClick={() => {
                    orbitRef.current.targetZoom = Math.max(1.55, orbitRef.current.targetZoom - 0.25)
                  }}
                  className="p-1.5 rounded-full text-[#182232] hover:bg-slate-100 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Customizer Controls */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 flex flex-col justify-between gap-5 shadow-xs">
            <div className="space-y-5">
              {/* 1. Frame Silhouette Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#526071]">
                    1. Select Frame Model
                  </span>
                  <span className="text-xs font-medium text-[#0064B5]">
                    {selectedProduct.measurements} · {selectedProduct.fitWidth} Fit
                  </span>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {studioProducts.slice(0, 7).map((prod) => {
                    const active = prod.id === selectedProduct.id
                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => onSelectProduct(prod, prod.colors[0])}
                        className={`shrink-0 px-3 py-2 rounded-xl border text-left transition cursor-pointer ${
                          active
                            ? 'border-[#0064B5] bg-[#0064B5]/6 text-[#182232]'
                            : 'border-slate-200 hover:border-slate-300 text-[#526071]'
                        }`}
                      >
                        <div className="text-[11px] font-semibold text-[#0064B5]">{prod.brand}</div>
                        <div className="text-xs font-semibold text-[#182232] whitespace-nowrap">
                          {prod.name}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 2. Frame Finish Swatches */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#526071]">
                    2. Frame Finish
                  </span>
                  <span className="text-xs font-semibold text-[#182232]">
                    {COLOR_FINISHES[selectedColor]?.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {(Object.keys(COLOR_FINISHES) as ColorFinishId[]).slice(0, 8).map((cid) => {
                    const finish = COLOR_FINISHES[cid]
                    const active = cid === selectedColor
                    return (
                      <button
                        key={cid}
                        type="button"
                        title={finish.name}
                        onClick={() => onSelectColor(cid)}
                        className={`w-8 h-8 rounded-full p-0.5 transition cursor-pointer ${
                          active
                            ? 'ring-2 ring-[#0064B5] ring-offset-2 scale-105'
                            : 'ring-1 ring-slate-300 hover:scale-105'
                        }`}
                      >
                        <span
                          className="block w-full h-full rounded-full"
                          style={{
                            background: finish.swatchSecondaryHex
                              ? `linear-gradient(135deg, ${finish.swatchHex} 50%, ${finish.swatchSecondaryHex} 50%)`
                              : finish.swatchHex,
                          }}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 3. Lens Tint & Crizal Optical Package */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#526071]">
                    3. Lens Tint / Optical Coating
                  </span>
                  <span className="text-xs text-[#526071]">{LENS_OPTIONS[lensId].name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {STUDIO_LENSES.map((lid) => {
                    const opt = LENS_OPTIONS[lid]
                    const active = lid === lensId
                    return (
                      <button
                        key={lid}
                        type="button"
                        onClick={() => setLensId(lid)}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs font-medium transition cursor-pointer ${
                          active
                            ? 'border-[#0064B5] bg-[#0064B5]/6 text-[#182232] font-semibold'
                            : 'border-slate-200 text-[#526071] hover:border-slate-300'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 border border-slate-300"
                          style={{ backgroundColor: opt.colorHex }}
                        />
                        <span className="truncate">{opt.shortLabel}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Live UV Sunlight Slider for Photochromic Transitions */}
                {lensId === 'photochromic' && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80">
                    <div className="flex items-center justify-between text-xs font-medium text-amber-950 mb-1.5">
                      <span className="inline-flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5 text-amber-600" /> Kota Sunlight UV Simulator
                      </span>
                      <span>{Math.round(sunlightAmount * 100)}% Outdoor UV</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(sunlightAmount * 100)}
                      onChange={(e) => setSunlightAmount(Number(e.target.value) / 100)}
                      className="w-full accent-[#0064B5] cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* 4. Greyjack Magnetic 3-Clip Snap Simulator */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#526071]">
                    <Magnet className="w-3.5 h-3.5 text-[#0064B5]" /> 4. Greyjack Magnetic Sun Clip
                  </span>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Snap-On Demo
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(
                    [
                      ['none', 'No Clip'],
                      ['polarized-smoke', 'Polarized Sun'],
                      ['night-yellow', 'Night Drive'],
                      ['cobalt-mirror', 'Mirror Blue'],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setClipStyle(id)}
                      className={`px-2.5 py-2 rounded-xl border text-xs font-medium transition cursor-pointer ${
                        clipStyle === id
                          ? 'bg-[#182232] text-white border-[#182232]'
                          : 'border-slate-200 text-[#526071] hover:border-slate-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Price & Action CTAs */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-[#526071]">In-Store &amp; Custom Rx Starting</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#182232]">
                    ₹{selectedProduct.price.toLocaleString('en-IN')}
                  </span>
                  {selectedProduct.mrp && (
                    <span className="text-xs text-slate-400 line-through">
                      ₹{selectedProduct.mrp.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onOpenTryOn(selectedProduct, selectedColor)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full border border-[#182232] text-xs sm:text-sm font-semibold text-[#182232] hover:bg-slate-50 transition cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Try On Face
                </button>
                <button
                  type="button"
                  onClick={() => onOpenCustomizer(selectedProduct, selectedColor)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0064B5] hover:bg-[#004E8F] text-xs sm:text-sm font-semibold text-white transition cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  Select Lenses
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
