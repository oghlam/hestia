import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  
  const toCrc = Buffer.concat([typeBuf, data]);
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < toCrc.length; i++) {
    crc ^= toCrc[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (-(crc & 1) & 0xEDB88320);
    }
  }
  crc = (crc ^ 0xFFFFFFFF) >>> 0;
  crcBuf.writeUInt32BE(crc, 0);
  
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, pixelFn) {
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = Math.max(0, Math.min(255, Math.round(r)));
      rawData[pxOffset + 1] = Math.max(0, Math.min(255, Math.round(g)));
      rawData[pxOffset + 2] = Math.max(0, Math.min(255, Math.round(b)));
      rawData[pxOffset + 3] = Math.max(0, Math.min(255, Math.round(a)));
    }
  }
  
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  
  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

// 3D Leaf Math & Shading
// Coordinates normalized from -1 to 1

function sdfSquircle(px, py, r) {
  const x = Math.abs(px);
  const y = Math.abs(py);
  return Math.pow(Math.pow(x, 4) + Math.pow(y, 4), 0.25) - r;
}

// Main Leaf 1 (Curved right-upward arching leaf with bevel ridge)
function leafSDF(px, py, cx, cy, scale, angle, archFactor) {
  // Rotate and translate
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  let x = (px - cx) * cosA - (py - cy) * sinA;
  let y = (px - cx) * sinA + (py - cy) * cosA;
  
  x /= scale;
  y /= scale;
  
  // Arch distortion
  x = x - archFactor * y * (1 - y);
  
  // Normalized leaf body in [0, 1] y
  if (y < -0.1 || y > 1.1) return 1.0;
  
  // Leaf width profile: smooth teardrop
  const widthAtY = Math.sin(Math.max(0, Math.min(Math.PI, y * Math.PI))) * 0.45;
  const dist = Math.abs(x) - widthAtY;
  
  // Return distance and side (for bevel normal)
  return { dist: dist * scale, u: x / (widthAtY + 1e-4), v: y };
}

function render3dIcon(px, py, w, h) {
  // Map pixel to [-1, 1] coordinate space
  const nx = (px / (w - 1)) * 2 - 1;
  const ny = (py / (h - 1)) * 2 - 1;
  
  // 1. Squircle Base Container
  const sqDist = sdfSquircle(nx, ny, 0.88);
  const sqAntiAlias = Math.max(0, Math.min(1, -sqDist * (w * 0.5)));
  
  if (sqAntiAlias <= 0) {
    return [0, 0, 0, 0]; // Transparent outside squircle
  }
  
  // Base background gradient: Deep luminous midnight sapphire
  // Top-left to bottom-right lighting
  const bgT = (nx + ny + 2) * 0.25;
  let bgR = 11 * (1 - bgT) + 20 * bgT;
  let bgG = 20 * (1 - bgT) + 40 * bgT;
  let bgB = 45 * (1 - bgT) + 85 * bgT;
  
  // Squircle top-left specular rim bevel
  const rimGrad = Math.max(0, (-nx - ny) * 0.6 + 0.2);
  const rimBorder = Math.exp(-Math.pow(sqDist * 20, 2)) * 0.45 * rimGrad;
  bgR += rimBorder * 180;
  bgG += rimBorder * 220;
  bgB += rimBorder * 255;
  
  // Subtle radial inner glow
  const rDist = Math.sqrt(nx * nx + ny * ny);
  const innerGlow = Math.max(0, 1 - rDist * 1.1) * 0.2;
  bgR += innerGlow * 30;
  bgG += innerGlow * 100;
  bgB += innerGlow * 200;
  
  // 2. Leaf Geometry Definition
  // Primary Center-Right Leaf
  const l1 = leafSDF(nx, ny, 0.05, 0.35, 0.82, -0.22, 0.28);
  // Secondary Left Supporting Leaf
  const l2 = leafSDF(nx, ny, -0.18, 0.28, 0.62, 0.35, -0.22);
  // Tertiary Top Sprout Leaf
  const l3 = leafSDF(nx, ny, 0.02, 0.48, 0.45, 0.08, 0.12);

  // Combine leaf distance
  let d1 = typeof l1 === 'object' ? l1.dist : 1;
  let d2 = typeof l2 === 'object' ? l2.dist : 1;
  let d3 = typeof l3 === 'object' ? l3.dist : 1;
  
  // Drop Shadow on squircle base
  const s1 = typeof l1 === 'object' ? leafSDF(nx - 0.04, ny - 0.06, 0.05, 0.35, 0.82, -0.22, 0.28).dist : 1;
  const s2 = typeof l2 === 'object' ? leafSDF(nx - 0.04, ny - 0.06, -0.18, 0.28, 0.62, 0.35, -0.22).dist : 1;
  const shadowDist = Math.min(s1, s2);
  if (shadowDist < 0.08) {
    const shadowIntensity = (1 - Math.max(0, shadowDist / 0.08)) * 0.65;
    bgR *= (1 - shadowIntensity);
    bgG *= (1 - shadowIntensity);
    bgB *= (1 - shadowIntensity);
  }
  
  // Determine which leaf has precedence
  let activeLeaf = null;
  let leafType = 0;
  
  if (d3 < 0) {
    activeLeaf = l3;
    leafType = 3;
  } else if (d1 < 0) {
    activeLeaf = l1;
    leafType = 1;
  } else if (d2 < 0) {
    activeLeaf = l2;
    leafType = 2;
  }
  
  if (!activeLeaf) {
    // Check antialiased edge of outer leaves
    const minD = Math.min(d1, d2, d3);
    if (minD < 0.015) {
      const edgeBlend = Math.max(0, 1 - minD / 0.015);
      // Soft glowing edge
      bgR = bgR * (1 - edgeBlend) + (14 * edgeBlend + bgR * 0.5);
      bgG = bgG * (1 - edgeBlend) + (165 * edgeBlend + bgG * 0.5);
      bgB = bgB * (1 - edgeBlend) + (233 * edgeBlend + bgB * 0.5);
    }
    return [bgR, bgG, bgB, sqAntiAlias * 255];
  }
  
  // 3. 3D Bevel Lighting & Volumetric Normal Computation
  // u is position across leaf width [-1 (left side) to +1 (right side)]
  // Ridge spine at u = 0
  const u = activeLeaf.u;
  const v = activeLeaf.v;
  
  // Normal vector calculation from 3D bevel roof
  const side = u >= 0 ? 1 : -1;
  const uAbs = Math.abs(u);
  
  // Surface height: convex beveled dome with sharp center spine
  const slope = -side * 0.75;
  const heightProfile = Math.sqrt(Math.max(0, 1 - uAbs * uAbs));
  
  // Normal in tangent space
  let nxSurf = slope * 0.8;
  let nySurf = (v - 0.5) * 0.35;
  let nzSurf = Math.max(0.2, heightProfile);
  
  // Normalize normal
  const nLen = Math.sqrt(nxSurf * nxSurf + nySurf * nySurf + nzSurf * nzSurf);
  nxSurf /= nLen;
  nySurf /= nLen;
  nzSurf /= nLen;
  
  // Light Vector from top-left: [-0.55, -0.65, 0.7]
  const lx = -0.55;
  const ly = -0.65;
  const lz = 0.7;
  const lLen = Math.sqrt(lx * lx + ly * ly + lz * lz);
  const nDotL = Math.max(0, (nxSurf * lx + nySurf * ly + nzSurf * lz) / lLen);
  
  // Specular Blinn-Phong highlight
  const vx = 0, vy = 0, vz = 1;
  const hx = (lx / lLen) + vx;
  const hy = (ly / lLen) + vy;
  const hz = (lz / lLen) + vz;
  const hLen = Math.sqrt(hx * hx + hy * hy + hz * hz);
  const nDotH = Math.max(0, (nxSurf * hx + nySurf * hy + nzSurf * hz) / hLen);
  const specular = Math.pow(nDotH, 18) * 0.95;
  
  // Central Bevel Spine highlight
  const spineHighlight = Math.exp(-Math.pow(u * 12, 2)) * 0.45;
  
  // Base Emerald to Azure Iridescent Gradient Palette
  // Saturated, brilliant, luminous 3D jewel tones
  let baseR, baseG, baseB;
  if (leafType === 1) {
    // Primary leaf: Emerald teal to electric azure
    const grad = v * 0.7 + (1 - uAbs) * 0.3;
    baseR = 10 * (1 - grad) + 0 * grad;
    baseG = 195 * (1 - grad) + 140 * grad;
    baseB = 220 * (1 - grad) + 255 * grad;
  } else if (leafType === 2) {
    // Left leaf: Rich vibrant cyan & mint green
    const grad = v;
    baseR = 16 * (1 - grad) + 40 * grad;
    baseG = 185 * (1 - grad) + 225 * grad;
    baseB = 129 * (1 - grad) + 180 * grad;
  } else {
    // Top sprout: Radiant golden-cyan flame
    const grad = v;
    baseR = 56 * (1 - grad) + 245 * grad;
    baseG = 189 * (1 - grad) + 210 * grad;
    baseB = 248 * (1 - grad) + 100 * grad;
  }
  
  // Apply 3D Ambient + Diffuse + Specular lighting
  const ambient = 0.42;
  const diffuse = nDotL * 0.68;
  const lightFactor = ambient + diffuse;
  
  let finalR = baseR * lightFactor + specular * 255 + spineHighlight * 255;
  let finalG = baseG * lightFactor + specular * 255 + spineHighlight * 255;
  let finalB = baseB * lightFactor + specular * 255 + spineHighlight * 255;
  
  // Subtle glossy rim fresnel at edge of leaf
  const edgeDist = Math.abs(activeLeaf.dist);
  if (edgeDist < 0.02) {
    const rim = (1 - edgeDist / 0.02) * 0.35;
    finalR += rim * 180;
    finalG += rim * 240;
    finalB += rim * 255;
  }
  
  return [finalR, finalG, finalB, sqAntiAlias * 255];
}

console.log('🎨 Generating 3D Beveled Emblem App Icons for HESTIA...');

const sizes = [
  { file: 'public/logo/hestia_pwa_512.png', size: 512 },
  { file: 'public/logo/hestia_pwa_192.png', size: 192 },
  { file: 'public/logo/hestia_favicon_32.png', size: 32 },
  { file: 'docs/logo/hestia_icon_512.png', size: 512 },
  { file: 'docs/logo/hestia_icon_192.png', size: 192 },
  { file: 'docs/logo/hestia_apple_180.png', size: 180 },
  { file: 'docs/logo/hestia_favicon_32.png', size: 32 },
  { file: 'docs/logo/hestia_favicon_16.png', size: 16 },
  { file: 'docs/logo/hestia_icon_primary.png', size: 512 },
  { file: 'public/logo/hestia_logo_primary.png', size: 512 },
];

for (const { file, size } of sizes) {
  const buf = createPng(size, size, (x, y, w, h) => render3dIcon(x, y, w, h));
  fs.writeFileSync(file, buf);
  console.log(`✔ Generated ${file} (${size}x${size}) · ${buf.length} bytes`);
}

// Also generate a pristine vector SVG for high-DPI scaling
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b1329" />
      <stop offset="50%" stop-color="#111c44" />
      <stop offset="100%" stop-color="#060b18" />
    </linearGradient>
    <linearGradient id="leafMainL" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>
    <linearGradient id="leafMainR" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7dd3fc" />
      <stop offset="50%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="leafLeftL" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="50%" stop-color="#059669" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
    <linearGradient id="leafLeftR" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6ee7b7" />
      <stop offset="50%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="sproutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#000000" flood-opacity="0.55" />
    </filter>
    <filter id="innerGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.22  0 0 0 0 0.74  0 0 0 0 0.97  0 0 0 0.35 0" />
    </filter>
  </defs>

  <!-- Squircle Base App Icon -->
  <rect x="32" y="32" width="448" height="448" rx="100" fill="url(#bgGrad)" stroke="rgba(255,255,255,0.18)" stroke-width="2" />
  
  <!-- Subtle Specular Top Highlight on Squircle -->
  <path d="M 132 34 L 380 34 C 430 34 466 70 476 120 C 420 80 330 60 256 60 C 182 60 92 80 36 120 C 46 70 82 34 132 34 Z" fill="rgba(255,255,255,0.12)" />

  <g filter="url(#dropShadow)">
    <!-- Left Supporting Leaf (Left Facet & Right Facet for 3D Bevel) -->
    <path d="M 170 380 C 120 320 110 240 185 170 C 185 170 170 250 215 310 Z" fill="url(#leafLeftL)" />
    <path d="M 185 170 C 230 230 240 300 215 310 C 195 260 185 210 185 170 Z" fill="url(#leafLeftR)" />

    <!-- Main Central Caring Leaf / Flame (Left Facet & Right Facet for 3D Bevel) -->
    <path d="M 256 100 C 180 180 170 320 256 420 C 240 330 220 220 256 100 Z" fill="url(#leafMainL)" />
    <path d="M 256 100 C 340 180 350 320 256 420 C 280 330 300 220 256 100 Z" fill="url(#leafMainR)" />

    <!-- Center Bevel Spine Highlight -->
    <path d="M 256 100 L 256 420" stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-linecap="round" />

    <!-- Radiant Inner Sprout -->
    <path d="M 256 180 C 235 220 235 270 256 310 C 277 270 277 220 256 180 Z" fill="url(#sproutGrad)" opacity="0.9" />
  </g>
</svg>`;

fs.writeFileSync('public/logo/hestia_icon_3d.svg', svgContent);
fs.writeFileSync('docs/logo/hestia_icon_3d.svg', svgContent);
console.log('✔ Generated public/logo/hestia_icon_3d.svg & docs/logo/hestia_icon_3d.svg');
console.log('🎉 All 3D Beveled Icons Generated Successfully!');
