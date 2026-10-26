const tehranDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Tehran',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const jalaliPartsFormatter = new Intl.DateTimeFormat('en-u-ca-persian', {
  timeZone: 'Asia/Tehran',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const jalaliHumanFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  timeZone: 'Asia/Tehran',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const jalaliMonthFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  timeZone: 'Asia/Tehran',
  year: 'numeric',
  month: 'long',
});

export function getTehranMeta(isoString) {
  const d = new Date(isoString);
  const parts = tehranDateFormatter.formatToParts(d);
  const map = {};
  for (const p of parts) map[p.type] = p.value;
  const gregorianDate = `${map.year}-${map.month}-${map.day}`; // YYYY-MM-DD in Asia/Tehran
  let hour = parseInt(map.hour, 10);
  if (hour === 24) hour = 0;

  const jParts = jalaliPartsFormatter.formatToParts(d);
  const jMap = {};
  for (const p of jParts) jMap[p.type] = p.value;
  const jalaliKey = `${jMap.year}/${jMap.month}/${jMap.day}`;
  const jalaliMonthKey = `${jMap.year}/${jMap.month}`;

  return {
    dateObj: d,
    ts: d.getTime(),
    gregorianDate,
    hour,
    minute: parseInt(map.minute, 10) || 0,
    jalaliKey,
    jalaliMonthKey,
    jalaliLabel: jalaliHumanFormatter.format(d),
    jalaliMonthLabel: jalaliMonthFormatter.format(d),
  };
}

export function filterSalesList(allSales, query = {}) {
  const {
    period = 'all', // 'today' | 'yesterday' | 'week' | 'month' | 'all' | 'custom'
    dateFrom = '',  // YYYY-MM-DD (Gregorian) optional
    dateTo = '',    // YYYY-MM-DD (Gregorian) optional
    hourFrom = '',
    hourTo = '',
    cashierId = '',
    brandId = '',
    categoryId = '',
    amperage = '',
    paymentMethod = '',
    posTerminalId = '',
    sepidarStatus = '',
    includeRejected = 'false',
    search = '',
  } = query;

  const nowMeta = getTehranMeta(new Date().toISOString());
  const todayStr = nowMeta.gregorianDate;

  const yesterdayDate = new Date(Date.now() - 24 * 3600 * 1000);
  const yesterdayStr = getTehranMeta(yesterdayDate.toISOString()).gregorianDate;

  const weekAgoTs = Date.now() - 7 * 24 * 3600 * 1000;
  const monthAgoTs = Date.now() - 30 * 24 * 3600 * 1000;

  const hFrom = hourFrom !== '' && hourFrom !== undefined ? Number(hourFrom) : null;
  const hTo = hourTo !== '' && hourTo !== undefined ? Number(hourTo) : null;
  const searchNeedle = String(search || '').trim().toLowerCase();

  return allSales.filter((sale) => {
    if (includeRejected !== 'true' && !sepidarStatus && sale.sepidar_status === 'rejected') {
      return false;
    }

    const meta = getTehranMeta(sale.created_at);

    if (period === 'today' && meta.gregorianDate !== todayStr) return false;
    if (period === 'yesterday' && meta.gregorianDate !== yesterdayStr) return false;
    if (period === 'week' && meta.ts < weekAgoTs) return false;
    if (period === 'month' && meta.ts < monthAgoTs) return false;
    if (period === 'custom') {
      if (dateFrom && meta.gregorianDate < dateFrom) return false;
      if (dateTo && meta.gregorianDate > dateTo) return false;
    }

    if (hFrom !== null && !Number.isNaN(hFrom) && meta.hour < hFrom) return false;
    if (hTo !== null && !Number.isNaN(hTo) && meta.hour > hTo) return false;

    if (cashierId && Number(sale.cashier_id) !== Number(cashierId)) return false;
    if (brandId && Number(sale.brand_id) !== Number(brandId)) return false;
    if (categoryId && Number(sale.category_id) !== Number(categoryId)) return false;
    if (amperage && Number(sale.amperage) !== Number(amperage)) return false;
    if (paymentMethod && sale.payment_method !== paymentMethod) return false;
    if (posTerminalId && Number(sale.pos_terminal_id) !== Number(posTerminalId)) return false;
    if (sepidarStatus && sale.sepidar_status !== sepidarStatus) return false;

    if (searchNeedle) {
      const hay = [
        sale.invoice_number,
        String(sale.label_number),
        sale.category_name,
        sale.brand_name,
        String(sale.amperage),
        sale.cashier_name,
        sale.customer_name,
        sale.customer_phone,
        sale.pos_bank_name,
        sale.sepidar_doc_number,
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(searchNeedle)) return false;
    }

    return true;
  });
}

export function buildComprehensiveReport(sales) {
  // KPI Summary
  const kpi = {
    totalInvoices: 0,
    totalBatteriesSold: 0,
    totalSoldAmps: 0,
    totalScrapCount: 0,
    totalScrapAmps: 0,
    grossSalesAmount: 0,
    scrapDeductionAmount: 0,
    finalNetAmount: 0,
    pendingSepidarCount: 0,
    syncedSepidarCount: 0,
  };

  // Hourly breakdown (0..23)
  const hourlyMap = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: `${String(hour).padStart(2, '0')}:۰۰ تا ${String((hour + 1) % 24).padStart(2, '0')}:۰۰`,
    shortLabel: `${String(hour).padStart(2, '0')}:۰۰`,
    invoiceCount: 0,
    batteryCount: 0,
    soldAmps: 0,
    scrapAmps: 0,
    grossAmount: 0,
    scrapAmount: 0,
    netAmount: 0,
  }));

  // Daily breakdown
  const dailyObj = {};
  // Weekly breakdown (grouped by 7-day Jalali week bucket)
  const weeklyObj = {};
  // Monthly breakdown (Jalali Year/Month)
  const monthlyObj = {};
  // Cashier breakdown
  const cashierObj = {};
  // Brand & Category breakdown
  const brandObj = {};
  const categoryObj = {};
  // Amperage breakdown
  const ampObj = {};
  // Payment & POS breakdown
  const paymentObj = {
    pos_total: { key: 'pos_total', title: 'کل کارتخوان‌ها', invoiceCount: 0, batteryCount: 0, netAmount: 0 },
    transfer: { key: 'transfer', title: 'واریز به حساب', invoiceCount: 0, batteryCount: 0, netAmount: 0 },
    cash: { key: 'cash', title: 'نقدی صندوق', invoiceCount: 0, batteryCount: 0, netAmount: 0 },
  };
  const posBankObj = {};

  for (const s of sales) {
    if (s.sepidar_status === 'rejected') continue;

    const meta = getTehranMeta(s.created_at);

    kpi.totalInvoices += 1;
    kpi.totalBatteriesSold += s.quantity;
    kpi.totalSoldAmps += s.total_sold_amps;
    kpi.totalScrapCount += s.has_scrap ? s.scrap_quantity : 0;
    kpi.totalScrapAmps += s.total_scrap_amps;
    kpi.grossSalesAmount += s.gross_amount;
    kpi.scrapDeductionAmount += s.scrap_deduction_amount;
    kpi.finalNetAmount += s.final_sale_amount;

    if (s.sepidar_status === 'pending') kpi.pendingSepidarCount += 1;
    if (s.sepidar_status === 'synced') kpi.syncedSepidarCount += 1;

    // 1. Hourly
    const hBucket = hourlyMap[meta.hour];
    if (hBucket) {
      hBucket.invoiceCount += 1;
      hBucket.batteryCount += s.quantity;
      hBucket.soldAmps += s.total_sold_amps;
      hBucket.scrapAmps += s.total_scrap_amps;
      hBucket.grossAmount += s.gross_amount;
      hBucket.scrapAmount += s.scrap_deduction_amount;
      hBucket.netAmount += s.final_sale_amount;
    }

    // 2. Daily
    if (!dailyObj[meta.jalaliKey]) {
      dailyObj[meta.jalaliKey] = {
        key: meta.jalaliKey,
        gregorianDate: meta.gregorianDate,
        label: meta.jalaliLabel,
        invoiceCount: 0,
        batteryCount: 0,
        soldAmps: 0,
        scrapAmps: 0,
        grossAmount: 0,
        scrapAmount: 0,
        netAmount: 0,
      };
    }
    dailyObj[meta.jalaliKey].invoiceCount += 1;
    dailyObj[meta.jalaliKey].batteryCount += s.quantity;
    dailyObj[meta.jalaliKey].soldAmps += s.total_sold_amps;
    dailyObj[meta.jalaliKey].scrapAmps += s.total_scrap_amps;
    dailyObj[meta.jalaliKey].grossAmount += s.gross_amount;
    dailyObj[meta.jalaliKey].scrapAmount += s.scrap_deduction_amount;
    dailyObj[meta.jalaliKey].netAmount += s.final_sale_amount;

    // 3. Weekly (Saturday-to-Friday Persian week start)
    const dLocal = new Date(`${meta.gregorianDate}T12:00:00Z`);
    const dayOfWeek = dLocal.getUTCDay(); // 0=Sun .. 6=Sat
    const daysSinceSaturday = (dayOfWeek + 1) % 7;
    const satDate = new Date(dLocal.getTime() - daysSinceSaturday * 86400 * 1000);
    const friDate = new Date(satDate.getTime() + 6 * 86400 * 1000);
    const satMeta = getTehranMeta(satDate.toISOString());
    const friMeta = getTehranMeta(friDate.toISOString());
    const weekKey = satMeta.gregorianDate;
    if (!weeklyObj[weekKey]) {
      weeklyObj[weekKey] = {
        key: weekKey,
        label: `هفته ${satMeta.jalaliLabel} تا ${friMeta.jalaliLabel}`,
        invoiceCount: 0,
        batteryCount: 0,
        soldAmps: 0,
        scrapAmps: 0,
        grossAmount: 0,
        scrapAmount: 0,
        netAmount: 0,
      };
    }
    weeklyObj[weekKey].invoiceCount += 1;
    weeklyObj[weekKey].batteryCount += s.quantity;
    weeklyObj[weekKey].soldAmps += s.total_sold_amps;
    weeklyObj[weekKey].scrapAmps += s.total_scrap_amps;
    weeklyObj[weekKey].grossAmount += s.gross_amount;
    weeklyObj[weekKey].scrapAmount += s.scrap_deduction_amount;
    weeklyObj[weekKey].netAmount += s.final_sale_amount;

    // 4. Monthly
    if (!monthlyObj[meta.jalaliMonthKey]) {
      monthlyObj[meta.jalaliMonthKey] = {
        key: meta.jalaliMonthKey,
        label: meta.jalaliMonthLabel,
        invoiceCount: 0,
        batteryCount: 0,
        soldAmps: 0,
        scrapAmps: 0,
        grossAmount: 0,
        scrapAmount: 0,
        netAmount: 0,
      };
    }
    monthlyObj[meta.jalaliMonthKey].invoiceCount += 1;
    monthlyObj[meta.jalaliMonthKey].batteryCount += s.quantity;
    monthlyObj[meta.jalaliMonthKey].soldAmps += s.total_sold_amps;
    monthlyObj[meta.jalaliMonthKey].scrapAmps += s.total_scrap_amps;
    monthlyObj[meta.jalaliMonthKey].grossAmount += s.gross_amount;
    monthlyObj[meta.jalaliMonthKey].scrapAmount += s.scrap_deduction_amount;
    monthlyObj[meta.jalaliMonthKey].netAmount += s.final_sale_amount;

    // 5. Cashier (کاربری که فاکتور زده کی بوده)
    const cKey = String(s.cashier_id);
    if (!cashierObj[cKey]) {
      cashierObj[cKey] = {
        cashierId: s.cashier_id,
        cashierName: s.cashier_name,
        invoiceCount: 0,
        batteryCount: 0,
        soldAmps: 0,
        scrapAmps: 0,
        grossAmount: 0,
        scrapAmount: 0,
        netAmount: 0,
        posAmount: 0,
        transferAmount: 0,
        cashAmount: 0,
      };
    }
    cashierObj[cKey].invoiceCount += 1;
    cashierObj[cKey].batteryCount += s.quantity;
    cashierObj[cKey].soldAmps += s.total_sold_amps;
    cashierObj[cKey].scrapAmps += s.total_scrap_amps;
    cashierObj[cKey].grossAmount += s.gross_amount;
    cashierObj[cKey].scrapAmount += s.scrap_deduction_amount;
    cashierObj[cKey].netAmount += s.final_sale_amount;
    if (s.payment_method === 'pos') cashierObj[cKey].posAmount += s.final_sale_amount;
    if (s.payment_method === 'transfer') cashierObj[cKey].transferAmount += s.final_sale_amount;
    if (s.payment_method === 'cash') cashierObj[cKey].cashAmount += s.final_sale_amount;

    // 6. Brand & Category
    if (!brandObj[s.brand_name]) {
      brandObj[s.brand_name] = {
        brandName: s.brand_name,
        invoiceCount: 0,
        batteryCount: 0,
        soldAmps: 0,
        scrapAmps: 0,
        grossAmount: 0,
        netAmount: 0,
      };
    }
    brandObj[s.brand_name].invoiceCount += 1;
    brandObj[s.brand_name].batteryCount += s.quantity;
    brandObj[s.brand_name].soldAmps += s.total_sold_amps;
    brandObj[s.brand_name].scrapAmps += s.total_scrap_amps;
    brandObj[s.brand_name].grossAmount += s.gross_amount;
    brandObj[s.brand_name].netAmount += s.final_sale_amount;

    if (!categoryObj[s.category_name]) {
      categoryObj[s.category_name] = {
        categoryName: s.category_name,
        invoiceCount: 0,
        batteryCount: 0,
        soldAmps: 0,
        scrapAmps: 0,
        netAmount: 0,
      };
    }
    categoryObj[s.category_name].invoiceCount += 1;
    categoryObj[s.category_name].batteryCount += s.quantity;
    categoryObj[s.category_name].soldAmps += s.total_sold_amps;
    categoryObj[s.category_name].scrapAmps += s.total_scrap_amps;
    categoryObj[s.category_name].netAmount += s.final_sale_amount;

    // 7. Amperage
    const aKey = String(s.amperage);
    if (!ampObj[aKey]) {
      ampObj[aKey] = {
        amperage: s.amperage,
        batteryCount: 0,
        soldAmps: 0,
        netAmount: 0,
      };
    }
    ampObj[aKey].batteryCount += s.quantity;
    ampObj[aKey].soldAmps += s.total_sold_amps;
    ampObj[aKey].netAmount += s.final_sale_amount;

    // 8. Payment & POS Bank
    if (s.payment_method === 'pos') {
      paymentObj.pos_total.invoiceCount += 1;
      paymentObj.pos_total.batteryCount += s.quantity;
      paymentObj.pos_total.netAmount += s.final_sale_amount;
      const bank = s.pos_bank_name || 'نامشخص';
      if (!posBankObj[bank]) {
        posBankObj[bank] = {
          bankName: bank,
          invoiceCount: 0,
          batteryCount: 0,
          netAmount: 0,
        };
      }
      posBankObj[bank].invoiceCount += 1;
      posBankObj[bank].batteryCount += s.quantity;
      posBankObj[bank].netAmount += s.final_sale_amount;
    } else if (s.payment_method === 'transfer') {
      paymentObj.transfer.invoiceCount += 1;
      paymentObj.transfer.batteryCount += s.quantity;
      paymentObj.transfer.netAmount += s.final_sale_amount;
    } else if (s.payment_method === 'cash') {
      paymentObj.cash.invoiceCount += 1;
      paymentObj.cash.batteryCount += s.quantity;
      paymentObj.cash.netAmount += s.final_sale_amount;
    }
  }

  return {
    kpi,
    hourly: hourlyMap,
    daily: Object.values(dailyObj).sort((a, b) => b.key.localeCompare(a.key)),
    weekly: Object.values(weeklyObj).sort((a, b) => b.key.localeCompare(a.key)),
    monthly: Object.values(monthlyObj).sort((a, b) => b.key.localeCompare(a.key)),
    byCashier: Object.values(cashierObj).sort((a, b) => b.netAmount - a.netAmount),
    byBrand: Object.values(brandObj).sort((a, b) => b.soldAmps - a.soldAmps),
    byCategory: Object.values(categoryObj).sort((a, b) => b.soldAmps - a.soldAmps),
    byAmperage: Object.values(ampObj).sort((a, b) => a.amperage - b.amperage),
    byPayment: Object.values(paymentObj),
    byPosBank: Object.values(posBankObj).sort((a, b) => b.netAmount - a.netAmount),
  };
}
