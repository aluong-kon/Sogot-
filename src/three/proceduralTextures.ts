import * as THREE from 'three';

/**
 * Procedural Canvas Textures for SOGOT
 * Pure procedural generation - zero external 404 images
 */

/**
 * Creates high-detail red-brown South Sudanese savannah soil texture
 */
export function createSavannahDirtTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Base reddish-brown dirt gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0, '#9e472a');
  grad.addColorStop(0.35, '#87381d');
  grad.addColorStop(0.7, '#752d16');
  grad.addColorStop(1, '#944122');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Dirt patches & soil variations
  for (let i = 0; i < 240; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const r = 20 + Math.random() * 90;
    const tone = Math.random() > 0.5 ? 'rgba(180, 95, 50, 0.16)' : 'rgba(70, 25, 10, 0.18)';
    ctx.beginPath();
    ctx.fillStyle = tone;
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Small stones and gravel specs
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const size = 1 + Math.random() * 2.5;
    const lightness = 60 + Math.random() * 80;
    ctx.fillStyle = `rgba(${lightness + 50}, ${lightness}, ${lightness - 20}, ${0.15 + Math.random() * 0.4})`;
    ctx.fillRect(x, y, size, size);
  }

  // Dry earth micro-cracks
  ctx.strokeStyle = 'rgba(60, 20, 10, 0.35)';
  ctx.lineWidth = 1.2;
  for (let c = 0; c < 28; c++) {
    ctx.beginPath();
    let cx = Math.random() * 1024;
    let cy = Math.random() * 1024;
    ctx.moveTo(cx, cy);
    const steps = 6 + Math.floor(Math.random() * 10);
    for (let s = 0; s < steps; s++) {
      cx += (Math.random() - 0.5) * 45;
      cy += (Math.random() - 0.5) * 45;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates normal/bump map for dirt
 */
export function createDirtBumpMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 3500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const v = Math.floor(Math.random() * 255);
    ctx.fillStyle = `rgba(${v}, ${v}, ${v}, 0.25)`;
    ctx.fillRect(x, y, 2 + Math.random() * 4, 2 + Math.random() * 4);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

/**
 * Creates natural carved wood bark / grain texture for sticks
 */
export function createWoodGrainTexture(isDark = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base wood tone
  ctx.fillStyle = isDark ? '#5a3821' : '#b28453';
  ctx.fillRect(0, 0, 512, 512);

  // Longitudinal wood fiber grain
  for (let x = 0; x < 512; x += 2) {
    const variation = (Math.sin(x * 0.15) + Math.cos(x * 0.05)) * 0.5;
    const alpha = 0.08 + Math.random() * 0.16;
    ctx.fillStyle = variation > 0 ? `rgba(45, 25, 12, ${alpha})` : `rgba(220, 180, 130, ${alpha * 0.7})`;
    ctx.fillRect(x, 0, 2, 512);
  }

  // Knots and growth rings
  for (let k = 0; k < 6; k++) {
    const kx = Math.random() * 512;
    const ky = Math.random() * 512;
    for (let r = 8; r < 40; r += 5) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(50, 28, 14, ${0.15 + (40 - r) * 0.008})`;
      ctx.lineWidth = 1.8;
      ctx.ellipse(kx, ky, r * 0.45, r * 1.4, Math.PI * 0.1, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates the circular boundary decal with white scraped sand/chalk ring
 */
export function createCircularBoundaryTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 512);

  const cx = 256;
  const cy = 256;
  const radius = 220;

  // Outer chalk stroke with rough chalky texture
  ctx.strokeStyle = 'rgba(240, 230, 215, 0.7)';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Natural dust scuffing on the ring
  for (let i = 0; i < 400; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = radius + (Math.random() - 0.5) * 22;
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;
    ctx.fillStyle = `rgba(250, 245, 235, ${0.2 + Math.random() * 0.5})`;
    ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
  }

  // Traditional orientation hatch marks on the boundary circle
  for (let a = 0; a < 8; a++) {
    const angle = (a * Math.PI) / 4;
    const x1 = cx + Math.cos(angle) * (radius - 12);
    const y1 = cy + Math.sin(angle) * (radius - 12);
    const x2 = cx + Math.cos(angle) * (radius + 12);
    const y2 = cy + Math.sin(angle) * (radius + 12);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates South Sudan flag texture for field banners, player badges & distance markers
 */
export function createSouthSudanFlagTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 300;
  const ctx = canvas.getContext('2d')!;

  const stripeH = 300 / 3;

  // Black stripe (Top)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 600, stripeH);

  // Red stripe (Middle)
  ctx.fillStyle = '#da121a';
  ctx.fillRect(0, stripeH, 600, stripeH);

  // Green stripe (Bottom)
  ctx.fillStyle = '#078930';
  ctx.fillRect(0, stripeH * 2, 600, stripeH);

  // White fimbriations (thin borders)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, stripeH - 8, 600, 16);
  ctx.fillRect(0, stripeH * 2 - 8, 600, 16);

  // Blue triangle at hoist
  ctx.fillStyle = '#0f47af';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(260, 150);
  ctx.lineTo(0, 300);
  ctx.closePath();
  ctx.fill();

  // Gold Star of Bethlehem in center of blue triangle
  drawStar(ctx, 85, 150, 5, 34, 15, '#fcdd09');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
  color: string,
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Creates distance marker banner texture (e.g. "50m", "100m")
 */
export function createDistanceMarkerTexture(label: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 256, 128);

  ctx.fillStyle = '#d97706';
  ctx.fillRect(0, 0, 16, 128);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 54px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 136, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
