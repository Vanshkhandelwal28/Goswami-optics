# Goswami Optics Kota — Digital Optical Studio & Storefront

A modern, zero-lag static frontend web application crafted for **Goswami Optics, Kota (Rajasthan)** — inspired by Warby Parker's sunlit editorial typography, color architecture, 360° 3D eyewear inspection, and real-time AR Virtual Try-On experience.

Built as a **100% client-side, zero-backend, zero-login** web application for instant speed and effortless hosting anywhere (GitHub Pages, Vercel, Netlify, Cloudflare Pages).

## Highlights

- **Interactive 360° WebGL 3D Eyewear & Sunglass Workbench (`Three.js`)**:
  - Real-time 60 FPS parametric 3D optical models across 6 silhouettes (*Wayfarer*, *Panto Round*, *Aviator Double-Bridge*, *Upswept Cat-Eye*, *Clubmaster Browline*, *Hexagonal Wire*).
  - Live frame finish switching (*Jet Black*, *Ristretto Tortoise*, *Crystal Clear*, *Polished Gold*, *Sesame Tortoise*, *Olive Matte*, *Polished Silver*, *Rose Water*).
  - Interactive **Greyjack 3-Clip Magnetic Sun/Night/Mirror Snap-On** animation, mechanical **Temple Hinge Folding**, and **Photochromic Transitions UV Sunlight** simulator.
- **3-Mode Virtual Try-On Studio (`Three.js` + Local 68-Point Face Landmark Tracking)**:
  1. **Studio Models**: Instant 0-permission 3D try-on across 4 portrait models with interactive 3D head-turn angle slider & Before/After split comparison.
  2. **Live Camera 3D AR**: Real-time webcam face tracking estimating eye centers, IPD frame scaling, 3D head yaw/pitch/roll, and temple depth occlusion.
  3. **Upload Selfie**: Automatic local browser face-landmark alignment + snapshot PNG download.
- **Two Verified Kota Showrooms & Google Maps Hub**:
  - **Branch 01 — Flagship Showroom (`GOSWAMI OPTICS`)**: `2-K-4, Rangbari Rd, Teachers Colony, Mahaveer Nagar, Kota, Rajasthan 324009` · **4.8★ (290 Google Reviews)** · [Google Profile](https://share.google/XlhxSlGqvhXNlhpsT)
  - **Branch 02 — Titan Eyewear Store (`GOSWAMI OPTICS NEW - TITAN EYEWEAR`)**: `S-7, 8, Opp. Chhabriya Cycle, Indra Vihar, Talwandi, Kota, Rajasthan 324005` · **4.8★ (126 Google Reviews)** · [Google Profile](https://share.google/qeTyImoBLn187W1ZF)
  - Direct 1-click Google Maps turn-by-turn directions, embedded live showroom map switcher, and instant WhatsApp slot booking (`+91 97827 92323`).
- **Verified Google Reviews + Native On-Site Review System**:
  - Displays verified Google customer reviews from both Kota branches plus instant `localStorage`-persisted visitor reviews and helpful voting without any login wall.

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```
