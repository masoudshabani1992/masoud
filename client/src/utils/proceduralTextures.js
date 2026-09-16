// Procedural Texture Generator for Three.js (100% Offline, Zero external CDN dependencies)
import * as THREE from 'three';

// 1. Generate Marble Texture Canvas
export function createMarbleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base white-grey gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0, '#f8fafc');
  grad.addColorStop(0.5, '#f1f5f9');
  grad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle marble veins
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

  // Soft secondary thin veins
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.12)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    let x = 1024 - (i * 90) % 1024;
    let y = 0;
    ctx.moveTo(x, y);
    while (y < 1024) {
      x += (Math.random() - 0.52) * 50;
      y += Math.random() * 70 + 25;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 2. Generate Natural Wood Texture Canvas
export function createWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base warm wood tone
  ctx.fillStyle = '#b48356';
  ctx.fillRect(0, 0, 1024, 1024);

  // Wood grain stripes
  for (let y = 0; y < 1024; y += 4) {
    const alpha = 0.08 + Math.sin(y * 0.05) * 0.06;
    ctx.fillStyle = `rgba(88, 51, 23, ${alpha})`;
    ctx.fillRect(0, y, 1024, Math.random() * 3 + 1);
  }

  // Knots & irregularities
  for (let i = 0; i < 6; i++) {
    const kx = Math.random() * 1024;
    const ky = Math.random() * 1024;
    const grad = ctx.createRadialGradient(kx, ky, 5, kx, ky, 60);
    grad.addColorStop(0, 'rgba(68, 36, 15, 0.4)');
    grad.addColorStop(1, 'rgba(180, 131, 86, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(kx, ky, 40, 15, Math.PI / 8, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 3. Generate Kraft Paper Fiber Texture
export function createKraftTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#c89d6c';
  ctx.fillRect(0, 0, 512, 512);

  // Organic specks & fibers
  ctx.fillStyle = 'rgba(92, 60, 30, 0.15)';
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const w = Math.random() * 3 + 1;
    const h = Math.random() * 1.5 + 0.5;
    ctx.fillRect(x, y, w, h);
  }

  // Light highlights
  ctx.fillStyle = 'rgba(255, 245, 230, 0.12)';
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillRect(x, y, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 4. Generate Luxury Brand Design Preset Artwork
export function createPresetArtwork(presetId = 'luxury_perfume', title = 'آرمان امیران') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (presetId === 'luxury_perfume') {
    // Elegant Midnight Emerald & Gold Foil
    ctx.fillStyle = '#09231f';
    ctx.fillRect(0, 0, 1024, 1024);

    // Decorative Gold Border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 8;
    ctx.strokeRect(60, 60, 904, 904);

    ctx.lineWidth = 2;
    ctx.strokeRect(80, 80, 864, 864);

    // Corner Geometric Ornaments
    const drawCorner = (x, y) => {
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
    };
    drawCorner(80, 80);
    drawCorner(944, 80);
    drawCorner(80, 944);
    drawCorner(944, 944);

    // Brand Emblem
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(512, 380, 90, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 36px serif';
    ctx.textAlign = 'center';
    ctx.fillText('👑', 512, 360);
    ctx.fillText('AA', 512, 410);

    // Title & Typography
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 52px sans-serif';
    ctx.fillText(title, 512, 540);

    ctx.fillStyle = '#d4af37';
    ctx.font = 'italic 26px serif';
    ctx.fillText('PREMIUM PACKAGING COLLECTION', 512, 600);
    ctx.fillText('EAU DE PARFUM • 100 ML', 512, 650);

    // Bottom Gold Seal
    ctx.fillStyle = '#f59e0b';
    ctx.font = '18px sans-serif';
    ctx.fillText('★ ★ ★ ★ ★', 512, 730);
    ctx.fillText('ARMAN AMIRAN INDUSTRIAL GROUP', 512, 770);

  } else if (presetId === 'organic_coffee') {
    // Warm Earthy Coffee Aesthetic
    ctx.fillStyle = '#271c19';
    ctx.fillRect(0, 0, 1024, 1024);

    // Organic Leaf Motif Background
    ctx.fillStyle = '#3a2b27';
    ctx.beginPath();
    ctx.arc(512, 512, 360, 0, Math.PI * 2);
    ctx.fill();

    // Coffee Bean Icon
    ctx.fillStyle = '#d97706';
    ctx.font = '72px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('☕', 512, 380);

    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 58px sans-serif';
    ctx.fillText(title, 512, 490);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('قهوه تخصصی ۱۰۰٪ عربیکا', 512, 560);

    ctx.fillStyle = '#d1d5db';
    ctx.font = '22px sans-serif';
    ctx.fillText('برشته‌کاری تازه • دانه‌های دست‌چین مزارع ارگانیک', 512, 630);
    ctx.fillText('وزن خالص: ۲۵۰ گرم • بسته بندی زیپ کیپ دار', 512, 680);

  } else if (presetId === 'pharma_med') {
    // Clean Clinical Pharmaceutical Design
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1024, 1024);

    // Top Header Bar
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, 1024, 220);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(title, 940, 120);

    ctx.font = '22px sans-serif';
    ctx.fillText('شرکت داروسازی و بهداشتی آرمان امیران', 940, 170);

    // Pharma Cross Icon
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(80, 70, 80, 24);
    ctx.fillRect(108, 42, 24, 80);

    // Product Medicine Info
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('آمیکاسین ۵۰۰ میلی‌گرم', 512, 460);

    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('Amikacin 500mg Injection', 512, 520);

    ctx.fillStyle = '#64748b';
    ctx.font = '24px sans-serif';
    ctx.fillText('حاوی ۱۰ ویال شیشه‌ای تزریقی به همراه بروشور راهنما', 512, 600);
    ctx.fillText('شماره پروانه ساخت: IRC-98421045', 512, 650);

    // Bottom Color Accent Stripe
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 960, 1024, 64);

  } else if (presetId === 'minimal_cosmetic') {
    // Pastel Peach & Rose Gold Minimal Cosmetic
    ctx.fillStyle = '#fce7f3';
    ctx.fillRect(0, 0, 1024, 1024);

    // Circle Accent
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(512, 420, 160, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#881337';
    ctx.font = 'bold 52px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, 512, 400);

    ctx.fillStyle = '#be123c';
    ctx.font = 'italic 28px serif';
    ctx.fillText('SKINCARE ESSENTIALS', 512, 460);

    ctx.fillStyle = '#4c0519';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('سرم ضدپیری و جوان‌ساز هیالورونیک اسید', 512, 660);

    ctx.fillStyle = '#9f1239';
    ctx.font = '22px sans-serif';
    ctx.fillText('فرمولاسیون سوئیس • ۵۰ میلی‌لیتر', 512, 720);
  } else {
    // Clean Kraft / Box Art
    ctx.fillStyle = '#d97706';
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, 512, 512);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return { texture, canvasUrl: canvas.toDataURL('image/png') };
}
