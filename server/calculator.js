/**
 * Industrial Cost Estimation Engine for Packaging & Box Factory (MIS Standard)
 */

function calculateBoxCost(params = {}) {
  const {
    // Basic Specs
    quantity = 10000,
    boxes_per_sheet = 2,
    print_waste = 5,

    // 1. Cardboard (مقوا)
    has_cardboard = true,
    cardboard_type = 'طوسی',
    cardboard_length = 1000, // mm
    cardboard_width = 600,   // mm
    cardboard_grammage = 350,// g/m2
    cardboard_unit_price = 2020000, // price per 1000 sheets or per unit

    // 2. Print (چاپ)
    has_print = true,
    zinc_status = 'زینک جدید',
    custom_color = false,
    print_colors_count = 4,
    print_type = 'افست',
    print_format = 'دوربرقی',
    print_length = 500,
    print_width = 600,

    // 3. Varnish & Cellophane (ورنی و سلفون)
    has_varnish = true,
    has_cellophane = true,
    cellophane_type = 'سلفون حرارتی مات',

    // 4. UV (یووی)
    has_uv = false,
    uv_shablon_status = 'شابلون موجود',
    uv_type = 'موضعی',

    // 5. Foil (فویل / طلاکوب)
    has_foil = true,
    foil_type = 'طلاکوب',
    foil_length = 200, // mm
    foil_width = 150,  // mm

    // 6. Emboss (برجسته)
    has_emboss = true,
    emboss_cliche_status = 'کلیشه جدید',
    emboss_type = 'مقوایی',

    // 7. Die (تیغ)
    has_blade = true,
    blade_status = 'جدید',
    blade_type = 'لترپرس',

    // 8. Window (طلق)
    has_window = false,
    window_length = 0,
    window_width = 0,
    window_thickness = 0,

    // 9. Glue (چسب)
    has_glue = true,
    glue_type = 'لمینتی',
    glue_price = 110, // per box

    // 10. Staple (منگنه)
    has_staple = false,
    staple_count = 0,

    // 11. Sheet / Single (سینگل / ورق)
    has_sheet = true,
    sheet_category = 'سینگل',
    sheet_length = 0,
    sheet_width = 0,
    sheet_price = 0,

    // Margin
    profit_margin = 20
  } = params;

  const qty = Math.max(1, parseInt(quantity) || 10000);
  const ups = Math.max(1, parseInt(boxes_per_sheet) || 2);
  const wastePercent = parseFloat(print_waste) || 5;

  // 1. Sheets calculation
  const netSheets = Math.ceil(qty / ups);
  const wasteSheets = Math.ceil(netSheets * (wastePercent / 100));
  const totalSheets = netSheets + wasteSheets;

  // Sheet area in m2
  const cLengthM = (parseFloat(cardboard_length) || 1000) / 1000;
  const cWidthM = (parseFloat(cardboard_width) || 600) / 1000;
  const sheetAreaM2 = cLengthM * cWidthM;

  // 1. Cardboard Cost
  let cardboardCost = 0;
  const totalWeightKg = (totalSheets * sheetAreaM2 * (parseFloat(cardboard_grammage) || 350)) / 1000;
  if (has_cardboard) {
    if (cardboard_unit_price > 500000) {
      // Specified as price per 1000 sheets
      cardboardCost = Math.round((totalSheets / 1000) * cardboard_unit_price);
    } else {
      // Specified per kg (e.g. 54,000 / 72,000)
      const perKg = cardboard_unit_price > 0 ? cardboard_unit_price : 54000;
      cardboardCost = Math.round(totalWeightKg * perKg);
    }
  }

  // 2. Corrugated / Single Sheet Cost
  let fluteCost = 0;
  let laminationCost = 0;
  if (has_sheet) {
    const totalFluteAreaM2 = totalSheets * sheetAreaM2;
    let flutePricePerM2 = 14500;
    if (sheet_category === 'ورق سه لایه') flutePricePerM2 = 24000;
    if (sheet_category === 'ورق پنج لایه') flutePricePerM2 = 42000;
    if (sheet_price > 0) flutePricePerM2 = sheet_price;

    fluteCost = Math.round(totalFluteAreaM2 * flutePricePerM2);
    laminationCost = Math.round(totalFluteAreaM2 * 5500); // lamination glue service
  }

  // 3. Print & Lithography Cost
  let plateCost = 0;
  let printCost = 0;
  if (has_print) {
    const colors = parseInt(print_colors_count) || 4;
    if (zinc_status === 'زینک جدید') {
      const plateUnitPrice = print_format.includes('۴.۵') ? 160000 : 95000;
      plateCost = colors * plateUnitPrice;
    }
    const printThousand = Math.ceil(totalSheets / 1000);
    const ratePerThousand = colors <= 2 ? 350000 : (colors === 4 ? 650000 : 850000);
    printCost = Math.max(1, printThousand) * ratePerThousand;
    if (custom_color) printCost += 400000; // Pantone formulation fee
  }

  // 4. Varnish & Cellophane Cost
  let varnishCost = 0;
  if (has_varnish) {
    varnishCost = Math.round((totalSheets / 1000) * 180000);
  }

  let cellophaneCost = 0;
  if (has_cellophane) {
    let ratePerM2 = 4200; // matte
    if (cellophane_type.includes('براق')) ratePerM2 = 3800;
    if (cellophane_type.includes('مخملی')) ratePerM2 = 9500;
    if (cellophane_type.includes('طرح‌دار')) ratePerM2 = 8000;
    cellophaneCost = Math.round(totalSheets * sheetAreaM2 * ratePerM2);
  }

  // 5. UV Cost
  let uvCost = 0;
  if (has_uv) {
    const shablonFee = uv_shablon_status === 'شابلون جدید' ? 350000 : 0;
    const uvPassCost = Math.ceil(totalSheets / 1000) * 650000;
    uvCost = shablonFee + uvPassCost;
  }

  // 6. Foil / Stamping Cost
  let foilCost = 0;
  if (has_foil) {
    const fAreaCm2 = ((parseFloat(foil_length) || 200) * (parseFloat(foil_width) || 150)) / 100;
    const clicheFee = Math.round(fAreaCm2 * 2500) + 400000;
    const stampPass = Math.ceil(totalSheets / 1000) * 750000;
    foilCost = clicheFee + stampPass;
  }

  // 7. Emboss Cost
  let embossCost = 0;
  if (has_emboss) {
    const clicheFee = emboss_cliche_status === 'کلیشه جدید' ? 450000 : 0;
    const embossPass = Math.ceil(totalSheets / 1000) * 380000;
    embossCost = clicheFee + embossPass;
  }

  // 8. Die & Mould Cost
  let bladeCost = 0;
  if (has_blade) {
    const mouldFee = blade_status === 'جدید' ? 1200000 : 0;
    const diePassRate = blade_type.includes('بوبست') ? 480000 : 420000;
    const diePassCost = Math.ceil(totalSheets / 1000) * diePassRate;
    bladeCost = mouldFee + diePassCost;
  }

  // 9. Window patching
  let windowCost = 0;
  if (has_window) {
    windowCost = Math.round(qty * 450);
  }

  // 10. Glue Cost
  let glueCost = 0;
  if (has_glue) {
    const unitGluePrice = parseFloat(glue_price) > 0 ? parseFloat(glue_price) : 110;
    glueCost = Math.round(qty * unitGluePrice);
  }

  // 11. Staple Cost
  let stapleCost = 0;
  if (has_staple) {
    stapleCost = Math.round(qty * (parseInt(staple_count) || 2) * 50);
  }

  // Total Raw Manufacturing Cost
  const totalRawCost = cardboardCost + fluteCost + laminationCost + plateCost + printCost +
                       varnishCost + cellophaneCost + uvCost + foilCost + embossCost +
                       bladeCost + windowCost + glueCost + stapleCost;

  // Margin Calculation
  const marginFactor = 1 + ((parseFloat(profit_margin) || 20) / 100);
  const finalPrice = Math.round(totalRawCost * marginFactor);
  const unitPrice = Math.round(finalPrice / qty);

  return {
    quantity: qty,
    imposition: {
      netSheets,
      wasteSheets,
      totalSheets,
      upsPerSheet: ups,
      totalWeightKg: Math.round(totalWeightKg * 10) / 10,
      sheetAreaM2: Math.round(sheetAreaM2 * 100) / 100
    },
    costBreakdown: {
      cardboardCost,
      fluteCost,
      laminationCost,
      plateCost,
      printCost,
      varnishCost,
      cellophaneCost,
      uvCost,
      foilCost,
      embossCost,
      bladeCost,
      windowCost,
      glueCost,
      stapleCost
    },
    totalRawCost,
    profitMarginPercent: parseFloat(profit_margin) || 20,
    finalPrice,
    unitPrice
  };
}

module.exports = { calculateBoxCost };
