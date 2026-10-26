// Convert Persian (۰-۹) and Arabic (٠-٩) digits to ASCII (0-9) for reliable numeric inputs
export function toEnglishDigits(input) {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[,٬]/g, '');
}

export function formatNumber(num) {
  const n = Number(num || 0);
  if (Number.isNaN(n)) return '۰';
  return n.toLocaleString('fa-IR');
}

export function formatToman(num) {
  return `${formatNumber(Math.round(Number(num || 0)))} تومان`;
}

export function formatJalaliDateTime(iso) {
  if (!iso) return '-';
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Tehran',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatJalaliDate(iso) {
  if (!iso) return '-';
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Tehran',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatTehranTime(iso) {
  if (!iso) return '-';
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Tehran',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

export function paymentMethodLabel(sale) {
  if (!sale) return '-';
  if (sale.payment_method === 'pos') {
    return `کارتخوان (${sale.pos_bank_name || 'بانکی'})`;
  }
  if (sale.payment_method === 'transfer') {
    return 'واریز به حساب';
  }
  if (sale.payment_method === 'cash') {
    return 'نقد';
  }
  return sale.payment_method;
}

export function sepidarStatusMeta(status, botQueueStatus = '') {
  if (status === 'pending' && botQueueStatus === 'queued') {
    return {
      label: 'در صف ربات ویندوزی',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap inline-block',
    };
  }
  switch (status) {
    case 'synced':
      return {
        label: 'ثبت شده در سپیدار',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 whitespace-nowrap inline-block',
      };
    case 'pending':
      return {
        label: 'در انتظار تایید مالی',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 whitespace-nowrap inline-block',
      };
    case 'error':
      return {
        label: 'خطای ارسال سپیدار',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 whitespace-nowrap inline-block',
      };
    case 'rejected':
      return {
        label: 'رد / ابطال شده',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-300 whitespace-nowrap inline-block',
      };
    default:
      return {
        label: status || '-',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 whitespace-nowrap inline-block',
      };
  }
}

// ISO/IEC 15417 Standard Code-128 Pattern Table (0..106)
const CODE128_PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312',
  '132212', '221213', '221312', '231212', '112232', '122132', '122231', '113222',
  '123122', '123221', '223211', '221132', '221231', '213212', '223112', '312131',
  '311222', '321122', '321221', '312212', '322112', '322211', '212123', '212321',
  '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121',
  '313121', '211331', '231131', '213113', '213311', '213131', '311123', '311321',
  '331121', '312113', '312311', '332111', '314111', '221411', '431111', '111224',
  '111422', '121124', '121421', '141122', '141221', '112214', '112412', '122114',
  '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112',
  '421211', '212141', '214121', '412121', '111143', '111341', '131141', '114113',
  '114311', '411113', '411311', '113141', '114131', '311141', '411131', '211412',
  '211214', '211232', '2331112',
];

/**
 * Generates SVG rect elements array for a scannable Code-128B barcode
 */
export function encodeCode128Rects(text) {
  const clean = String(text || '1500').replace(/[^\x20-\x7E]/g, '');
  const codes = [104]; // Start Code B
  let checksum = 104;

  for (let i = 0; i < clean.length; i++) {
    const val = clean.charCodeAt(i) - 32;
    codes.push(val);
    checksum += val * (i + 1);
  }
  codes.push(checksum % 103);
  codes.push(106); // Stop pattern

  const rects = [];
  let x = 10; // Quiet zone = 10 modules

  for (const code of codes) {
    const pattern = CODE128_PATTERNS[code];
    for (let i = 0; i < pattern.length; i++) {
      const width = Number(pattern[i]);
      if (i % 2 === 0) {
        // Bar (black)
        rects.push({ x, width });
      }
      x += width;
    }
  }

  return {
    rects,
    totalModules: x + 10, // +10 trailing quiet zone
  };
}
