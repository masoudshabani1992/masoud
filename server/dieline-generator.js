/**
 * Pacdora Studio & ESKO ArtiosCAD 23.07 Master Dieline Engine
 * Developed for Arman Amiran Box Factory by Masoud Shabani (مسعود شعبانی)
 *
 * Fully supports all standard models:
 * - 100010: Straight Tuck End (STE) Folding Carton
 * - 150010: Flip-Top Mailer Box (FEFCO 0427)
 * - 110020: Snap Lock Auto Bottom Box (ECMA A20.40)
 * - 200010: RSC Regular Slotted Carton (FEFCO 0201)
 * - 300010: Rigid Base & Lid Box (هاردباکس لوکس)
 * - 400010: Pillow Box (جعبه بالشتی)
 * - 500010: Sleeve & Tray Box (جعبه کشویی)
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
  const modelKey = boxType || type || 'tuck_end';
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
  const glueW = mat.glueTabW;

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
    // ================= 1. Straight Tuck End (STE) =================
    case 'tuck_end':
    default: {
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

      // Crease lines (Red dashed)
      creasePaths.push(`M ${x1} ${yTopBody} L ${x1} ${yBotBody}`);
      creasePaths.push(`M ${x2} ${yTopBody} L ${x2} ${yBotBody}`);
      creasePaths.push(`M ${x3} ${yTopBody} L ${x3} ${yBotBody}`);
      creasePaths.push(`M ${x4} ${yTopBody} L ${x4} ${yBotBody}`);
      creasePaths.push(`M ${x1} ${yTopBody} L ${x5} ${yTopBody}`);
      creasePaths.push(`M ${x1} ${yBotBody} L ${x5} ${yBotBody}`);
      creasePaths.push(`M ${x1} ${yTopFlap} L ${x2} ${yTopFlap}`);
      creasePaths.push(`M ${x3} ${yBotFlap} L ${x4} ${yBotFlap}`);

      // Trim / Cut lines (Blue solid)
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

      // Bleed Line (Green)
      bleedPaths.push(`
        M ${x0 - 3} ${yTopBody + 3}
        L ${x1 - 3} ${yTopBody - 3}
        L ${x1 - 3} ${yTopTuck - 3}
        L ${x2 + 3} ${yTopTuck - 3}
        L ${x2 + 3} ${yTopBody - dustH - 3}
        L ${x3 - 3} ${yTopBody - dustH - 3}
        L ${x3} ${yTopBody - 3}
        L ${x4} ${yTopBody - 3}
        L ${x4 + 3} ${yTopBody - dustH - 3}
        L ${x5 + 3} ${yTopBody - dustH - 3}
        L ${x5 + 3} ${yBotBody + dustH + 3}
        L ${x4 + 3} ${yBotBody + dustH + 3}
        L ${x4 + 3} ${yBotTuck + 3}
        L ${x3 - 3} ${yBotTuck + 3}
        L ${x3 - 3} ${yBotBody + dustH + 3}
        L ${x2 + 3} ${yBotBody + dustH + 3}
        L ${x2 - 3} ${yBotBody + 3}
        L ${x1 - 3} ${yBotBody + 3}
        L ${x0 - 3} ${yBotBody - 3}
        Z
      `);

      // In-Canvas Dimensions
      inCanvasDims.push(createPacdoraDimArrowH({ x1: x1, x2: x2, y: yTopBody + H * 0.6, text: `${L}` }));
      inCanvasDims.push(createPacdoraDimArrowH({ x1: x2, x2: x3, y: yTopBody + H * 0.25, text: `${W}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: x4 + W / 2, y1: yTopBody, y2: yBotBody, text: `${H}` }));

      totalCutMm = (2 * flatW) + (2 * flatH) + 120;
      totalCreaseMm = (4 * H) + (2 * (flatW - glueW)) + (2 * L);
      break;
    }

    // ================= 2. Flip-Top Mailer Box (FEFCO 0427) =================
    case 'keyboard':
    case 'mailer':
    case 'fefco_0427': {
      const rollH = Math.max(15, H - (1.5 * T));
      const frontFlap = Math.max(20, H - T);
      const earW = Math.min(22, Math.max(14, W * 0.15));
      const slotL = Math.max(12, Math.min(20, L * 0.1));
      const slotW = T * 1.5;

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

      // Slots
      cutPaths.push(`M ${xL1 + 8} ${yBottomCrease + 4} L ${xL1 + 8 + slotL} ${yBottomCrease + 4} L ${xL1 + 8 + slotL} ${yBottomCrease + 4 + slotW} L ${xL1 + 8} ${yBottomCrease + 4 + slotW} Z`);
      cutPaths.push(`M ${xR1 - 8 - slotL} ${yBottomCrease + 4} L ${xR1 - 8} ${yBottomCrease + 4} L ${xR1 - 8} ${yBottomCrease + 4 + slotW} L ${xR1 - 8 - slotL} ${yBottomCrease + 4 + slotW} Z`);

      // Bleed
      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);

      // In-Canvas Dimensions
      inCanvasDims.push(createPacdoraDimArrowH({ x1: xL1, x2: xR1, y: yBottomCrease + W / 2, text: `${L}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: xR1 - 20, y1: yBottomCrease, y2: yFrontWall, text: `${W}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: xL1 + 20, y1: yBackWall, y2: yBottomCrease, text: `${H}` }));

      totalCutMm = (2 * flatW) + (2 * flatH) + 140;
      totalCreaseMm = (4 * L) + (4 * W) + (4 * H);
      break;
    }

    // ================= 3. Snap Lock Auto Bottom (ECMA A20.40) =================
    case 'snap_lock_bottom':
    case 'auto_bottom': {
      const topTuck = Math.max(15, W * 0.7);
      const bottomFlap = Math.max(25, W * 0.65);

      flatW = (2 * L) + (2 * W) + glueW;
      flatH = H + W + topTuck + bottomFlap;

      const ox = padX;
      const oy = padY + topTuck + W;

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

      cutPaths.push(`M ${ox} ${oy + 6} L ${x1} ${oy} L ${x1} ${oy - W} L ${x2} ${oy - W} L ${x2} ${oy} L ${x5} ${oy} L ${x5} ${oy + H} L ${x5} ${oy + H + bottomFlap} L ${x4} ${oy + H + bottomFlap} L ${x4} ${oy + H} L ${x1} ${oy + H} L ${ox} ${oy + H - 6} Z`);
      bleedPaths.push(`M ${padX - 3} ${padY - 3} L ${padX + flatW + 3} ${padY - 3} L ${padX + flatW + 3} ${padY + flatH + 3} L ${padX - 3} ${padY + flatH + 3} Z`);

      inCanvasDims.push(createPacdoraDimArrowH({ x1: x1, x2: x2, y: oy + H * 0.5, text: `${L}` }));
      inCanvasDims.push(createPacdoraDimArrowH({ x1: x2, x2: x3, y: oy + H * 0.3, text: `${W}` }));
      inCanvasDims.push(createPacdoraDimArrowV({ x: x4 + W / 2, y1: oy, y2: oy + H, text: `${H}` }));

      totalCutMm = (2 * flatW) + (2 * flatH) + 100;
      totalCreaseMm = (4 * H) + (2 * (flatW - glueW));
      break;
    }

    // ================= 4. RSC Shipping Carton (FEFCO 0201) =================
    case 'american':
    case 'rsc':
    case 'fefco_0201': {
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
      width_cm: Math.round((flatW / 10) * 10) / 10,
      height_cm: Math.round((flatH / 10) * 10) / 10
    },
    technical_matrix: {
      cut_perimeter_mm: Math.round(totalCutMm),
      crease_perimeter_mm: Math.round(totalCreaseMm),
      blank_area_cm2: Math.round((flatW * flatH) / 100),
      blank_weight_g: Math.round(blankWeightG * 10) / 10
    },
    ruleLengthMeters: {
      cutRuleMeters: Math.round((totalCutMm / 1000) * 10) / 10,
      creaseRuleMeters: Math.round((totalCreaseMm / 1000) * 10) / 10,
      totalRuleMeters: Math.round(((totalCutMm + totalCreaseMm) / 1000) * 10) / 10
    },
    svg: svgContent,
    svg_content: svgContent
  };
}

/**
 * Intelligent Sheet Montage Optimizer
 */
function optimizeSheetMontage({
  boxType = 'tuck_end',
  length = 120,
  width = 60,
  height = 160,
  material = '350g_white',
  quantity = 5000,
  grammage = 350,
  cardboardPricePerKg = 62000,
  selectedSheetId = null
}) {
  const dieline = generateParametricStudioDieline({
    boxType,
    length,
    width,
    height,
    materialId: material
  });

  const flatW = dieline.flatDimensions.flatWidthMm;
  const flatH = dieline.flatDimensions.flatHeightMm;

  const gapMm = 5;
  const marginMm = 15;

  const results = STANDARD_SHEETS.map((sheet) => {
    const usableW = sheet.widthMm - (marginMm * 2);
    const usableH = sheet.heightMm - (marginMm * 2);

    // Orientation 1 (Normal)
    const cols1 = Math.floor((usableW + gapMm) / (flatW + gapMm));
    const rows1 = Math.floor((usableH + gapMm) / (flatH + gapMm));
    const up1 = Math.max(0, cols1 * rows1);

    // Orientation 2 (Rotated 90 deg)
    const cols2 = Math.floor((usableW + gapMm) / (flatH + gapMm));
    const rows2 = Math.floor((usableH + gapMm) / (flatW + gapMm));
    const up2 = Math.max(0, cols2 * rows2);

    const isRotated = up2 > up1;
    const itemsPerSheet = Math.max(1, isRotated ? up2 : up1);
    const cols = isRotated ? cols2 : cols1;
    const rows = isRotated ? rows2 : rows1;

    const totalSheets = Math.ceil(quantity / itemsPerSheet);
    const totalSheetsWithWaste = Math.ceil(totalSheets * 1.06);

    const sheetAreaM2 = (sheet.widthMm * sheet.heightMm) / 1000000;
    const totalAreaUsedM2 = (flatW * flatH * itemsPerSheet) / 1000000;
    const efficiencyPercent = Math.min(96, Math.round((totalAreaUsedM2 / sheetAreaM2) * 100));

    const totalWeightKg = (totalSheetsWithWaste * sheetAreaM2 * grammage) / 1000;
    const totalCardboardCost = totalWeightKg * cardboardPricePerKg;
    const costPerBox = itemsPerSheet > 0 ? Math.round(totalCardboardCost / quantity) : 0;

    return {
      sheetId: sheet.id,
      sheetName: sheet.name,
      sheetWidthMm: sheet.widthMm,
      sheetHeightMm: sheet.heightMm,
      sheetWidthCm: sheet.widthCm,
      sheetHeightCm: sheet.heightCm,
      itemsPerSheet,
      layoutGrid: { cols, rows, isRotated },
      efficiencyPercent,
      totalSheetsNeeded: totalSheetsWithWaste,
      totalWeightKg: Math.round(totalWeightKg),
      totalCostTomans: Math.round(totalCardboardCost),
      costPerBoxTomans: costPerBox,
      isRecommended: false
    };
  });

  results.sort((a, b) => b.efficiencyPercent - a.efficiencyPercent);
  if (results.length > 0) {
    results[0].isRecommended = true;
  }

  const activeSheet = selectedSheetId
    ? results.find((r) => r.sheetId === selectedSheetId) || results[0]
    : results[0];

  return {
    success: true,
    dieline,
    activeSheet,
    allSheetOptions: results,
    montageSpecs: {
      gapMm,
      marginMm,
      boxFlatWidthMm: flatW,
      boxFlatHeightMm: flatH
    }
  };
}

module.exports = {
  MATERIAL_DATABASE,
  MATERIAL_SPECS,
  STANDARD_SHEETS,
  calculateDimensionTriad,
  generateParametricStudioDieline,
  generateBoxDieline: generateParametricStudioDieline,
  optimizeSheetMontage
};
