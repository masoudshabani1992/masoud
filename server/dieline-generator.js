/**
 * Parametric Packaging Dieline & Sheet Imposition Engine
 * Developed for Arman Amiran ERP by Masoud Shabani (مسعود شعبانی)
 *
 * Supported Box Structures:
 * 1. tuck_end (سر و ته دارویی / دو طرف درب مقوایی / Straight & Reverse Tuck End Box)
 * 2. sleeve_drawer (کشویی دو تکه / Matchbox Sleeve & Drawer)
 * 3. snap_lock_bottom (سر دارویی ته قفلی / Auto-Lock / Tuck-Top Snap Lock Bottom)
 * 4. keyboard (کیبوردی سرهم‌شونده / Mailer Box)
 * 5. american (آمریکایی ۴ درب / RSC Regular Slotted Carton)
 * 6. base_lid (زیره و رویه دو تکه / iPhone style Rigid Base & Lid)
 * 7. tray (کفی بدون در / Open Top Tray)
 */

const MATERIAL_SPECS = {
  cardboard: { name: 'جعبه مقوایی (ایندربرد / پشت طوسی)', thickness: 0.5, bendK: 0.8, glueWidth: 15, clearance: 1.5, defaultGsm: 300 },
  flute_e: { name: 'کارتن لمینتی E-Flute (ای فلوت)', thickness: 1.5, bendK: 1.5, glueWidth: 25, clearance: 2.5, defaultGsm: 450 },
  flute_b: { name: 'کارتن B-Flute (بی فلوت)', thickness: 3.0, bendK: 3.0, glueWidth: 35, clearance: 4.5, defaultGsm: 550 },
  flute_c: { name: 'کارتن C-Flute (سی فلوت)', thickness: 4.0, bendK: 4.0, glueWidth: 40, clearance: 6.0, defaultGsm: 650 }
};

const STANDARD_SHEETS = [
  { id: 'sheet_70x100', name: '۷۰ × ۱۰۰ سانت (چهار ورقی)', widthMm: 1000, heightMm: 700, widthCm: 100, heightCm: 70 },
  { id: 'sheet_60x90', name: '۶۰ × ۹۰ سانت (سه ورقی)', widthMm: 900, heightMm: 600, widthCm: 90, heightCm: 60 },
  { id: 'sheet_50x70', name: '۵۰ × ۷۰ سانت (دو ورقی)', widthMm: 700, heightMm: 500, widthCm: 70, heightCm: 50 },
  { id: 'sheet_100x140', name: '۱۰۰ × ۱۴۰ سانت (شش ورقی)', widthMm: 1400, heightMm: 1000, widthCm: 140, heightCm: 100 }
];

/**
 * Generate Parametric SVG & Measurements for a specific box type
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
  let labels = [];
  let parts = [];

  switch (boxType) {
    // ================= 1. سر و ته دارویی (دو طرف درب مقوایی / Tuck End) =================
    case 'tuck_end': {
      const tuck = Math.max(12, Math.min(22, W * 0.75 + 3));
      const flapH = W;
      flatW = (L * 2) + (W * 2) + glueW;
      flatH = H + (flapH * 2) + (tuck * 2);

      const margin = 15;
      const ox = margin;
      const oy = margin + flapH + tuck;

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

      // Dust flaps side creases
      const dustH = Math.min(flapH * 0.8, 14);

      // Cut lines (خطوط تیغ و برش خارجی)
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

      labels.push({ text: `لب‌چسب (${glueW}mm)`, x: x0 + glueW / 2, y: yTopBody + H / 2 });
      labels.push({ text: `طول اصلی: ${L}mm`, x: x1 + L / 2, y: yTopBody + H / 2 });
      labels.push({ text: `عرض: ${W}mm`, x: x2 + W / 2, y: yTopBody + H / 2 });
      labels.push({ text: `طول پشت: ${L}mm`, x: x3 + L / 2, y: yTopBody + H / 2 });
      labels.push({ text: `عرض: ${W}mm`, x: x4 + W / 2, y: yTopBody + H / 2 });
      labels.push({ text: `ارتفاع: ${H}mm`, x: x1 + L / 2, y: yTopBody + 25 });

      parts.push({
        id: 'box',
        name: 'جعبه دارویی کامل (دو طرف درب مقوایی)',
        flatW: Math.round(flatW),
        flatH: Math.round(flatH),
        areaCm2: Math.round((flatW * flatH) / 100)
      });
      break;
    }

    // ================= 2. کشویی (Matchbox Sleeve & Drawer) =================
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

      flatW = Math.max(sleeveFlatW, drawerFlatW) + 40;
      flatH = sleeveFlatH + drawerFlatH + 80;

      // Part 1: Drawer
      const dx = 30 + wallH + rollH;
      const dy = 30 + wallH + rollH;

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

      labels.push({ text: `قطعه ۱: کشوی داخلی (${W}×${L}×${H}mm)`, x: dx + W / 2, y: dy + L / 2 });

      // Part 2: Sleeve
      const sy = dy + L + wallH + rollH + 50;
      const sx = 30;

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

      labels.push({ text: `قطعه ۲: کاور دورپیچ کشویی (${sL}mm)`, x: sx1 + sW, y: sy - 15 });

      parts.push({
        id: 'drawer',
        name: 'قطعه ۱: کشوی داخلی (Drawer Tray)',
        flatW: Math.round(drawerFlatW),
        flatH: Math.round(drawerFlatH),
        areaCm2: Math.round((drawerFlatW * drawerFlatH) / 100)
      });
      parts.push({
        id: 'sleeve',
        name: 'قطعه ۲: کاور دورپیچ (Outer Sleeve)',
        flatW: Math.round(sleeveFlatW),
        flatH: Math.round(sleeveFlatH),
        areaCm2: Math.round((sleeveFlatW * sleeveFlatH) / 100)
      });
      break;
    }

    // ================= 3. کیبوردی (Mailer Box) =================
    case 'keyboard': {
      const frontFlap = H;
      flatW = L + (H * 4) + 20;
      flatH = (H * 2) + (W * 2) + frontFlap + 20;

      const ox = 20 + H * 2;
      const oy = 20 + frontFlap;

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

      labels.push({ text: `کف جعبه: ${L} × ${W} mm`, x: ox + L / 2, y: oy + W / 2 });
      labels.push({ text: `درب بالایی: ${L} × ${W} mm`, x: ox + L / 2, y: oy + W + H + W / 2 });

      parts.push({ id: 'box', name: 'خط تیغ کیبوردی یک‌تکه', flatW: Math.round(flatW), flatH: Math.round(flatH), areaCm2: Math.round((flatW * flatH) / 100) });
      break;
    }

    // ================= 4. آمریکایی ۴ درب (RSC Carton) =================
    case 'american': {
      const flapH = W / 2;
      flatW = (L * 2) + (W * 2) + glueW;
      flatH = H + (flapH * 2);

      const ox = 20;
      const oy = 20 + flapH;

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

      labels.push({ text: `کارتن آمریکایی: ${L} × ${W} × ${H} mm`, x: x1 + L / 2, y: oy + H / 2 });
      parts.push({ id: 'box', name: 'کارتن آمریکایی ۴ درب', flatW: Math.round(flatW), flatH: Math.round(flatH), areaCm2: Math.round((flatW * flatH) / 100) });
      break;
    }

    // ================= 5. سر دارویی ته قفلی (Lock Bottom) =================
    case 'snap_lock_bottom': {
      const topTuck = Math.max(15, W * 0.4);
      const topFlap = W * 0.75;
      const lockBottomH = W * 0.65;

      flatW = (L * 2) + (W * 2) + glueW;
      flatH = H + topFlap + topTuck + lockBottomH;

      const ox = 20;
      const oy = 20 + topFlap + topTuck;

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

      labels.push({ text: 'سر دارویی ته قفلی (Lock-Bottom)', x: x1 + L / 2, y: oy + H / 2 });
      parts.push({ id: 'box', name: 'جعبه ته‌قفلی (لاک‌باتم)', flatW: Math.round(flatW), flatH: Math.round(flatH), areaCm2: Math.round((flatW * flatH) / 100) });
      break;
    }

    // ================= 6. کفی بدون در (Open Top Tray) =================
    case 'tray': {
      flatW = L + (H * 2) + 20;
      flatH = W + (H * 2) + 20;

      const ox = 20 + H;
      const oy = 20 + H;

      creasePaths.push(`M ${ox} ${oy} L ${ox + L} ${oy} L ${ox + L} ${oy + W} L ${ox} ${oy + W} Z`);
      cutPaths.push(`
        M ${ox} ${oy - H} L ${ox + L} ${oy - H} L ${ox + L} ${oy - 5} L ${ox + L + H} ${oy - 5}
        L ${ox + L + H} ${oy + W + 5} L ${ox + L} ${oy + W + 5} L ${ox + L} ${oy + W + H}
        L ${ox} ${oy + W + H} L ${ox} ${oy + W + 5} L ${ox - H} ${oy + W + 5} L ${ox - H} ${oy - 5} L ${ox} ${oy - 5} Z
      `);

      labels.push({ text: `کف سینی: ${L} × ${W} mm`, x: ox + L / 2, y: oy + W / 2 });
      parts.push({ id: 'box', name: 'کفی سینی (Tray)', flatW: Math.round(flatW), flatH: Math.round(flatH), areaCm2: Math.round((flatW * flatH) / 100) });
      break;
    }

    // ================= 7. زیره رویه (Base & Lid) =================
    case 'base_lid': {
      const lidClearance = mat.thickness * 2 + 1.5;
      const lidL = L + lidClearance;
      const lidW = W + lidClearance;
      const lidH = Math.min(H, Math.max(20, H * 0.85));

      const baseFlatW = L + (H * 2) + 10;
      const baseFlatH = W + (H * 2) + 10;
      const lidFlatW = lidL + (lidH * 2) + 10;
      const lidFlatH = lidW + (lidH * 2) + 10;

      flatW = Math.max(baseFlatW, lidFlatW);
      flatH = baseFlatH + lidFlatH + 30;

      const bx = 20 + H;
      const by = 20 + H;
      creasePaths.push(`M ${bx} ${by} L ${bx + L} ${by} L ${bx + L} ${by + W} L ${bx} ${by + W} Z`);
      cutPaths.push(`
        M ${bx} ${by - H} L ${bx + L} ${by - H} L ${bx + L} ${by} L ${bx + L + H} ${by}
        L ${bx + L + H} ${by + W} L ${bx + L} ${by + W} L ${bx + L} ${by + W + H}
        L ${bx} ${by + W + H} L ${bx} ${by + W} L ${bx - H} ${by + W} L ${bx - H} ${by} L ${bx} ${by} Z
      `);

      const ly = by + W + H + 30 + lidH;
      const lx = 20 + lidH;
      creasePaths.push(`M ${lx} ${ly} L ${lx + lidL} ${ly} L ${lx + lidL} ${ly + lidW} L ${lx} ${ly + lidW} Z`);
      cutPaths.push(`
        M ${lx} ${ly - lidH} L ${lx + lidL} ${ly - lidH} L ${lx + lidL} ${ly} L ${lx + lidL + lidH} ${ly}
        L ${lx + lidL + lidH} ${ly + lidW} L ${lx + lidL} ${ly + lidW} L ${lx + lidL} ${ly + lidW + lidH}
        L ${lx} ${ly + lidW + lidH} L ${lx} ${ly + lidW} L ${lx - lidH} ${ly + lidW} L ${lx - lidH} ${ly} L ${lx} ${ly} Z
      `);

      labels.push({ text: `قطعه ۱: زیره (Base) - ${L}×${W}×${H}mm`, x: bx + L / 2, y: by + W / 2 });
      labels.push({ text: `قطعه ۲: رویه (Lid) - ${Math.round(lidL)}×${Math.round(lidW)}×${Math.round(lidH)}mm`, x: lx + lidL / 2, y: ly + lidW / 2 });

      parts.push({ id: 'base', name: 'قطعه ۱: زیره (Base)', flatW: Math.round(baseFlatW), flatH: Math.round(baseFlatH), areaCm2: Math.round((baseFlatW * baseFlatH) / 100) });
      parts.push({ id: 'lid', name: 'قطعه ۲: رویه (Lid)', flatW: Math.round(lidFlatW), flatH: Math.round(lidFlatH), areaCm2: Math.round((lidFlatW * lidFlatH) / 100) });
      break;
    }
  }

  // Construct Single Vector SVG
  const svgViewBox = `0 0 ${flatW + 40} ${flatH + 40}`;
  const svgContent = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="${svgViewBox}" width="${flatW + 40}mm" height="${flatH + 40}mm">
  <defs>
    <style>
      .cut-line { stroke: #e11d48; stroke-width: 1.2; fill: none; stroke-linecap: round; stroke-linejoin: round; }
      .crease-line { stroke: #2563eb; stroke-width: 1.0; stroke-dasharray: 4, 3; fill: none; }
      .label-text { font-family: 'Vazirmatn', sans-serif; font-size: 8px; fill: #475569; text-anchor: middle; font-weight: bold; }
    </style>
  </defs>
  
  <g id="CreaseLines">
    ${creasePaths.map(d => `<path d="${d}" class="crease-line" />`).join('\n    ')}
  </g>

  <g id="CutLines">
    ${cutPaths.map(d => `<path d="${d.trim()}" class="cut-line" />`).join('\n    ')}
  </g>

  <g id="Labels">
    ${labels.map(l => `<text x="${l.x}" y="${l.y}" class="label-text">${l.text}</text>`).join('\n    ')}
  </g>
</svg>`;

  return {
    success: true,
    boxType,
    dimensions: { length: L, width: W, height: H },
    material: mat,
    flatDimensions: {
      flatWidthMm: Math.round(flatW),
      flatHeightMm: Math.round(flatH),
      flatWidthCm: Math.round((flatW / 10) * 10) / 10,
      flatHeightCm: Math.round((flatH / 10) * 10) / 10
    },
    parts,
    singleCutPaths: cutPaths,
    singleCreasePaths: creasePaths,
    svg: svgContent
  };
}

/**
 * Packing Algorithm for Single-Part or Dedicated Part Imposition
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

  // Plan A: 0 deg (Normal)
  const colsA = Math.floor((pW + gutter) / (itemW + gutter));
  const rowsA = Math.floor((pH + gutter) / (itemH + gutter));
  const countA = Math.max(0, colsA * rowsA);

  // Plan B: 90 deg (Rotated)
  const colsB = Math.floor((pW + gutter) / (itemH + gutter));
  const rowsB = Math.floor((pH + gutter) / (itemW + gutter));
  const countB = Math.max(0, colsB * rowsB);

  // Plan C: Mixed Layout (Normal in main area + Rotated in leftover strip)
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

  // Determine Best Plan
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

  // Build Item Coordinates
  const items = [];
  let itemIdx = 1;

  if (bestPlan === 'A') {
    // Normal grid
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
    // Rotated grid
    const totalGridW = colsB * itemH + (colsB - 1) * gutter;
    const totalGridH = rowsB * itemW + (rowsB - 1) * gutter;
    const startX = sideMargin + Math.floor((pW - totalGridW) / 2);
    const startY = gripperMargin + Math.floor((pH - totalGridH) / 2);

    for (let r = 0; r < rowsB; r++) {
      for (let c = 0; c < colsB; c++) {
        items.push({
          id: itemIdx++,
          name: itemName,
          x: Math.round(startX + c * (itemH + gutter)),
          y: Math.round(startY + r * (itemW + gutter)),
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
          name: `${itemName} (گردش ۹۰°)`,
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
 * Packing Algorithm for Combo/Paired Imposition (Part 1 + Part 2 in same sheet)
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
 * Generate Full CAD Vector Montage SVG with Die Cut & Crease Lines & Title Block
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
    const bgFill = isSleeve ? '#fffbeb' : isDrawer ? '#f0fdf4' : '#f8fafc';

    // Internal cut & crease lines to replicate die maker visual
    const innerCrease1 = `M 15 15 L ${it.width - 15} 15 L ${it.width - 15} ${it.height - 15} L 15 ${it.height - 15} Z`;
    const innerCrease2 = `M ${Math.floor(it.width * 0.45)} 15 L ${Math.floor(it.width * 0.45)} ${it.height - 15}`;
    const innerCrease3 = `M ${Math.floor(it.width * 0.55)} 15 L ${Math.floor(it.width * 0.55)} ${it.height - 15}`;

    return `
      <!-- Placed Dieline #${it.id} -->
      <g transform="translate(${it.x}, ${it.y})">
        <!-- Box Paper Blank -->
        <rect width="${it.width}" height="${it.height}" rx="1" fill="${bgFill}" fill-opacity="0.8" stroke="${strokeColor}" stroke-width="1.2" />
        
        <!-- Crease lines (خطوط تا و خط‌کشی آبی) -->
        <path d="${innerCrease1}" stroke="${creaseColor}" stroke-width="0.8" stroke-dasharray="3,2" fill="none" />
        <path d="${innerCrease2}" stroke="${creaseColor}" stroke-width="0.8" stroke-dasharray="3,2" fill="none" />
        <path d="${innerCrease3}" stroke="${creaseColor}" stroke-width="0.8" stroke-dasharray="3,2" fill="none" />

        <!-- Dimension and Part Info -->
        <text x="${it.width / 2}" y="${Math.max(14, it.height / 2 - 5)}" font-family="'Vazirmatn', sans-serif" font-size="10px" font-weight="900" fill="#0f172a" text-anchor="middle">
          #${it.id} (${it.width}×${it.height}mm)
        </text>
        <text x="${it.width / 2}" y="${Math.min(it.height - 6, it.height / 2 + 10)}" font-family="'Vazirmatn', sans-serif" font-size="8px" font-weight="bold" fill="#475569" text-anchor="middle">
          ${it.name || 'قالب'}
        </text>
      </g>
    `;
  }).join('\n');

  // Title Block Dimensions
  const tbW = Math.min(380, sheetW - 40);
  const tbH = 45;
  const tbX = sheetW - tbW - 15;
  const tbY = sheetH - tbH - 15;

  return `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="${svgViewBox}" width="${sheetW}mm" height="${sheetH}mm">
  <defs>
    <style>
      .sheet-bg { fill: #ffffff; stroke: #0f172a; stroke-width: 2.5; }
      .gripper-bar { fill: #fef3c7; stroke: #d97706; stroke-width: 1; }
      .register-cross { stroke: #0f172a; stroke-width: 0.8; fill: none; }
      .title-block-bg { fill: #f8fafc; stroke: #1e293b; stroke-width: 1.5; }
      .tb-text-bold { font-family: 'Vazirmatn', sans-serif; font-size: 8.5px; font-weight: 900; fill: #0f172a; }
      .tb-text-reg { font-family: 'Vazirmatn', sans-serif; font-size: 7.5px; fill: #334155; }
    </style>
  </defs>

  <!-- Sheet Cardboard Paper Background -->
  <rect x="0" y="0" width="${sheetW}" height="${sheetH}" class="sheet-bg" />

  <!-- Gripper Edge (حاشیه لب‌پنجه چاپ) -->
  <rect x="0" y="0" width="${sheetW}" height="${gripperMargin}" class="gripper-bar" />
  <text x="${sheetW / 2}" y="${gripperMargin - 4}" font-family="'Vazirmatn', sans-serif" font-size="8.5px" font-weight="bold" fill="#92400e" text-anchor="middle">
    حاشیه لب‌پنجه ماشین چاپ (${gripperMargin}mm Gripper Margin)
  </text>

  <!-- Prepress Registration Marks (صلیب و علائم رجیستر لیتوگرافی در ۴ گوشه) -->
  <g class="register-cross">
    <circle cx="5" cy="5" r="3" />
    <line x1="1" y1="5" x2="9" y2="5" />
    <line x1="5" y1="1" x2="5" y2="9" />

    <circle cx="${sheetW - 5}" cy="5" r="3" />
    <line x1="${sheetW - 9}" y1="5" x2="${sheetW - 1}" y2="5" />
    <line x1="${sheetW - 5}" y1="1" x2="${sheetW - 5}" y2="9" />

    <circle cx="5" cy="${sheetH - 5}" r="3" />
    <line x1="1" y1="${sheetH - 5}" x2="9" y2="${sheetH - 5}" />
    <line x1="5" y1="${sheetH - 9}" x2="5" y2="${sheetH - 1}" />

    <circle cx="${sheetW - 5}" cy="${sheetH - 5}" r="3" />
    <line x1="${sheetW - 9}" y1="${sheetH - 5}" x2="${sheetW - 1}" y2="${sheetH - 5}" />
    <line x1="${sheetW - 5}" y1="${sheetH - 9}" x2="${sheetW - 5}" y2="${sheetH - 1}" />
  </g>

  <!-- Placed Box Dieline Instances -->
  <g id="SheetItems">
    ${itemSvgs}
  </g>

  <!-- Professional Prepress & Die-Maker Title Block (جدول مشخصات فنی قالب‌سازی) -->
  <g id="DieMakerTitleBlock" transform="translate(${tbX}, ${tbY})">
    <rect width="${tbW}" height="${tbH}" class="title-block-bg" rx="2" />
    <line x1="0" y1="22" x2="${tbW}" y2="22" stroke="#cbd5e1" stroke-width="1" />
    <line x1="${tbW * 0.5}" y1="0" x2="${tbW * 0.5}" y2="${tbH}" stroke="#cbd5e1" stroke-width="1" />

    <!-- Row 1: Factory & Box Specs -->
    <text x="${tbW - 10}" y="15" text-anchor="end" class="tb-text-bold">صنایع چاپ و بسته‌بندی آرمان امیران</text>
    <text x="${tbW * 0.5 - 10}" y="15" text-anchor="end" class="tb-text-reg">ساختار: ${dieline?.boxType || 'جعبه استاندارد'}</text>

    <!-- Row 2: Sheet Specs & Efficiency -->
    <text x="${tbW - 10}" y="36" text-anchor="end" class="tb-text-reg">
      شیت: ${sheetW}×${sheetH}mm | تعداد در فرم: ${items.length} عدد
    </text>
    <text x="${tbW * 0.5 - 10}" y="36" text-anchor="end" class="tb-text-reg">
      سطح مفید: ${efficiencyPercentage}٪ | ضایعات: ${wastePercentage}٪
    </text>
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

  // Sort by lowest waste percentage, then lowest cost
  evaluations.sort((a, b) => a.wastePercentage - b.wastePercentage || a.cardboardCostPerBox - b.cardboardCostPerBox);
  const bestChoice = evaluations[0];

  return {
    success: true,
    dieline,
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
  STANDARD_SHEETS,
  generateBoxDieline,
  packSinglePartOnSheet,
  packComboPartsOnSheet,
  generateSheetMontageSvg,
  optimizeSheetMontage
};
