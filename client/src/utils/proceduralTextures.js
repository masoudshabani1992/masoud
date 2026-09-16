// Procedural Texture Generator for Three.js (100% Offline, Zero external CDN dependencies)
import * as THREE from 'three';

// 1. Generate Clean Natural Paperboard / Ivory Board Texture (مقوای ایندربرد سفید خام)
export function createPaperboardTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Pure clean off-white paperboard base
  ctx.fillStyle = '#fafaf9';
  ctx.fillRect(0, 0, 1024, 1024);

  // Very subtle cellulose paper fiber specks
  ctx.fillStyle = 'rgba(214, 211, 209, 0.25)';
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const w = Math.random() * 2 + 0.8;
    const h = Math.random() * 1.2 + 0.5;
    ctx.fillRect(x, y, w, h);
  }

  // Ultra-fine paper grain
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 2. Generate Natural Kraft Paper Fiber Texture (مقوای کرافت طبیعی قهوه‌ای)
export function createKraftTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base warm kraft tone
  ctx.fillStyle = '#c89d6c';
  ctx.fillRect(0, 0, 1024, 1024);

  // Organic wood fibers & dark specks
  ctx.fillStyle = 'rgba(92, 60, 30, 0.18)';
  for (let i = 0; i < 7000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const w = Math.random() * 3.5 + 1;
    const h = Math.random() * 1.5 + 0.5;
    ctx.fillRect(x, y, w, h);
  }

  // Light cellulose specks
  ctx.fillStyle = 'rgba(255, 245, 230, 0.15)';
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    ctx.fillRect(x, y, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 3. Generate Duplex Board Texture (مقوای پشت طوسی)
export function createDuplexTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f1f1ed';
  ctx.fillRect(0, 0, 1024, 1024);

  ctx.fillStyle = 'rgba(168, 162, 158, 0.2)';
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    ctx.fillRect(x, y, 2, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 4. Generate Marble Texture Canvas (for studio floor/podium)
export function createMarbleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0, '#f8fafc');
  grad.addColorStop(0.5, '#f1f5f9');
  grad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  for (let i = 0; i < 18; i++) {
    ctx.beginPath();
    let x = (i * 70) % 1024;
    let y = 0;
    ctx.moveTo(x, y);

    while (y < 1024) {
      x += (Math.random() - 0.48) * 45;
      y += Math.random() * 60 + 20;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 5. Generate Natural Wood Texture Canvas
export function createWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#b48356';
  ctx.fillRect(0, 0, 1024, 1024);

  for (let y = 0; y < 1024; y += 4) {
    const alpha = 0.08 + Math.sin(y * 0.05) * 0.06;
    ctx.fillStyle = `rgba(88, 51, 23, ${alpha})`;
    ctx.fillRect(0, y, 1024, Math.random() * 3 + 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 6. Optional Custom Artwork Generator (if user chooses to apply a brand design)
export function createPresetArtwork(presetId = 'pharma_med', title = 'آرمان امیران') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (presetId === 'pharma_med') {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 1024, 1024);

    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, 1024, 140);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('صنایع دارویی و بهداشتی امیران', 512, 90);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 52px sans-serif';
    ctx.fillText('CEPHALEXIN 500 MG', 512, 480);

    ctx.fillStyle = '#64748b';
    ctx.font = '24px sans-serif';
    ctx.fillText('کپسول خوراکی ۵۰۰ میلی‌گرم • تعداد ۲۰ عدد', 512, 550);

  } else {
    ctx.fillStyle = '#fefefe';
    ctx.fillRect(0, 0, 1024, 1024);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return { texture };
}
