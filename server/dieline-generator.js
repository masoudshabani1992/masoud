/**
 * Pacdora Studio & ESKO ArtiosCAD 23.07 Master Dieline Engine
 * Developed for Arman Amiran Box Factory by Masoud Shabani (مسعود شعبانی)
 *
 * Full Library of 22 Standard Packaging Dieline Models:
 * - ECMA A20.20 / A20.40 / A50.20 / A55.20 (Straight Tuck, Reverse Tuck, Snap Lock, Auto Bottom, Hanging Tab)
 * - FEFCO 0427 / 0201 / 0200 / 0203 (Mailer, RSC, HSC, FOL, Pizza Box, RETT)
 * - Rigid & Luxury (Two-Piece Base & Lid, Sleeve & Drawer, Magnetic Book Box)
 * - Food & Specialty (Gable Top, Bakery Cake Box, French Fry Box, Pillow, Hexagon, Triangle)
 * - Display & Trays (Counter Display Stand, 4-Corner Tray)
 */

const MATERIAL_DATABASE = {
  '350g_white': {
    id: '350g_white',
    name: 'ایندربرد ۳۵۰ گرم (350g White Board)',
    thicknessMm: 0.5,
    minThick: 0.3,
    maxThick: 0.8,
    bendLoss: 0.45,
    glueTabW: 15,
    defaultGsm: 350,
    colorHex: '#ffffff',
    texture: 'smooth_white'
  },
  '300g_white': {
    id: '300g_white',
    name: 'ایندربرد ۳۰۰ گرم (300g White Board)',
    thicknessMm: 0.42,
    minThick: 0.25,
    maxThick: 0.7,
    bendLoss: 0.4,
    glueTabW: 14,
    defaultGsm: 300,
    colorHex: '#fafafa',
    texture: 'smooth_white'
  },
  '250g_duplex': {
    id: '250g_duplex',
    name: 'پشت طوسی ۲۵۰ گرم (250g Duplex Board)',
    thicknessMm: 0.45,
    minThick: 0.3,
    maxThick: 0.75,
    bendLoss: 0.42,
    glueTabW: 15,
    defaultGsm: 250,
    colorHex: '#f1f1ed',
    texture: 'duplex_gray'
  },
  'kraft': {
    id: 'kraft',
    name: 'مقوای کرافت قهوه‌ای (Kraft Board)',
    thicknessMm: 0.55,
    minThick: 0.3,
    maxThick: 0.9,
    bendLoss: 0.5,
    glueTabW: 16,
    defaultGsm: 320,
    colorHex: '#c89d6c',
    texture: 'kraft_brown'
  },
  'flute_e': {
    id: 'flute_e',
    name: 'کارتن E-Flute ۱.۵ میلی‌متر (سینگل لمینتی)',
    thicknessMm: 1.5,
    minThick: 1.2,
    maxThick: 1.8,
    bendLoss: 1.2,
    glueTabW: 25,
    defaultGsm: 450,
    colorHex: '#dfbe95',
    texture: 'corrugated_e'
  },
  'flute_b': {
    id: 'flute_b',
    name: 'کارتن B-Flute ۳ میلی‌متر (۳ لایه سه لایه)',
    thicknessMm: 3.0,
    minThick: 2.6,
    maxThick: 3.4,
    bendLoss: 2.4,
    glueTabW: 32,
    defaultGsm: 550,
    colorHex: '#be9364',
    texture: 'corrugated_b'
  }
};

const MATERIAL_SPECS = MATERIAL_DATABASE;

const STANDARD_SHEETS = [
  { id: 'sheet_70x100', name: '۷۰ × ۱۰۰ سانت (۴ ورقی)', widthMm: 1000, heightMm: 700, widthCm: 100, heightCm: 70 },
  { id: 'sheet_60x90', name: '۶۰ × ۹۰ سانت (۳ ورقی)', widthMm: 900, heightMm: 600, widthCm: 90, heightCm: 60 },
  { id: 'sheet_50x70', name: '۵۰ × ۷۰ سانت (۲ ورقی)', widthMm: 700, heightMm: 500, widthCm: 70, heightCm: 50 },
  { id: 'sheet_35x50', name: '۳۵ × ۵۰ سانت (۱ ورقی)', widthMm: 500, heightMm: 350, widthCm: 50, heightCm: 35 },
  { id: 'sheet_100x140', name: '۱۰۰ × ۱۴۰ سانت (۶ ورقی)', widthMm: 1400, heightMm: 1000, widthCm: 140, heightCm: 100 }
];

/**
 * Size Conversion Triad (Manufacture, Inner, Outer)
 */
function calculateDimensionTriad({ L, W, H, sizeMode = 'mfg', thicknessMm = 0.5, bendLoss = 0.4 }) {
  const T = Math.max(0.1, parseFloat(thicknessMm) || 0.5);
  const K = Math.max(0.1, parseFloat(bendLoss) || (T * 0.8));

  let inner = { l: 0, w: 0, h: 0 };
  let mfg = { l: 0, w: 0, h: 0 };
  let outer = { l: 0, w: 0, h: 0 };

  if (sizeMode === 'mfg') {
    mfg.l = L;
    mfg.w = W;
    mfg.h = H;
    inner.l = Math.max(2, L - (K * 1.5));
    inner.w = Math.max(2, W - (K * 1.5));
    inner.h = Math.max(2, H - (K * 2.5));
    outer.l = L + (T * 0.8);
    outer.w = W + (T * 0.8);
    outer.h = H + (T * 1.8);
  } else if (sizeMode === 'inner') {
    inner.l = L;
    inner.w = W;
    inner.h = H;
    mfg.l = L + (K * 1.5);
    mfg.w = W + (K * 1.5);
    mfg.h = H + (K * 2.5);
    outer.l = L + (2 * T);
    outer.w = W + (2 * T);
    outer.h = H + (2 * T);
  } else {
    // outer
    outer.l = L;
    outer.w = W;
    outer.h = H;
    inner.l = Math.max(2, L - (2 * T));
    inner.w = Math.max(2, W - (2 * T));
    inner.h = Math.max(2, H - (2 * T));
    mfg.l = inner.l + (K * 1.5);
    mfg.w = inner.w + (K * 1.5);
    mfg.h = inner.h + (K * 2.5);
  }

  const r = (n) => Math.round(n * 10) / 10;
  return {
    inner: { l: r(inner.l), w: r(inner.w), h: r(inner.h) },
    mfg: { l: r(mfg.l), w: r(mfg.w), h: r(mfg.h) },
    outer: { l: r(outer.l), w: r(outer.w), h: r(outer.h) }
  };
}

/**
 * Generate In-Canvas Blue Dimension Arrow
 */
function createPacdoraDimArrowH({ x1, x2, y, text, unit = 'mm' }) {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const midX = (minX + maxX) / 2;
  const dist = maxX - minX;
  if (dist < 10) return '';

  const arrowSize = 4;
  return `
    <g class="pacdora-dim-h">
      <line x1="${minX}" y1="${y}" x2="${maxX}" y2="${y}" stroke="#0284c7" stroke-width="0.9" />
      <polygon points="${minX},${y} ${minX + arrowSize},${y - 2.5} ${minX + arrowSize},${y + 2.5}" fill="#0284c7" />
      <polygon points="${maxX},${y} ${maxX - arrowSize},${y - 2.5} ${maxX - arrowSize},${y + 2.5}" fill="#0284c7" />
      <rect x="${midX - 26}" y="${y - 8}" width="52" height="16" rx="3" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.5" />
      <text x="${midX}" y="${y + 3.5}" font-family="'Inter', 'Vazirmatn', sans-serif" font-size="8.5px" font-weight="600" fill="#0284c7" text-anchor="middle">
        ${text} ${unit}
      </text>
    </g>
  `;
}

function createPacdoraDimArrowV({ x, y1, y2, text, unit = 'mm' }) {
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  const midY = (minY + maxY) / 2;
  const dist = maxY - minY;
  if (dist < 10) return '';

  const arrowSize = 4;
  return `
    <g class="pacdora-dim-v">
      <line x1="${x}" y1="${minY}" x2="${x}" y2="${maxY}" stroke="#0284c7" stroke-width="0.9" />
      <polygon points="${x},${minY} ${x - 2.5},${minY + arrowSize} ${x + 2.5},${minY + arrowSize}" fill="#0284c7" />
      <polygon points="${x},${maxY} ${x - 2.5},${maxY - arrowSize} ${x + 2.5},${maxY - arrowSize}" fill="#0284c7" />
      <rect x="${x - 26}" y="${midY - 8}" width="52" height="16" rx="3" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.5" />
      <text x="${x}" y="${midY + 3.5}" font-family="'Inter', 'Vazirmatn', sans-serif" font-size="8.5px" font-weight="600" fill="#0284c7" text-anchor="middle">
        ${text} ${unit}
      </text>
    </g>
  `;
}

/**
 * MASTER PARAMETRIC DIELINE GENERATOR
 * Supports all standard 22 Pacdora / ECMA / FEFCO templates
 */
function generateParametricStudioDieline({
  boxType = 'tuck_end',
  type = null,
  length = 120,
  width = 60,
  height = 160,
  materialId = '350g_white',
  material = null,
  material_type = null,
  customThickness = null,
  thickness = null,
  sizeMode = 'mfg',
  size_mode = null
}) {
  const modelKey = (boxType || type || 'tuck_end').toLowerCase();
  const effectiveMatId = materialId || material || material_type || '350g_white';
  const mat = MATERIAL_DATABASE[effectiveMatId] || MATERIAL_DATABASE['350g_white'];
  const T = customThickness || thickness ? parseFloat(customThickness || thickness) : mat.thicknessMm;
  const bendLoss = mat.bendLoss;
  const effectiveSizeMode = size_mode || sizeMode || 'mfg';

  const triad = calculateDimensionTriad({
    L: parseFloat(length) || 120,
    W: parseFloat(width) || 60,
    H: parseFloat(height) || 160,
    sizeMode: effectiveSizeMode,
    thicknessMm: T,
    bendLoss
  });

  const L = triad.mfg.l;
  const W = triad.mfg.w;
  const H = triad.mfg.h;
  const glueW = mat.glueTabW || 15;

  let flatW = 0;
  let flatH = 0;
  let cutPaths = [];
  let creasePaths = [];
  let bleedPaths = [];
  let inCanvasDims = [];
  let totalCutMm = 0;
  let totalCreaseMm = 0;

  const padX = 60;
  const padY = 60;

  switch (modelKey) {
    // ================= 1. Straight Tuck End (STE) - ECMA A20.20 =================
    case 'tuck_end':
    case 'ste':
    case '100010': {
      const tuck = Math.max(14, Math.min(28, W * 0.75 + 2));
      const flapH = W;
      const dustH = Math.min(flapH * 0.85, 20);

      flatW = (L * 2) + (W * 2) + glueW;
      flatH = H + (flapH * 2) + (tuck * 2);

      const ox = padX;
      const oy = padY + flapH + tuck;

      const x0 = ox;
      const x1 = ox + glueW;
      const x2 = x1 + L;
      const x3 = x2 + W;
      const x4 = x3 + L;
      const x5 = x4 + W;

      const yTopBody = oy;
      const yBotBody = oy + H;
      const yTopFlap = yTopBody - flapH;
      const yTopTuck = yTopFlap - tuck;
      const yBotFlap = yBotBody + flapH;
      const yBotTuck = yBotFlap + tuck;

      // Crease lines (Dashed)
      creasePaths.push(`M ${x1} ${yTopBody} L ${x1} ${yBotBody}`);
      creasePaths.push(`M ${x2} ${yTopBody} L ${x2} ${yBotBody}`);
      creasePaths.push(`M ${x3} ${yTopBody} L ${x3} ${yBotBody}`);
      creasePaths.push(`M ${x4} ${yTopBody} L ${x4} ${yBotBody}`);
      creasePaths.push(`M ${x1} ${yTopBody} L ${x5} ${yTopBody}`);
      creasePaths.push(`M ${x1} ${yBotBody} L ${x5} ${yBotBody}`);
      creasePaths.push(`M ${x1} ${yTopFlap} L ${x2} ${yTopFlap}`);
      creasePaths.push(`M ${x1} ${yBotFlap} L ${x2} ${yBotFlap}`);

      // Trim / Cut lines (Solid)
      cutPaths.push(`
        M ${x0} ${yTopBody + 6}
        L ${x1} ${yTopBody}
        L ${x1} ${yTopFlap}
        L ${x1 + 4} ${yTopFlap}
        L ${x1 + 4} ${yTopTuck + 5}
        Q ${x1 + 4} ${yTopTuck} ${x1 + 9} ${yTopTuck}
        L ${x2 - 9} ${yTopTuck}
        Q ${x2 - 4} ${yTopTuck} ${x2 - 4} ${yTopTuck + 5}
        L ${x2 - 4} ${yTopFlap}
        L ${x2} ${yTopFlap}
        L ${x2} ${yTopBody}
        L ${x2 + 3} ${yTopBody - dustH}
        L ${x3 - 3} ${yTopBody - dustH}
        L ${x3} ${yTopBody}
        L ${x4} ${yTopBody}
        L ${x4 + 3} ${yTopBody - dustH}
        L ${x5 - 3} ${yTopBody - dustH}
        L ${x5} ${yTopBody}
        L ${x5} ${yBotBody}
        L ${x5 - 3} ${yBotBody + dustH}
        L ${x4 + 3} ${yBotBody + dustH}
        L ${x4} ${yBotBody}
        L ${x3} ${yBotBody}
        L ${x3 - 3} ${yBotBody + dustH}
        L ${x2 + 3} ${yBotBody + dustH}
        L ${x2} ${yBotBody}
        L ${x2} ${yBotFlap}
        L ${x2 - 4} ${yBotFlap}
        L ${x2 - 4} ${yBotTuck - 5}
        Q ${x2 - 4} ${yBotTuck} ${x2 - 9} ${yBotTuck}
        L ${x1 + 9} ${yBotTuck}
        Q ${x1 + 4} ${yBotTuck} ${x1 + 4} ${yBotTuck - 5}
        L ${x1 + 4} ${yBotFlap}
        L ${x1} ${yBotFlap}
        L ${x1} ${yBotBody}
        L ${x0} ${yBotBody - 6}
        Z
      `);

      // Bleed Line
      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);

      // In-Canvas Dimensions
      inCanvasDims.push(createPacdoraDimArrowH({ x1: x1, x2: x2, y: yTopBody + H * 0.6, text: `${L}` }));
      inCanvasDims.push(createPacdoraDimArrowH({ x1: x2, x2: x3, y: yTopBody + H * 0.25, text: `${W}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: x4 + W / 2, y1: yTopBody, y2: yBotBody, text: `${H}` }));

      totalCutMm = (2 * flatW) + (2 * flatH) + 120;
      totalCreaseMm = (4 * H) + (2 * (flatW - glueW)) + (2 * L);
      break;
    }

    // ================= 2. Reverse Tuck End (RTE) - ECMA A20.40 =================
    case 'reverse_tuck':
    case 'rte':
    case '100020': {
      const tuck = Math.max(14, Math.min(28, W * 0.75 + 2));
      const flapH = W;
      const dustH = Math.min(flapH * 0.85, 20);

      flatW = (L * 2) + (W * 2) + glueW;
      flatH = H + (flapH * 2) + (tuck * 2);

      const ox = padX;
      const oy = padY + flapH + tuck;

      const x0 = ox;
      const x1 = ox + glueW;
      const x2 = x1 + L;
      const x3 = x2 + W;
      const x4 = x3 + L;
      const x5 = x4 + W;

      const yTopBody = oy;
      const yBotBody = oy + H;
      const yTopFlap = yTopBody - flapH;
      const yTopTuck = yTopFlap - tuck;
      const yBotFlap = yBotBody + flapH;
      const yBotTuck = yBotFlap + tuck;

      // Creases
      creasePaths.push(`M ${x1} ${yTopBody} L ${x1} ${yBotBody}`);
      creasePaths.push(`M ${x2} ${yTopBody} L ${x2} ${yBotBody}`);
      creasePaths.push(`M ${x3} ${yTopBody} L ${x3} ${yBotBody}`);
      creasePaths.push(`M ${x4} ${yTopBody} L ${x4} ${yBotBody}`);
      creasePaths.push(`M ${x1} ${yTopBody} L ${x5} ${yTopBody}`);
      creasePaths.push(`M ${x1} ${yBotBody} L ${x5} ${yBotBody}`);
      creasePaths.push(`M ${x1} ${yTopFlap} L ${x2} ${yTopFlap}`);
      creasePaths.push(`M ${x3} ${yBotFlap} L ${x4} ${yBotFlap}`);

      // Cuts (Top tuck on L1, Bottom tuck on L2)
      cutPaths.push(`
        M ${x0} ${yTopBody + 6}
        L ${x1} ${yTopBody}
        L ${x1} ${yTopFlap}
        L ${x1 + 4} ${yTopFlap}
        L ${x1 + 4} ${yTopTuck + 5}
        Q ${x1 + 4} ${yTopTuck} ${x1 + 9} ${yTopTuck}
        L ${x2 - 9} ${yTopTuck}
        Q ${x2 - 4} ${yTopTuck} ${x2 - 4} ${yTopTuck + 5}
        L ${x2 - 4} ${yTopFlap}
        L ${x2} ${yTopFlap}
        L ${x2} ${yTopBody}
        L ${x2 + 3} ${yTopBody - dustH}
        L ${x3 - 3} ${yTopBody - dustH}
        L ${x3} ${yTopBody}
        L ${x4} ${yTopBody}
        L ${x4 + 3} ${yTopBody - dustH}
        L ${x5 - 3} ${yTopBody - dustH}
        L ${x5} ${yTopBody}
        L ${x5} ${yBotBody}
        L ${x5 - 3} ${yBotBody + dustH}
        L ${x4 + 3} ${yBotBody + dustH}
        L ${x4} ${yBotBody}
        L ${x4} ${yBotFlap}
        L ${x4 - 4} ${yBotFlap}
        L ${x4 - 4} ${yBotTuck - 5}
        Q ${x4 - 4} ${yBotTuck} ${x4 - 9} ${yBotTuck}
        L ${x3 + 9} ${yBotTuck}
        Q ${x3 + 4} ${yBotTuck} ${x3 + 4} ${yBotTuck - 5}
        L ${x3 + 4} ${yBotFlap}
        L ${x3} ${yBotFlap}
        L ${x3} ${yBotBody}
        L ${x3 - 3} ${yBotBody + dustH}
        L ${x2 + 3} ${yBotBody + dustH}
        L ${x2} ${yBotBody}
        L ${x1} ${yBotBody}
        L ${x0} ${yBotBody - 6}
        Z
      `);

      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);

      inCanvasDims.push(createPacdoraDimArrowH({ x1: x1, x2: x2, y: yTopBody + H * 0.6, text: `${L}` }));
      inCanvasDims.push(createPacdoraDimArrowH({ x1: x2, x2: x3, y: yTopBody + H * 0.25, text: `${W}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: x4 + W / 2, y1: yTopBody, y2: yBotBody, text: `${H}` }));

      totalCutMm = (2 * flatW) + (2 * flatH) + 120;
      totalCreaseMm = (4 * H) + (2 * (flatW - glueW)) + (2 * L);
      break;
    }

    // ================= 3. Snap-Lock Bottom (1-2-3 Bottom) - ECMA A50.20 =================
    case 'snap_lock_bottom':
    case '1-2-3_bottom':
    case '110010': {
      const tuck = Math.max(14, Math.min(26, W * 0.75));
      const topFlap = W;
      const botFlap = Math.max(W * 0.75, 25);

      flatW = (2 * L) + (2 * W) + glueW;
      flatH = H + topFlap + tuck + botFlap;

      const ox = padX;
      const oy = padY + topFlap + tuck;

      const x1 = ox + glueW;
      const x2 = x1 + L;
      const x3 = x2 + W;
      const x4 = x3 + L;
      const x5 = x4 + W;

      creasePaths.push(`M ${x1} ${oy} L ${x1} ${oy + H}`);
      creasePaths.push(`M ${x2} ${oy} L ${x2} ${oy + H}`);
      creasePaths.push(`M ${x3} ${oy} L ${x3} ${oy + H}`);
      creasePaths.push(`M ${x4} ${oy} L ${x4} ${oy + H}`);
      creasePaths.push(`M ${x1} ${oy} L ${x5} ${oy}`);
      creasePaths.push(`M ${x1} ${oy + H} L ${x5} ${oy + H}`);
      creasePaths.push(`M ${x1} ${oy - topFlap} L ${x2} ${oy - topFlap}`);

      // Snap lock bottom cut profile
      cutPaths.push(`
        M ${ox} ${oy + 8}
        L ${x1} ${oy}
        L ${x1} ${oy - topFlap}
        L ${x2} ${oy - topFlap}
        L ${x2} ${oy}
        L ${x5} ${oy}
        L ${x5} ${oy + H}
        L ${x4} ${oy + H + botFlap * 0.6}
        L ${x3} ${oy + H + botFlap}
        L ${x2} ${oy + H + botFlap * 0.6}
        L ${x1} ${oy + H + botFlap}
        L ${x1} ${oy + H}
        L ${ox} ${oy + H - 8}
        Z
      `);

      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);
      inCanvasDims.push(createPacdoraDimArrowH({ x1: x1, x2: x2, y: oy + H * 0.5, text: `${L}` }));
      inCanvasDims.push(createPacdoraDimArrowH({ x1: x2, x2: x3, y: oy + H * 0.25, text: `${W}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: x4 + W / 2, y1: oy, y2: oy + H, text: `${H}` }));

      totalCutMm = (2 * flatW) + (2 * flatH) + 140;
      totalCreaseMm = (4 * H) + (2 * (flatW - glueW)) + L;
      break;
    }

    // ================= 4. Crash-Lock Auto Bottom - ECMA A55.20 =================
    case 'auto_bottom':
    case 'crash_lock':
    case '110020': {
      const tuck = Math.max(14, Math.min(26, W * 0.75));
      const topFlap = W;
      const botFlap = Math.max(W * 0.85, 30);

      flatW = (2 * L) + (2 * W) + glueW;
      flatH = H + topFlap + tuck + botFlap;

      const ox = padX;
      const oy = padY + topFlap + tuck;

      const x1 = ox + glueW;
      const x2 = x1 + L;
      const x3 = x2 + W;
      const x4 = x3 + L;
      const x5 = x4 + W;

      // Creases + 45 deg diagonal fold creases on base flaps
      creasePaths.push(`M ${x1} ${oy} L ${x1} ${oy + H}`);
      creasePaths.push(`M ${x2} ${oy} L ${x2} ${oy + H}`);
      creasePaths.push(`M ${x3} ${oy} L ${x3} ${oy + H}`);
      creasePaths.push(`M ${x4} ${oy} L ${x4} ${oy + H}`);
      creasePaths.push(`M ${x1} ${oy} L ${x5} ${oy}`);
      creasePaths.push(`M ${x1} ${oy + H} L ${x5} ${oy + H}`);
      creasePaths.push(`M ${x1} ${oy - topFlap} L ${x2} ${oy - topFlap}`);
      // Auto bottom 45° creases
      creasePaths.push(`M ${x1} ${oy + H} L ${x1 + (W * 0.5)} ${oy + H + (W * 0.5)}`);
      creasePaths.push(`M ${x3} ${oy + H} L ${x3 + (W * 0.5)} ${oy + H + (W * 0.5)}`);

      cutPaths.push(`
        M ${ox} ${oy + 8}
        L ${x1} ${oy}
        L ${x1} ${oy - topFlap}
        L ${x2} ${oy - topFlap}
        L ${x2} ${oy}
        L ${x5} ${oy}
        L ${x5} ${oy + H}
        L ${x4} ${oy + H + botFlap}
        L ${x3} ${oy + H + botFlap * 0.8}
        L ${x2} ${oy + H + botFlap}
        L ${x1} ${oy + H + botFlap * 0.8}
        L ${x1} ${oy + H}
        L ${ox} ${oy + H - 8}
        Z
      `);

      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);
      inCanvasDims.push(createPacdoraDimArrowH({ x1: x1, x2: x2, y: oy + H * 0.5, text: `${L}` }));
      inCanvasDims.push(createPacdoraDimArrowH({ x1: x2, x2: x3, y: oy + H * 0.25, text: `${W}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: x4 + W / 2, y1: oy, y2: oy + H, text: `${H}` }));

      totalCutMm = (2 * flatW) + (2 * flatH) + 160;
      totalCreaseMm = (4 * H) + (2 * (flatW - glueW)) + L + (W * 1.4);
      break;
    }

    // ================= 5. Flip-Top Mailer Box (FEFCO 0427) =================
    case 'keyboard':
    case 'mailer':
    case 'fefco_0427':
    case '150010': {
      const rollH = Math.max(15, H - (1.5 * T));
      const frontFlap = Math.max(20, H - T);
      const earW = Math.min(22, Math.max(14, W * 0.15));

      flatW = L + (2 * H) + (2 * rollH) + (2 * earW);
      flatH = (2 * W) + (2 * H) + frontFlap + (2 * T);

      const ox = padX + rollH + earW;
      const oy = padY + frontFlap;

      const xL0 = ox - H;
      const xL1 = ox;
      const xR1 = ox + L;
      const xR0 = xR1 + H;

      const yFrontLid = oy - frontFlap;
      const yLidCrease = oy;
      const yBackWall = oy + W;
      const yBottomCrease = yBackWall + H;
      const yFrontWall = yBottomCrease + W;
      const yRollOver = yFrontWall + H;

      // Creases
      creasePaths.push(`M ${xL1} ${yLidCrease} L ${xR1} ${yLidCrease}`);
      creasePaths.push(`M ${xL1} ${yBackWall} L ${xR1} ${yBackWall}`);
      creasePaths.push(`M ${xL1} ${yBottomCrease} L ${xR1} ${yBottomCrease}`);
      creasePaths.push(`M ${xL1} ${yFrontWall} L ${xR1} ${yFrontWall}`);
      creasePaths.push(`M ${xL1} ${yBottomCrease} L ${xL1} ${yFrontWall}`);
      creasePaths.push(`M ${xR1} ${yBottomCrease} L ${xR1} ${yFrontWall}`);
      creasePaths.push(`M ${xL0} ${yBottomCrease} L ${xL0} ${yFrontWall}`);
      creasePaths.push(`M ${xR0} ${yBottomCrease} L ${xR0} ${yFrontWall}`);

      // Cut Lines
      cutPaths.push(`
        M ${xL1} ${yFrontLid}
        L ${xR1} ${yFrontLid}
        L ${xR1 + earW} ${yLidCrease - 4}
        L ${xR1 + earW} ${yLidCrease + 4}
        L ${xR1} ${yLidCrease + 12}
        L ${xR1} ${yBackWall}
        L ${xR0} ${yBackWall + 5}
        L ${xR0 + rollH} ${yBottomCrease}
        L ${xR0 + rollH} ${yFrontWall}
        L ${xR0} ${yFrontWall + H - 5}
        L ${xR1} ${yFrontWall + H}
        L ${xR1 - 15} ${yRollOver}
        L ${xL1 + 15} ${yRollOver}
        L ${xL1} ${yFrontWall + H}
        L ${xL0} ${yFrontWall + H - 5}
        L ${xL0 - rollH} ${yFrontWall}
        L ${xL0 - rollH} ${yBottomCrease}
        L ${xL0} ${yBackWall + 5}
        L ${xL1} ${yBackWall}
        L ${xL1} ${yLidCrease + 12}
        L ${xL1 - earW} ${yLidCrease + 4}
        L ${xL1 - earW} ${yLidCrease - 4}
        Z
      `);

      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);
      inCanvasDims.push(createPacdoraDimArrowH({ x1: xL1, x2: xR1, y: yBackWall + H / 2, text: `${L}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: xL1 + L / 2, y1: yBottomCrease, y2: yFrontWall, text: `${W}` }));
      inCanvasDims.push(createPacdoraDimArrowH({ x1: xR1, x2: xR0, y: yBottomCrease + W / 2, text: `${H}` }));

      totalCutMm = (2 * flatW) + (2 * flatH) + 160;
      totalCreaseMm = (4 * L) + (4 * W);
      break;
    }

    // ================= 6. Regular Slotted Carton (RSC) - FEFCO 0201 =================
    case 'american':
    case 'rsc':
    case 'fefco_0201':
    case '200010': {
      const flapH = W / 2;
      flatW = (2 * L) + (2 * W) + glueW;
      flatH = H + (2 * flapH);

      const ox = padX;
      const oy = padY + flapH;

      const x1 = ox + glueW;
      const x2 = x1 + L;
      const x3 = x2 + W;
      const x4 = x3 + L;
      const x5 = x4 + W;

      creasePaths.push(`M ${x1} ${oy} L ${x1} ${oy + H}`);
      creasePaths.push(`M ${x2} ${oy} L ${x2} ${oy + H}`);
      creasePaths.push(`M ${x3} ${oy} L ${x3} ${oy + H}`);
      creasePaths.push(`M ${x4} ${oy} L ${x4} ${oy + H}`);
      creasePaths.push(`M ${x1} ${oy} L ${x5} ${oy}`);
      creasePaths.push(`M ${x1} ${oy + H} L ${x5} ${oy + H}`);

      cutPaths.push(`M ${ox} ${oy + 10} L ${x1} ${oy} L ${x1} ${oy - flapH} L ${x2} ${oy - flapH} L ${x2} ${oy} L ${x3} ${oy - flapH} L ${x4} ${oy - flapH} L ${x4} ${oy} L ${x5} ${oy} L ${x5} ${oy + H} L ${x5} ${oy + H + flapH} L ${x4} ${oy + H + flapH} L ${x4} ${oy + H} L ${x3} ${oy + H + flapH} L ${x2} ${oy + H + flapH} L ${x2} ${oy + H} L ${x1} ${oy + H + flapH} L ${x1} ${oy + H} L ${ox} ${oy + H - 10} Z`);
      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);

      inCanvasDims.push(createPacdoraDimArrowH({ x1: x1, x2: x2, y: oy + H * 0.5, text: `${L}` }));
      inCanvasDims.push(createPacdoraDimArrowH({ x1: x2, x2: x3, y: oy + H * 0.3, text: `${W}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: x4 + W / 2, y1: oy, y2: oy + H, text: `${H}` }));

      totalCutMm = (2 * flatW) + (2 * flatH) + 80;
      totalCreaseMm = (4 * H) + (2 * (flatW - glueW));
      break;
    }

    // ================= 7. Half Slotted Container (HSC) - FEFCO 0200 =================
    case 'hsc':
    case 'fefco_0200':
    case '200020': {
      const flapH = W / 2;
      flatW = (2 * L) + (2 * W) + glueW;
      flatH = H + flapH;

      const ox = padX;
      const oy = padY;

      const x1 = ox + glueW;
      const x2 = x1 + L;
      const x3 = x2 + W;
      const x4 = x3 + L;
      const x5 = x4 + W;

      creasePaths.push(`M ${x1} ${oy} L ${x1} ${oy + H}`);
      creasePaths.push(`M ${x2} ${oy} L ${x2} ${oy + H}`);
      creasePaths.push(`M ${x3} ${oy} L ${x3} ${oy + H}`);
      creasePaths.push(`M ${x4} ${oy} L ${x4} ${oy + H}`);
      creasePaths.push(`M ${x1} ${oy + H} L ${x5} ${oy + H}`);

      cutPaths.push(`M ${ox} ${oy + 10} L ${x1} ${oy} L ${x5} ${oy} L ${x5} ${oy + H} L ${x5} ${oy + H + flapH} L ${x4} ${oy + H + flapH} L ${x4} ${oy + H} L ${x3} ${oy + H + flapH} L ${x2} ${oy + H + flapH} L ${x2} ${oy + H} L ${x1} ${oy + H + flapH} L ${x1} ${oy + H} L ${ox} ${oy + H - 10} Z`);
      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);
      inCanvasDims.push(createPacdoraDimArrowH({ x1: x1, x2: x2, y: oy + H * 0.5, text: `${L}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: x4 + W / 2, y1: oy, y2: oy + H, text: `${H}` }));

      totalCutMm = (2 * flatW) + (2 * flatH) + 60;
      totalCreaseMm = (4 * H) + (flatW - glueW);
      break;
    }

    // ================= 8. Full Overlap Carton (FOL) - FEFCO 0203 =================
    case 'full_overlap':
    case 'fol':
    case 'fefco_0203':
    case '200030': {
      const flapH = W; // Full overlap equals full width
      flatW = (2 * L) + (2 * W) + glueW;
      flatH = H + (2 * flapH);

      const ox = padX;
      const oy = padY + flapH;

      const x1 = ox + glueW;
      const x2 = x1 + L;
      const x3 = x2 + W;
      const x4 = x3 + L;
      const x5 = x4 + W;

      creasePaths.push(`M ${x1} ${oy} L ${x1} ${oy + H}`);
      creasePaths.push(`M ${x2} ${oy} L ${x2} ${oy + H}`);
      creasePaths.push(`M ${x3} ${oy} L ${x3} ${oy + H}`);
      creasePaths.push(`M ${x4} ${oy} L ${x4} ${oy + H}`);
      creasePaths.push(`M ${x1} ${oy} L ${x5} ${oy}`);
      creasePaths.push(`M ${x1} ${oy + H} L ${x5} ${oy + H}`);

      cutPaths.push(`M ${ox} ${oy + 10} L ${x1} ${oy} L ${x1} ${oy - flapH} L ${x2} ${oy - flapH} L ${x2} ${oy} L ${x3} ${oy - flapH} L ${x4} ${oy - flapH} L ${x4} ${oy} L ${x5} ${oy} L ${x5} ${oy + H} L ${x5} ${oy + H + flapH} L ${x4} ${oy + H + flapH} L ${x4} ${oy + H} L ${x3} ${oy + H + flapH} L ${x2} ${oy + H + flapH} L ${x2} ${oy + H} L ${x1} ${oy + H + flapH} L ${x1} ${oy + H} L ${ox} ${oy + H - 10} Z`);
      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);
      inCanvasDims.push(createPacdoraDimArrowH({ x1: x1, x2: x2, y: oy + H * 0.5, text: `${L}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: x4 + W / 2, y1: oy, y2: oy + H, text: `${H}` }));

      totalCutMm = (2 * flatW) + (2 * flatH) + 90;
      totalCreaseMm = (4 * H) + (2 * (flatW - glueW));
      break;
    }

    // ================= 9. Corrugated Pizza Box =================
    case 'pizza_box':
    case '160010': {
      const flap = Math.max(18, H);
      flatW = L + (2 * H) + 30;
      flatH = (2 * W) + (2 * H) + flap;

      const ox = padX + H + 15;
      const oy = padY + flap;

      creasePaths.push(`M ${ox} ${oy} L ${ox + L} ${oy}`);
      creasePaths.push(`M ${ox} ${oy + W} L ${ox + L} ${oy + W}`);
      creasePaths.push(`M ${ox} ${oy + W + H} L ${ox + L} ${oy + W + H}`);
      creasePaths.push(`M ${ox} ${oy + W + H + W} L ${ox + L} ${oy + W + H + W}`);
      creasePaths.push(`M ${ox} ${oy + W} L ${ox} ${oy + W + H}`);
      creasePaths.push(`M ${ox + L} ${oy + W} L ${ox + L} ${oy + W + H}`);

      cutPaths.push(`
        M ${ox} ${oy - flap}
        L ${ox + L} ${oy - flap}
        L ${ox + L + 12} ${oy}
        L ${ox + L + H} ${oy + W}
        L ${ox + L + H + 10} ${oy + W + H}
        L ${ox + L} ${oy + W + H + W + H}
        L ${ox} ${oy + W + H + W + H}
        L ${ox - H - 10} ${oy + W + H}
        L ${ox - H} ${oy + W}
        L ${ox - 12} ${oy}
        Z
      `);

      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);
      inCanvasDims.push(createPacdoraDimArrowH({ x1: ox, x2: ox + L, y: oy + W / 2, text: `${L}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: ox + L / 2, y1: oy, y2: oy + W, text: `${W}` }));

      totalCutMm = (2 * flatW) + (2 * flatH);
      totalCreaseMm = (4 * L) + (2 * H);
      break;
    }

    // ================= 10. Two-Piece Base & Lid (Rigid Box) =================
    case 'two_piece':
    case 'base_lid':
    case 'rigid_box':
    case '300010': {
      // Base Flat (Left) + Lid Flat (Right)
      const baseFlatW = L + (2 * H);
      const baseFlatH = W + (2 * H);
      const lidH = Math.max(15, H * 0.6);
      const lidFlatW = (L + 3) + (2 * lidH);
      const lidFlatH = (W + 3) + (2 * lidH);

      const gap = 30;
      flatW = baseFlatW + gap + lidFlatW;
      flatH = Math.max(baseFlatH, lidFlatH);

      // Base Box (Left)
      const bx1 = padX + H;
      const bx2 = bx1 + L;
      const by1 = padY + H;
      const by2 = by1 + W;

      creasePaths.push(`M ${bx1} ${by1} L ${bx2} ${by1}`);
      creasePaths.push(`M ${bx1} ${by2} L ${bx2} ${by2}`);
      creasePaths.push(`M ${bx1} ${by1} L ${bx1} ${by2}`);
      creasePaths.push(`M ${bx2} ${by1} L ${bx2} ${by2}`);

      cutPaths.push(`
        M ${padX} ${by1}
        L ${bx1} ${by1}
        L ${bx1} ${padY}
        L ${bx2} ${padY}
        L ${bx2} ${by1}
        L ${padX + baseFlatW} ${by1}
        L ${padX + baseFlatW} ${by2}
        L ${bx2} ${by2}
        L ${bx2} ${padY + baseFlatH}
        L ${bx1} ${padY + baseFlatH}
        L ${bx1} ${by2}
        L ${padX} ${by2}
        Z
      `);

      // Lid Box (Right)
      const lxOffset = padX + baseFlatW + gap;
      const lx1 = lxOffset + lidH;
      const lx2 = lx1 + L + 3;
      const ly1 = padY + lidH;
      const ly2 = ly1 + W + 3;

      creasePaths.push(`M ${lx1} ${ly1} L ${lx2} ${ly1}`);
      creasePaths.push(`M ${lx1} ${ly2} L ${lx2} ${ly2}`);
      creasePaths.push(`M ${lx1} ${ly1} L ${lx1} ${ly2}`);
      creasePaths.push(`M ${lx2} ${ly1} L ${lx2} ${ly2}`);

      cutPaths.push(`
        M ${lxOffset} ${ly1}
        L ${lx1} ${ly1}
        L ${lx1} ${padY}
        L ${lx2} ${padY}
        L ${lx2} ${ly1}
        L ${lxOffset + lidFlatW} ${ly1}
        L ${lxOffset + lidFlatW} ${ly2}
        L ${lx2} ${ly2}
        L ${lx2} ${padY + lidFlatH}
        L ${lx1} ${padY + lidFlatH}
        L ${lx1} ${ly2}
        L ${lxOffset} ${ly2}
        Z
      `);

      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);
      inCanvasDims.push(createPacdoraDimArrowH({ x1: bx1, x2: bx2, y: by1 + W / 2, text: `کف: ${L}` }));
      inCanvasDims.push(createPacdoraDimArrowH({ x1: lx1, x2: lx2, y: ly1 + (W + 3) / 2, text: `درب: ${L + 3}` }));

      totalCutMm = (2 * baseFlatW + 2 * baseFlatH) + (2 * lidFlatW + 2 * lidFlatH);
      totalCreaseMm = (2 * L + 2 * W) + (2 * (L + 3) + 2 * (W + 3));
      break;
    }

    // ================= 11. Matchbox Sleeve & Drawer =================
    case 'sleeve_tray':
    case 'drawer':
    case 'matchbox':
    case '310010': {
      // Outer Sleeve (Top) + Inner Tray (Bottom)
      const sleeveFlatW = (2 * L) + (2 * H) + glueW;
      const sleeveFlatH = W;
      const trayFlatW = L + (2 * H);
      const trayFlatH = W + (2 * H);

      flatW = Math.max(sleeveFlatW, trayFlatW);
      flatH = sleeveFlatH + 30 + trayFlatH;

      const sx0 = padX;
      const sx1 = sx0 + glueW;
      const sx2 = sx1 + L;
      const sx3 = sx2 + H;
      const sx4 = sx3 + L;
      const sx5 = sx4 + H;
      const sy0 = padY;
      const sy1 = sy0 + sleeveFlatH;

      // Sleeve creases
      creasePaths.push(`M ${sx1} ${sy0} L ${sx1} ${sy1}`);
      creasePaths.push(`M ${sx2} ${sy0} L ${sx2} ${sy1}`);
      creasePaths.push(`M ${sx3} ${sy0} L ${sx3} ${sy1}`);
      creasePaths.push(`M ${sx4} ${sy0} L ${sx4} ${sy1}`);
      cutPaths.push(`M ${sx0} ${sy0 + 6} L ${sx1} ${sy0} L ${sx5} ${sy0} L ${sx5} ${sy1} L ${sx1} ${sy1} L ${sx0} ${sy1 - 6} Z`);

      // Tray (Bottom)
      const tyOffset = sy1 + 30;
      const tx1 = padX + H;
      const tx2 = tx1 + L;
      const ty1 = tyOffset + H;
      const ty2 = ty1 + W;

      creasePaths.push(`M ${tx1} ${ty1} L ${tx2} ${ty1}`);
      creasePaths.push(`M ${tx1} ${ty2} L ${tx2} ${ty2}`);
      creasePaths.push(`M ${tx1} ${ty1} L ${tx1} ${ty2}`);
      creasePaths.push(`M ${tx2} ${ty1} L ${tx2} ${ty2}`);

      cutPaths.push(`
        M ${padX} ${ty1}
        L ${tx1} ${ty1}
        L ${tx1} ${tyOffset}
        L ${tx2} ${tyOffset}
        L ${tx2} ${ty1}
        L ${padX + trayFlatW} ${ty1}
        L ${padX + trayFlatW} ${ty2}
        L ${tx2} ${ty2}
        L ${tx2} ${tyOffset + trayFlatH}
        L ${tx1} ${tyOffset + trayFlatH}
        L ${tx1} ${ty2}
        L ${padX} ${ty2}
        Z
      `);

      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);
      inCanvasDims.push(createPacdoraDimArrowH({ x1: sx1, x2: sx2, y: sy0 + sleeveFlatH / 2, text: `غلاف: ${L}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: sx2 + H / 2, y1: sy0, y2: sy1, text: `${W}` }));

      totalCutMm = (2 * sleeveFlatW + 2 * sleeveFlatH) + (2 * trayFlatW + 2 * trayFlatH);
      totalCreaseMm = (4 * W) + (2 * L + 2 * W);
      break;
    }

    // ================= 12. Book Style Rigid Box =================
    case 'book_style':
    case 'magnetic_box':
    case '320010': {
      const magFlap = 35;
      const coverFlatW = (2 * L) + H + magFlap + 10;
      const coverFlatH = W + 10;
      const trayFlatW = L + (2 * H);
      const trayFlatH = W + (2 * H);

      flatW = Math.max(coverFlatW, trayFlatW);
      flatH = coverFlatH + 30 + trayFlatH;

      const ox = padX;
      const oy = padY;
      const cx1 = ox + magFlap;
      const cx2 = cx1 + L;
      const cx3 = cx2 + H;
      const cx4 = cx3 + L;

      creasePaths.push(`M ${cx1} ${oy} L ${cx1} ${oy + coverFlatH}`);
      creasePaths.push(`M ${cx2} ${oy} L ${cx2} ${oy + coverFlatH}`);
      creasePaths.push(`M ${cx3} ${oy} L ${cx3} ${oy + coverFlatH}`);

      cutPaths.push(`M ${ox} ${oy} L ${cx4} ${oy} L ${cx4} ${oy + coverFlatH} L ${ox} ${oy + coverFlatH} Z`);

      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);
      inCanvasDims.push(createPacdoraDimArrowH({ x1: cx2, x2: cx3, y: oy + coverFlatH / 2, text: `عطف: ${H}` }));
      inCanvasDims.push(createPacdoraDimArrowH({ x1: cx1, x2: cx2, y: oy + coverFlatH / 2, text: `کتابی: ${L}` }));

      totalCutMm = (2 * coverFlatW + 2 * coverFlatH) + 120;
      totalCreaseMm = 3 * coverFlatH;
      break;
    }

    // ================= 13. Pillow Box =================
    case 'pillow':
    case 'pillow_box':
    case '400010': {
      const flapCurve = Math.min(30, W * 0.35);
      flatW = (2 * L) + glueW;
      flatH = W + (2 * flapCurve);

      const ox = padX;
      const oy = padY + flapCurve;

      const x1 = ox + glueW;
      const x2 = x1 + L;
      const x3 = x2 + L;

      // Body crease
      creasePaths.push(`M ${x2} ${oy} L ${x2} ${oy + W}`);

      // Curved Creases Top & Bottom
      creasePaths.push(`M ${x1} ${oy} Q ${x1 + L / 2} ${oy + flapCurve * 0.6} ${x2} ${oy}`);
      creasePaths.push(`M ${x2} ${oy} Q ${x2 + L / 2} ${oy + flapCurve * 0.6} ${x3} ${oy}`);
      creasePaths.push(`M ${x1} ${oy + W} Q ${x1 + L / 2} ${oy + W - flapCurve * 0.6} ${x2} ${oy + W}`);
      creasePaths.push(`M ${x2} ${oy + W} Q ${x2 + L / 2} ${oy + W - flapCurve * 0.6} ${x3} ${oy + W}`);

      // Outer Cut
      cutPaths.push(`
        M ${ox} ${oy + 6}
        L ${x1} ${oy}
        Q ${x1 + L / 2} ${oy - flapCurve} ${x2} ${oy}
        Q ${x2 + L / 2} ${oy - flapCurve} ${x3} ${oy}
        L ${x3} ${oy + W}
        Q ${x2 + L / 2} ${oy + W + flapCurve} ${x2} ${oy + W}
        Q ${x1 + L / 2} ${oy + W + flapCurve} ${x1} ${oy + W}
        L ${ox} ${oy + W - 6}
        Z
      `);

      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);
      inCanvasDims.push(createPacdoraDimArrowH({ x1: x1, x2: x2, y: oy + W / 2, text: `${L}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: x2 + L / 2, y1: oy, y2: oy + W, text: `${W}` }));

      totalCutMm = 2 * (flatW + flatH);
      totalCreaseMm = W + (4 * L);
      break;
    }

    // ================= 14. Gable Top Box (Handle Gift Box) =================
    case 'gable_top':
    case 'handle_box':
    case '500010': {
      const handleH = Math.max(35, H * 0.35);
      const botFlap = W * 0.8;
      flatW = (2 * L) + (2 * W) + glueW;
      flatH = H + handleH + botFlap;

      const ox = padX;
      const oy = padY + handleH;

      const x1 = ox + glueW;
      const x2 = x1 + L;
      const x3 = x2 + W;
      const x4 = x3 + L;
      const x5 = x4 + W;

      creasePaths.push(`M ${x1} ${oy} L ${x1} ${oy + H}`);
      creasePaths.push(`M ${x2} ${oy} L ${x2} ${oy + H}`);
      creasePaths.push(`M ${x3} ${oy} L ${x3} ${oy + H}`);
      creasePaths.push(`M ${x4} ${oy} L ${x4} ${oy + H}`);
      creasePaths.push(`M ${x1} ${oy} L ${x5} ${oy}`);
      creasePaths.push(`M ${x1} ${oy + H} L ${x5} ${oy + H}`);

      // Triangular gable creases on side panels
      creasePaths.push(`M ${x2} ${oy} L ${x2 + W / 2} ${oy - handleH * 0.7}`);
      creasePaths.push(`M ${x3} ${oy} L ${x2 + W / 2} ${oy - handleH * 0.7}`);
      creasePaths.push(`M ${x4} ${oy} L ${x4 + W / 2} ${oy - handleH * 0.7}`);
      creasePaths.push(`M ${x5} ${oy} L ${x4 + W / 2} ${oy - handleH * 0.7}`);

      // Cut path with handle punch holes
      cutPaths.push(`
        M ${ox} ${oy + 6}
        L ${x1} ${oy}
        L ${x1} ${oy - handleH}
        L ${x2} ${oy - handleH}
        L ${x2} ${oy}
        L ${x3} ${oy}
        L ${x3} ${oy - handleH}
        L ${x4} ${oy - handleH}
        L ${x4} ${oy}
        L ${x5} ${oy}
        L ${x5} ${oy + H}
        L ${x4} ${oy + H + botFlap}
        L ${x3} ${oy + H + botFlap * 0.7}
        L ${x2} ${oy + H + botFlap}
        L ${x1} ${oy + H + botFlap * 0.7}
        L ${x1} ${oy + H}
        L ${ox} ${oy + H - 6}
        Z
      `);

      // Handle die cut slots
      cutPaths.push(`M ${x1 + 20} ${oy - handleH * 0.6} L ${x2 - 20} ${oy - handleH * 0.6} A 5 5 0 0 1 ${x2 - 20} ${oy - handleH * 0.3} L ${x1 + 20} ${oy - handleH * 0.3} A 5 5 0 0 1 ${x1 + 20} ${oy - handleH * 0.6} Z`);
      cutPaths.push(`M ${x3 + 20} ${oy - handleH * 0.6} L ${x4 - 20} ${oy - handleH * 0.6} A 5 5 0 0 1 ${x4 - 20} ${oy - handleH * 0.3} L ${x3 + 20} ${oy - handleH * 0.3} A 5 5 0 0 1 ${x3 + 20} ${oy - handleH * 0.6} Z`);

      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);
      inCanvasDims.push(createPacdoraDimArrowH({ x1: x1, x2: x2, y: oy + H * 0.5, text: `${L}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: x4 + W / 2, y1: oy, y2: oy + H, text: `${H}` }));

      totalCutMm = (2 * flatW + 2 * flatH) + 180;
      totalCreaseMm = (4 * H) + (2 * (flatW - glueW)) + (4 * handleH);
      break;
    }

    // ================= 15. Bakery & Cake Box =================
    case 'cake_box':
    case '510010': {
      const flapH = H;
      flatW = L + (2 * H) + 40;
      flatH = W + (2 * H) + 40;

      const ox = padX + H + 20;
      const oy = padY + H + 20;

      creasePaths.push(`M ${ox} ${oy} L ${ox + L} ${oy}`);
      creasePaths.push(`M ${ox} ${oy + W} L ${ox + L} ${oy + W}`);
      creasePaths.push(`M ${ox} ${oy} L ${ox} ${oy + W}`);
      creasePaths.push(`M ${ox + L} ${oy} L ${ox + L} ${oy + W}`);

      // 4-corner diagonal creases
      creasePaths.push(`M ${ox} ${oy} L ${ox - H} ${oy - H}`);
      creasePaths.push(`M ${ox + L} ${oy} L ${ox + L + H} ${oy - H}`);
      creasePaths.push(`M ${ox} ${oy + W} L ${ox - H} ${oy + W + H}`);
      creasePaths.push(`M ${ox + L} ${oy + W} L ${ox + L + H} ${oy + W + H}`);

      cutPaths.push(`
        M ${ox - H} ${oy}
        L ${ox} ${oy - H}
        L ${ox + L} ${oy - H}
        L ${ox + L + H} ${oy}
        L ${ox + L + H} ${oy + W}
        L ${ox + L} ${oy + W + H}
        L ${ox} ${oy + W + H}
        L ${ox - H} ${oy + W}
        Z
      `);

      // Optional Window cut in center
      const winW = Math.max(30, L * 0.5);
      const winH = Math.max(30, W * 0.5);
      cutPaths.push(`M ${ox + (L - winW) / 2} ${oy + (W - winH) / 2} L ${ox + (L + winW) / 2} ${oy + (W - winH) / 2} L ${ox + (L + winW) / 2} ${oy + (W + winH) / 2} L ${ox + (L - winW) / 2} ${oy + (W + winH) / 2} Z`);

      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);
      inCanvasDims.push(createPacdoraDimArrowH({ x1: ox, x2: ox + L, y: oy + W / 2, text: `${L}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: ox + L / 2, y1: oy, y2: oy + W, text: `${W}` }));

      totalCutMm = 2 * (flatW + flatH) + (2 * winW + 2 * winH);
      totalCreaseMm = (2 * L + 2 * W) + (4 * H * 1.414);
      break;
    }

    // ================= 16. Hanging Tab Box (Euro Punch) =================
    case 'hanging_tab':
    case 'euro_slot':
    case '120010': {
      const tuck = Math.max(14, Math.min(26, W * 0.75));
      const flapH = W;
      const tabH = 35;

      flatW = (L * 2) + (W * 2) + glueW;
      flatH = H + (flapH * 2) + (tuck * 2) + tabH;

      const ox = padX;
      const oy = padY + flapH + tuck + tabH;

      const x1 = ox + glueW;
      const x2 = x1 + L;
      const x3 = x2 + W;
      const x4 = x3 + L;
      const x5 = x4 + W;

      creasePaths.push(`M ${x1} ${oy} L ${x1} ${oy + H}`);
      creasePaths.push(`M ${x2} ${oy} L ${x2} ${oy + H}`);
      creasePaths.push(`M ${x3} ${oy} L ${x3} ${oy + H}`);
      creasePaths.push(`M ${x4} ${oy} L ${x4} ${oy + H}`);
      creasePaths.push(`M ${x1} ${oy} L ${x5} ${oy}`);
      creasePaths.push(`M ${x1} ${oy + H} L ${x5} ${oy + H}`);
      creasePaths.push(`M ${x1} ${oy - flapH} L ${x2} ${oy - flapH}`);

      // Cut path with extended hanging header on rear panel (x3 to x4)
      cutPaths.push(`
        M ${ox} ${oy + 6}
        L ${x1} ${oy}
        L ${x1} ${oy - flapH - tuck}
        L ${x2} ${oy - flapH - tuck}
        L ${x2} ${oy}
        L ${x3} ${oy}
        L ${x3} ${oy - flapH - tabH}
        L ${x4} ${oy - flapH - tabH}
        L ${x4} ${oy}
        L ${x5} ${oy}
        L ${x5} ${oy + H}
        L ${x4} ${oy + H + flapH + tuck}
        L ${x3} ${oy + H + flapH + tuck}
        L ${x3} ${oy + H}
        L ${x1} ${oy + H}
        L ${ox} ${oy + H - 6}
        Z
      `);

      // Standard Euro Slot punch hole in hanging header
      const euroMidX = (x3 + x4) / 2;
      const euroY = oy - flapH - tabH / 2;
      cutPaths.push(`
        M ${euroMidX - 15} ${euroY}
        L ${euroMidX - 5} ${euroY}
        A 4 4 0 0 1 ${euroMidX + 5} ${euroY}
        L ${euroMidX + 15} ${euroY}
        A 3 3 0 0 1 ${euroMidX + 15} ${euroY + 6}
        L ${euroMidX - 15} ${euroY + 6}
        A 3 3 0 0 1 ${euroMidX - 15} ${euroY}
        Z
      `);

      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);
      inCanvasDims.push(createPacdoraDimArrowH({ x1: x1, x2: x2, y: oy + H * 0.5, text: `${L}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: x4 + W / 2, y1: oy, y2: oy + H, text: `${H}` }));

      totalCutMm = (2 * flatW + 2 * flatH) + 140;
      totalCreaseMm = (4 * H) + (2 * (flatW - glueW));
      break;
    }

    // ================= 17. Hexagonal 6-Corner Box =================
    case 'hexagon_box':
    case '600010': {
      const sideW = Math.max(20, L / 2);
      const flapH = sideW * 0.866;
      flatW = (6 * sideW) + glueW;
      flatH = H + (2 * flapH);

      const ox = padX;
      const oy = padY + flapH;

      for (let i = 1; i <= 5; i++) {
        const xPos = ox + glueW + (i * sideW);
        creasePaths.push(`M ${xPos} ${oy} L ${xPos} ${oy + H}`);
      }
      creasePaths.push(`M ${ox + glueW} ${oy} L ${ox + flatW} ${oy}`);
      creasePaths.push(`M ${ox + glueW} ${oy + H} L ${ox + flatW} ${oy + H}`);

      cutPaths.push(`
        M ${ox} ${oy + 6}
        L ${ox + glueW} ${oy}
        L ${ox + flatW} ${oy}
        L ${ox + flatW} ${oy + H}
        L ${ox + glueW} ${oy + H}
        L ${ox} ${oy + H - 6}
        Z
      `);

      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);
      inCanvasDims.push(createPacdoraDimArrowH({ x1: ox + glueW, x2: ox + glueW + sideW, y: oy + H * 0.5, text: `ضلع: ${sideW.toFixed(0)}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: ox + glueW + sideW * 2, y1: oy, y2: oy + H, text: `${H}` }));

      totalCutMm = 2 * (flatW + flatH);
      totalCreaseMm = (6 * H) + (2 * (flatW - glueW));
      break;
    }

    // ================= 18. Triangular Prism Box =================
    case 'triangular_box':
    case '610010': {
      const sideW = Math.max(30, L * 0.6);
      const flapH = sideW * 0.866;
      flatW = (3 * sideW) + glueW;
      flatH = H + (2 * flapH);

      const ox = padX;
      const oy = padY + flapH;

      for (let i = 1; i <= 2; i++) {
        const xPos = ox + glueW + (i * sideW);
        creasePaths.push(`M ${xPos} ${oy} L ${xPos} ${oy + H}`);
      }
      creasePaths.push(`M ${ox + glueW} ${oy} L ${ox + flatW} ${oy}`);
      creasePaths.push(`M ${ox + glueW} ${oy + H} L ${ox + flatW} ${oy + H}`);

      cutPaths.push(`
        M ${ox} ${oy + 6}
        L ${ox + glueW} ${oy}
        L ${ox + glueW + sideW / 2} ${oy - flapH}
        L ${ox + glueW + sideW} ${oy}
        L ${ox + flatW} ${oy}
        L ${ox + flatW} ${oy + H}
        L ${ox + glueW + sideW} ${oy + H}
        L ${ox + glueW + sideW / 2} ${oy + H + flapH}
        L ${ox + glueW} ${oy + H}
        L ${ox} ${oy + H - 6}
        Z
      `);

      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);
      inCanvasDims.push(createPacdoraDimArrowH({ x1: ox + glueW, x2: ox + glueW + sideW, y: oy + H * 0.5, text: `${sideW.toFixed(0)}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: ox + glueW + sideW * 1.5, y1: oy, y2: oy + H, text: `${H}` }));

      totalCutMm = 2 * (flatW + flatH);
      totalCreaseMm = (3 * H) + (2 * (flatW - glueW));
      break;
    }

    // ================= 19. Counter Display Stand =================
    case 'counter_display':
    case 'display_stand':
    case '700010': {
      const headerH = Math.max(60, H * 0.8);
      flatW = (2 * L) + (2 * W) + glueW;
      flatH = H + headerH + W;

      const ox = padX;
      const oy = padY + headerH;

      const x1 = ox + glueW;
      const x2 = x1 + L;
      const x3 = x2 + W;
      const x4 = x3 + L;
      const x5 = x4 + W;

      creasePaths.push(`M ${x1} ${oy} L ${x1} ${oy + H}`);
      creasePaths.push(`M ${x2} ${oy} L ${x2} ${oy + H}`);
      creasePaths.push(`M ${x3} ${oy} L ${x3} ${oy + H}`);
      creasePaths.push(`M ${x4} ${oy} L ${x4} ${oy + H}`);
      creasePaths.push(`M ${x1} ${oy} L ${x5} ${oy}`);
      creasePaths.push(`M ${x1} ${oy + H} L ${x5} ${oy + H}`);

      // Stepped side display cut profile
      cutPaths.push(`
        M ${ox} ${oy + 6}
        L ${x1} ${oy + H * 0.4}
        L ${x2} ${oy + H * 0.4}
        L ${x3} ${oy}
        L ${x3} ${oy - headerH}
        L ${x4} ${oy - headerH}
        L ${x4} ${oy}
        L ${x5} ${oy + H * 0.4}
        L ${x5} ${oy + H}
        L ${x1} ${oy + H + W}
        L ${x1} ${oy + H}
        L ${ox} ${oy + H - 6}
        Z
      `);

      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);
      inCanvasDims.push(createPacdoraDimArrowH({ x1: x1, x2: x2, y: oy + H * 0.7, text: `عرض: ${L}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: x3 + L / 2, y1: oy - headerH, y2: oy, text: `تاج: ${headerH}` }));

      totalCutMm = 2 * (flatW + flatH) + 120;
      totalCreaseMm = (4 * H) + (2 * (flatW - glueW));
      break;
    }

    // ================= 20. 4-Corner Beer Tray =================
    case 'four_corner_tray':
    case 'beer_tray':
    case '710010': {
      flatW = L + (2 * H);
      flatH = W + (2 * H);

      const bx1 = padX + H;
      const bx2 = bx1 + L;
      const by1 = padY + H;
      const by2 = by1 + W;

      creasePaths.push(`M ${bx1} ${by1} L ${bx2} ${by1}`);
      creasePaths.push(`M ${bx1} ${by2} L ${bx2} ${by2}`);
      creasePaths.push(`M ${bx1} ${by1} L ${bx1} ${by2}`);
      creasePaths.push(`M ${bx2} ${by1} L ${bx2} ${by2}`);

      // Corner 45° fold creases
      creasePaths.push(`M ${bx1} ${by1} L ${padX} ${padY}`);
      creasePaths.push(`M ${bx2} ${by1} L ${padX + flatW} ${padY}`);
      creasePaths.push(`M ${bx1} ${by2} L ${padX} ${padY + flatH}`);
      creasePaths.push(`M ${bx2} ${by2} L ${padX + flatW} ${padY + flatH}`);

      cutPaths.push(`
        M ${padX} ${padY}
        L ${padX + flatW} ${padY}
        L ${padX + flatW} ${padY + flatH}
        L ${padX} ${padY + flatH}
        Z
      `);

      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);
      inCanvasDims.push(createPacdoraDimArrowH({ x1: bx1, x2: bx2, y: by1 + W / 2, text: `${L}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: bx1 + L / 2, y1: by1, y2: by2, text: `${W}` }));

      totalCutMm = 2 * (flatW + flatH);
      totalCreaseMm = (2 * L + 2 * W) + (4 * H * 1.414);
      break;
    }

    // ================= 21. French Fry Scoop Box =================
    case 'french_fry_box':
    case '520010': {
      const scoopCurve = Math.min(25, H * 0.3);
      flatW = (2 * L) + (2 * W) + glueW;
      flatH = H + W;

      const ox = padX;
      const oy = padY;

      const x1 = ox + glueW;
      const x2 = x1 + L;
      const x3 = x2 + W;
      const x4 = x3 + L;
      const x5 = x4 + W;

      creasePaths.push(`M ${x1} ${oy} L ${x1} ${oy + H}`);
      creasePaths.push(`M ${x2} ${oy} L ${x2} ${oy + H}`);
      creasePaths.push(`M ${x3} ${oy} L ${x3} ${oy + H}`);
      creasePaths.push(`M ${x4} ${oy} L ${x4} ${oy + H}`);
      creasePaths.push(`M ${x1} ${oy + H} L ${x5} ${oy + H}`);

      // Curved scoop front
      cutPaths.push(`
        M ${ox} ${oy + 10}
        L ${x1} ${oy}
        Q ${x1 + L / 2} ${oy + scoopCurve} ${x2} ${oy}
        L ${x3} ${oy}
        L ${x4} ${oy}
        L ${x5} ${oy}
        L ${x5} ${oy + H + W * 0.5}
        L ${x1} ${oy + H + W * 0.5}
        L ${ox} ${oy + H - 10}
        Z
      `);

      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);
      inCanvasDims.push(createPacdoraDimArrowH({ x1: x1, x2: x2, y: oy + H * 0.6, text: `${L}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: x4 + W / 2, y1: oy, y2: oy + H, text: `${H}` }));

      totalCutMm = 2 * (flatW + flatH);
      totalCreaseMm = (4 * H) + (flatW - glueW);
      break;
    }

    // ================= 22. Roll End Tuck Top (RETT) =================
    case 'roll_end_tuck_top':
    case 'rett':
    case '150020':
    default: {
      const rollH = Math.max(15, H - (1.5 * T));
      const frontFlap = Math.max(20, H - T);

      flatW = L + (2 * H) + (2 * rollH);
      flatH = (2 * W) + (2 * H) + frontFlap;

      const ox = padX + rollH;
      const oy = padY;

      const xL0 = ox - H;
      const xL1 = ox;
      const xR1 = ox + L;
      const xR0 = xR1 + H;

      const yTopLid = oy;
      const yLidCrease = oy + frontFlap;
      const yBackWall = yLidCrease + W;
      const yBottomCrease = yBackWall + H;
      const yFrontWall = yBottomCrease + W;

      creasePaths.push(`M ${xL1} ${yLidCrease} L ${xR1} ${yLidCrease}`);
      creasePaths.push(`M ${xL1} ${yBackWall} L ${xR1} ${yBackWall}`);
      creasePaths.push(`M ${xL1} ${yBottomCrease} L ${xR1} ${yBottomCrease}`);
      creasePaths.push(`M ${xL1} ${yFrontWall} L ${xR1} ${yFrontWall}`);

      cutPaths.push(`
        M ${xL1} ${yTopLid}
        L ${xR1} ${yTopLid}
        L ${xR1} ${yBackWall}
        L ${xR0 + rollH} ${yBottomCrease}
        L ${xR0 + rollH} ${yFrontWall}
        L ${xR1} ${yFrontWall + H}
        L ${xL1} ${yFrontWall + H}
        L ${xL0 - rollH} ${yFrontWall}
        L ${xL0 - rollH} ${yBottomCrease}
        L ${xL1} ${yBackWall}
        Z
      `);

      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);
      inCanvasDims.push(createPacdoraDimArrowH({ x1: xL1, x2: xR1, y: yBottomCrease + W / 2, text: `${L}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: xL1 + L / 2, y1: yBottomCrease, y2: yFrontWall, text: `${W}` }));

      totalCutMm = 2 * (flatW + flatH);
      totalCreaseMm = (4 * L) + (4 * W);
      break;
    }
  }

  // Construct Studio-Grade Vector SVG Output
  const totalViewW = Math.round(flatW + (padX * 2));
  const totalViewH = Math.round(flatH + (padY * 2));
  const svgViewBox = `0 0 ${totalViewW} ${totalViewH}`;

  const svgContent = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="${svgViewBox}" width="100%" height="100%" style="display:block; max-height: 100%;">
  <defs>
    <pattern id="pacdoraGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 0 20 L 20 0 L 40 20 L 20 40 Z" fill="none" stroke="#f1f5f9" stroke-width="0.8" />
    </pattern>

    <style>
      .pacdora-bleed { stroke: #22c55e; stroke-width: 0.9; fill: none; }
      .pacdora-trim { stroke: #1e40af; stroke-width: 1.2; fill: none; stroke-linecap: round; stroke-linejoin: round; }
      .pacdora-crease { stroke: #dc2626; stroke-width: 0.9; stroke-dasharray: 2.5, 1.8; fill: none; }
      .pacdora-legend { font-family: 'Inter', 'Vazirmatn', sans-serif; font-size: 8px; font-weight: 600; fill: #475569; }
      .pacdora-triad-title { font-family: 'Inter', 'Vazirmatn', sans-serif; font-size: 8px; font-weight: bold; fill: #64748b; }
      .pacdora-triad-val { font-family: 'Inter', 'Vazirmatn', sans-serif; font-size: 8.5px; font-weight: bold; fill: #1e293b; }
    </style>
  </defs>

  <!-- Canvas Background -->
  <rect x="0" y="0" width="${totalViewW}" height="${totalViewH}" fill="#ffffff" />
  <rect x="0" y="0" width="${totalViewW}" height="${totalViewH}" fill="url(#pacdoraGrid)" />

  <!-- 1. Bleed Layer (Green) -->
  <g id="Layer_Bleed">
    ${bleedPaths.map(d => `<path d="${d}" class="pacdora-bleed" />`).join('\n    ')}
  </g>

  <!-- 2. Crease Layer (Red Dashed) -->
  <g id="Layer_Crease">
    ${creasePaths.map(d => `<path d="${d}" class="pacdora-crease" />`).join('\n    ')}
  </g>

  <!-- 3. Trim / Cut Layer (Blue Solid) -->
  <g id="Layer_Trim">
    ${cutPaths.map(d => `<path d="${d.trim()}" class="pacdora-trim" />`).join('\n    ')}
  </g>

  <!-- 4. In-Canvas Pacdora Dimension Arrows -->
  <g id="Layer_InCanvas_Dimensions">
    ${inCanvasDims.join('\n    ')}
  </g>
</svg>`;

  const blankWeightG = ((flatW * flatH) / 1000000) * (mat.defaultGsm || 350);

  return {
    success: true,
    boxType: modelKey,
    material: mat,
    thicknessMm: T,
    sizeMode: effectiveSizeMode,
    triadDimensions: triad,
    flatDimensions: {
      flatWidthMm: Math.round(flatW),
      flatHeightMm: Math.round(flatH),
      flatWidthCm: Math.round((flatW / 10) * 10) / 10,
      flatHeightCm: Math.round((flatH / 10) * 10) / 10
    },
    flat_dimensions: {
      width_mm: Math.round(flatW),
      height_mm: Math.round(flatH),
      total_cut_mm: Math.round(totalCutMm),
      total_crease_mm: Math.round(totalCreaseMm)
    },
    totalCutMm: Math.round(totalCutMm),
    totalCreaseMm: Math.round(totalCreaseMm),
    blankWeightG: Math.round(blankWeightG * 10) / 10,
    svg: svgContent,
    svg_content: svgContent
  };
}

/**
 * Intelligent Sheet Montage & Imposition Engine
 */
function optimizeStudioSheetMontage({
  flatWidthMm,
  flatHeightMm,
  sheetId = 'sheet_70x100',
  customSheet = null,
  quantity = 10000,
  spacingMm = 3,
  gripperMarginMm = 12
}) {
  const fw = parseFloat(flatWidthMm) || 200;
  const fh = parseFloat(flatHeightMm) || 150;
  const gap = parseFloat(spacingMm) || 3;
  const grip = parseFloat(gripperMarginMm) || 12;

  let sheetW = 1000;
  let sheetH = 700;
  let sheetName = '۷۰ × ۱۰۰ سانت';

  if (customSheet && customSheet.widthMm && customSheet.heightMm) {
    sheetW = parseFloat(customSheet.widthMm);
    sheetH = parseFloat(customSheet.heightMm);
    sheetName = `شیت اختصاصی (${sheetW / 10} × ${sheetH / 10} cm)`;
  } else {
    const std = STANDARD_SHEETS.find(s => s.id === sheetId) || STANDARD_SHEETS[0];
    sheetW = std.widthMm;
    sheetH = std.heightMm;
    sheetName = std.name;
  }

  const effW = sheetW - (gap * 2);
  const effH = sheetH - grip - (gap * 2);

  // Orientation 1 (Normal)
  const cols1 = Math.max(1, Math.floor((effW + gap) / (fw + gap)));
  const rows1 = Math.max(1, Math.floor((effH + gap) / (fh + gap)));
  const ups1 = cols1 * rows1;
  const usedArea1 = ups1 * (fw * fh);
  const sheetArea = sheetW * sheetH;
  const waste1 = Math.max(0, 100 - ((usedArea1 / sheetArea) * 100));

  // Orientation 2 (Rotated 90 deg)
  const cols2 = Math.max(1, Math.floor((effW + gap) / (fh + gap)));
  const rows2 = Math.max(1, Math.floor((effH + gap) / (fw + gap)));
  const ups2 = cols2 * rows2;
  const usedArea2 = ups2 * (fw * fh);
  const waste2 = Math.max(0, 100 - ((usedArea2 / sheetArea) * 100));

  let isRotated = false;
  let bestCols = cols1;
  let bestRows = rows1;
  let bestUps = ups1;
  let bestWaste = waste1;

  if (ups2 > ups1 || (ups2 === ups1 && waste2 < waste1)) {
    isRotated = true;
    bestCols = cols2;
    bestRows = rows2;
    bestUps = ups2;
    bestWaste = waste2;
  }

  const totalQty = parseInt(quantity) || 10000;
  const sheetsNeeded = Math.ceil(totalQty / bestUps);
  const wasteAllowance = Math.max(150, Math.ceil(sheetsNeeded * 0.05));
  const totalSheetsToOrder = sheetsNeeded + wasteAllowance;

  // Generate Montage SVG
  const montageSvg = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sheetW} ${sheetH}" width="100%" height="100%" style="background:#0f172a; border-radius:12px;">
  <!-- Sheet Background -->
  <rect x="0" y="0" width="${sheetW}" height="${sheetH}" fill="#1e293b" stroke="#334155" stroke-width="2" rx="6" />
  
  <!-- Gripper Margin (لبه زینک / گریپر) -->
  <rect x="0" y="${sheetH - grip}" width="${sheetW}" height="${grip}" fill="#ef4444" fill-opacity="0.25" stroke="#ef4444" stroke-width="0.8" stroke-dasharray="3,2" />
  <text x="${sheetW / 2}" y="${sheetH - 3}" font-family="'Vazirmatn', sans-serif" font-size="7px" font-weight="bold" fill="#fca5a5" text-anchor="middle">
    ناحیه گریپر ماشین چاپ (${grip} mm Gripper)
  </text>

  <!-- Ups Grid -->
  <g id="Montage_Ups">
    ${Array.from({ length: bestRows }).map((_, rIdx) => {
      return Array.from({ length: bestCols }).map((_, cIdx) => {
        const itemW = isRotated ? fh : fw;
        const itemH = isRotated ? fw : fh;
        const xPos = gap + (cIdx * (itemW + gap));
        const yPos = gap + (rIdx * (itemH + gap));
        const upIndex = (rIdx * bestCols) + cIdx + 1;

        return `
          <g transform="translate(${xPos}, ${yPos})">
            <rect x="0" y="0" width="${itemW}" height="${itemH}" fill="#3b82f6" fill-opacity="0.15" stroke="#60a5fa" stroke-width="1.2" rx="3" />
            <line x1="0" y1="0" x2="${itemW}" y2="${itemH}" stroke="#38bdf8" stroke-width="0.5" stroke-dasharray="2,2" opacity="0.4" />
            <line x1="${itemW}" y1="0" x2="0" y2="${itemH}" stroke="#38bdf8" stroke-width="0.5" stroke-dasharray="2,2" opacity="0.4" />
            <circle cx="${itemW / 2}" cy="${itemH / 2}" r="10" fill="#1e40af" />
            <text x="${itemW / 2}" y="${itemH / 2 + 3.5}" font-family="'Inter', sans-serif" font-size="8.5px" font-weight="bold" fill="#ffffff" text-anchor="middle">
              #${upIndex}
            </text>
            <text x="${itemW / 2}" y="${itemH - 4}" font-family="'Inter', sans-serif" font-size="6.5px" fill="#93c5fd" text-anchor="middle">
              ${itemW.toFixed(0)} × ${itemH.toFixed(0)} mm
            </text>
          </g>
        `;
      }).join('\n');
    }).join('\n')}
  </g>
</svg>`;

  return {
    success: true,
    sheet: {
      id: sheetId,
      name: sheetName,
      widthMm: sheetW,
      heightMm: sheetH
    },
    ups: bestUps,
    cols: bestCols,
    rows: bestRows,
    isRotated,
    wastePercent: Math.round(bestWaste * 10) / 10,
    sheetsNeeded,
    wasteAllowance,
    totalSheetsToOrder,
    montageSvg
  };
}

// Master alias for backward compatibility
const generateBoxDieline = generateParametricStudioDieline;

module.exports = {
  MATERIAL_DATABASE,
  MATERIAL_SPECS,
  STANDARD_SHEETS,
  calculateDimensionTriad,
  generateParametricStudioDieline,
  generateBoxDieline,
  optimizeStudioSheetMontage
};
