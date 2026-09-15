/**
 * Parametric Packaging Dieline & Sheet Imposition Engine
 * Developed for Arman Amiran ERP by Masoud Shabani (مسعود شعبانی)
 *
 * Supported Box Structures:
 * 1. keyboard (کیبوردی سرهم‌شونده / Mailer Box)
 * 2. american (آمریکایی ۴ درب / RSC Regular Slotted Carton)
 * 3. tuck_end (سر و ته دارویی / Reverse & Straight Tuck End Box)
 * 4. snap_lock_bottom (سر دارویی ته قفلی / Auto-Lock / Tuck-Top Snap Lock Bottom)
 * 5. tray (کفی بدون در / Open Top Tray)
 * 6. base_lid (زیره و رویه دو تکه / iPhone style Rigid Base & Lid)
 * 7. sleeve_drawer (کشویی دو تکه / Matchbox Sleeve & Drawer)
 *
 * Materials:
 * - cardboard (مقوای ایندربرد / پشت طوسی - ضخامت 0.5mm)
 * - flute_e (ای فلوت لمینتی - ضخامت 1.5mm)
 * - flute_b (بی فلوت - ضخامت 3.0mm)
 * - flute_c (سی فلوت - ضخامت 4.0mm)
 */

// Thickness and clearance map in mm
const MATERIAL_SPECS = {
  cardboard: { name: 'جعبه مقوایی (ایندربرد / پشت طوسی)', thickness: 0.5, bendK: 0.8, glueWidth: 15 },
  flute_e: { name: 'کارتن لمینتی E-Flute (ای فلوت)', thickness: 1.5, bendK: 1.5, glueWidth: 25 },
  flute_b: { name: 'کارتن B-Flute (بی فلوت)', thickness: 3.0, bendK: 3.0, glueWidth: 35 },
  flute_c: { name: 'کارتن C-Flute (سی فلوت)', thickness: 4.0, bendK: 4.0, glueWidth: 40 }
};

/**
 * Generate Parametric SVG & Measurements for a specific box type
 */
function generateBoxDieline({
  boxType = 'tuck_end',
  length = 150, // in mm (L)
  width = 100,  // in mm (W)
  height = 50,  // in mm (H)
  material = 'cardboard'
}) {
  const L = Math.max(10, parseFloat(length) || 150);
  const W = Math.max(10, parseFloat(width) || 100);
  const H = Math.max(10, parseFloat(height) || 50);
  const mat = MATERIAL_SPECS[material] || MATERIAL_SPECS.cardboard;
  const T = mat.thickness;
  const glueW = mat.glueWidth;

  let flatW = 0;
  let flatH = 0;
  let cutPaths = [];
  let creasePaths = [];
  let labels = [];
  let parts = [];

  switch (boxType) {
    // ================= 1. سر و ته دارویی (Tuck End) =================
    case 'tuck_end': {
      // Flaps: Tuck flap (Tuck = 15mm), Dust flap (W/2)
      const tuck = Math.max(15, Math.min(25, W * 0.4));
      const flapH = W * 0.75;
      flatW = (L * 2) + (W * 2) + glueW;
      flatH = H + (flapH * 2) + (tuck * 2);

      const margin = 20;
      const ox = margin;
      const oy = margin + flapH + tuck;

      // Outer Cutting Box & Glue Tab
      // Panels X coordinates:
      // [Glue Tab: 0 -> glueW] [L1: glueW -> glueW+L] [W1: +W] [L2: +L] [W2: +W]
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

      // Crease lines (Vertical folds between panels)
      creasePaths.push(`M ${x1} ${yTopBody} L ${x1} ${yBotBody}`);
      creasePaths.push(`M ${x2} ${yTopBody} L ${x2} ${yBotBody}`);
      creasePaths.push(`M ${x3} ${yTopBody} L ${x3} ${yBotBody}`);
      creasePaths.push(`M ${x4} ${yTopBody} L ${x4} ${yBotBody}`);

      // Horizontal Creases (Body to Flaps)
      creasePaths.push(`M ${x1} ${yTopBody} L ${x5} ${yTopBody}`);
      creasePaths.push(`M ${x1} ${yBotBody} L ${x5} ${yBotBody}`);
      creasePaths.push(`M ${x1} ${yTopFlap} L ${x2} ${yTopFlap}`); // Tuck crease top
      creasePaths.push(`M ${x3} ${yBotFlap} L ${x4} ${yBotFlap}`); // Tuck crease bottom

      // Cutting lines (Perimeter outline)
      cutPaths.push(`
        M ${x0} ${yTopBody + 5}
        L ${x1} ${yTopBody}
        L ${x1} ${yTopFlap + 5}
        L ${x1 + 3} ${yTopFlap}
        L ${x1 + 3} ${yTopTuck + 5}
        Q ${x1 + 3} ${yTopTuck} ${x1 + 8} ${yTopTuck}
        L ${x2 - 8} ${yTopTuck}
        Q ${x2 - 3} ${yTopTuck} ${x2 - 3} ${yTopTuck + 5}
        L ${x2 - 3} ${yTopFlap}
        L ${x2} ${yTopFlap + 5}
        L ${x2} ${yTopBody}
        L ${x3} ${yTopBody - 10}
        L ${x3} ${yTopBody}
        L ${x4} ${yTopBody}
        L ${x5} ${yTopBody - 10}
        L ${x5} ${yBotBody + 10}
        L ${x4} ${yBotBody}
        L ${x4} ${yBotFlap - 5}
        L ${x4 - 3} ${yBotFlap}
        L ${x4 - 3} ${yBotTuck - 5}
        Q ${x4 - 3} ${yBotTuck} ${x4 - 8} ${yBotTuck}
        L ${x3 + 8} ${yBotTuck}
        Q ${x3 + 3} ${yBotTuck} ${x3 + 3} ${yBotTuck - 5}
        L ${x3 + 3} ${yBotFlap}
        L ${x3} ${yBotFlap - 5}
        L ${x3} ${yBotBody}
        L ${x2} ${yBotBody + 10}
        L ${x2} ${yBotBody}
        L ${x1} ${yBotBody}
        L ${x0} ${yBotBody - 5}
        Z
      `);

      labels.push({ text: 'لب‌چسب (Glue Flap)', x: x0 + glueW / 2, y: yTopBody + H / 2 });
      labels.push({ text: `طول اصلی: ${L}mm`, x: x1 + L / 2, y: yTopBody + H / 2 });
      labels.push({ text: `عرض: ${W}mm`, x: x2 + W / 2, y: yTopBody + H / 2 });
      labels.push({ text: `ارتفاع: ${H}mm`, x: x1 + L / 2, y: yTopBody + H / 4 });
      labels.push({ text: 'درب بالا (Tuck Top)', x: x1 + L / 2, y: yTopFlap + 10 });
      labels.push({ text: 'درب پایین (Tuck Bottom)', x: x3 + L / 2, y: yBotFlap - 10 });

      parts.push({ name: 'جعبه دارویی کامل', flatW: Math.round(flatW), flatH: Math.round(flatH) });
      break;
    }

    // ================= 2. کیبوردی (Mailer Box / RETF) =================
    case 'keyboard': {
      // Folded self-locking box with double-wall sides and tuck flap
      const sideWall = H;
      const topLid = W;
      const frontFlap = H;
      const tuckEar = 15;

      flatW = L + (H * 4) + 20; // Main body + side double walls
      flatH = (H * 2) + (W * 2) + frontFlap + 20; // Bottom + Back + Lid + Front

      const ox = 20 + H * 2;
      const oy = 20 + frontFlap;

      // Creases
      creasePaths.push(`M ${ox} ${oy} L ${ox + L} ${oy}`); // Front to bottom
      creasePaths.push(`M ${ox} ${oy + W} L ${ox + L} ${oy + W}`); // Bottom to back
      creasePaths.push(`M ${ox} ${oy + W + H} L ${ox + L} ${oy + W + H}`); // Back to Lid
      creasePaths.push(`M ${ox} ${oy} L ${ox} ${oy + W}`); // Left side
      creasePaths.push(`M ${ox + L} ${oy} L ${ox + L} ${oy + W}`); // Right side

      // Side double wall creases
      creasePaths.push(`M ${ox - H} ${oy} L ${ox - H} ${oy + W}`);
      creasePaths.push(`M ${ox + L + H} ${oy} L ${ox + L + H} ${oy + W}`);

      // Outer Cut Path
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
      labels.push({ text: `دیواره‌های دوبل قفل‌شونده (${H}mm)`, x: ox - H, y: oy + W / 2 });

      parts.push({ name: 'خط تیغ کیبوردی یک‌تکه', flatW: Math.round(flatW), flatH: Math.round(flatH) });
      break;
    }

    // ================= 3. آمریکایی ۴ درب (RSC Carton) =================
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

      // Vertical creases
      creasePaths.push(`M ${x1} ${oy} L ${x1} ${oy + H}`);
      creasePaths.push(`M ${x2} ${oy} L ${x2} ${oy + H}`);
      creasePaths.push(`M ${x3} ${oy} L ${x3} ${oy + H}`);
      creasePaths.push(`M ${x4} ${oy} L ${x4} ${oy + H}`);

      // Horizontal creases for top & bottom flaps
      creasePaths.push(`M ${x1} ${oy} L ${x5} ${oy}`);
      creasePaths.push(`M ${x1} ${oy + H} L ${x5} ${oy + H}`);

      // Slot Cuts between flaps
      cutPaths.push(`M ${x2} ${oy - flapH} L ${x2} ${oy}`);
      cutPaths.push(`M ${x3} ${oy - flapH} L ${x3} ${oy}`);
      cutPaths.push(`M ${x4} ${oy - flapH} L ${x4} ${oy}`);

      cutPaths.push(`M ${x2} ${oy + H} L ${x2} ${oy + H + flapH}`);
      cutPaths.push(`M ${x3} ${oy + H} L ${x3} ${oy + H + flapH}`);
      cutPaths.push(`M ${x4} ${oy + H} L ${x4} ${oy + H + flapH}`);

      // Outer Perimeter
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
      labels.push({ text: 'درب‌های تاشو بالا (Top Flaps)', x: x1 + L / 2, y: oy - flapH / 2 });
      labels.push({ text: 'درب‌های تاشو پایین (Bottom Flaps)', x: x1 + L / 2, y: oy + H + flapH / 2 });

      parts.push({ name: 'کارتن آمریکایی ۴ درب', flatW: Math.round(flatW), flatH: Math.round(flatH) });
      break;
    }

    // ================= 4. سر دارویی ته قفلی (Lock Bottom / Snap Lock) =================
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

      // Creases
      creasePaths.push(`M ${x1} ${oy} L ${x1} ${oy + H}`);
      creasePaths.push(`M ${x2} ${oy} L ${x2} ${oy + H}`);
      creasePaths.push(`M ${x3} ${oy} L ${x3} ${oy + H}`);
      creasePaths.push(`M ${x4} ${oy} L ${x4} ${oy + H}`);
      creasePaths.push(`M ${x1} ${oy} L ${x5} ${oy}`);
      creasePaths.push(`M ${x1} ${oy + H} L ${x5} ${oy + H}`);

      // Top Tuck Crease
      creasePaths.push(`M ${x1} ${oy - topFlap} L ${x2} ${oy - topFlap}`);

      // Lock bottom 45-degree angled creases
      creasePaths.push(`M ${x1} ${oy + H} L ${x1 + lockBottomH} ${oy + H + lockBottomH}`);
      creasePaths.push(`M ${x3} ${oy + H} L ${x3 + lockBottomH} ${oy + H + lockBottomH}`);

      // Perimeter
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
      labels.push({ text: 'زبانه قفل‌شونده اتوماتیک ۴۵ درجه', x: x1 + L / 2, y: oy + H + lockBottomH / 2 });

      parts.push({ name: 'جعبه ته‌قفلی (لاک‌باتم)', flatW: Math.round(flatW), flatH: Math.round(flatH) });
      break;
    }

    // ================= 5. کفی بدون در (Open Top Tray) =================
    case 'tray': {
      flatW = L + (H * 2) + 20;
      flatH = W + (H * 2) + 20;

      const ox = 20 + H;
      const oy = 20 + H;

      // Base rectangle creases
      creasePaths.push(`M ${ox} ${oy} L ${ox + L} ${oy}`);
      creasePaths.push(`M ${ox + L} ${oy} L ${ox + L} ${oy + W}`);
      creasePaths.push(`M ${ox + L} ${oy + W} L ${ox} ${oy + W}`);
      creasePaths.push(`M ${ox} ${oy + W} L ${ox} ${oy}`);

      // Cut path with 4 corner glue tabs
      cutPaths.push(`
        M ${ox} ${oy - H}
        L ${ox + L} ${oy - H}
        L ${ox + L} ${oy - 5}
        L ${ox + L + H} ${oy - 5}
        L ${ox + L + H} ${oy + W + 5}
        L ${ox + L} ${oy + W + 5}
        L ${ox + L} ${oy + W + H}
        L ${ox} ${oy + W + H}
        L ${ox} ${oy + W + 5}
        L ${ox - H} ${oy + W + 5}
        L ${ox - H} ${oy - 5}
        L ${ox} ${oy - 5}
        Z
      `);

      labels.push({ text: `کف سینی: ${L} × ${W} mm`, x: ox + L / 2, y: oy + W / 2 });
      labels.push({ text: `دیواره: ${H}mm`, x: ox + L / 2, y: oy - H / 2 });

      parts.push({ name: 'کفی سینی (Tray)', flatW: Math.round(flatW), flatH: Math.round(flatH) });
      break;
    }

    // ================= 6. زیره رویه آیفونی (Base & Lid 2-Piece) =================
    case 'base_lid': {
      // Base: L x W x H
      // Lid: (L+2) x (W+2) x (H*0.8)
      const clearance = T * 2 + 1.5;
      const lidL = L + clearance;
      const lidW = W + clearance;
      const lidH = Math.min(H, Math.max(20, H * 0.85));

      const baseFlatW = L + (H * 2) + 10;
      const baseFlatH = W + (H * 2) + 10;
      const lidFlatW = lidL + (lidH * 2) + 10;
      const lidFlatH = lidW + (lidH * 2) + 10;

      flatW = Math.max(baseFlatW, lidFlatW);
      flatH = baseFlatH + lidFlatH + 30;

      // Base part
      const bx = 20 + H;
      const by = 20 + H;
      creasePaths.push(`M ${bx} ${by} L ${bx + L} ${by} L ${bx + L} ${by + W} L ${bx} ${by + W} Z`);
      cutPaths.push(`
        M ${bx} ${by - H} L ${bx + L} ${by - H} L ${bx + L} ${by} L ${bx + L + H} ${by}
        L ${bx + L + H} ${by + W} L ${bx + L} ${by + W} L ${bx + L} ${by + W + H}
        L ${bx} ${by + W + H} L ${bx} ${by + W} L ${bx - H} ${by + W} L ${bx - H} ${by} L ${bx} ${by} Z
      `);

      // Lid part (Offset down)
      const ly = by + W + H + 30 + lidH;
      const lx = 20 + lidH;
      creasePaths.push(`M ${lx} ${ly} L ${lx + lidL} ${ly} L ${lx + lidL} ${ly + lidW} L ${lx} ${ly + lidW} Z`);
      cutPaths.push(`
        M ${lx} ${ly - lidH} L ${lx + lidL} ${ly - lidH} L ${lx + lidL} ${ly} L ${lx + lidL + lidH} ${ly}
        L ${lx + lidL + lidH} ${ly + lidW} L ${lx + lidL} ${ly + lidW} L ${lx + lidL} ${ly + lidW + lidH}
        L ${lx} ${ly + lidW + lidH} L ${lx} ${ly + lidW} L ${lx - lidH} ${ly + lidW} L ${lx - lidH} ${ly} L ${lx} ${ly} Z
      `);

      labels.push({ text: `قطعه ۱: زیره (Base) - ${L}×${W}×${H}mm`, x: bx + L / 2, y: by + W / 2 });
      labels.push({ text: `قطعه ۲: رویه (Lid) - ${Math.round(lidL)}×${Math.round(lidW)}×${Math.round(lidH)}mm (+${clearance}mm بادخور)`, x: lx + lidL / 2, y: ly + lidW / 2 });

      parts.push({ name: 'قطعه ۱: زیره (Base)', flatW: Math.round(baseFlatW), flatH: Math.round(baseFlatH) });
      parts.push({ name: 'قطعه ۲: رویه (Lid)', flatW: Math.round(lidFlatW), flatH: Math.round(lidFlatH) });
      break;
    }

    // ================= 7. کشویی (Matchbox Sleeve & Drawer) =================
    case 'sleeve_drawer': {
      const clearance = T * 2 + 1.2;
      const sleeveL = L + 2;
      const sleeveW = W + clearance;
      const sleeveH = H + clearance;

      // Drawer (Tray)
      const drawerFlatW = L + (H * 2) + 10;
      const drawerFlatH = W + (H * 2) + 10;

      // Sleeve (Wrap Around 4 panels + glue tab)
      const sleeveFlatW = (sleeveW * 2) + (sleeveH * 2) + glueW;
      const sleeveFlatH = sleeveL + 10;

      flatW = Math.max(drawerFlatW, sleeveFlatW);
      flatH = drawerFlatH + sleeveFlatH + 30;

      // Draw Tray Creases
      const dx = 20 + H;
      const dy = 20 + H;
      creasePaths.push(`M ${dx} ${dy} L ${dx + L} ${dy} L ${dx + L} ${dy + W} L ${dx} ${dy + W} Z`);
      cutPaths.push(`
        M ${dx} ${dy - H} L ${dx + L} ${dy - H} L ${dx + L} ${dy} L ${dx + L + H} ${dy}
        L ${dx + L + H} ${dy + W} L ${dx + L} ${dy + W} L ${dx + L} ${dy + W + H}
        L ${dx} ${dy + W + H} L ${dx} ${dy + W} L ${dx - H} ${dy + W} L ${dx - H} ${dy} L ${dx} ${dy} Z
      `);

      // Draw Sleeve (Offset down)
      const sy = dy + W + H + 30;
      const sx = 20;
      const sx1 = sx + glueW;
      const sx2 = sx1 + sleeveW;
      const sx3 = sx2 + sleeveH;
      const sx4 = sx3 + sleeveW;
      const sx5 = sx4 + sleeveH;

      creasePaths.push(`M ${sx1} ${sy} L ${sx1} ${sy + sleeveL}`);
      creasePaths.push(`M ${sx2} ${sy} L ${sx2} ${sy + sleeveL}`);
      creasePaths.push(`M ${sx3} ${sy} L ${sx3} ${sy + sleeveL}`);
      creasePaths.push(`M ${sx4} ${sy} L ${sx4} ${sy + sleeveL}`);

      cutPaths.push(`
        M ${sx} ${sy + 3} L ${sx1} ${sy} L ${sx5} ${sy} L ${sx5} ${sy + sleeveL}
        L ${sx1} ${sy + sleeveL} L ${sx} ${sy + sleeveL - 3} Z
      `);

      labels.push({ text: `قطعه ۱: کشو داخلی (Drawer) - ${L}×${W}×${H}mm`, x: dx + L / 2, y: dy + W / 2 });
      labels.push({ text: `قطعه ۲: کاور دورپیچ (Sleeve) - ${Math.round(sleeveW)}×${Math.round(sleeveH)}×${sleeveL}mm`, x: sx + sleeveFlatW / 2, y: sy + sleeveL / 2 });

      parts.push({ name: 'قطعه ۱: کشوی درونی', flatW: Math.round(drawerFlatW), flatH: Math.round(drawerFlatH) });
      parts.push({ name: 'قطعه ۲: کاور دورپیچ بیرونی', flatW: Math.round(sleeveFlatW), flatH: Math.round(sleeveFlatH) });
      break;
    }
  }

  // Construct standard SVG Vector output (Compatible with Adobe Illustrator, CorelDraw, laser cutter)
  const svgViewBox = `0 0 ${flatW + 40} ${flatH + 40}`;
  const svgContent = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="${svgViewBox}" width="${flatW + 40}mm" height="${flatH + 40}mm">
  <defs>
    <style>
      .cut-line { stroke: #e11d48; stroke-width: 1.5; fill: none; stroke-linecap: round; stroke-linejoin: round; }
      .crease-line { stroke: #2563eb; stroke-width: 1.2; stroke-dasharray: 4, 3; fill: none; }
      .label-text { font-family: 'Vazirmatn', sans-serif; font-size: 8px; fill: #475569; text-anchor: middle; }
      .dim-line { stroke: #059669; stroke-width: 0.8; stroke-dasharray: 2, 2; }
    </style>
  </defs>
  
  <!-- Crease / Score Lines (خطوط تا) -->
  <g id="CreaseLines">
    ${creasePaths.map(d => `<path d="${d}" class="crease-line" />`).join('\n    ')}
  </g>

  <!-- Cut Lines (خطوط تیغ و برش) -->
  <g id="CutLines">
    ${cutPaths.map(d => `<path d="${d.trim()}" class="cut-line" />`).join('\n    ')}
  </g>

  <!-- Annotations & Labels -->
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
    svg: svgContent
  };
}

module.exports = {
  MATERIAL_SPECS,
  generateBoxDieline
};
