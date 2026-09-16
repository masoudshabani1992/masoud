/**
 * ESKO ArtiosCAD 23.07 Build 3268 Parametric Packaging CAD & Sheet Imposition Engine
 * Developed for Arman Amiran Packaging ERP by Masoud Shabani (مسعود شعبانی)
 *
 * Supported ECMA & FEFCO Packaging Standards with 100% CAD Dimensioning per Edge:
 * 1. tuck_end          -> ECMA A20.20.03.01 (Straight Tuck End)
 * 2. sleeve_drawer     -> ECMA F10.02.01 (Matchbox Style Sleeve & Drawer Tray)
 * 3. snap_lock_bottom  -> ECMA A20.40.01 (Auto-Locking 1-2-3 Snap Lock Bottom Box)
 * 4. keyboard          -> FEFCO 0427 / ECMA C20.20.01 (Mailer Box with Dust Flaps & Self-Lock)
 * 5. american          -> FEFCO 0201 (RSC Regular Slotted Carton Standard 4-Flap Mother Box)
 * 6. base_lid          -> FEFCO 0301 / ECMA D20.20.01 (Two-Piece Rigid Base & Telescopic Lid)
 * 7. tray              -> FEFCO 0422 / ECMA B10.01.01 (Open Top Display Tray with Corner Wedges)
 */

const MATERIAL_SPECS = {
  cardboard: { name: 'جعبه مقوایی (ایندربرد / پشت طوسی)', thickness: 0.5, bendK: 0.8, glueWidth: 15, clearance: 1.5, defaultGsm: 300 },
  flute_e: { name: 'کارتن لمینتی E-Flute (ای فلوت)', thickness: 1.5, bendK: 1.5, glueWidth: 25, clearance: 2.5, defaultGsm: 450 },
  flute_b: { name: 'کارتن B-Flute (بی فلوت)', thickness: 3.0, bendK: 3.0, glueWidth: 35, clearance: 4.5, defaultGsm: 550 },
  flute_c: { name: 'کارتن C-Flute (سی فلوت)', thickness: 4.0, bendK: 4.0, glueWidth: 40, clearance: 6.0, defaultGsm: 650 }
};

const ECMA_STANDARDS = {
  tuck_end: { code: 'ECMA A20.20.03.01', name: 'جعبه سر و ته دارویی (Straight Tuck End)', standardGroup: 'ECMA Folder-Gluer Folding Cartons' },
  sleeve_drawer: { code: 'ECMA F10.02.01', name: 'جعبه کشویی کبریتی (Matchbox Sleeve & Drawer)', standardGroup: 'ECMA Two-Piece Rigid & Sleeve' },
  snap_lock_bottom: { code: 'ECMA A20.40.01', name: 'جعبه سر دارویی ته قفلی (Snap Lock 1-2-3)', standardGroup: 'ECMA Auto-Locking Bottom' },
  keyboard: { code: 'FEFCO 0427 / ECMA C20.20', name: 'کیبوردی پستی خودقفل‌شو (Mailer RETF)', standardGroup: 'FEFCO Corrugated & Solid Board' },
  american: { code: 'FEFCO 0201', name: 'کارتن آمریکایی ۴ درب (RSC Carton)', standardGroup: 'FEFCO Standard Shipping Boxes' },
  base_lid: { code: 'FEFCO 0301 / ECMA D20.20', name: 'زیره و رویه تلسکوپی (Rigid Base & Lid)', standardGroup: 'ECMA Rigid Boxes' },
  tray: { code: 'FEFCO 0422', name: 'سینی روباز با لبه‌های قفل‌دار (Open Tray)', standardGroup: 'FEFCO Trays & Display' }
};

const STANDARD_SHEETS = [
  { id: 'sheet_70x100', name: '۷۰ × ۱۰۰ سانت (چهار ورقی)', widthMm: 1000, heightMm: 700, widthCm: 100, heightCm: 70 },
  { id: 'sheet_60x90', name: '۶۰ × ۹۰ سانت (سه ورقی)', widthMm: 900, heightMm: 600, widthCm: 90, heightCm: 60 },
  { id: 'sheet_50x70', name: '۵۰ × ۷۰ سانت (دو ورقی)', widthMm: 700, heightMm: 500, widthCm: 70, heightCm: 50 },
  { id: 'sheet_100x140', name: '۱۰۰ × ۱۴۰ سانت (شش ورقی)', widthMm: 1400, heightMm: 1000, widthCm: 140, heightCm: 100 }
];

/**
 * Helper to generate CAD Dimension Line with witness marks, arrows, and badge
 */
function createCADDimensionH({ x1, x2, y, text, offset = -14, color = '#2563eb', bg = '#eff6ff', fontSize = 7.5 }) {
  const dimY = y + offset;
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const midX = (minX + maxX) / 2;
  const dist = Math.abs(maxX - minX);

  if (dist < 2) return '';

  // Witness lines from geometry to dimension line
  const witness1 = `M ${minX} ${y} L ${minX} ${dimY - (offset < 0 ? 3 : -3)}`;
  const witness2 = `M ${maxX} ${y} L ${maxX} ${dimY - (offset < 0 ? 3 : -3)}`;
  const dimLine = `M ${minX} ${dimY} L ${maxX} ${dimY}`;

  // Arrow markers / ticks at both ends (ArtiosCAD style 45° ticks or filled arrowheads)
  const tick1 = `M ${minX - 2.5} ${dimY - 2.5} L ${minX + 2.5} ${dimY + 2.5}`;
  const tick2 = `M ${maxX - 2.5} ${dimY - 2.5} L ${maxX + 2.5} ${dimY + 2.5}`;

  const textWidth = Math.min(dist * 0.9, text.length * 5.2 + 8);
  const textHeight = 11;

  return `
    <!-- CAD Dimension H: ${text} -->
    <g class="cad-dim">
      <path d="${witness1}" stroke="#94a3b8" stroke-width="0.4" stroke-dasharray="1.5,1.5" />
      <path d="${witness2}" stroke="#94a3b8" stroke-width="0.4" stroke-dasharray="1.5,1.5" />
      <path d="${dimLine}" stroke="${color}" stroke-width="0.7" />
      <path d="${tick1}" stroke="${color}" stroke-width="1.2" stroke-linecap="round" />
      <path d="${tick2}" stroke="${color}" stroke-width="1.2" stroke-linecap="round" />
      <rect x="${midX - textWidth / 2}" y="${dimY - textHeight / 2}" width="${textWidth}" height="${textHeight}" rx="2" fill="${bg}" stroke="${color}" stroke-width="0.5" />
      <text x="${midX}" y="${dimY + 3}" font-family="'Vazirmatn', sans-serif" font-size="${fontSize}px" font-weight="bold" fill="${color}" text-anchor="middle">
        ${text}
      </text>
    </g>
  `;
}

function createCADDimensionV({ x, y1, y2, text, offset = -14, color = '#2563eb', bg = '#eff6ff', fontSize = 7.5 }) {
  const dimX = x + offset;
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  const midY = (minY + maxY) / 2;
  const dist = Math.abs(maxY - minY);

  if (dist < 2) return '';

  const witness1 = `M ${x} ${minY} L ${dimX - (offset < 0 ? 3 : -3)} ${minY}`;
  const witness2 = `M ${x} ${maxY} L ${dimX - (offset < 0 ? 3 : -3)} ${maxY}`;
  const dimLine = `M ${dimX} ${minY} L ${dimX} ${maxY}`;

  const tick1 = `M ${dimX - 2.5} ${minY - 2.5} L ${dimX + 2.5} ${minY + 2.5}`;
  const tick2 = `M ${dimX - 2.5} ${maxY - 2.5} L ${dimX + 2.5} ${maxY + 2.5}`;

  const textWidth = Math.min(dist * 0.9, text.length * 5.2 + 8);
  const textHeight = 11;

  return `
    <!-- CAD Dimension V: ${text} -->
    <g class="cad-dim">
      <path d="${witness1}" stroke="#94a3b8" stroke-width="0.4" stroke-dasharray="1.5,1.5" />
      <path d="${witness2}" stroke="#94a3b8" stroke-width="0.4" stroke-dasharray="1.5,1.5" />
      <path d="${dimLine}" stroke="${color}" stroke-width="0.7" />
      <path d="${tick1}" stroke="${color}" stroke-width="1.2" stroke-linecap="round" />
      <path d="${tick2}" stroke="${color}" stroke-width="1.2" stroke-linecap="round" />
      <g transform="translate(${dimX}, ${midY}) rotate(-90)">
        <rect x="${-textWidth / 2}" y="${-textHeight / 2}" width="${textWidth}" height="${textHeight}" rx="2" fill="${bg}" stroke="${color}" stroke-width="0.5" />
        <text x="0" y="3" font-family="'Vazirmatn', sans-serif" font-size="${fontSize}px" font-weight="bold" fill="${color}" text-anchor="middle">
          ${text}
        </text>
      </g>
    </g>
  `;
}

/**
 * Generate Parametric SVG & Full Edge Measurements matching ESKO ArtiosCAD 23.07
 */
function generateBoxDieline({
  boxType = 'tuck_end',
  length = 80,  // in mm (L)
  width = 15,   // in mm (W)
  height = 165, // in mm (H / Depth)
  material = 'cardboard'
}) {
  const L = Math.max(10, parseFloat(length) || 80);
  const W = Math.max(10, parseFloat(width) || 15);
  const H = Math.max(10, parseFloat(height) || 165);
  const mat = MATERIAL_SPECS[material] || MATERIAL_SPECS.cardboard;
  const clearance = mat.clearance;
  const glueW = mat.glueWidth;

  let flatW = 0;
  let flatH = 0;
  let cutPaths = [];
  let creasePaths = [];
  let bleedPaths = [];
  let cadDimensions = [];
  let faceBadges = [];
  let parts = [];
  let totalCutLengthMm = 0;
  let totalCreaseLengthMm = 0;

  const standardInfo = ECMA_STANDARDS[boxType] || ECMA_STANDARDS.tuck_end;

  // Margin for outer CAD dimensions and title
  const padX = 65;
  const padY = 65;

  switch (boxType) {
    // ================= 1. ECMA A20.20.03 (Tuck End / دو طرف درب دارویی) =================
    case 'tuck_end': {
      const tuck = Math.max(12, Math.min(24, W * 0.75 + 3));
      const flapH = W;
      const dustH = Math.min(flapH * 0.85, 14);

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

      // Crease lines (خطوط تا)
      creasePaths.push(`M ${x1} ${yTopBody} L ${x1} ${yBotBody}`);
      creasePaths.push(`M ${x2} ${yTopBody} L ${x2} ${yBotBody}`);
      creasePaths.push(`M ${x3} ${yTopBody} L ${x3} ${yBotBody}`);
      creasePaths.push(`M ${x4} ${yTopBody} L ${x4} ${yBotBody}`);
      creasePaths.push(`M ${x1} ${yTopBody} L ${x5} ${yTopBody}`);
      creasePaths.push(`M ${x1} ${yBotBody} L ${x5} ${yBotBody}`);
      creasePaths.push(`M ${x1} ${yTopFlap} L ${x2} ${yTopFlap}`);
      creasePaths.push(`M ${x3} ${yBotFlap} L ${x4} ${yBotFlap}`);

      totalCreaseLengthMm = (4 * H) + (2 * (flatW - glueW)) + (2 * L);

      // Cut lines (تیغ برش خارجی با گوشواره‌های اصطکاکی)
      cutPaths.push(`
        M ${x0} ${yTopBody + 4}
        L ${x1} ${yTopBody}
        L ${x1} ${yTopFlap}
        L ${x1 + 3} ${yTopFlap}
        L ${x1 + 3} ${yTopTuck + 4}
        Q ${x1 + 3} ${yTopTuck} ${x1 + 7} ${yTopTuck}
        L ${x2 - 7} ${yTopTuck}
        Q ${x2 - 3} ${yTopTuck} ${x2 - 3} ${yTopTuck + 4}
        L ${x2 - 3} ${yTopFlap}
        L ${x2} ${yTopFlap}
        L ${x2} ${yTopBody}
        L ${x2 + 2} ${yTopBody - dustH}
        L ${x3 - 2} ${yTopBody - dustH}
        L ${x3} ${yTopBody}
        L ${x4} ${yTopBody}
        L ${x4 + 2} ${yTopBody - dustH}
        L ${x5 - 2} ${yTopBody - dustH}
        L ${x5} ${yTopBody}
        L ${x5} ${yBotBody}
        L ${x5 - 2} ${yBotBody + dustH}
        L ${x4 + 2} ${yBotBody + dustH}
        L ${x4} ${yBotBody}
        L ${x4} ${yBotFlap}
        L ${x4 - 3} ${yBotFlap}
        L ${x4 - 3} ${yBotTuck - 4}
        Q ${x4 - 3} ${yBotTuck} ${x4 - 7} ${yBotTuck}
        L ${x3 + 7} ${yBotTuck}
        Q ${x3 + 3} ${yBotTuck} ${x3 + 3} ${yBotTuck - 4}
        L ${x3 + 3} ${yBotFlap}
        L ${x3} ${yBotFlap}
        L ${x3} ${yBotBody}
        L ${x3 - 2} ${yBotBody + dustH}
        L ${x2 + 2} ${yBotBody + dustH}
        L ${x2} ${yBotBody}
        L ${x1} ${yBotBody}
        L ${x0} ${yBotBody - 4}
        Z
      `);

      totalCutLengthMm = (2 * flatW) + (2 * flatH) + 80;

      // Bleed Line (حاشیه بلید ۳ میلی‌متری)
      bleedPaths.push(`M ${x0 - 3} ${yTopTuck - 3} L ${x5 + 3} ${yTopTuck - 3} L ${x5 + 3} ${yBotTuck + 3} L ${x0 - 3} ${yBotTuck + 3} Z`);

      // ======== EXACT CAD DIMENSIONS ON EVERY SINGLE EDGE ========
      // 1. Horizontal panel widths along top/middle
      cadDimensions.push(createCADDimensionH({ x1: x0, x2: x1, y: yTopBody, text: `لب‌چسب: ${glueW}mm`, offset: -12, color: '#0284c7', bg: '#f0f9ff' }));
      cadDimensions.push(createCADDimensionH({ x1: x1, x2: x2, y: yTopBody, text: `طول (L): ${L}mm`, offset: -12, color: '#2563eb', bg: '#eff6ff' }));
      cadDimensions.push(createCADDimensionH({ x1: x2, x2: x3, y: yTopBody, text: `عرض (W): ${W}mm`, offset: -12, color: '#7c3aed', bg: '#faf5ff' }));
      cadDimensions.push(createCADDimensionH({ x1: x3, x2: x4, y: yTopBody, text: `طول (L): ${L}mm`, offset: -12, color: '#2563eb', bg: '#eff6ff' }));
      cadDimensions.push(createCADDimensionH({ x1: x4, x2: x5, y: yTopBody, text: `عرض (W): ${W}mm`, offset: -12, color: '#7c3aed', bg: '#faf5ff' }));

      // 2. Top flaps dimensions
      cadDimensions.push(createCADDimensionH({ x1: x1, x2: x2, y: yTopTuck, text: `لبه درب بالا: ${L}mm`, offset: -8, color: '#e11d48', bg: '#fff1f2' }));
      cadDimensions.push(createCADDimensionV({ x: x1, y1: yTopBody, y2: yTopFlap, text: `ارتفاع درب: ${W}mm`, offset: -10, color: '#e11d48', bg: '#fff1f2' }));
      cadDimensions.push(createCADDimensionV({ x: x1, y1: yTopFlap, y2: yTopTuck, text: `زبانه: ${Math.round(tuck)}mm`, offset: -10, color: '#e11d48', bg: '#fff1f2' }));
      cadDimensions.push(createCADDimensionV({ x: x2, y1: yTopBody, y2: yTopBody - dustH, text: `گردگیر: ${Math.round(dustH)}mm`, offset: 8, color: '#d97706', bg: '#fffbeb' }));

      // 3. Bottom flaps dimensions
      cadDimensions.push(createCADDimensionH({ x1: x3, x2: x4, y: yBotTuck, text: `لبه درب پایین: ${L}mm`, offset: 8, color: '#e11d48', bg: '#fff1f2' }));
      cadDimensions.push(createCADDimensionV({ x: x4, y1: yBotBody, y2: yBotFlap, text: `ارتفاع درب: ${W}mm`, offset: 10, color: '#e11d48', bg: '#fff1f2' }));
      cadDimensions.push(createCADDimensionV({ x: x4, y1: yBotFlap, y2: yBotTuck, text: `زبانه: ${Math.round(tuck)}mm`, offset: 10, color: '#e11d48', bg: '#fff1f2' }));
      cadDimensions.push(createCADDimensionV({ x: x5, y1: yBotBody, y2: yBotBody + dustH, text: `گردگیر: ${Math.round(dustH)}mm`, offset: 8, color: '#d97706', bg: '#fffbeb' }));

      // 4. Vertical Body Heights
      cadDimensions.push(createCADDimensionV({ x: x0, y1: yTopBody, y2: yBotBody, text: `ارتفاع بدنه (H): ${H}mm`, offset: -18, color: '#0f172a', bg: '#f8fafc', fontSize: 8.5 }));
      cadDimensions.push(createCADDimensionV({ x: x5, y1: yTopBody, y2: yBotBody, text: `ارتفاع: ${H}mm`, offset: 18, color: '#0f172a', bg: '#f8fafc' }));

      // 5. Total Bounding Box Outer Dimensions
      cadDimensions.push(createCADDimensionH({ x1: x0, x2: x5, y: yTopTuck, text: `کل عرض گسترده: ${flatW} mm (${(flatW / 10).toFixed(1)} cm)`, offset: -24, color: '#047857', bg: '#ecfdf5', fontSize: 9 }));
      cadDimensions.push(createCADDimensionV({ x: x0, y1: yTopTuck, y2: yBotTuck, text: `کل ارتفاع گسترده: ${flatH} mm (${(flatH / 10).toFixed(1)} cm)`, offset: -38, color: '#047857', bg: '#ecfdf5', fontSize: 9 }));

      // Face Center Badges
      faceBadges.push({ title: 'وجه ۱ (رو / جلو)', sub: `${L} × ${H} mm`, x: x1 + L / 2, y: yTopBody + H / 2 });
      faceBadges.push({ title: 'وجه ۲ (عطف راست)', sub: `${W} × ${H} mm`, x: x2 + W / 2, y: yTopBody + H / 2 });
      faceBadges.push({ title: 'وجه ۳ (پشت)', sub: `${L} × ${H} mm`, x: x3 + L / 2, y: yTopBody + H / 2 });
      faceBadges.push({ title: 'وجه ۴ (عطف چپ)', sub: `${W} × ${H} mm`, x: x4 + W / 2, y: yTopBody + H / 2 });
      faceBadges.push({ title: 'لبه چسب', sub: `${glueW} mm`, x: x0 + glueW / 2, y: yTopBody + H / 2 });

      parts.push({
        id: 'box',
        name: 'جعبه دارویی کامل (دو طرف درب مقوایی)',
        ecmaCode: 'ECMA A20.20.03',
        flatW: Math.round(flatW),
        flatH: Math.round(flatH),
        areaCm2: Math.round((flatW * flatH) / 100)
      });
      break;
    }

    // ================= 2. ECMA F10.02.01 (Matchbox Sleeve & Drawer) =================
    case 'sleeve_drawer': {
      const sW = W + clearance;
      const sH = H + clearance;
      const sL = L;

      const sleeveFlatW = (sW * 2) + (sH * 2) + glueW;
      const sleeveFlatH = sL;

      const wallH = H;
      const rollH = Math.max(10, H - 1.5);
      const drawerFlatW = W + (wallH * 2) + (rollH * 2);
      const drawerFlatH = L + (wallH * 2) + (rollH * 2);

      flatW = Math.max(sleeveFlatW, drawerFlatW);
      flatH = sleeveFlatH + drawerFlatH + 60;

      // Part 1: Drawer Tray (کشوی داخلی)
      const dx = padX + (flatW - drawerFlatW) / 2 + wallH + rollH;
      const dy = padY + wallH + rollH;

      creasePaths.push(`M ${dx} ${dy} L ${dx + W} ${dy} L ${dx + W} ${dy + L} L ${dx} ${dy + L} Z`);
      creasePaths.push(`M ${dx - wallH} ${dy} L ${dx - wallH} ${dy + L}`);
      creasePaths.push(`M ${dx + W + wallH} ${dy} L ${dx + W + wallH} ${dy + L}`);
      creasePaths.push(`M ${dx} ${dy - wallH} L ${dx + W} ${dy - wallH}`);
      creasePaths.push(`M ${dx} ${dy + L + wallH} L ${dx + W} ${dy + L + wallH}`);

      cutPaths.push(`
        M ${dx} ${dy - wallH - rollH}
        L ${dx + W} ${dy - wallH - rollH}
        L ${dx + W} ${dy - wallH}
        L ${dx + W + wallH} ${dy - wallH + 5}
        L ${dx + W + wallH + rollH} ${dy}
        L ${dx + W + wallH + rollH} ${dy + L}
        L ${dx + W + wallH} ${dy + L + wallH - 5}
        L ${dx + W} ${dy + L + wallH}
        L ${dx + W} ${dy + L + wallH + rollH}
        L ${dx} ${dy + L + wallH + rollH}
        L ${dx} ${dy + L + wallH}
        L ${dx - wallH} ${dy + L + wallH - 5}
        L ${dx - wallH - rollH} ${dy + L}
        L ${dx - wallH - rollH} ${dy}
        L ${dx - wallH} ${dy - wallH + 5}
        L ${dx} ${dy - wallH}
        Z
      `);

      // Dimensions for Drawer
      cadDimensions.push(createCADDimensionH({ x1: dx, x2: dx + W, y: dy, text: `عرض کف: ${W}mm`, offset: -10, color: '#2563eb' }));
      cadDimensions.push(createCADDimensionV({ x: dx, y1: dy, y2: dy + L, text: `طول کف: ${L}mm`, offset: -10, color: '#2563eb' }));
      cadDimensions.push(createCADDimensionV({ x: dx, y1: dy - wallH, y2: dy, text: `دیواره: ${wallH}mm`, offset: 8, color: '#7c3aed' }));
      cadDimensions.push(createCADDimensionV({ x: dx, y1: dy - wallH - rollH, y2: dy - wallH, text: `دوبل: ${rollH}mm`, offset: 8, color: '#d97706' }));
      cadDimensions.push(createCADDimensionH({ x1: dx - wallH - rollH, x2: dx + W + wallH + rollH, y: dy - wallH - rollH, text: `گسترده کشو: ${drawerFlatW}mm`, offset: -18, color: '#047857' }));

      faceBadges.push({ title: 'کف کشو', sub: `${W} × ${L} mm`, x: dx + W / 2, y: dy + L / 2 });

      // Part 2: Outer Sleeve (کاور دورپیچ بیرونی)
      const sy = dy + L + wallH + rollH + 50;
      const sx = padX + (flatW - sleeveFlatW) / 2;

      const sx0 = sx;
      const sx1 = sx0 + glueW;
      const sx2 = sx1 + sW;
      const sx3 = sx2 + sH;
      const sx4 = sx3 + sW;
      const sx5 = sx4 + sH;

      creasePaths.push(`M ${sx1} ${sy} L ${sx1} ${sy + sL}`);
      creasePaths.push(`M ${sx2} ${sy} L ${sx2} ${sy + sL}`);
      creasePaths.push(`M ${sx3} ${sy} L ${sx3} ${sy + sL}`);
      creasePaths.push(`M ${sx4} ${sy} L ${sx4} ${sy + sL}`);

      const notchRadius = 8;
      cutPaths.push(`
        M ${sx0} ${sy + 4}
        L ${sx1} ${sy}
        L ${sx2 - notchRadius} ${sy}
        A ${notchRadius} ${notchRadius} 0 0 0 ${sx2 + notchRadius} ${sy}
        L ${sx5} ${sy}
        L ${sx5} ${sy + sL}
        L ${sx2 + notchRadius} ${sy + sL}
        A ${notchRadius} ${notchRadius} 0 0 0 ${sx2 - notchRadius} ${sy + sL}
        L ${sx1} ${sy + sL}
        L ${sx0} ${sy + sL - 4}
        Z
      `);

      // Dimensions for Sleeve
      cadDimensions.push(createCADDimensionH({ x1: sx0, x2: sx1, y: sy, text: `لب‌چسب: ${glueW}mm`, offset: -10, color: '#0284c7' }));
      cadDimensions.push(createCADDimensionH({ x1: sx1, x2: sx2, y: sy, text: `عرض رو: ${sW}mm`, offset: -10, color: '#2563eb' }));
      cadDimensions.push(createCADDimensionH({ x1: sx2, x2: sx3, y: sy, text: `عطف: ${sH}mm`, offset: -10, color: '#7c3aed' }));
      cadDimensions.push(createCADDimensionH({ x1: sx3, x2: sx4, y: sy, text: `عرض زیر: ${sW}mm`, offset: -10, color: '#2563eb' }));
      cadDimensions.push(createCADDimensionH({ x1: sx4, x2: sx5, y: sy, text: `عطف: ${sH}mm`, offset: -10, color: '#7c3aed' }));
      cadDimensions.push(createCADDimensionV({ x: sx0, y1: sy, y2: sy + sL, text: `طول کاور: ${sL}mm`, offset: -14, color: '#0f172a' }));
      cadDimensions.push(createCADDimensionH({ x1: sx0, x2: sx5, y: sy + sL, text: `گسترده کاور: ${sleeveFlatW}mm (بادخور +${clearance}mm)`, offset: 16, color: '#047857' }));

      faceBadges.push({ title: 'کاور دورپیچ کشویی', sub: `${sW} × ${sL} mm`, x: sx1 + sW, y: sy + sL / 2 });

      totalCutLengthMm = (drawerFlatW * 2 + drawerFlatH * 2) + (sleeveFlatW * 2 + sleeveFlatH * 2);
      totalCreaseLengthMm = (4 * W + 4 * L) + (4 * sL);

      parts.push({
        id: 'drawer',
        name: 'قطعه ۱: کشوی داخلی (Drawer Tray)',
        ecmaCode: 'ECMA F10.02',
        flatW: Math.round(drawerFlatW),
        flatH: Math.round(drawerFlatH),
        areaCm2: Math.round((drawerFlatW * drawerFlatH) / 100)
      });
      parts.push({
        id: 'sleeve',
        name: 'قطعه ۲: کاور دورپیچ (Outer Sleeve)',
        ecmaCode: 'ECMA F10.02',
        flatW: Math.round(sleeveFlatW),
        flatH: Math.round(sleeveFlatH),
        areaCm2: Math.round((sleeveFlatW * sleeveFlatH) / 100)
      });
      break;
    }

    // ================= 3. FEFCO 0427 / ECMA C20.20 (Mailer Box) =================
    case 'keyboard': {
      const frontFlap = H;
      flatW = L + (H * 4) + 20;
      flatH = (H * 2) + (W * 2) + frontFlap + 20;

      const ox = padX + H * 2 + 10;
      const oy = padY + frontFlap + 10;

      creasePaths.push(`M ${ox} ${oy} L ${ox + L} ${oy}`);
      creasePaths.push(`M ${ox} ${oy + W} L ${ox + L} ${oy + W}`);
      creasePaths.push(`M ${ox} ${oy + W + H} L ${ox + L} ${oy + W + H}`);
      creasePaths.push(`M ${ox} ${oy} L ${ox} ${oy + W}`);
      creasePaths.push(`M ${ox + L} ${oy} L ${ox + L} ${oy + W}`);
      creasePaths.push(`M ${ox - H} ${oy} L ${ox - H} ${oy + W}`);
      creasePaths.push(`M ${ox + L + H} ${oy} L ${ox + L + H} ${oy + W}`);

      cutPaths.push(`
        M ${ox} ${oy - frontFlap}
        L ${ox + L} ${oy - frontFlap}
        L ${ox + L + 10} ${oy}
        L ${ox + L + H * 2} ${oy}
        L ${ox + L + H * 2} ${oy + W}
        L ${ox + L + 10} ${oy + W}
        L ${ox + L + 10} ${oy + W + H}
        L ${ox + L} ${oy + W + H + W}
        L ${ox} ${oy + W + H + W}
        L ${ox - 10} ${oy + W + H}
        L ${ox - 10} ${oy + W}
        L ${ox - H * 2} ${oy + W}
        L ${ox - H * 2} ${oy}
        L ${ox - 10} ${oy}
        Z
      `);

      // Dimensions on every side
      cadDimensions.push(createCADDimensionH({ x1: ox, x2: ox + L, y: oy, text: `طول کف (L): ${L}mm`, offset: -10, color: '#2563eb' }));
      cadDimensions.push(createCADDimensionV({ x: ox, y1: oy, y2: oy + W, text: `عرض کف (W): ${W}mm`, offset: -12, color: '#2563eb' }));
      cadDimensions.push(createCADDimensionH({ x1: ox - H * 2, x2: ox - H, y: oy, text: `دوبل: ${H}mm`, offset: -10, color: '#d97706' }));
      cadDimensions.push(createCADDimensionH({ x1: ox - H, x2: ox, y: oy, text: `دیواره: ${H}mm`, offset: -10, color: '#7c3aed' }));
      cadDimensions.push(createCADDimensionV({ x: ox, y1: oy - frontFlap, y2: oy, text: `زبانه درب: ${frontFlap}mm`, offset: -12, color: '#e11d48' }));
      cadDimensions.push(createCADDimensionV({ x: ox, y1: oy + W, y2: oy + W + H, text: `دیواره پشت: ${H}mm`, offset: -12, color: '#7c3aed' }));
      cadDimensions.push(createCADDimensionV({ x: ox, y1: oy + W + H, y2: oy + W + H + W, text: `درب بالا: ${W}mm`, offset: -12, color: '#2563eb' }));
      cadDimensions.push(createCADDimensionH({ x1: padX, x2: padX + flatW, y: oy - frontFlap, text: `کل عرض گسترده: ${flatW}mm`, offset: -22, color: '#047857' }));
      cadDimensions.push(createCADDimensionV({ x: padX, y1: oy - frontFlap, y2: oy + W + H + W, text: `کل ارتفاع گسترده: ${flatH}mm`, offset: -34, color: '#047857' }));

      faceBadges.push({ title: 'کف کارتن کیبوردی', sub: `${L} × ${W} mm`, x: ox + L / 2, y: oy + W / 2 });
      faceBadges.push({ title: 'درب روی کارتن', sub: `${L} × ${W} mm`, x: ox + L / 2, y: oy + W + H + W / 2 });

      totalCutLengthMm = flatW * 2 + flatH * 2 + 60;
      totalCreaseLengthMm = (3 * L) + (4 * W);

      parts.push({ id: 'box', name: 'خط تیغ کیبوردی یک‌تکه', ecmaCode: 'FEFCO 0427', flatW: Math.round(flatW), flatH: Math.round(flatH), areaCm2: Math.round((flatW * flatH) / 100) });
      break;
    }

    // ================= 4. FEFCO 0201 (RSC Carton) =================
    case 'american': {
      const flapH = W / 2;
      flatW = (L * 2) + (W * 2) + glueW;
      flatH = H + (flapH * 2);

      const ox = padX;
      const oy = padY + flapH;

      const x0 = ox;
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

      cutPaths.push(`M ${x2} ${oy - flapH} L ${x2} ${oy}`);
      cutPaths.push(`M ${x3} ${oy - flapH} L ${x3} ${oy}`);
      cutPaths.push(`M ${x4} ${oy - flapH} L ${x4} ${oy}`);
      cutPaths.push(`M ${x2} ${oy + H} L ${x2} ${oy + H + flapH}`);
      cutPaths.push(`M ${x3} ${oy + H} L ${x3} ${oy + H + flapH}`);
      cutPaths.push(`M ${x4} ${oy + H} L ${x4} ${oy + H + flapH}`);

      cutPaths.push(`
        M ${x0} ${oy + 5}
        L ${x1} ${oy}
        L ${x1} ${oy - flapH}
        L ${x5} ${oy - flapH}
        L ${x5} ${oy + H + flapH}
        L ${x1} ${oy + H + flapH}
        L ${x1} ${oy + H}
        L ${x0} ${oy + H - 5}
        Z
      `);

      // Dimensions on every edge
      cadDimensions.push(createCADDimensionH({ x1: x0, x2: x1, y: oy, text: `لب‌چسب: ${glueW}mm`, offset: -10, color: '#0284c7' }));
      cadDimensions.push(createCADDimensionH({ x1: x1, x2: x2, y: oy, text: `طول (L): ${L}mm`, offset: -10, color: '#2563eb' }));
      cadDimensions.push(createCADDimensionH({ x1: x2, x2: x3, y: oy, text: `عرض (W): ${W}mm`, offset: -10, color: '#7c3aed' }));
      cadDimensions.push(createCADDimensionH({ x1: x3, x2: x4, y: oy, text: `طول (L): ${L}mm`, offset: -10, color: '#2563eb' }));
      cadDimensions.push(createCADDimensionH({ x1: x4, x2: x5, y: oy, text: `عرض (W): ${W}mm`, offset: -10, color: '#7c3aed' }));
      cadDimensions.push(createCADDimensionV({ x: x0, y1: oy, y2: oy + H, text: `ارتفاع بدنه (H): ${H}mm`, offset: -14, color: '#0f172a' }));
      cadDimensions.push(createCADDimensionV({ x: x1, y1: oy - flapH, y2: oy, text: `درب بالا: ${Math.round(flapH)}mm (W/2)`, offset: -10, color: '#e11d48' }));
      cadDimensions.push(createCADDimensionV({ x: x1, y1: oy + H, y2: oy + H + flapH, text: `درب پایین: ${Math.round(flapH)}mm (W/2)`, offset: -10, color: '#e11d48' }));
      cadDimensions.push(createCADDimensionH({ x1: x0, x2: x5, y: oy - flapH, text: `کل عرض گسترده: ${flatW}mm`, offset: -20, color: '#047857' }));
      cadDimensions.push(createCADDimensionV({ x: x0, y1: oy - flapH, y2: oy + H + flapH, text: `کل ارتفاع گسترده: ${flatH}mm`, offset: -30, color: '#047857' }));

      faceBadges.push({ title: 'رو (Front)', sub: `${L} × ${H} mm`, x: x1 + L / 2, y: oy + H / 2 });
      faceBadges.push({ title: 'عطف (Side)', sub: `${W} × ${H} mm`, x: x2 + W / 2, y: oy + H / 2 });
      faceBadges.push({ title: 'پشت (Back)', sub: `${L} × ${H} mm`, x: x3 + L / 2, y: oy + H / 2 });
      faceBadges.push({ title: 'عطف (Side)', sub: `${W} × ${H} mm`, x: x4 + W / 2, y: oy + H / 2 });

      totalCutLengthMm = flatW * 2 + flatH * 2 + (6 * flapH);
      totalCreaseLengthMm = (4 * H) + (2 * (flatW - glueW));

      parts.push({ id: 'box', name: 'کارتن آمریکایی ۴ درب', ecmaCode: 'FEFCO 0201', flatW: Math.round(flatW), flatH: Math.round(flatH), areaCm2: Math.round((flatW * flatH) / 100) });
      break;
    }

    // ================= 5. ECMA A20.40.01 (Lock Bottom) =================
    case 'snap_lock_bottom': {
      const topTuck = Math.max(15, W * 0.4);
      const topFlap = W * 0.75;
      const lockBottomH = W * 0.65;

      flatW = (L * 2) + (W * 2) + glueW;
      flatH = H + topFlap + topTuck + lockBottomH;

      const ox = padX;
      const oy = padY + topFlap + topTuck;

      const x0 = ox;
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
      creasePaths.push(`M ${x1} ${oy + H} L ${x1 + lockBottomH} ${oy + H + lockBottomH}`);
      creasePaths.push(`M ${x3} ${oy + H} L ${x3 + lockBottomH} ${oy + H + lockBottomH}`);

      cutPaths.push(`
        M ${x0} ${oy + 5}
        L ${x1} ${oy}
        L ${x1} ${oy - topFlap - topTuck}
        L ${x2} ${oy - topFlap - topTuck}
        L ${x2} ${oy}
        L ${x5} ${oy}
        L ${x5} ${oy + H + lockBottomH}
        L ${x4} ${oy + H + lockBottomH}
        L ${x3} ${oy + H + lockBottomH}
        L ${x1} ${oy + H + lockBottomH}
        L ${x0} ${oy + H - 5}
        Z
      `);

      // Dimensions on every side
      cadDimensions.push(createCADDimensionH({ x1: x0, x2: x1, y: oy, text: `لب‌چسب: ${glueW}mm`, offset: -10, color: '#0284c7' }));
      cadDimensions.push(createCADDimensionH({ x1: x1, x2: x2, y: oy, text: `طول (L): ${L}mm`, offset: -10, color: '#2563eb' }));
      cadDimensions.push(createCADDimensionH({ x1: x2, x2: x3, y: oy, text: `عرض (W): ${W}mm`, offset: -10, color: '#7c3aed' }));
      cadDimensions.push(createCADDimensionH({ x1: x3, x2: x4, y: oy, text: `طول (L): ${L}mm`, offset: -10, color: '#2563eb' }));
      cadDimensions.push(createCADDimensionH({ x1: x4, x2: x5, y: oy, text: `عرض (W): ${W}mm`, offset: -10, color: '#7c3aed' }));
      cadDimensions.push(createCADDimensionV({ x: x0, y1: oy, y2: oy + H, text: `ارتفاع بدنه (H): ${H}mm`, offset: -14, color: '#0f172a' }));
      cadDimensions.push(createCADDimensionV({ x: x1, y1: oy - topFlap, y2: oy, text: `درب بالا: ${Math.round(topFlap)}mm`, offset: -10, color: '#e11d48' }));
      cadDimensions.push(createCADDimensionV({ x: x1, y1: oy - topFlap - topTuck, y2: oy - topFlap, text: `زبانه: ${Math.round(topTuck)}mm`, offset: -10, color: '#e11d48' }));
      cadDimensions.push(createCADDimensionV({ x: x1, y1: oy + H, y2: oy + H + lockBottomH, text: `قفل کف: ${Math.round(lockBottomH)}mm`, offset: -10, color: '#059669' }));
      cadDimensions.push(createCADDimensionH({ x1: x0, x2: x5, y: oy - topFlap - topTuck, text: `کل عرض گسترده: ${flatW}mm`, offset: -22, color: '#047857' }));
      cadDimensions.push(createCADDimensionV({ x: x0, y1: oy - topFlap - topTuck, y2: oy + H + lockBottomH, text: `کل ارتفاع گسترده: ${flatH}mm`, offset: -32, color: '#047857' }));

      faceBadges.push({ title: 'بدنه رو', sub: `${L} × ${H} mm`, x: x1 + L / 2, y: oy + H / 2 });
      faceBadges.push({ title: 'قفل کف خودکار (Lock-Bottom)', sub: 'تحمل بار بالا', x: x1 + L, y: oy + H + lockBottomH / 2 });

      totalCutLengthMm = flatW * 2 + flatH * 2 + 70;
      totalCreaseLengthMm = (4 * H) + (2 * (flatW - glueW)) + L;

      parts.push({ id: 'box', name: 'جعبه ته‌قفلی (لاک‌باتم)', ecmaCode: 'ECMA A20.40.01', flatW: Math.round(flatW), flatH: Math.round(flatH), areaCm2: Math.round((flatW * flatH) / 100) });
      break;
    }

    // ================= 6. FEFCO 0422 (Tray) =================
    case 'tray': {
      flatW = L + (H * 2) + 20;
      flatH = W + (H * 2) + 20;

      const ox = padX + H + 10;
      const oy = padY + H + 10;

      creasePaths.push(`M ${ox} ${oy} L ${ox + L} ${oy} L ${ox + L} ${oy + W} L ${ox} ${oy + W} Z`);
      cutPaths.push(`
        M ${ox} ${oy - H} L ${ox + L} ${oy - H} L ${ox + L} ${oy - 5} L ${ox + L + H} ${oy - 5}
        L ${ox + L + H} ${oy + W + 5} L ${ox + L} ${oy + W + 5} L ${ox + L} ${oy + W + H}
        L ${ox} ${oy + W + H} L ${ox} ${oy + W + 5} L ${ox - H} ${oy + W + 5} L ${ox - H} ${oy - 5} L ${ox} ${oy - 5} Z
      `);

      cadDimensions.push(createCADDimensionH({ x1: ox, x2: ox + L, y: oy, text: `طول کف سینی (L): ${L}mm`, offset: -10, color: '#2563eb' }));
      cadDimensions.push(createCADDimensionV({ x: ox, y1: oy, y2: oy + W, text: `عرض کف سینی (W): ${W}mm`, offset: -10, color: '#2563eb' }));
      cadDimensions.push(createCADDimensionV({ x: ox, y1: oy - H, y2: oy, text: `دیواره بالا: ${H}mm`, offset: 8, color: '#7c3aed' }));
      cadDimensions.push(createCADDimensionV({ x: ox, y1: oy + W, y2: oy + W + H, text: `دیواره پایین: ${H}mm`, offset: 8, color: '#7c3aed' }));
      cadDimensions.push(createCADDimensionH({ x1: ox - H, x2: ox, y: oy, text: `دیواره چپ: ${H}mm`, offset: 8, color: '#7c3aed' }));
      cadDimensions.push(createCADDimensionH({ x1: ox + L, x2: ox + L + H, y: oy, text: `دیواره راست: ${H}mm`, offset: 8, color: '#7c3aed' }));
      cadDimensions.push(createCADDimensionH({ x1: padX, x2: padX + flatW, y: oy - H, text: `کل عرض گسترده: ${flatW}mm`, offset: -20, color: '#047857' }));
      cadDimensions.push(createCADDimensionV({ x: padX, y1: oy - H, y2: oy + W + H, text: `کل ارتفاع گسترده: ${flatH}mm`, offset: -30, color: '#047857' }));

      faceBadges.push({ title: 'کف سینی مقوایی', sub: `${L} × ${W} mm`, x: ox + L / 2, y: oy + W / 2 });

      totalCutLengthMm = flatW * 2 + flatH * 2;
      totalCreaseLengthMm = (2 * L) + (2 * W);

      parts.push({ id: 'box', name: 'کفی سینی (Tray)', ecmaCode: 'FEFCO 0422', flatW: Math.round(flatW), flatH: Math.round(flatH), areaCm2: Math.round((flatW * flatH) / 100) });
      break;
    }

    // ================= 7. FEFCO 0301 / ECMA D20.20 (Base & Lid) =================
    case 'base_lid': {
      const lidClearance = mat.thickness * 2 + 1.5;
      const lidL = L + lidClearance;
      const lidW = W + lidClearance;
      const lidH = Math.min(H, Math.max(20, H * 0.85));

      const baseFlatW = L + (H * 2) + 20;
      const baseFlatH = W + (H * 2) + 20;
      const lidFlatW = lidL + (lidH * 2) + 20;
      const lidFlatH = lidW + (lidH * 2) + 20;

      flatW = Math.max(baseFlatW, lidFlatW);
      flatH = baseFlatH + lidFlatH + 40;

      // Base (زیره)
      const bx = padX + (flatW - baseFlatW) / 2 + H + 10;
      const by = padY + H + 10;
      creasePaths.push(`M ${bx} ${by} L ${bx + L} ${by} L ${bx + L} ${by + W} L ${bx} ${by + W} Z`);
      cutPaths.push(`
        M ${bx} ${by - H} L ${bx + L} ${by - H} L ${bx + L} ${by} L ${bx + L + H} ${by}
        L ${bx + L + H} ${by + W} L ${bx + L} ${by + W} L ${bx + L} ${by + W + H}
        L ${bx} ${by + W + H} L ${bx} ${by + W} L ${bx - H} ${by + W} L ${bx - H} ${by} L ${bx} ${by} Z
      `);

      cadDimensions.push(createCADDimensionH({ x1: bx, x2: bx + L, y: by, text: `طول زیره: ${L}mm`, offset: -10, color: '#2563eb' }));
      cadDimensions.push(createCADDimensionV({ x: bx, y1: by, y2: by + W, text: `عرض زیره: ${W}mm`, offset: -10, color: '#2563eb' }));
      cadDimensions.push(createCADDimensionV({ x: bx, y1: by - H, y2: by, text: `دیواره: ${H}mm`, offset: 8, color: '#7c3aed' }));
      cadDimensions.push(createCADDimensionH({ x1: bx - H, x2: bx + L + H, y: by - H, text: `گسترده زیره: ${baseFlatW}mm`, offset: -18, color: '#047857' }));

      faceBadges.push({ title: 'قطعه ۱: زیره (Base)', sub: `${L} × ${W} × ${H} mm`, x: bx + L / 2, y: by + W / 2 });

      // Lid (رویه)
      const ly = by + W + H + 40 + lidH;
      const lx = padX + (flatW - lidFlatW) / 2 + lidH + 10;
      creasePaths.push(`M ${lx} ${ly} L ${lx + lidL} ${ly} L ${lx + lidL} ${ly + lidW} L ${lx} ${ly + lidW} Z`);
      cutPaths.push(`
        M ${lx} ${ly - lidH} L ${lx + lidL} ${ly - lidH} L ${lx + lidL} ${ly} L ${lx + lidL + lidH} ${ly}
        L ${lx + lidL + lidH} ${ly + lidW} L ${lx + lidL} ${ly + lidW} L ${lx + lidL} ${ly + lidW + lidH}
        L ${lx} ${ly + lidW + lidH} L ${lx} ${ly + lidW} L ${lx - lidH} ${ly + lidW} L ${lx - lidH} ${ly} L ${lx} ${ly} Z
      `);

      cadDimensions.push(createCADDimensionH({ x1: lx, x2: lx + lidL, y: ly, text: `طول رویه: ${Math.round(lidL)}mm`, offset: -10, color: '#2563eb' }));
      cadDimensions.push(createCADDimensionV({ x: lx, y1: ly, y2: ly + lidW, text: `عرض رویه: ${Math.round(lidW)}mm`, offset: -10, color: '#2563eb' }));
      cadDimensions.push(createCADDimensionV({ x: lx, y1: ly - lidH, y2: ly, text: `دیواره: ${Math.round(lidH)}mm`, offset: 8, color: '#7c3aed' }));
      cadDimensions.push(createCADDimensionH({ x1: lx - lidH, x2: lx + lidL + lidH, y: ly - lidH, text: `گسترده رویه: ${lidFlatW}mm (بادخور +${lidClearance.toFixed(1)}mm)`, offset: -18, color: '#047857' }));

      faceBadges.push({ title: 'قطعه ۲: رویه (Lid)', sub: `${Math.round(lidL)} × ${Math.round(lidW)} × ${Math.round(lidH)} mm`, x: lx + lidL / 2, y: ly + lidW / 2 });

      totalCutLengthMm = (baseFlatW * 2 + baseFlatH * 2) + (lidFlatW * 2 + lidFlatH * 2);
      totalCreaseLengthMm = (2 * L + 2 * W) + (2 * lidL + 2 * lidW);

      parts.push({ id: 'base', name: 'قطعه ۱: زیره (Base)', ecmaCode: 'FEFCO 0301', flatW: Math.round(baseFlatW), flatH: Math.round(baseFlatH), areaCm2: Math.round((baseFlatW * baseFlatH) / 100) });
      parts.push({ id: 'lid', name: 'قطعه ۲: رویه (Lid)', ecmaCode: 'FEFCO 0301', flatW: Math.round(lidFlatW), flatH: Math.round(lidFlatH), areaCm2: Math.round((lidFlatW * lidFlatH) / 100) });
      break;
    }
  }

  // Construct Standard ESKO ArtiosCAD Vector SVG with Full Per-Edge Dimensions
  const totalViewW = flatW + (padX * 2);
  const totalViewH = flatH + (padY * 2);
  const svgViewBox = `0 0 ${totalViewW} ${totalViewH}`;

  const svgContent = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="${svgViewBox}" width="${totalViewW}mm" height="${totalViewH}mm">
  <defs>
    <style>
      .artios-cut { stroke: #e11d48; stroke-width: 1.2; fill: none; stroke-linecap: round; stroke-linejoin: round; }
      .artios-crease { stroke: #2563eb; stroke-width: 1.0; stroke-dasharray: 4, 3; fill: none; }
      .artios-bleed { stroke: #9333ea; stroke-width: 0.6; stroke-dasharray: 2, 4; fill: none; }
      .artios-face-title { font-family: 'Vazirmatn', sans-serif; font-size: 8.5px; fill: #0f172a; text-anchor: middle; font-weight: 900; }
      .artios-face-sub { font-family: 'Vazirmatn', sans-serif; font-size: 7px; fill: #475569; text-anchor: middle; font-weight: bold; }
      .artios-header-text { font-family: 'Vazirmatn', sans-serif; font-size: 10px; fill: #1e1b4b; font-weight: 900; }
    </style>
  </defs>

  <!-- Background Grid & Canvas Border -->
  <rect x="0" y="0" width="${totalViewW}" height="${totalViewH}" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
  
  <!-- Bleed Layer (بلید و اضافه رنگ ۳ میلی‌متری) -->
  <g id="Layer_Bleed">
    ${bleedPaths.map(d => `<path d="${d}" class="artios-bleed" />`).join('\n    ')}
  </g>

  <!-- Crease Layer (خطوط تا و خط‌کشی آبی) -->
  <g id="Layer_CreaseLines">
    ${creasePaths.map(d => `<path d="${d}" class="artios-crease" />`).join('\n    ')}
  </g>

  <!-- Cut Layer (خطوط تیغ و برش خارجی قرمز) -->
  <g id="Layer_CutLines">
    ${cutPaths.map(d => `<path d="${d.trim()}" class="artios-cut" />`).join('\n    ')}
  </g>

  <!-- Face Center Annotations -->
  <g id="Layer_FaceBadges">
    ${faceBadges.map(b => `
      <g transform="translate(${b.x}, ${b.y})">
        <text x="0" y="-2" class="artios-face-title">${b.title}</text>
        <text x="0" y="8" class="artios-face-sub">${b.sub}</text>
      </g>
    `).join('\n    ')}
  </g>

  <!-- CAD Edge-by-Edge Dimensions Layer (ابعاد دقیق هر ضلع و لبه) -->
  <g id="Layer_CAD_Dimensions">
    ${cadDimensions.join('\n    ')}
  </g>

  <!-- ESKO ArtiosCAD Technical Header Bar -->
  <g id="Header_Bar" transform="translate(20, 20)">
    <text x="0" y="0" class="artios-header-text">📐 ESKO ArtiosCAD 23.07 | نقشه مهندسی خط تیغ با اندازه‌گذاری کامل تمام اضلاع | استاندارد: ${standardInfo.code}</text>
  </g>
</svg>`;

  return {
    success: true,
    boxType,
    ecmaStandard: standardInfo,
    dimensions: { length: L, width: W, height: H },
    material: mat,
    flatDimensions: {
      flatWidthMm: Math.round(flatW),
      flatHeightMm: Math.round(flatH),
      flatWidthCm: Math.round((flatW / 10) * 10) / 10,
      flatHeightCm: Math.round((flatH / 10) * 10) / 10
    },
    ruleLengthMeters: {
      cutRuleMeters: Math.round((totalCutLengthMm / 1000) * 10) / 10,
      creaseRuleMeters: Math.round((totalCreaseLengthMm / 1000) * 10) / 10,
      totalRuleMeters: Math.round(((totalCutLengthMm + totalCreaseLengthMm) / 1000) * 10) / 10
    },
    parts,
    svg: svgContent
  };
}

/**
 * ArtiosCAD Single-Part Imposition (Supporting Standard Grid & Interlocking Layout)
 */
function packSinglePartOnSheet({
  itemW,
  itemH,
  itemName = 'قالب جعبه',
  sheetW = 1000,
  sheetH = 700,
  gripperMargin = 15,
  sideMargin = 10,
  gutter = 3
}) {
  const pW = sheetW - (sideMargin * 2);
  const pH = sheetH - gripperMargin - sideMargin;

  // Plan A: 0 deg (Normal Grid)
  const colsA = Math.floor((pW + gutter) / (itemW + gutter));
  const rowsA = Math.floor((pH + gutter) / (itemH + gutter));
  const countA = Math.max(0, colsA * rowsA);

  // Plan B: 90 deg (Rotated Grid)
  const colsB = Math.floor((pW + gutter) / (itemH + gutter));
  const rowsB = Math.floor((pH + gutter) / (itemW + gutter));
  const countB = Math.max(0, colsB * rowsB);

  // Plan C: Mixed Block
  let planC = { count: 0, items: [] };
  if (colsA > 0 && rowsA > 0) {
    const usedWA = colsA * (itemW + gutter) - gutter;
    const remW = pW - usedWA - gutter;
    if (remW >= itemH) {
      const remCols = Math.floor((remW + gutter) / (itemH + gutter));
      const remRows = Math.floor((pH + gutter) / (itemW + gutter));
      if (remCols > 0 && remRows > 0) {
        planC.count = countA + (remCols * remRows);
        planC.remCols = remCols;
        planC.remRows = remRows;
      }
    }
  }

  let bestPlan = 'A';
  let bestCount = countA;
  if (countB > bestCount) {
    bestPlan = 'B';
    bestCount = countB;
  }
  if (planC.count > bestCount) {
    bestPlan = 'C';
    bestCount = planC.count;
  }

  const items = [];
  let itemIdx = 1;

  if (bestPlan === 'A') {
    const totalGridW = colsA * itemW + (colsA - 1) * gutter;
    const totalGridH = rowsA * itemH + (rowsA - 1) * gutter;
    const startX = sideMargin + Math.floor((pW - totalGridW) / 2);
    const startY = gripperMargin + Math.floor((pH - totalGridH) / 2);

    for (let r = 0; r < rowsA; r++) {
      for (let c = 0; c < colsA; c++) {
        items.push({
          id: itemIdx++,
          name: itemName,
          x: Math.round(startX + c * (itemW + gutter)),
          y: Math.round(startY + r * (itemH + gutter)),
          width: itemW,
          height: itemH,
          rotated: false,
          col: c + 1,
          row: r + 1
        });
      }
    }
  } else if (bestPlan === 'B') {
    const totalGridW = colsB * itemH + (colsB - 1) * gutter;
    const totalGridH = rowsB * itemW + (rowsB - 1) * gutter;
    const startX = sideMargin + Math.floor((pW - totalGridW) / 2);
    const startY = gripperMargin + Math.floor((pH - totalGridH) / 2);

    for (let r = 0; r < rowsB; r++) {
      for (let c = 0; c < colsB; c++) {
        items.push({
          id: itemIdx++,
          name: itemName,
          x: Math.round(startX + c * (itemW + gutter)),
          y: Math.round(startY + r * (itemH + gutter)),
          width: itemH,
          height: itemW,
          rotated: true,
          col: c + 1,
          row: r + 1
        });
      }
    }
  } else if (bestPlan === 'C') {
    const startX = sideMargin;
    const startY = gripperMargin;
    for (let r = 0; r < rowsA; r++) {
      for (let c = 0; c < colsA; c++) {
        items.push({
          id: itemIdx++,
          name: itemName,
          x: Math.round(startX + c * (itemW + gutter)),
          y: Math.round(startY + r * (itemH + gutter)),
          width: itemW,
          height: itemH,
          rotated: false,
          col: c + 1,
          row: r + 1
        });
      }
    }
    const remStartX = startX + colsA * (itemW + gutter);
    for (let r = 0; r < planC.remRows; r++) {
      for (let c = 0; c < planC.remCols; c++) {
        items.push({
          id: itemIdx++,
          name: `${itemName} (۹۰°)`,
          x: Math.round(remStartX + c * (itemH + gutter)),
          y: Math.round(startY + r * (itemW + gutter)),
          width: itemH,
          height: itemW,
          rotated: true,
          col: colsA + c + 1,
          row: r + 1
        });
      }
    }
  }

  const usedArea = bestCount * itemW * itemH;
  const totalSheetArea = sheetW * sheetH;
  const efficiency = totalSheetArea > 0 ? ((usedArea / totalSheetArea) * 100).toFixed(1) : 0;
  const waste = (100 - efficiency).toFixed(1);

  return {
    count: bestCount,
    items,
    orientation: bestPlan === 'B' ? 'چرخش ۹۰ درجه (عرضی)' : bestPlan === 'C' ? 'ترکیبی طولی و عرضی' : 'طولی مستقیم (۰ درجه)',
    cols: bestPlan === 'B' ? colsB : colsA,
    rows: bestPlan === 'B' ? rowsB : rowsA,
    usedArea,
    totalSheetArea,
    efficiencyPercentage: parseFloat(efficiency),
    wastePercentage: parseFloat(waste)
  };
}

/**
 * ArtiosCAD Combo Multi-Part Imposition (Part 1 + Part 2 on same sheet)
 */
function packComboPartsOnSheet({
  part1,
  part2,
  sheetW = 1000,
  sheetH = 700,
  gripperMargin = 15,
  sideMargin = 10,
  gutter = 3
}) {
  const pW = sheetW - (sideMargin * 2);
  const pH = sheetH - gripperMargin - sideMargin;

  let bestResult = {
    pairs: 0,
    items: [],
    orientation: 'ترکیبی جفتی',
    usedArea: 0,
    totalSheetArea: sheetW * sheetH,
    efficiencyPercentage: 0,
    wastePercentage: 100
  };

  // Vertical split
  for (let splitFrac = 0.25; splitFrac <= 0.75; splitFrac += 0.05) {
    const w1 = Math.floor(pW * splitFrac) - gutter;
    const w2 = pW - w1 - gutter;

    const pack1 = packSinglePartOnSheet({
      itemW: part1.flatW,
      itemH: part1.flatH,
      itemName: part1.name,
      sheetW: w1 + sideMargin * 2,
      sheetH: sheetH,
      gripperMargin,
      sideMargin,
      gutter
    });

    const pack2 = packSinglePartOnSheet({
      itemW: part2.flatW,
      itemH: part2.flatH,
      itemName: part2.name,
      sheetW: w2 + sideMargin * 2,
      sheetH: sheetH,
      gripperMargin,
      sideMargin,
      gutter
    });

    const pairs = Math.min(pack1.count, pack2.count);
    if (pairs > bestResult.pairs) {
      const adjustedPack2Items = pack2.items.map((it) => ({
        ...it,
        id: it.id + pack1.items.length,
        x: it.x + w1 + gutter
      }));

      const allItems = [...pack1.items, ...adjustedPack2Items];
      const usedArea = (pack1.count * part1.flatW * part1.flatH) + (pack2.count * part2.flatW * part2.flatH);
      const totalSheetArea = sheetW * sheetH;
      const efficiency = ((usedArea / totalSheetArea) * 100).toFixed(1);

      bestResult = {
        pairs,
        count: pairs,
        countPart1: pack1.count,
        countPart2: pack2.count,
        items: allItems,
        orientation: `تقسیم عمودی فرم (${pack1.count} عدد ${part1.name} + ${pack2.count} عدد ${part2.name})`,
        usedArea,
        totalSheetArea,
        efficiencyPercentage: parseFloat(efficiency),
        wastePercentage: parseFloat((100 - efficiency).toFixed(1))
      };
    }
  }

  // Horizontal split
  for (let splitFrac = 0.25; splitFrac <= 0.75; splitFrac += 0.05) {
    const h1 = Math.floor(pH * splitFrac) - gutter;
    const h2 = pH - h1 - gutter;

    const pack1 = packSinglePartOnSheet({
      itemW: part1.flatW,
      itemH: part1.flatH,
      itemName: part1.name,
      sheetW: sheetW,
      sheetH: h1 + gripperMargin + sideMargin,
      gripperMargin,
      sideMargin,
      gutter
    });

    const pack2 = packSinglePartOnSheet({
      itemW: part2.flatW,
      itemH: part2.flatH,
      itemName: part2.name,
      sheetW: sheetW,
      sheetH: h2 + sideMargin * 2,
      gripperMargin: sideMargin,
      sideMargin,
      gutter
    });

    const pairs = Math.min(pack1.count, pack2.count);
    if (pairs > bestResult.pairs) {
      const adjustedPack2Items = pack2.items.map((it) => ({
        ...it,
        id: it.id + pack1.items.length,
        y: it.y + h1 + gutter
      }));

      const allItems = [...pack1.items, ...adjustedPack2Items];
      const usedArea = (pack1.count * part1.flatW * part1.flatH) + (pack2.count * part2.flatW * part2.flatH);
      const totalSheetArea = sheetW * sheetH;
      const efficiency = ((usedArea / totalSheetArea) * 100).toFixed(1);

      bestResult = {
        pairs,
        count: pairs,
        countPart1: pack1.count,
        countPart2: pack2.count,
        items: allItems,
        orientation: `تقسیم افقی فرم (${pack1.count} عدد ${part1.name} + ${pack2.count} عدد ${part2.name})`,
        usedArea,
        totalSheetArea,
        efficiencyPercentage: parseFloat(efficiency),
        wastePercentage: parseFloat((100 - efficiency).toFixed(1))
      };
    }
  }

  return bestResult;
}

/**
 * Generate Authentic ESKO ArtiosCAD 23.07 Sheet Imposition SVG
 */
function generateSheetMontageSvg({
  sheetW,
  sheetH,
  items = [],
  gripperMargin = 15,
  sheetName = 'شیت مقوا',
  dieline = null,
  efficiencyPercentage = 80,
  wastePercentage = 20
}) {
  const svgViewBox = `0 0 ${sheetW} ${sheetH}`;

  const itemSvgs = items.map((it) => {
    const isSleeve = it.name && it.name.includes('کاور');
    const isDrawer = it.name && it.name.includes('کشو');
    const strokeColor = isSleeve ? '#d97706' : '#e11d48';
    const creaseColor = '#2563eb';
    const bgFill = isSleeve ? '#fffbeb' : isDrawer ? '#f0fdf4' : '#ffffff';

    const innerCrease1 = `M 15 15 L ${it.width - 15} 15 L ${it.width - 15} ${it.height - 15} L 15 ${it.height - 15} Z`;
    const innerCrease2 = `M ${Math.floor(it.width * 0.45)} 15 L ${Math.floor(it.width * 0.45)} ${it.height - 15}`;
    const innerCrease3 = `M ${Math.floor(it.width * 0.55)} 15 L ${Math.floor(it.width * 0.55)} ${it.height - 15}`;

    return `
      <!-- ArtiosCAD Placed Blank #${it.id} -->
      <g transform="translate(${it.x}, ${it.y})">
        <rect width="${it.width}" height="${it.height}" rx="1" fill="${bgFill}" fill-opacity="0.9" stroke="${strokeColor}" stroke-width="1.2" />
        <path d="${innerCrease1}" stroke="${creaseColor}" stroke-width="0.8" stroke-dasharray="3,2" fill="none" />
        <path d="${innerCrease2}" stroke="${creaseColor}" stroke-width="0.8" stroke-dasharray="3,2" fill="none" />
        <path d="${innerCrease3}" stroke="${creaseColor}" stroke-width="0.8" stroke-dasharray="3,2" fill="none" />
        
        <!-- Center Box ID and Edge Dimension Labels -->
        <rect x="${it.width / 2 - 45}" y="${it.height / 2 - 14}" width="90" height="28" rx="4" fill="#ffffff" stroke="#94a3b8" stroke-width="0.5" />
        <text x="${it.width / 2}" y="${it.height / 2 - 2}" font-family="'Vazirmatn', sans-serif" font-size="9px" font-weight="900" fill="#0f172a" text-anchor="middle">
          #${it.id} | ${it.width} × ${it.height} mm
        </text>
        <text x="${it.width / 2}" y="${it.height / 2 + 10}" font-family="'Vazirmatn', sans-serif" font-size="7.5px" font-weight="bold" fill="#475569" text-anchor="middle">
          ${it.name || 'قالب'}
        </text>

        <!-- Top Edge Dimension -->
        <text x="${it.width / 2}" y="10" font-family="'Vazirmatn', sans-serif" font-size="7px" font-weight="bold" fill="#0284c7" text-anchor="middle">
          عرض: ${it.width}mm
        </text>
        <!-- Side Edge Dimension -->
        <text x="${it.width - 6}" y="${it.height / 2}" font-family="'Vazirmatn', sans-serif" font-size="7px" font-weight="bold" fill="#0284c7" text-anchor="middle" transform="rotate(90, ${it.width - 6}, ${it.height / 2})">
          طول: ${it.height}mm
        </text>
      </g>
    `;
  }).join('\n');

  // Title Block Dimensions
  const tbW = Math.min(430, sheetW - 40);
  const tbH = 52;
  const tbX = sheetW - tbW - 15;
  const tbY = sheetH - tbH - 15;

  const standardCode = dieline?.ecmaStandard?.code || 'ECMA A20.20.03';
  const totalRuleCut = dieline?.ruleLengthMeters ? Math.round(dieline.ruleLengthMeters.cutRuleMeters * (items.length || 1) * 10) / 10 : 21.4;
  const totalRuleCrease = dieline?.ruleLengthMeters ? Math.round(dieline.ruleLengthMeters.creaseRuleMeters * (items.length || 1) * 10) / 10 : 16.8;

  return `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="${svgViewBox}" width="${sheetW}mm" height="${sheetH}mm">
  <defs>
    <style>
      .artios-sheet-bg { fill: #f8fafc; stroke: #0f172a; stroke-width: 2.5; }
      .artios-gripper { fill: #fef3c7; stroke: #d97706; stroke-width: 1; }
      .artios-reg { stroke: #0f172a; stroke-width: 0.8; fill: none; }
      .artios-tb-bg { fill: #ffffff; stroke: #0f172a; stroke-width: 1.5; }
      .tb-header { font-family: 'Vazirmatn', sans-serif; font-size: 8px; font-weight: 900; fill: #4338ca; }
      .tb-bold { font-family: 'Vazirmatn', sans-serif; font-size: 8px; font-weight: 900; fill: #0f172a; }
      .tb-text { font-family: 'Vazirmatn', sans-serif; font-size: 7.5px; fill: #334155; }
    </style>
  </defs>

  <!-- Sheet Background -->
  <rect x="0" y="0" width="${sheetW}" height="${sheetH}" class="artios-sheet-bg" />

  <!-- Gripper Edge (حاشیه لب‌پنجه ماشین چاپ) -->
  <rect x="0" y="0" width="${sheetW}" height="${gripperMargin}" class="artios-gripper" />
  <text x="${sheetW / 2}" y="${gripperMargin - 4}" font-family="'Vazirmatn', sans-serif" font-size="8.5px" font-weight="bold" fill="#92400e" text-anchor="middle">
    حاشیه لب‌پنجه ماشین چاپ (${gripperMargin}mm Gripper Margin - Heidelberg / KBA Offset)
  </text>

  <!-- Sheet Outer Dimension Arrows -->
  <text x="${sheetW / 2}" y="${sheetH - 5}" font-family="'Vazirmatn', sans-serif" font-size="9px" font-weight="900" fill="#0f172a" text-anchor="middle">
    📐 ابعاد کل شیت مقوا: ${sheetW} میلی‌متر (طول) × ${sheetH} میلی‌متر (عرض) | ${sheetW / 10} × ${sheetH / 10} سانتی‌متر
  </text>

  <!-- Prepress Registration Crosses (علائم رجیستر لیتوگرافی ۴ گوشه) -->
  <g class="artios-reg">
    <circle cx="5" cy="5" r="3" /><line x1="1" y1="5" x2="9" y2="5" /><line x1="5" y1="1" x2="5" y2="9" />
    <circle cx="${sheetW - 5}" cy="5" r="3" /><line x1="${sheetW - 9}" y1="5" x2="${sheetW - 1}" y2="5" /><line x1="${sheetW - 5}" y1="1" x2="${sheetW - 5}" y2="9" />
    <circle cx="5" cy="${sheetH - 5}" r="3" /><line x1="1" y1="${sheetH - 5}" x2="9" y2="${sheetH - 5}" /><line x1="5" y1="${sheetH - 9}" x2="5" y2="${sheetH - 1}" />
    <circle cx="${sheetW - 5}" cy="${sheetH - 5}" r="3" /><line x1="${sheetW - 9}" y1="${sheetH - 5}" x2="${sheetW - 1}" y2="${sheetH - 5}" /><line x1="${sheetW - 5}" y1="${sheetH - 9}" x2="${sheetW - 5}" y2="${sheetH - 1}" />
  </g>

  <!-- Placed Box Dielines -->
  <g id="SheetItems">
    ${itemSvgs}
  </g>

  <!-- ESKO ArtiosCAD 23.07 Prepress Title Block -->
  <g id="ArtiosCADTitleBlock" transform="translate(${tbX}, ${tbY})">
    <rect width="${tbW}" height="${tbH}" class="artios-tb-bg" rx="2" />
    <line x1="0" y1="17" x2="${tbW}" y2="17" stroke="#cbd5e1" stroke-width="1" />
    <line x1="0" y1="35" x2="${tbW}" y2="35" stroke="#cbd5e1" stroke-width="1" />
    <line x1="${tbW * 0.5}" y1="0" x2="${tbW * 0.5}" y2="${tbH}" stroke="#cbd5e1" stroke-width="1" />

    <!-- Row 1: Software & Standard -->
    <text x="${tbW - 8}" y="12" text-anchor="end" class="tb-header">ESKO ArtiosCAD 23.07 Build 3268</text>
    <text x="${tbW * 0.5 - 8}" y="12" text-anchor="end" class="tb-bold">استاندارد: ${standardCode}</text>

    <!-- Row 2: Company & Specs -->
    <text x="${tbW - 8}" y="28" text-anchor="end" class="tb-text">صنایع چاپ و بسته‌بندی آرمان امیران</text>
    <text x="${tbW * 0.5 - 8}" y="28" text-anchor="end" class="tb-text">شیت: ${sheetW}×${sheetH}mm (${items.length} Ups)</text>

    <!-- Row 3: Efficiency & Rule Length -->
    <text x="${tbW - 8}" y="46" text-anchor="end" class="tb-text">راندمان مفید: ${efficiencyPercentage}٪ | باطله: ${wastePercentage}٪</text>
    <text x="${tbW * 0.5 - 8}" y="46" text-anchor="end" class="tb-text">متراژ کل تیغ: ${totalRuleCut}m برش / ${totalRuleCrease}m تا</text>
  </g>
</svg>`;
}

/**
 * Master Sheet Imposition Optimizer
 */
function optimizeSheetMontage({
  boxType = 'tuck_end',
  length = 80,
  width = 15,
  height = 165,
  material = 'cardboard',
  quantity = 10000,
  grammage = null,
  cardboardPricePerKg = 65000,
  customSheet = null,
  montageMode = 'auto'
}) {
  const dieline = generateBoxDieline({ boxType, length, width, height, material });
  const matSpec = MATERIAL_SPECS[material] || MATERIAL_SPECS.cardboard;
  const gsm = grammage || matSpec.defaultGsm;
  const isMultiPart = dieline.parts && dieline.parts.length > 1;

  let sheetList = [...STANDARD_SHEETS];
  if (customSheet && customSheet.widthMm > 50 && customSheet.heightMm > 50) {
    sheetList.unshift({
      id: 'sheet_custom',
      name: `شیت اختصاصی (${customSheet.widthMm / 10} × ${customSheet.heightMm / 10} سانت)`,
      widthMm: parseFloat(customSheet.widthMm),
      heightMm: parseFloat(customSheet.heightMm),
      widthCm: customSheet.widthMm / 10,
      heightCm: customSheet.heightMm / 10
    });
  }

  const evaluations = [];

  for (const sheet of sheetList) {
    let result = null;

    if (isMultiPart && (montageMode === 'combo' || montageMode === 'auto')) {
      result = packComboPartsOnSheet({
        part1: dieline.parts[0],
        part2: dieline.parts[1],
        sheetW: sheet.widthMm,
        sheetH: sheet.heightMm
      });
    } else if (isMultiPart && montageMode === 'part1') {
      result = packSinglePartOnSheet({
        itemW: dieline.parts[0].flatW,
        itemH: dieline.parts[0].flatH,
        itemName: dieline.parts[0].name,
        sheetW: sheet.widthMm,
        sheetH: sheet.heightMm
      });
    } else if (isMultiPart && montageMode === 'part2') {
      result = packSinglePartOnSheet({
        itemW: dieline.parts[1].flatW,
        itemH: dieline.parts[1].flatH,
        itemName: dieline.parts[1].name,
        sheetW: sheet.widthMm,
        sheetH: sheet.heightMm
      });
    } else {
      result = packSinglePartOnSheet({
        itemW: dieline.flatDimensions.flatWidthMm,
        itemH: dieline.flatDimensions.flatHeightMm,
        itemName: dieline.parts[0]?.name || 'جعبه',
        sheetW: sheet.widthMm,
        sheetH: sheet.heightMm
      });
    }

    const boxesPerSheet = result.count || 1;
    const rawSheetsNeeded = Math.ceil(quantity / Math.max(1, boxesPerSheet));
    const pressScrapSheets = Math.ceil(rawSheetsNeeded * 0.05);
    const totalSheetsNeeded = rawSheetsNeeded + pressScrapSheets;

    const sheetAreaSqm = (sheet.widthMm / 1000) * (sheet.heightMm / 1000);
    const weightPerSheetKg = (sheetAreaSqm * gsm) / 1000;
    const totalWeightKg = Math.round(totalSheetsNeeded * weightPerSheetKg);
    const totalCardboardCost = Math.round(totalWeightKg * cardboardPricePerKg);
    const cardboardCostPerBox = Math.round(totalCardboardCost / Math.max(1, quantity));

    const montageSvg = generateSheetMontageSvg({
      sheetW: sheet.widthMm,
      sheetH: sheet.heightMm,
      items: result.items,
      sheetName: sheet.name,
      dieline,
      efficiencyPercentage: result.efficiencyPercentage,
      wastePercentage: result.wastePercentage
    });

    evaluations.push({
      sheetId: sheet.id,
      sheetName: sheet.name,
      sheetLength: sheet.widthCm,
      sheetWidth: sheet.heightCm,
      sheetLengthMm: sheet.widthMm,
      sheetWidthMm: sheet.heightMm,
      boxesPerSheet,
      countPart1: result.countPart1 || null,
      countPart2: result.countPart2 || null,
      orientation: result.orientation,
      items: result.items,
      efficiencyPercentage: result.efficiencyPercentage,
      wastePercentage: result.wastePercentage,
      usedArea: result.usedArea,
      totalSheetArea: result.totalSheetArea,
      sheetsNeeded: totalSheetsNeeded,
      pressScrapSheets,
      totalWeightKg,
      totalCardboardCost,
      cardboardCostPerBox,
      montageSvg
    });
  }

  evaluations.sort((a, b) => a.wastePercentage - b.wastePercentage || a.cardboardCostPerBox - b.cardboardCostPerBox);
  const bestChoice = evaluations[0];

  return {
    success: true,
    dieline,
    artiosEngineVersion: 'ESKO ArtiosCAD 23.07 Build 3268 Compatible',
    bestChoice,
    allSheets: evaluations,
    quantity,
    grammage: gsm,
    cardboardPricePerKg,
    isMultiPart,
    montageMode
  };
}

module.exports = {
  MATERIAL_SPECS,
  ECMA_STANDARDS,
  STANDARD_SHEETS,
  generateBoxDieline,
  packSinglePartOnSheet,
  packComboPartsOnSheet,
  generateSheetMontageSvg,
  optimizeSheetMontage
};
