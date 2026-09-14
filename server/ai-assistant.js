/**
 * AI Assistant & Packaging Engineering Engine for Arman Amiran ERP
 * Developed by: Masoud Shabani (مسعود شعبانی)
 *
 * Features:
 * 1. Persian NLP Order & Quote Parser (Extracts full technical specs from text/voice)
 * 2. Intelligent Sheet Nesting & Imposition Optimizer (Minimizes cardboard waste)
 * 3. Packaging Preflight & Technical Safety Inspector
 * 4. Technical Packaging Knowledge Base & Copilot
 */

const { calculateBoxCost } = require('./calculator');

// Persian Number normalizer
function normalizePersianNumbers(str) {
  if (!str) return '';
  const p2e = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
    'ي': 'ی', 'ك': 'ک'
  };
  return str.replace(/[۰-۹٠-٩يك]/g, (m) => p2e[m] || m);
}

/**
 * 1. AI Persian NLP Extractor for Packaging Inquiries
 */
function parsePackagingPrompt(rawPrompt) {
  if (!rawPrompt || typeof rawPrompt !== 'string') {
    return { success: false, error: 'متن درخواست خالی است.' };
  }

  const text = normalizePersianNumbers(rawPrompt).toLowerCase();

  const result = {
    title: '',
    customer_name: '',
    quantity: 10000,
    box_type: 'جعبه مقوایی',
    box_structure: 'درب و ته معمولی',
    // Cardboard specs
    has_cardboard: 1,
    cardboard_type: 'ایندربرد',
    cardboard_grammage: 300,
    cardboard_length: 1000,
    cardboard_width: 700,
    length: 15,
    width: 10,
    height: 5,
    // Print specs
    has_print: 1,
    print_colors_count: 4,
    print_type: 'افست ۴ رنگ CMYK',
    zinc_status: 'زینک جدید',
    // Finishing
    has_cellophane: 0,
    cellophane_type: 'بدون سلفون',
    has_varnish: 0,
    has_uv: 0,
    uv_type: 'بدون یووی',
    has_foil: 0,
    foil_type: 'بدون طلاکوب',
    has_emboss: 0,
    emboss_type: 'بدون برجسته',
    has_blade: 1,
    blade_status: 'قالب جدید',
    has_glue: 1,
    glue_type: 'لب‌چسب ساده اتوماتیک',
    has_window: 0,
    has_corrugated: 0,
    corrugated_type: 'بدون سینگل',
    detected_tags: []
  };

  // 1. Quantity detection (تیراژ)
  const qtyPatterns = [
    /(\d+[\d,]*)\s*(هزار|میلیون|k|تا|عدد|برگ|شیت|بسته)/i,
    /تیراژ[:\s]*(\d+[\d,]*)/i,
    /تعداد[:\s]*(\d+[\d,]*)/i,
    /(\d+)\s*k/i
  ];

  for (const pat of qtyPatterns) {
    const m = text.match(pat);
    if (m) {
      let num = parseInt(m[1].replace(/,/g, ''), 10);
      if (m[2] === 'هزار' || m[2] === 'k' || m[0].includes('k')) {
        num = num * 1000;
      } else if (m[2] === 'میلیون') {
        num = num * 1000000;
      }
      if (num > 0) {
        result.quantity = num;
        result.detected_tags.push(`تیراژ: ${num.toLocaleString('fa-IR')} عدد`);
        break;
      }
    }
  }

  // If no thousand keyword, look for standalone 4-6 digit numbers
  if (result.quantity === 10000) {
    const rawNum = text.match(/\b(\d{3,7})\b/);
    if (rawNum && parseInt(rawNum[1], 10) >= 500) {
      result.quantity = parseInt(rawNum[1], 10);
      result.detected_tags.push(`تیراژ حدسی: ${result.quantity.toLocaleString('fa-IR')} عدد`);
    }
  }

  // 2. Cardboard Type (نوع مقوا)
  if (text.includes('ایندربرد') || text.includes('ایندر') || text.includes('ایورست') || text.includes('fbb')) {
    result.cardboard_type = 'ایندربرد';
    result.detected_tags.push('مقوا: ایندربرد بهداشتی');
  } else if (text.includes('پشت طوسی') || text.includes('پشت خاکستری') || text.includes('طوسی')) {
    result.cardboard_type = 'طوسی';
    result.detected_tags.push('مقوا: پشت طوسی صنعتی');
  } else if (text.includes('پشت سفید') || text.includes('دوپین')) {
    result.cardboard_type = 'سفید';
    result.detected_tags.push('مقوا: پشت سفید');
  } else if (text.includes('گلاسه') || text.includes('آرت پیپر')) {
    result.cardboard_type = 'گلاسه';
    result.detected_tags.push('مقوا: گلاسه');
  } else if (text.includes('کرافت') || text.includes('کاغذ کاهی')) {
    result.cardboard_type = 'کرافت';
    result.detected_tags.push('مقوا: کرافت');
  }

  // 3. Cardboard Grammage (گرماژ)
  const gsmMatch = text.match(/(\d{3})\s*(گرم|gr|gsm)/i) || text.match(/(۲۳۰|۲۵۰|۲۸۰|۳۰۰|۳۵۰|۴۰۰|۴۵۰|۵۰۰)\s*گرم/);
  if (gsmMatch) {
    result.cardboard_grammage = parseInt(gsmMatch[1], 10);
    result.detected_tags.push(`گرماژ: ${result.cardboard_grammage} گرم`);
  } else {
    // Check known numbers
    const knownGsm = [450, 400, 350, 300, 280, 250, 230, 200];
    for (const g of knownGsm) {
      if (text.includes(g.toString())) {
        result.cardboard_grammage = g;
        result.detected_tags.push(`گرماژ: ${g} گرم`);
        break;
      }
    }
  }

  // 4. Dimensions (ابعاد: طول × عرض × ارتفاع)
  const dimPatterns = [
    /(\d+[\.\d]*)\s*(?:در|x|\*|×|\/)\s*(\d+[\.\d]*)\s*(?:در|x|\*|×|\/)\s*(\d+[\.\d]*)/i,
    /ابعاد[:\s]*(\d+[\.\d]*)\s*[\*x×در]\s*(\d+[\.\d]*)\s*[\*x×در]\s*(\d+[\.\d]*)/i,
    /(\d+[\.\d]*)\s*در\s*(\d+[\.\d]*)/i
  ];

  for (const pat of dimPatterns) {
    const m = text.match(pat);
    if (m) {
      if (m[3]) {
        result.length = parseFloat(m[1]);
        result.width = parseFloat(m[2]);
        result.height = parseFloat(m[3]);
        result.detected_tags.push(`ابعاد: ${result.length} × ${result.width} × ${result.height} cm`);
      } else if (m[2]) {
        result.length = parseFloat(m[1]);
        result.width = parseFloat(m[2]);
        result.height = 4;
        result.detected_tags.push(`ابعاد: ${result.length} × ${result.width} cm`);
      }
      break;
    }
  }

  // 5. Print Colors (رنگ‌های چاپ)
  if (text.includes('۴ رنگ') || text.includes('4 رنگ') || text.includes('چهار رنگ') || text.includes('full color') || text.includes('cmyk')) {
    result.print_colors_count = 4;
    result.print_type = 'افست ۴ رنگ CMYK';
    result.detected_tags.push('چاپ: ۴ رنگ افست');
  } else if (text.includes('۵ رنگ') || text.includes('5 رنگ') || text.includes('پنج رنگ') || text.includes('پنتون') || text.includes('رنگ اختصاصی')) {
    result.print_colors_count = 5;
    result.print_type = 'افست ۵ رنگ (CMYK + پنتون اختصاصی)';
    result.detected_tags.push('چاپ: ۵ رنگ پنتون');
  } else if (text.includes('تک رنگ') || text.includes('۱ رنگ') || text.includes('1 رنگ')) {
    result.print_colors_count = 1;
    result.print_type = 'افست تک رنگ';
    result.detected_tags.push('چاپ: تک رنگ');
  } else if (text.includes('۲ رنگ') || text.includes('2 رنگ') || text.includes('دو رنگ')) {
    result.print_colors_count = 2;
    result.print_type = 'افست ۲ رنگ';
    result.detected_tags.push('چاپ: ۲ رنگ');
  }

  // 6. Cellophane (سلفون)
  if (text.includes('سلفون مات') || text.includes('مات حرارتی') || text.includes('مات')) {
    result.has_cellophane = 1;
    result.cellophane_type = 'سلفون حرارتی مات';
    result.detected_tags.push('روکش: سلفون مات');
  } else if (text.includes('سلفون براق') || text.includes('براق حرارتی') || text.includes('براق')) {
    result.has_cellophane = 1;
    result.cellophane_type = 'سلفون حرارتی براق';
    result.detected_tags.push('روکش: سلفون براق');
  } else if (text.includes('مخملی') || text.includes('سافت تاچ') || text.includes('مخمل')) {
    result.has_cellophane = 1;
    result.cellophane_type = 'سلفون مخملی';
    result.detected_tags.push('روکش: سلفون مخملی لوکس');
  } else if (text.includes('ورنی') || text.includes('روغن ورنی')) {
    result.has_cellophane = 0;
    result.has_varnish = 1;
    result.detected_tags.push('روکش: ورنی چاپی');
  }

  // 7. Spot UV (یووی موضعی)
  if (text.includes('یووی موضعی') || text.includes('یووی') || text.includes('uv') || text.includes('شابلون یووی') || text.includes('یووی برجسته')) {
    result.has_uv = 1;
    result.uv_type = text.includes('برجسته') ? 'یووی موضعی برجسته (۳D)' : 'یووی موضعی سیلندری';
    result.detected_tags.push('خدمات: یووی موضعی');
  }

  // 8. Foil Stamping (طلاکوب / نقره‌کوب)
  if (text.includes('طلاکوب') || text.includes('طلا کوب') || text.includes('فویل طلا') || text.includes('فویل طلایی')) {
    result.has_foil = 1;
    result.foil_type = 'طلاکوب طلایی';
    result.detected_tags.push('خدمات: طلاکوب طلایی');
  } else if (text.includes('نقره کوب') || text.includes('نقره‌کوب') || text.includes('فویل نقره')) {
    result.has_foil = 1;
    result.foil_type = 'نقره‌کوب نقره‌ای';
    result.detected_tags.push('خدمات: نقره‌کوب');
  } else if (text.includes('هولوگرام') || text.includes('طلاکوب هفت رنگ')) {
    result.has_foil = 1;
    result.foil_type = 'هولوگرام';
    result.detected_tags.push('خدمات: طلاکوب هولوگرام');
  }

  // 9. Embossing (برجسته / امباس)
  if (text.includes('برجسته') || text.includes('برجسته‌کاری') || text.includes('امباس') || text.includes('کلیشه برجسته')) {
    result.has_emboss = 1;
    result.emboss_type = 'برجسته کلیشه‌ای';
    result.detected_tags.push('خدمات: برجسته‌سازی');
  }

  // 10. Corrugated & E-Flute (سینگل فلوت / لمینت)
  if (text.includes('سینگل') || text.includes('ای فلوت') || text.includes('e فلوت') || text.includes('فلوتینگ') || text.includes('لمینت') || text.includes('کارتن')) {
    result.has_corrugated = 1;
    result.corrugated_type = 'سینگل E-Flute لمینتی';
    result.box_type = 'کارتن لمینتی';
    result.detected_tags.push('بدنه: لمینت روی سینگل E-Flute');
  }

  // 11. Window Patching (پنجره طلق‌دار)
  if (text.includes('پنجره') || text.includes('طلق') || text.includes('ویندو پچ') || text.includes('پنجره‌دار')) {
    result.has_window = 1;
    result.detected_tags.push('خدمات: پنجره طلق‌دار');
  }

  // 12. Structure & Gluing (مدل جعبه و چسب)
  if (text.includes('ته قفلی') || text.includes('لاک باتم') || text.includes('lock bottom')) {
    result.box_structure = 'ته‌قفلی (لاک‌باتم)';
    result.glue_type = 'چسب ۳ نقطه ته‌قفلی';
    result.detected_tags.push('ساختار: ته‌قفلی لاک‌باتم');
  } else if (text.includes('کیبوردی') || text.includes('پستی') || text.includes('جعبه لپ تاپ')) {
    result.box_structure = 'کیبوردی سرهم‌شونده';
    result.glue_type = 'بدون چسب (قفل سرخود)';
    result.detected_tags.push('ساختار: کیبوردی');
  } else if (text.includes('کشویی') || text.includes('کبریت')) {
    result.box_structure = 'کشویی (کاور + کشو)';
    result.detected_tags.push('ساختار: کشویی');
  } else if (text.includes('هاردباکس') || text.includes('hard box')) {
    result.box_type = 'هاردباکس لوکس';
    result.box_structure = 'هاردباکس دوتکه مگنتی';
    result.detected_tags.push('نوع: هاردباکس');
  } else if (text.includes('دارو') || text.includes('قرص') || text.includes('شربت') || text.includes('پماد') || text.includes('سفالکسین')) {
    result.box_type = 'جعبه دارویی';
    result.box_structure = 'درب دارویی ته زبانه';
    result.detected_tags.push('کاربرد: دارویی استاندارد');
  }

  // 13. Job Title Guessing
  const lines = rawPrompt.split(/[\n,،.]/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.includes('جعبه') || trimmed.includes('کارتن') || trimmed.includes('پک') || trimmed.includes('بسته‌بندی')) {
      result.title = trimmed.replace(/^(سلام|مهندس|قیمت|استعلام|لطفا|می‌خوایم|میخوایم|برای)\s*/g, '').substring(0, 45);
      break;
    }
  }

  if (!result.title) {
    result.title = `جعبه ${result.cardboard_type} ${result.length}×${result.width} (${result.quantity.toLocaleString('fa-IR')} عدد)`;
  }

  // 14. Calculate instant financial estimate
  const costCalc = calculateBoxCost({
    quantity: result.quantity,
    cardboard_grammage: result.cardboard_grammage,
    cardboard_type: result.cardboard_type,
    has_cardboard: result.has_cardboard,
    has_print: result.has_print,
    print_colors_count: result.print_colors_count,
    has_cellophane: result.has_cellophane,
    cellophane_type: result.cellophane_type,
    has_varnish: result.has_varnish,
    has_uv: result.has_uv,
    uv_type: result.uv_type,
    has_foil: result.has_foil,
    has_emboss: result.has_emboss,
    has_blade: result.has_blade,
    has_glue: result.has_glue,
    has_flute: result.has_corrugated
  });

  return {
    success: true,
    data: result,
    estimate: costCalc,
    summaryText: generatePersianQuoteSummary(result, costCalc)
  };
}

/**
 * Generate Persian Quotation Message for Customer (WhatsApp / Bale / SMS)
 */
function generatePersianQuoteSummary(specs, estimate) {
  const finalPrice = estimate?.finalPrice || 0;
  const unitPrice = estimate?.unitPrice || 0;
  const priceUnitToman = Math.round(unitPrice / 10);
  const totalPriceToman = Math.round(finalPrice / 10);

  return `📄 **پیش‌فاکتور استعلام قیمت - صنایع چاپ و بسته‌بندی آرمان امیران**\n` +
    `📦 **نام سفارش:** ${specs.title}\n` +
    `🔢 **تیراژ:** ${specs.quantity.toLocaleString('fa-IR')} عدد\n` +
    `📏 **ابعاد جعبه:** ${specs.length} × ${specs.width} × ${specs.height} سانتی‌متر\n` +
    `📑 **جنس مقوا:** ${specs.cardboard_type} ${specs.cardboard_grammage} گرم\n` +
    `🎨 **چاپ:** ${specs.print_type}\n` +
    `✨ **خدمات تکمیلی:** ${specs.has_cellophane ? specs.cellophane_type : (specs.has_varnish ? 'ورنی چاپی' : 'بدون سلفون')}${specs.has_uv ? ' + ' + specs.uv_type : ''}${specs.has_foil ? ' + ' + specs.foil_type : ''}${specs.has_emboss ? ' + برجسته‌سازی' : ''}\n` +
    `✂️ **عملیات تیغ و اتصال:** ساخت قالب نو + ${specs.glue_type}\n` +
    `───────────────────────\n` +
    `💰 **قیمت هر عدد:** ${priceUnitToman.toLocaleString('fa-IR')} تومان (${unitPrice.toLocaleString('fa-IR')} ریال)\n` +
    `💳 **مبلغ کل سفارش:** ${totalPriceToman.toLocaleString('fa-IR')} تومان (${finalPrice.toLocaleString('fa-IR')} ریال)\n` +
    `⏱️ **مدت زمان تحویل:** ۷ الی ۱۰ روز کاری پس از تایید نهایی طرح و خط تیغ\n` +
    `📞 **واحد فروش و مشاوره:** صنایع چاپ و بسته‌بندی آرمان امیران`;
}

/**
 * 2. Intelligent Sheet Nesting & Imposition Optimizer
 */
const STANDARD_SHEET_SIZES = [
  { name: '۷۰ × ۱۰۰ سانت (شیت کامل ۴.۵ ورقی)', length: 100, width: 70, popular: true },
  { name: '۶۰ × ۹۰ سانت (شیت ۴ ورقی استاندارد)', length: 90, width: 60, popular: true },
  { name: '۷۰ × ۹۰ سانت (شیت ۳.۵ ورقی)', length: 90, width: 70, popular: false },
  { name: '۶۰ × ۱۰۰ سانت', length: 100, width: 60, popular: false },
  { name: '۸۰ × ۱۲۰ سانت (شیت کارتن)', length: 120, width: 80, popular: false },
  { name: '۱۰۰ × ۱۴۰ سانت (شش ورقی)', length: 140, width: 100, popular: false },
  { name: '۵۰ × ۷۰ سانت (دو ورقی)', length: 70, width: 50, popular: true }
];

function optimizeSheetNesting({
  flatLength,
  flatWidth,
  quantity = 10000,
  grammage = 300,
  cardboardPricePerKg = 65000,
  customSheets = []
}) {
  const boxL = parseFloat(flatLength) || 25;
  const boxW = parseFloat(flatWidth) || 18;
  const qty = parseInt(quantity, 10) || 10000;
  const gsm = parseInt(grammage, 10) || 300;
  const priceKg = parseInt(cardboardPricePerKg, 10) || 65000;

  // Margin allowances for gripper (لب‌پنجه) and trimming (برش)
  const GRIPPER_MARGIN_CM = 1.5;
  const TRIM_MARGIN_CM = 0.5;

  const sheetsToTest = [...STANDARD_SHEET_SIZES, ...customSheets];
  const results = [];

  for (const sheet of sheetsToTest) {
    const usableL = sheet.length - (TRIM_MARGIN_CM * 2);
    const usableW = sheet.width - (GRIPPER_MARGIN_CM + TRIM_MARGIN_CM);

    // 1. Regular Portrait Layout
    const countL1 = Math.floor(usableL / boxL);
    const countW1 = Math.floor(usableW / boxW);
    const total1 = countL1 * countW1;

    // 2. Regular Landscape / Rotated Layout
    const countL2 = Math.floor(usableL / boxW);
    const countW2 = Math.floor(usableW / boxL);
    const total2 = countL2 * countW2;

    // 3. Mixed / Combination Layout (L-shapes in remaining gap)
    let totalMixed = 0;
    let mixedCols1 = countL1;
    let mixedRows1 = countW1;
    let mixedRemainL = usableL - (countL1 * boxL);
    let mixedAddCount = 0;

    if (mixedRemainL >= boxW) {
      const addCols = Math.floor(mixedRemainL / boxW);
      const addRows = Math.floor(usableW / boxL);
      mixedAddCount = addCols * addRows;
    }
    totalMixed = total1 + mixedAddCount;

    // Pick best orientation for this sheet
    let bestCount = 0;
    let bestOrientation = 'straight';
    let cols = 0;
    let rows = 0;

    if (total1 >= total2 && total1 >= totalMixed) {
      bestCount = total1;
      bestOrientation = 'طولی مستقیم (Portrait)';
      cols = countL1;
      rows = countW1;
    } else if (total2 >= total1 && total2 >= totalMixed) {
      bestCount = total2;
      bestOrientation = 'عرضی چرخیده (Landscape)';
      cols = countL2;
      rows = countW2;
    } else {
      bestCount = totalMixed;
      bestOrientation = 'ترکیبی هوشمند (Nested Mixed)';
      cols = countL1;
      rows = countW1;
    }

    if (bestCount > 0) {
      const sheetArea = sheet.length * sheet.width;
      const usedArea = bestCount * (boxL * boxW);
      const wasteArea = sheetArea - usedArea;
      const wastePercentage = Math.round((wasteArea / sheetArea) * 1000) / 10;
      const efficiencyPercentage = Math.round((usedArea / sheetArea) * 1000) / 10;

      // Sheets needed (with 3% setup waste)
      const sheetsNeeded = Math.ceil((qty / bestCount) * 1.03);
      
      // Cardboard weight in kg: (Sheets * Length_m * Width_m * GSM) / 1000
      const totalWeightKg = Math.round((sheetsNeeded * (sheet.length / 100) * (sheet.width / 100) * (gsm / 1000)));
      const totalCardboardCost = totalWeightKg * priceKg;
      const cardboardCostPerBox = Math.round(totalCardboardCost / qty);

      results.push({
        sheetName: sheet.name,
        sheetLength: sheet.length,
        sheetWidth: sheet.width,
        boxesPerSheet: bestCount,
        orientation: bestOrientation,
        cols,
        rows,
        wastePercentage,
        efficiencyPercentage,
        sheetsNeeded,
        totalWeightKg,
        totalCardboardCost,
        cardboardCostPerBox,
        popular: sheet.popular,
        score: (bestCount * 100) - (wastePercentage * 2)
      });
    }
  }

  // Sort by lowest waste & highest efficiency
  results.sort((a, b) => a.totalCardboardCost - b.totalCardboardCost);

  const bestSheet = results[0] || null;

  return {
    success: true,
    boxDimensions: { flatLength: boxL, flatWidth: boxW, quantity: qty, grammage: gsm },
    bestChoice: bestSheet,
    allChoices: results,
    savingsVsWorst: results.length > 1 ? (results[results.length - 1].totalCardboardCost - (bestSheet?.totalCardboardCost || 0)) : 0
  };
}

/**
 * 3. Packaging Preflight & Technical Quality Audit
 */
function auditPackagingSpecs(specs) {
  const issues = [];
  const suggestions = [];

  // 1. Spot UV compatibility
  if (specs.has_uv && !specs.has_cellophane && specs.cardboard_type !== 'ایندربرد') {
    issues.push({
      level: 'warning',
      category: 'پوشش و یووی',
      title: 'یووی موضعی بدون سلفون مات',
      desc: 'اجرای یووی موضعی روی مقوای بدون سلفون ممکن است جذب بافت مقوا شده و لبه‌های نامنظم یا براقیت ناکافی ایجاد کند. پیشنهاد می‌شود حتماً لایه زیرین سلفون مات در نظر گرفته شود.'
    });
  }

  // 2. Grammage vs Size audit
  const approxPerimeter = ((specs.length || 10) + (specs.width || 5)) * 2;
  if (approxPerimeter > 60 && (specs.cardboard_grammage || 300) < 300 && !specs.has_corrugated) {
    issues.push({
      level: 'critical',
      category: 'استحکام مقوا',
      title: 'گرماژ پایین نسبت به ابعاد بزرگ جعبه',
      desc: `محیط بازشده جعبه (${approxPerimeter} سانت) نسبت به گرماژ ${specs.cardboard_grammage} گرم بالاست و احتمال دفرمه شدن و شکم دادن جعبه زیر بار وجود دارد. پیشنهاد: استفاده از گرماژ حداقل ۳۵۰ یا لمینت روی سینگل E-Flute.`
    });
  }

  // 3. Bleed margin warning
  suggestions.push({
    category: 'آماده‌سازی خط تیغ',
    title: 'رعایت فاصله امن برش (Bleed)',
    desc: 'حداقل ۳ میلی‌متر رنگ اضافی (اضافه رنگ) از لبه‌های تیغ به بیرون و فاصله ۵ میلی‌متر برای متن‌های حساس از خطوط تا در نظر گرفته شود.'
  });

  // 4. Grain direction rule (راه‌دان مقوا)
  suggestions.push({
    category: 'راه‌دان کاغذ (Grain Direction)',
    title: 'تنظیم راه‌دان مقوا موازی با خط‌های تاشو',
    desc: 'جهت جلوگیری از ترکیدگی لبه‌های جعبه و تسهیل کارکرد دستگاه جعبه‌چسبانی، جهت الیاف مقوا (راه‌دان) باید موازی با خط‌های تاشوی اصلی شیت باشد.'
  });

  // 5. Glue flap width
  suggestions.push({
    category: 'لب‌چسب اتوماتیک',
    title: 'عرض استاندارد لبه چسب',
    desc: 'عرض لبه چسب (Glue Flap) برای ماشین‌های جعبه‌چسبانی اتوماتیک حداقل ۱۲ الی ۱۵ میلی‌متر و بدون پوشش سلفون یا ورنی باشد تا چسبندگی کامل ایجاد شود.'
  });

  return {
    success: true,
    issuesCount: issues.length,
    issues,
    suggestions
  };
}

/**
 * 4. AI Packaging Copilot Quick Q&A Knowledge Base
 */
const PACKAGING_FAQ = [
  {
    q: 'وزن هر شیت مقوای ۷۰ در ۱۰۰ با گرماژ ۳۰۰ گرم چقدر است؟',
    a: 'فرمول: (۰.۷۰ × ۱.۰۰ × ۳۰۰) / ۱۰۰۰ = ۲۱۰ گرم برای هر برگ شیت. هر بسته ۱۰۰ تایی ۲۱ کیلوگرم وزن دارد.'
  },
  {
    q: 'تفاوت ایندربرد (FBB) با مقوای پشت طوسی چیست؟',
    a: 'ایندربرد از الیاف بکر سلولزی ساخته شده، سفید خالص در دو طرف است، دارای گرید بهداشتی دارویی و غذایی بوده و دانسیته و سختی خمشی بالاتری دارد. پشت طوسی از الیاف بازیافتی تولید شده و برای مصارف عمومی صنعتی مناسب است.'
  },
  {
    q: 'چه زمانی نیاز به سینگل فلوت (E-Flute) است؟',
    a: 'برای جعبه‌هایی با وزن محتویات بیش از ۵۰۰ گرم، قطعات شکستنی یا جعبه‌های پستی و قطعات یدکی خودرو، مقوای چاپی با سینگل E-Flute لمینت می‌شود تا استحکام فشاری (ECT) افزایش یابد.'
  }
];

module.exports = {
  parsePackagingPrompt,
  optimizeSheetNesting,
  auditPackagingSpecs,
  generatePersianQuoteSummary,
  PACKAGING_FAQ
};
